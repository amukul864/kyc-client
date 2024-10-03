"use client";
import styles from "./page.module.css";
import Button from "@/app/components/ui/Button";
import { useState, useContext, useEffect } from "react";
import VideoContext from "@/app/store/video-context";
import useAudio from "@/hooks/useAudio";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ErrorModal from "../../components/ErrorModal/ErrorModal";
import axios from "@/utils/axios";
import Image from "next/image";
import customerFeedbackLocale from "@/locale/multi-lingual/pages/customer-feedback";
import useLocale from "@/hooks/useLocale";
import Auth from "@/middleware/Auth";

const CustomerFeedback = () => {
  useAudio("customer-feedback");
  const ctx = useContext(VideoContext);
  const [feedback, setFeedback] = useState<number[]>([]);
  const [feedbackQuestions, setFeedbackQuestions] = useState<any[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const locale = useLocale(customerFeedbackLocale);

  useEffect(() => {
    const init = async () => {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_API_URL}/feedbacks/${ctx.shareId}`,
        headers: {
          "Content-Type": "application/json",
        },
      };
      try {
        const response = await axios.request(config);
        setFeedbackQuestions(response.data.data.feedbacks);
      } catch (err) {
        console.log(err);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (feedbackQuestions.length !== 0) {
      const feedbackArray = new Array(feedbackQuestions.length).fill(0);
      setFeedback(feedbackArray);
    }
  }, [feedbackQuestions]);

  const errorHandler = async () => {
    setError(false);
    const feedbacks = [...feedbackQuestions];
    for (let i = 0; i < feedbacks.length; i++) {
      feedbacks[i].value = feedback[i];
    }
    const data = { feedbacks };
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.NEXT_PUBLIC_API_URL}/feedbacks/${ctx.shareId}`,
      data: data,
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      await axios.request(config);
      ctx.routePath();
    } catch (err) {
      console.log(err);
    }
  };

  const disagreementsHandler = async () => {
    const data = { disagreements: ctx.disagreements };
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.NEXT_PUBLIC_API_URL}/feedbacks/disagreements/${ctx.shareId}`,
      data: data,
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      await axios.request(config);
    } catch (err) {
      console.log(err);
    }
  };

  const saveFeedback = (question: number, answer: number) => {
    let feedbackArray = new Array(feedbackQuestions.length).fill(0);
    feedbackArray = [...feedback];
    feedbackArray[question] = answer;
    setFeedback(feedbackArray);
  };

  const canProceed = () => {
    for (let i = 0; i < feedback.length; i++) {
      if (feedback[i] === 0) {
        return false;
      }
    }
    return true;
  };

  if (ctx.locale === "" || !locale) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {error && (
        <ErrorModal
          error={[locale.Error.Values.Thanks_For_Submitting]}
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
      <div className={styles.card}>
        <div className={styles.infoItem}>
          {locale.Subheading.Rate_On_The_Scale}
        </div>
      </div>
      <div className={styles.personalInfo}>
        {feedbackQuestions.map((item, index) => (
          <div key={index} className={styles.detail}>
            <div className={styles.label}>{item.label}</div>
            <div className={`${styles.flex} ${styles.field}`}>
              {feedback.map((_, number) => (
                <div
                  key={number}
                  className={`${styles.rating}  ${
                    feedback[index] > number ? styles.applied : ""
                  }`}
                  onClick={() => {
                    saveFeedback(index, number + 1);
                  }}
                >
                  {number + 1}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.flex}>
        {!loading ? (
          canProceed() && (
            <Button
              className={styles.controlButton}
              onClick={async () => {
                setLoading(true);
                await ctx.takeScreenshot("customer-feedback");
                await disagreementsHandler();
                setError(true);
              }}
            >
              {locale.Button.Agree}
            </Button>
          )
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

export default Auth(CustomerFeedback);
