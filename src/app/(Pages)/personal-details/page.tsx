"use client";
import styles from "./page.module.css";
import Button from "@/app/components/ui/Button";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import ErrorModal from "./../../components/ErrorModal/ErrorModal";
import VideoContext from "@/app/store/video-context";
import useAudio from "@/hooks/useAudio";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import personalDetailsLocale from "@/locale/multi-lingual/pages/personal-details";
import useLocale from "@/hooks/useLocale";
import Auth from "@/middleware/Auth";

const PersonalDetails = () => {
  useAudio("personal-details");
  const ctx = useContext(VideoContext);
  const [error, setError] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [first, setFirst] = useState<boolean | null>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const locale = useLocale(personalDetailsLocale);

  const clickHandler = async () => {
    setLoading(true);
    await ctx.takeScreenshot("personal-details");
    ctx.routePath();
  };

  const disagreement = () => {
    setError(true);
  };

  const errorHandler = (err?: string) => {
    if (err) {
      ctx.disagreements.push({ url: "personal-details", disagreement: err });
    }
    setError(false);
  };

  const errorHandler2 = () => {
    setIsError(false);
  };

  useEffect(() => {
    const detectFace = async () => {
      if (ctx.photoBlob) {
        await ctx.detectFace();
        if (!ctx.detected) {
          setIsError(true);
        }
      }
    };
    detectFace();
  }, [ctx.photoBlob]);

  useEffect(() => {
    if (!ctx.detected && !first && ctx.photoBlob) {
      setIsError(true);
      setFirst(false);
    }
    if (ctx.detected) {
      setIsError(false);
      setFirst(false);
    }
  }, [ctx.detected, first, ctx.photoBlob]);

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
      {isError && (
        <ErrorModal
          error={[locale.Error.Values.Not_Detected]}
          buttonString={[locale.Error.Button.Proceed]}
          errorHander={[errorHandler2]}
        />
      )}
      <div className={`${styles.heading}`}>{locale.Heading}</div>
      <div className={styles.card}>
        <div className={styles.info}>
          {ctx.detected === true ? (
            <div className={styles.infoItem}>
              {locale.Values.Detected}
              <Image
                src="/success.png"
                width={32}
                height={32}
                alt="Picture of the author"
              />
            </div>
          ) : (
            ctx.photoBlob && (
              <div className={styles.infoItem}>
                {locale.Values.Not_Detected}
              </div>
            )
          )}
          <div className={styles.infoItem}>
            {locale.Subheading.Proposal_Number} {ctx.user.proposalNumber}
          </div>
        </div>
        {ctx.photoBlob && (
          <Image
            className={styles.image}
            src={URL.createObjectURL(ctx.photoBlob)}
            alt="Captured"
            width={280}
            height={210}
          />
        )}
      </div>
      <div className={styles.personalInfo}>
        {ctx.user.personal.map((item, index) => (
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
        {(ctx.detected || !ctx.photoBlob) &&
          (!loading ? (
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
          ))}
      </div>
    </>
  );
};

export default Auth(PersonalDetails);
