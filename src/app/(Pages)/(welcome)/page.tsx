"use client";
import styles from "./page.module.css";
import Button from "@/app/components/ui/Button";
import useBrowser from "@/hooks/useBrowser";
import { useContext, useEffect, useState } from "react";
import VideoContext from "@/app/store/video-context";
import useAuth from "@/hooks/useAuth";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import Image from "next/image";
import pkg from "../../../../package.json";
import welcomeLocale from "@/locale/multi-lingual/pages/welcome";
import useLocale from "@/hooks/useLocale";
import Auth from "@/middleware/Auth";

const Welcome = () => {
  const ctx = useContext(VideoContext);
  const [reference, setReference] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const isAuth = useAuth();
  const locale = useLocale(welcomeLocale);

  useBrowser();

  // Show the current version of the application
  console.info({ version: pkg.version });

  useEffect(() => {
    const init = async () => {
      if (ctx.shareId !== "") {
        await ctx.getUserData();
      }
    };

    init();
  }, [ctx.shareId]);

  useEffect(() => {
    if (isAuth === true) {
      ctx.setToken();
    }
  }, [isAuth]);

  useEffect(() => {
    const init = () => {
      if (isAuth === true) {
        setReference(ctx.user.referalNumber);
        if (ctx.shareId !== "") {
          ctx.getPaths();
        }
      }
    };

    init();
  }, [ctx.shareId, ctx.user.referalNumber, isAuth]);

  const clickHandler = () => {
    setLoading(true);
    ctx.routePath();
  };

  if (ctx.locale === "" || !locale) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className={`${styles.heading}`}>{locale.Heading}</div>
      <div className={`${styles.referenceNumber}`}>
        {locale.Subheading.Reference_Number}{" "}
        {reference !== "" ? reference : locale.Subheading.Loading}
      </div>
      {!loading ? (
        <Button className={`${styles.controlButton}`} onClick={clickHandler}>
          {locale.Button.English}
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
    </>
  );
};

export default Auth(Welcome);
