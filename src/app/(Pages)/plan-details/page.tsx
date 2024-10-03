"use client";
import styles from "./page.module.css";
import Button from "@/app/components/ui/Button";
import { useState, useContext } from "react";
import ErrorModal from "../../components/ErrorModal/ErrorModal";
import VideoContext from "@/app/store/video-context";
import useAudio from "@/hooks/useAudio";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import Image from "next/image";
import planDetailsLocale from "@/locale/multi-lingual/pages/plan-details";
import useLocale from "@/hooks/useLocale";
import Auth from "@/middleware/Auth";

const PlanDetails = () => {
  useAudio("plan-details");
  const ctx = useContext(VideoContext);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const locale = useLocale(planDetailsLocale);

  const clickHandler = async () => {
    // router.replace("/rider-details");
    setLoading(true);
    await ctx.takeScreenshot("plan-details");
    ctx.routePath();
  };

  const disagreement = () => {
    setError(true);
  };

  const errorHandler = (err?: string) => {
    if (err) {
      ctx.disagreements.push({ url: "plan-details", disagreement: err });
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
        {ctx.user.plan.map((item, index) => (
          <div key={index} className={styles.detail}>
            <div className={styles.label}>{item.label}</div>
            <div className={styles.field}>{item.value}</div>
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

export default Auth(PlanDetails);
