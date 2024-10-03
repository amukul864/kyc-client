"use client";
import styles from "./page.module.css";
import Button from "@/app/components/ui/Button";
import { useState, useRef, useContext } from "react";
import Image from "next/image";
import VideoContext from "@/app/store/video-context";
import useAudio from "@/hooks/useAudio";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import uploadIdLocale from "@/locale/multi-lingual/pages/upload-id";
import useLocale from "@/hooks/useLocale";
import Auth from "@/middleware/Auth";

const UploadId = () => {
  useAudio("upload-id");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ctx = useContext(VideoContext);
  const [loading, setLoading] = useState<boolean>(false);
  const locale = useLocale(uploadIdLocale);

  const uploadPhotoAndNavigate = async () => {
    setLoading(true);
    await ctx.takeScreenshot("upload-id");
    ctx.routePath();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (ctx.locale === "" || !locale) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className={`${styles.heading}`}>{locale.Heading}</div>
      <div className={`${styles.script}`}>{locale.Subheading.Upload_Id}</div>
      <div className={styles.permissionCard}>
        <input
          className={styles.controlButton}
          type="file"
          accept="image/*"
          onChange={ctx.handleImageChange}
          style={{ display: "none" }}
          ref={fileInputRef}
        />
        <Button onClick={triggerFileInput} className={styles.controlButton}>
          {locale.Button.Select_Id}
        </Button>
        {ctx.imageBlob && (
          <div className={styles.preview}>
            <Image
              className={styles.image}
              src={URL.createObjectURL(ctx.imageBlob)}
              alt="Selected preview"
              width={270}
              height={200}
            />
          </div>
        )}
      </div>
      {ctx.imageBlob && loading && (
        <Image
          src="/loading.svg"
          width={32}
          height={32}
          alt="Picture of the author"
        />
      )}
      {ctx.imageBlob && !loading && (
        <button
          className={styles.navigationButton}
          onClick={uploadPhotoAndNavigate}
        >
          {locale.Button.Proceed}
        </button>
      )}
    </>
  );
};

export default Auth(UploadId);
