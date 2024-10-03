"use client";
import styles from "./page.module.css";
import Button from "@/app/components/ui/Button";
import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import ErrorModal from "./../../components/ErrorModal/ErrorModal";
import VideoContext from "@/app/store/video-context";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import photoConsentLocale from "@/locale/multi-lingual/pages/photo-consent";
import useLocale from "@/hooks/useLocale";
import Auth from "@/middleware/Auth";

const PhotoConsent = () => {
  const [isError, setIsError] = useState<boolean>(false);
  const ctx = useContext(VideoContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [first, setFirst] = useState<boolean | null>(true);
  const locale = useLocale(photoConsentLocale);

  useEffect(() => {
    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (ctx.videoRef.current) {
        ctx.videoRef.current.srcObject = stream;
      }
    };

    setupCamera();
    return () => {
      if (ctx.videoRef.current && ctx.videoRef.current.srcObject) {
        (ctx.videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach(track => track.stop());
      }
    };
  }, [ctx.videoRef.current]);

  useEffect(() => {
    if (!ctx.similiar && !first) {
      setIsError(true);
      setFirst(false);
    }
  }, [ctx.similiar, first]);

  useEffect(() => {
    const initAccuracy = async () => {
      if (ctx.photoBlob) {
        setLoading(true);
        await ctx.checkAccuracy("photo-consent");
        setLoading(false);
      }
    };
    initAccuracy();
  }, [ctx.photoBlob]);

  const handleClick = async () => {
    setLoading(true);
    ctx.similiarityScore = null;
    await ctx.takeScreenshot("photo-consent");
    setFirst(null);
    ctx.routePath();
  };

  const errorHandler = () => {
    setIsError(false);
  };

  if (ctx.locale === "" || !locale) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {isError && (
        <ErrorModal
          error={[locale.Error.Values.Do_Not_Match]}
          buttonString={[locale.Error.Button.Try_Again]}
          errorHander={[errorHandler]}
        />
      )}
      <div className={`${styles.heading}`}>{locale.Heading}</div>
      <div className={`${styles.script}`}>{locale.Subheading.Take_Selfie}</div>
      <div className={styles.permissionCard}>
        <div className={styles.image}>
          {!ctx.photoBlob ? (
            <video
              ref={ctx.videoRef}
              autoPlay
              muted
              className={styles.recordVideo}
            ></video>
          ) : (
            <Image
              // className={styles.recordVideo}
              src={URL.createObjectURL(ctx.photoBlob)}
              alt="Captured"
              width={280}
              height={210}
            />
          )}
        </div>
        {!ctx.photoBlob ? (
          <Button className={styles.controlButton} onClick={ctx.capturePhoto}>
            {locale.Button.Take_Selfie}
          </Button>
        ) : (
          <Button className={styles.controlButton} onClick={ctx.resetPhoto}>
            {locale.Button.Take_Again}
          </Button>
        )}
      </div>
      {ctx.similiarityScore !== null ? (
        <div
          className={`${styles.referenceNumber} ${
            ctx.similiar === true ? styles.greenBack : styles.redBack
          }`}
        >
          {locale.Values.Match_Score} {Math.floor(ctx.similiarityScore)}
        </div>
      ) : null}
      {!!ctx.photoBlob && ctx.similiar === true && !loading && (
        <Button className={styles.navigationButton} onClick={handleClick}>
          {locale.Button.Proceed}
        </Button>
      )}
      {ctx.photoBlob && loading && (
        <Image
          src="/loading.svg"
          width={32}
          height={32}
          alt="Picture of the author"
          style={{ marginTop: 16 }}
        />
      )}
    </>
  );
};

export default Auth(PhotoConsent);
