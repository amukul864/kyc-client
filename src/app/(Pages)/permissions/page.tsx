"use client";
import styles from "./page.module.css";
import Button from "@/app/components/ui/Button";
import Image from "next/image";
import { useContext, useState } from "react";
import useAudio from "@/hooks/useAudio";
import VideoContext from "@/app/store/video-context";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import permissionsLocale from "@/locale/multi-lingual/pages/permissions";
import useLocale from "@/hooks/useLocale";
import Auth from "@/middleware/Auth";

const Permissions = () => {
  useAudio("permissions");
  const [cameraAccess, setCameraAccess] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<boolean | null>(null);
  const [locationAccess, setLocationAccess] = useState<boolean | null>(null);
  const [locationError, setLocationError] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const ctx = useContext(VideoContext);
  const locale = useLocale(permissionsLocale);

  const clickHandler = () => {
    setLoading(true);
    ctx.routePath();
  };

  const requestVideoAndAudioPermissions = async (): Promise<void> => {
    try {
      setCameraAccess(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setCameraAccess(false);
      await ctx.sendAdditionalData({ hwEnabled: true });
      return stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("Permissions denied", error);
      setCameraAccess(null);
      setCameraError(true);
    }
  };

  const requestLocationAccess = async () => {
    setLocationAccess(false);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async position => {
          setLocationAccess(true);
          await ctx.sendAdditionalData({
            locEnabled: true,
            lat: position.coords.latitude.toString(),
            long: position.coords.longitude.toString(),
          });
        },
        error => {
          console.error("Location access denied", error);
          setLocationAccess(null);
          setLocationError(true);
        },
      );
    } else {
      console.error("Geolocation is not supported by this browser");
    }
  };

  if (ctx.locale === "" || !locale) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className={`${styles.heading}`}>{locale.Heading}</div>
      <div className={`${styles.script}`}>{locale.Subheading.Permissions}</div>
      <div className={styles.permissionCard}>
        <div>{locale.Values.Camera}</div>
        {cameraAccess == true && !cameraError && (
          <Image
            className={styles.image}
            src="/loading.svg"
            width={32}
            height={32}
            alt="Picture of the author"
          />
        )}
        {cameraAccess == false && (
          <Image
            className={styles.image}
            src="/success.png"
            width={32}
            height={32}
            alt="Picture of the author"
          />
        )}
        {cameraAccess === null && !cameraError ? (
          <Button
            className={styles.controlButton}
            onClick={requestVideoAndAudioPermissions}
          >
            {locale.Button.Allow}
          </Button>
        ) : (
          <div className={styles.extra} />
        )}
        {cameraError === true ? (
          <div className="color-orange-red">{locale.Values.Camera_Reset}</div>
        ) : null}
      </div>
      <div className={styles.permissionCard}>
        <div>{locale.Values.Location}</div>
        {locationAccess == false && !locationError && (
          <Image
            className={styles.image}
            src="/loading.svg"
            width={32}
            height={32}
            alt="Picture of the author"
          />
        )}
        {locationAccess == true && (
          <Image
            className={styles.image}
            src="/success.png"
            width={32}
            height={32}
            alt="Picture of the author"
          />
        )}
        {locationAccess === null && !locationError ? (
          <Button
            className={styles.controlButton}
            onClick={requestLocationAccess}
          >
            {locale.Button.Allow}
          </Button>
        ) : (
          <div className={styles.extra} />
        )}
        {locationError === true ? (
          <div className="color-orange-red">{locale.Values.Location_Reset}</div>
        ) : null}
      </div>
      {cameraAccess == false &&
        locationAccess == true &&
        (!loading ? (
          <Button className={styles.navigationButton} onClick={clickHandler}>
            {locale.Button.Proceed}
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
    </>
  );
};

export default Auth(Permissions);
