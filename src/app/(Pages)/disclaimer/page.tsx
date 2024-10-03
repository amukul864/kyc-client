"use client";
import styles from "./page.module.css";
import Button from "@/app/components/ui/Button";
import Image from "next/image";
import { useContext, useState } from "react";
import VideoContext from "@/app/store/video-context";
import useAudio from "@/hooks/useAudio";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import disclaimerlocale from "@/locale/multi-lingual/pages/disclaimer";
import useLocale from "@/hooks/useLocale";
import Auth from "@/middleware/Auth";

const Disclaimer = () => {
  useAudio("disclaimer");
  const ctx = useContext(VideoContext);
  const [loading, setLoading] = useState<boolean>(false);
  const locale = useLocale(disclaimerlocale);

  const clickHandler = async () => {
    setLoading(true);
    await ctx.takeScreenshot("disclaimer");
    ctx.routePath();
  };

  if (ctx.locale === "" || !locale) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className={`${styles.heading}`}>{locale.Heading}</div>
      <div className={styles.card}>
        <div className={styles.infoItem}>
          {locale.Subheading.Proposal_Number} {ctx.user.proposalNumber}
        </div>
      </div>
      <div className={styles.personalInfo}>
        <div className={styles.detail}>
          <div className={styles.label}>{locale.Values.Tax}</div>
          <div className={styles.field}>{locale.Values.Tax_Disclaimer}</div>
        </div>
        <div className={styles.detail}>
          <div className={styles.label}>{locale.Values.IRDAI}</div>
          <div className={styles.field}>{locale.Values.IRDAI_Disclaimer}</div>
        </div>
      </div>
      {loading ? (
        <Image
          src="/loading.svg"
          width={32}
          height={32}
          alt="Picture of the author"
          style={{ marginTop: 16, marginBottom: 16 }}
        />
      ) : (
        <div className={styles.flex}>
          <Button className={styles.controlButton} onClick={clickHandler}>
            {locale.Button.Proceed}
          </Button>
        </div>
      )}
    </>
  );
};

export default Auth(Disclaimer);
