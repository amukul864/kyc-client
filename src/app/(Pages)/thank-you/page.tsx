"use client";
import styles from "./page.module.css";
import Button from "@/app/components/ui/Button";
import { useState, useContext, useRef } from "react";
import ErrorModal from "../../components/ErrorModal/ErrorModal";
import VideoContext from "@/app/store/video-context";
import axios from "@/utils/axios";
import useAudio from "@/hooks/useAudio";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import thankYouLocale from "@/locale/multi-lingual/pages/thank-you";
import useLocale from "@/hooks/useLocale";
import Auth from "@/middleware/Auth";

const ThankYou = () => {
  useAudio("thank-you");
  const ctx = useContext(VideoContext);
  const [error, setError] = useState<boolean>(false);
  const [downLoading, setDownloading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const locale = useLocale(thankYouLocale);

  const pdfDownloader = async () => {
    try {
      setDownloading(true);
      const data = new FormData();
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_API_URL}/links/reports/${ctx.shareId}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };
      const response = await axios.request(config);
      setTimeout(async () => {
        if (response.data.data) {
          window.open(
            process.env.NEXT_PUBLIC_URL + "/" + response.data.data.reportUrl,
          );
          setDownloading(false);
        }
      }, 2000);
    } catch (error) {
      console.log(error);
      setDownloading(false);
    }
  };

  const errorHandler = () => {
    setError(false);
  };

  if (ctx.locale === "" || !locale) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {error && (
        <ErrorModal
          error={[locale.Error.Values.Submitted]}
          buttonString={[locale.Error.Button.Close]}
          errorHander={[errorHandler]}
          isPositive={true}
        />
      )}
      <div className={`${styles.heading}`}>{locale.Heading}</div>
      <div className={styles.card}>
        <div className={styles.infoItem}>
          {locale.Subheading.Proposal_Number} {ctx.user.proposalNumber}
        </div>
      </div>
      <div className={styles.personalInfo}>
        <div className={styles.detail}>
          <div className={styles.label}>{locale.Values.Customer_Care}</div>
          <input
            type="text"
            className={styles.field}
            required
            readOnly
            value="9996824625"
          ></input>
        </div>
        <div className={styles.detail}>
          <div className={styles.label}>{locale.Values.Email}</div>
          <input
            type="text"
            className={styles.field}
            required
            readOnly
            value="amukul864@gmail.com"
          ></input>
        </div>
        <div className={styles.detail}>
          <div className={styles.label}>{locale.Values.More_Info}</div>
          <input
            type="text"
            className={styles.field}
            required
            readOnly
            value="mailto:amukul864@gmail.com"
          ></input>
        </div>
      </div>
      <div className={styles.flex}>
        {!downLoading ? (
          <Button className={styles.controlButton} onClick={pdfDownloader}>
            {locale.Button.Download_Pdf}
          </Button>
        ) : (
          <Button className={styles.controlButton} disabled>
            {locale.Values.Generating}
          </Button>
        )}
      </div>
    </>
  );
};

export default Auth(ThankYou);
