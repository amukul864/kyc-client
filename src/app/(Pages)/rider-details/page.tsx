"use client";
import styles from "./page.module.css";
import Button from "@/app/components/ui/Button";
import { useState, useContext } from "react";
import ErrorModal from "../../components/ErrorModal/ErrorModal";
import VideoContext from "@/app/store/video-context";
import useAudio from "@/hooks/useAudio";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import Image from "next/image";
import riderDetailsLocale from "@/locale/multi-lingual/pages/rider-details";
import useLocale from "@/hooks/useLocale";
import Auth from "@/middleware/Auth";

const RiderDetails = () => {
  useAudio("rider-details");
  const ctx = useContext(VideoContext);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const locale = useLocale(riderDetailsLocale);

  const clickHandler = async () => {
    setLoading(true);
    await ctx.takeScreenshot("rider-details");
    ctx.routePath();
  };

  const disagreement = () => {
    setError(true);
  };

  const errorHandler = (err?: string) => {
    if (err) {
      ctx.disagreements.push({ url: "rider-details", disagreement: err });
    }
    setError(false);
  };

  if (ctx.locale === "" || !locale) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {error && (
        <ErrorModal
          error={[locale.Error.Values.Input_Label]}
          buttonString={[locale.Error.Button.Proceed]}
          isInputAvailable={true}
          errorHander={[errorHandler]}
        />
      )}
      <div className={`${styles.heading}`}>{locale.Heading}</div>
      <div className={styles.card}>
        <div className={styles.infoItem}>
          {locale.Subheading.Proposal_Number} {ctx.user.proposalNumber}
        </div>
      </div>
      <div className={styles.personalInfo}>
        {ctx.user.rider.map((item, index) => (
          <div key={index} className={styles.detail}>
            <div className={styles.label}>{`${locale.Values.Rider} ${
              index + 1
            }`}</div>
            <div className={styles.field}>{item.label}</div>
            <div
              className={styles.field}
            >{`${locale.Values.Sum_Assured} ${item.value}`}</div>
          </div>
        ))}
      </div>
      <div className={styles.flex}>
        <Button className={styles.controlButton} onClick={disagreement}>
          {locale.Button.Disagree}
        </Button>
        {!loading ? (
          <Button className={styles.controlButton} onClick={clickHandler}>
            {locale.Button.Agree}
          </Button>
        ) : (
          <Image
            src="/loading.svg"
            width={32}
            height={32}
            alt="loading..."
            className={`${styles.loading}`}
          />
        )}
      </div>
    </>
  );
};

export default Auth(RiderDetails);
