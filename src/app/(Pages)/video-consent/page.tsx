"use client";
import styles from "./page.module.css";
import Button from "@/app/components/ui/Button";
import { useState, useEffect, useContext, useRef } from "react";
import Image from "next/image";
import VideoContext from "@/app/store/video-context";
import axios from "@/utils/axios";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ErrorModal from "@/app/components/ErrorModal/ErrorModal";
import videoConsentLocale from "@/locale/multi-lingual/pages/video-consent";
import useLocale from "@/hooks/useLocale";
import Auth from "@/middleware/Auth";

const VideoConsent = () => {
  const ctx = useContext(VideoContext);
  const [time, setTime] = useState<string>("0:0:0");
  const [minTimeMet, setMinTimeMet] = useState<boolean>(false);
  const [compare, setCompare] = useState<boolean>(false);
  const [script, setScript] = useState<string>("");
  const [src, setSrc] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [listening, setListening] = useState<boolean>(false);
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const [customerAttributes, setCustomerAttributes] = useState<any[]>([]);
  const [isError, setIsError] = useState<boolean | null>(false);
  const [isForm, setIsForm] = useState<boolean | null>(false);
  const [error, setError] = useState<boolean | null>(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isTrue, setIsTrue] = useState<boolean[]>([]);
  const locale = useLocale(videoConsentLocale);
  const shouldContinueRef = useRef<boolean>(true);

  useEffect(() => {
    if (isError === false || compare === false) {
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
    }
  }, [isError, compare, ctx.videoRef.current]);

  useEffect(() => {
    if (customerAttributes.length !== 0) {
      const isTrueArray = new Array(customerAttributes.length).fill(false);
      setIsTrue(isTrueArray);
    }
  }, [customerAttributes]);

  const clickHandler = async () => {
    setLoading(true);
    for (let i = 0; i < customerAttributes.length; i++) {
      customerAttributes[i].value = isTrue[i] ? "true" : "false";
    }
    await ctx.submitRecording(customerAttributes);
    setError(true);
  };

  const saveAnswers = (question: number, answer: boolean) => {
    let feedbackArray = new Array(customerAttributes.length).fill(0);
    feedbackArray = [...isTrue];
    feedbackArray[question] = answer;
    setIsTrue(feedbackArray);
  };

  useEffect(() => {
    const init = async () => {
      if (isFirst === true) {
        setIsFirst(false);
      } else if (ctx.photoBlob) {
        await ctx.checkAccuracy("video-consent");
        setIsError(null);
      }
    };
    init();
  }, [ctx.photoBlob]);

  useEffect(() => {
    if (isFirst === false) {
      if (ctx.similiar === true) {
        setCompare(false);
        ctx.startRecording();
      }
      if (ctx.similiar === false) {
        setCompare(false);
        setIsError(true);
      }
    }
  }, [ctx.similiar, isError]);

  useEffect(() => {
    const init = async () => {
      if (
        process.env.NEXT_PUBLIC_MIN_DURATION &&
        process.env.NEXT_PUBLIC_MAX_DURATION
      ) {
        const minDuration = parseInt(process.env.NEXT_PUBLIC_MIN_DURATION);
        const maxDuration = parseInt(process.env.NEXT_PUBLIC_MAX_DURATION);
        if (ctx.time < 1000 * minDuration) {
          setMinTimeMet(false);
        } else {
          setMinTimeMet(true);
        }
        if (ctx.time > 1000 * maxDuration) {
          await ctx.takeScreenshot("video-consent");
          ctx.stopRecording();
          ctx.confirmRecording();
          setScript("");
          shouldContinueRef.current = false;
        }
      }
    };
    init();
  }, [ctx.time]);

  useEffect(() => {
    const totalSeconds: number = Math.floor(ctx.time / 1000);
    const totalMinutes: number = Math.floor(totalSeconds / 60);
    const totalHours: number = Math.floor(totalMinutes / 60);
    const minutes: number = Math.floor(totalMinutes - totalHours * 60);
    const seconds: number = Math.floor(totalSeconds - totalMinutes * 60);
    setTime(`${totalHours}:${minutes}:${seconds}`);
  }, [ctx.time]);

  useEffect(() => {
    const data = new FormData();
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.NEXT_PUBLIC_API_URL}/videos/scripts?language=${ctx.locale}&shareId=${ctx.shareId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    axios
      .request(config)
      .then(response => {
        setSrc(response.data.data.script);
        setAudioUrl(
          process.env.NEXT_PUBLIC_URL + "/" + response.data.data.speechUrl,
        );
        let attributes: any[] = [];
        Object.values(response.data.data.customerAttributes).forEach(key => {
          attributes.push(key);
        });
        attributes = attributes.sort(
          (a: any, b: any) => a.sortOrder - b.sortOrder,
        );
        setCustomerAttributes(attributes);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  const pause = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const scriptWritter = async () => {
    const srcArray = src.split(" ");
    setScript("");
    shouldContinueRef.current = true;
    for (let i = 0; i < srcArray.length; i++) {
      if (!shouldContinueRef.current) {
        break;
      }
      setScript(state => state + " " + srcArray[i]);
      await pause(500);
    }
  };

  const confirmHandler = () => {
    setError(false);
  };

  const recordingHandler = () => {
    if (ctx.imageBlob) {
      setCompare(true);
      ctx.capturePhoto();
    }
    if (!ctx.imageBlob) {
      ctx.startRecording();
    }
  };

  const recordAgain = () => {
    ctx.routePath("video-consent");
    setIsError(false);
    setIsFirst(true);
  };

  const uploadIdAgain = () => {
    ctx.routePath("upload-id");
  };

  const playScript = () => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      setListening(true);
      audioRef.current.play().catch(error => {
        console.error("Failed to play audio:", error);
      });
    }
  };

  const stopScript = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
      setListening(false);
    }
  };

  if (ctx.locale === "" || !locale) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <audio ref={audioRef} crossOrigin="anonymous" className="hide" controls />
      {compare && <ErrorModal error={[locale.Error.Values.Verifying]} />}
      {isError && (
        <ErrorModal
          error={[locale.Error.Values.Do_Not_Match]}
          errorHander={[recordAgain, uploadIdAgain]}
          buttonString={[
            locale.Error.Button.Try_Again,
            locale.Error.Button.Upload_Id_Again,
          ]}
        />
      )}
      {error && (
        <ErrorModal
          error={[locale.Error.Values.Submitted]}
          buttonString={[locale.Error.Button.Proceed]}
          errorHander={[confirmHandler]}
          isPositive={true}
        />
      )}
      <div className={`${styles.heading}`}>{locale.Heading}</div>
      <div className={styles.card}>
        <div className={styles.infoItem}>
          {locale.Subheading.Proposal_Number} {ctx.user.proposalNumber}
        </div>
      </div>
      <div className={styles.permissionCard}>
        <div className={styles.image}>
          {!listening && (
            <>
              <video
                ref={ctx.videoRef}
                autoPlay
                muted
                className={`${!ctx.playing ? styles.recordVideo : "hide"}`}
              ></video>
              <video
                ref={ctx.playbackRef}
                autoPlay
                className={`${ctx.playing ? styles.recordVideo : "hide"}`}
              ></video>
            </>
          )}
          {!listening && <div className={styles.timeElapsed}>{time}</div>}
        </div>
        {ctx.videoBlob && !listening ? (
          <>
            <div className={styles.warning}>{locale.Values.Submitted}</div>
          </>
        ) : (
          <>
            <div className={styles.warning}>{locale.Values.Instructions}</div>
          </>
        )}
        {!(ctx.recording || ctx.paused || ctx.playing || !!ctx.videoBlob) && (
          <Button
            onClick={() => {
              stopScript();
              recordingHandler();
              scriptWritter();
            }}
            disabled={
              ctx.recording || ctx.paused || ctx.playing || !!ctx.videoBlob
            }
            className={styles.controlButton}
          >
            {locale.Button.Start_Recording}
          </Button>
        )}
        {!(
          ctx.recording ||
          ctx.paused ||
          ctx.playing ||
          !!ctx.videoBlob ||
          listening
        ) && (
          <Button
            onClick={() => {
              playScript();
              shouldContinueRef.current = false;
              setScript("");
            }}
            disabled={
              ctx.recording ||
              ctx.paused ||
              ctx.playing ||
              !!ctx.videoBlob ||
              listening
            }
            className={styles.controlButton}
          >
            {locale.Button.Listen_Script}
          </Button>
        )}
        {listening && (
          <Button
            onClick={async () => {
              stopScript();
              setScript("");
              await ctx.resetRecording();
            }}
            className={styles.controlButton}
          >
            {locale.Button.Stop_Script}
          </Button>
        )}
        {!(!ctx.recording || !minTimeMet || listening) && (
          <>
            <Button
              onClick={async () => {
                await ctx.takeScreenshot("video-consent");
                ctx.stopRecording();
                ctx.confirmRecording();
                shouldContinueRef.current = false;
                setScript("");
              }}
              disabled={!ctx.recording || !minTimeMet}
              className={styles.controlButton}
            >
              {locale.Button.Stop_Recording}
            </Button>
          </>
        )}
        {!(!ctx.recording || listening) && (
          <>
            <Button
              onClick={async () => {
                ctx.pauseRecording();
              }}
              disabled={!ctx.recording}
              className={`${!ctx.paused ? styles.controlButton : "hide"}`}
            >
              {locale.Button.Pause}
            </Button>
            <Button
              onClick={async () => {
                ctx.resumeRecording();
              }}
              disabled={!ctx.recording}
              className={`${ctx.paused ? styles.controlButton : "hide"}`}
            >
              {locale.Button.Resume}
            </Button>
          </>
        )}
        {!!ctx.videoBlob && !listening && (
          <>
            <Button
              onClick={() => {
                setIsError(false);
                setIsFirst(true);
                ctx.resetRecording();
              }}
              disabled={!ctx.videoBlob || listening}
              className={styles.controlButton}
            >
              {locale.Button.Record_Again}
            </Button>
            <Button
              onClick={ctx.playVideo}
              disabled={!ctx.videoBlob || listening}
              className={styles.controlButton}
            >
              {locale.Button.Play_Video}
            </Button>
          </>
        )}
      </div>
      {script !== "" &&
        (!isForm ? (
          <div className={styles.personalInfo}>
            <div className={styles.detail}>
              <div className={styles.label}>
                <div>{locale.Values.Script}</div>
                {!listening && (
                  <div
                    className={styles.controlButton}
                    onClick={() => {
                      ctx.stopRecording();
                      setListening(true);
                      setIsError(false);
                      playScript();
                      shouldContinueRef.current = false;
                      setScript("");
                    }}
                  >
                    {locale.Button.Play_Script}
                  </div>
                )}
              </div>
              <div className={styles.field}>{script}</div>
            </div>
            {!listening && (
              <Button
                onClick={() => {
                  setIsForm(true);
                  stopScript();
                }}
                className={`${styles.navigationButton}`}
              >
                {locale.Button.Fill_Form}
              </Button>
            )}
          </div>
        ) : (
          <div className={styles.personalInfo}>
            <div className={styles.detail}>
              {customerAttributes.map((item, index) => (
                <div className={styles.form} key={index}>
                  <div className={styles.formField}>{item.label}</div>
                  <div
                    onClick={() => {
                      saveAnswers(index, !isTrue[index]);
                    }}
                    className={`${styles.formButton} ${
                      !isTrue[index] && styles.redButton
                    }`}
                  >
                    {!isTrue[index] ? (
                      <div className={styles.toggleRed}>{locale.Button.No}</div>
                    ) : (
                      <div className={styles.toggleGreen}>
                        {locale.Button.Yes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                setIsForm(false);
              }}
              className={styles.navigationButton}
            >
              {locale.Button.Show_Script}
            </Button>
          </div>
        ))}
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
          {ctx.videoBlob && (
            <Button
              onClick={clickHandler}
              disabled={!ctx.videoBlob}
              className={styles.navigationButton}
            >
              {locale.Button.Submit_Video}
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default Auth(VideoConsent);
