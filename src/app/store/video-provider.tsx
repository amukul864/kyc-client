"use client";

import VideoContext from "./video-context";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "@/utils/axios";
import html2canvas from "html2canvas";

interface User {
  referalNumber: string;
  proposalNumber: string;
  personal: any[];
  plan: any[];
  rider: any[];
}

const VideoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}): any => {
  const [recording, setRecording] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(false);
  const [detected, setDetected] = useState<boolean>(false);
  const [similiar, setSimiliar] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState<number>(0);
  const [videoTime, setVideoTime] = useState<number>(0);
  const timeInterval = useRef<NodeJS.Timeout | undefined>(undefined);
  const stopTimeInterval = useRef<NodeJS.Timeout | undefined>(undefined);
  const router = useRouter();
  const videoExtension = "mp4";
  const [urlPaths, setUrlPaths] = useState<
    | {
        url: string;
        sortOrder: number;
      }[]
    | null
  >(null);
  const [url, setUrl] = useState<number>(0);
  const [user, setUser] = useState<User>({
    referalNumber: "",
    proposalNumber: "",
    personal: [],
    plan: [],
    rider: [],
  });
  const [disagreements, _] = useState<{ url: string; disagreement: string }[]>(
    [],
  );
  const [shareId, setShareId] = useState<string>("");
  const [locale, setLocale] = useState<string>("");
  const [similiarityScore, setSimiliarityScore] = useState<number | null>(null);

  const stopRecording = () => {
    clearInterval(timeInterval.current);
    setVideoTime(time);
    if (mediaRecorder) {
      mediaRecorder.stop();
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach(track => track.stop());
      }
      setRecording(false);
      setPaused(false);
      setPlaying(true);
    } else {
      console.error("mediaRecorder is not available");
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    let option: string | null = null;
    if (MediaRecorder.isTypeSupported("video/webm; codecs=vp9")) {
      option = "video/webm; codecs=vp9";
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      option = "video/webm";
    } else if (MediaRecorder.isTypeSupported("video/mp4")) {
      option = "video/mp4";
    } else {
      console.error("no suitable mimetype found for this device");
    }
    const options = {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
      mimeType: option || `video/webm;codecs=h264`,
    };
    const recorder = new MediaRecorder(stream, options);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    recorder.onstop = () => {
      const completeBlob = new Blob(chunks, {
        type: `video/${videoExtension}`,
      });
      setVideoBlob(completeBlob);
    };
    recorder.start();
    setMediaRecorder(recorder);
    setPaused(false);
    setRecording(true);
    timeInterval.current = setInterval(() => {
      setTime(state => state + 10);
    }, 10);
  };

  const playVideo = () => {
    setTime(0);
    clearInterval(timeInterval.current);
    if (videoBlob && playbackRef.current) {
      const trimmedVideoURL = URL.createObjectURL(videoBlob);
      playbackRef.current.src = trimmedVideoURL;
      playbackRef.current.play().catch(error => {
        console.error("Failed to start video playback:", error);
      });
      timeInterval.current = setInterval(() => {
        setTime(state => state + 10);
      }, 10);
      stopTimeInterval.current = setTimeout(() => {
        clearInterval(timeInterval.current);
      }, videoTime);
    } else {
      console.error(
        "trimmedVideoBlob is not available or PlaybackRef.current is null",
      );
    }
  };

  const pauseRecording = () => {
    clearInterval(timeInterval.current);
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      setPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      timeInterval.current = setInterval(() => {
        setTime(state => state + 10);
      }, 10);
      mediaRecorder.resume();
      setPaused(false);
    }
  };

  const resetRecording = async () => {
    setVideoTime(0);
    clearTimeout(stopTimeInterval.current);
    clearInterval(timeInterval.current);
    setPlaying(false);
    setVideoBlob(null);
    setRecording(false);
    setPaused(false);
    setTime(0);
    if (playbackRef.current) {
      playbackRef.current.src = "";
    }
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach(track => track.stop());
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const confirmRecording = async () => {
    clearInterval(timeInterval.current);
    clearTimeout(stopTimeInterval.current);
  };

  const submitRecording = async (customerAttributes: any[]) => {
    if (!videoBlob) {
      console.error("No video to submit");
      return;
    }
    const formData = new FormData();
    formData.append("shareId", `${shareId}`);
    formData.append("referrer", `video-consent`);
    formData.append("customerAttributes", JSON.stringify(customerAttributes));
    formData.append("videoConsent", videoBlob, `video.mp4`);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/videos/consent`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );
      if (response.data.data === "ok") {
        routePath();
      } else {
        console.log("not ok");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const capturePhoto = async () => {
    try {
      setPhotoBlob(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      await new Promise<void>(resolve => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoBlob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(blob => {
          resolve(blob);
        }, "image/jpeg");
      });
      stream.getTracks().forEach(track => track.stop());
      setPhotoBlob(photoBlob);
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  };

  const resetPhoto = async () => {
    setPhotoBlob(null);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach(track => track.stop());
      }
      setPhotoBlob(null);
    };
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && File.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.type });
        setImageBlob(blob);
      };
      reader.readAsDataURL(file);
    }
  };

  const getUserData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${shareId}`,
        {
          withCredentials: true,
        },
      );
      const newUser: User = {
        proposalNumber: "",
        referalNumber: "",
        plan: [],
        personal: [],
        rider: [],
      };
      const data = response.data.data;
      newUser.proposalNumber = data.proposalNumber;
      newUser.referalNumber = data.referalNumber;
      Object.values(data.personal).forEach(key => {
        newUser.personal.push(key);
      });
      Object.values(data.plan).forEach(key => {
        newUser.plan.push(key);
      });
      Object.values(data.rider).forEach(key => {
        newUser.rider.push(key);
      });
      newUser.personal = newUser.personal.sort(
        (a: any, b: any) => a.sortOrder - b.sortOrder,
      );
      newUser.plan = newUser.plan.sort(
        (a: any, b: any) => a.sortOrder - b.sortOrder,
      );
      newUser.rider = newUser.rider.sort(
        (a: any, b: any) => a.sortOrder - b.sortOrder,
      );
      setUser(newUser);
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  const detectFace = async () => {
    if (photoBlob) {
      const data = new FormData();
      data.append("shareId", `${shareId}`);
      data.append("referrer", `personal-details`);
      data.append("photoFace", photoBlob, "image.jpg");
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_API_URL}/photos/face-detect`,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: data,
        withCredentials: true,
      };
      try {
        const response = await axios.request(config);
        setDetected(response.data.data.faceDetected || false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const checkAccuracy = async (url: string) => {
    if (imageBlob && photoBlob) {
      const data = new FormData();
      data.append("shareId", `${shareId}`);
      data.append("referrer", `${url}`);
      data.append("photoConsent", photoBlob, "image.jpg");
      data.append("photoId", imageBlob, "image.jpg");
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_API_URL}/photos/face-compare`,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: data,
        withCredentials: true,
      };
      try {
        const response = await axios.request(config);
        if (
          response.data.data.isSimilar === true ||
          response.data.data.isSimilar === false
        ) {
          setSimiliar((response.data.data.isSimilar as boolean) || false);
          setSimiliarityScore(response.data.data.similarity);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const sendAdditionalData = async ({
    hwEnabled,
    locEnabled,
    lat,
    long,
    live,
    browser,
    version,
    appName,
    userAgent,
  }: {
    hwEnabled?: boolean;
    locEnabled?: boolean;
    lat?: string;
    long?: string;
    live?: boolean;
    browser?: string;
    version?: string;
    appName?: string;
    userAgent?: string;
  }) => {
    let data: string;
    if (hwEnabled !== undefined) {
      data = JSON.stringify({
        cameraMicrophoneEnabled: hwEnabled,
      });
    } else if (
      locEnabled !== undefined &&
      lat !== undefined &&
      long !== undefined
    ) {
      data = JSON.stringify({
        locationEnabled: locEnabled,
        coordinates: {
          latitude: lat,
          longitude: long,
        },
      });
    } else if (live !== undefined) {
      data = JSON.stringify({
        liveness: {
          personAlive: live,
        },
      });
    } else if (
      browser !== undefined &&
      version !== undefined &&
      appName !== undefined &&
      userAgent !== undefined
    ) {
      data = JSON.stringify({
        clientInfo: {
          browser,
          version,
          appName,
          userAgent,
        },
      });
    } else {
      data = JSON.stringify({});
    }
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.NEXT_PUBLIC_API_URL}/activities/${shareId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    try {
      await axios.request(config);
    } catch (error) {
      console.log(error);
    }
  };

  const getPaths = async () => {
    const data = new FormData();
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.NEXT_PUBLIC_API_URL}/workflows/${shareId}`,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data,
    };
    try {
      const response = await axios.request(config);
      const sortedUrlsAndSortOrders = response.data.data.pages
        .map((item: any) => ({
          url: item.url,
          sortOrder: item.sortOrder,
        }))
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder);
      setUrlPaths(sortedUrlsAndSortOrders);
      setUrl(0);
    } catch (error) {
      console.log(error);
    }
  };

  const routePath = (customPath?: string) => {
    if (urlPaths) {
      if (customPath) {
        const pathIndex = urlPaths.findIndex(state => state.url === customPath);
        setUrl(pathIndex);
        router.replace(`/${urlPaths[pathIndex].url}`);
        setUrl(state => state + 1);
        setPhotoBlob(null);
      } else if (url < urlPaths.length) {
        router.replace(`/${urlPaths[url].url}`);
        setUrl(state => state + 1);
      } else if (url >= urlPaths.length) {
        router.replace("/thank-you");
      }
    }
  };

  const setToken = () => {
    setShareId(window.location.search.split("shareId=")[1]);
  };

  const setUserLocale = (language: string) => {
    setLocale(language);
  };

  const takeScreenshot = async (urlString: string) => {
    try {
      let screenshot: HTMLBodyElement = document.body as HTMLBodyElement;
      const canvas = await html2canvas(screenshot);
      canvas.toBlob(async blob => {
        if (blob) {
          let data = new FormData();
          data.append("shareId", shareId);
          data.append("referrer", urlString);
          data.append("photoScreenshot", blob, "image.jpg");
          const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `${process.env.NEXT_PUBLIC_API_URL}/photos/screenshots`,
            headers: {
              "Content-Type": "multipart/form-data",
            },
            data: data,
          };
          await axios.request(config);
        } else {
          console.error("Failed to capture screenshot");
        }
      }, "image/jpg");
    } catch (error) {
      console.error("Error taking screenshot:", error);
    }
  };

  return (
    <VideoContext.Provider
      value={{
        recording,
        paused,
        playing,
        detected,
        similiar,
        similiarityScore,
        time,
        videoBlob,
        photoBlob,
        imageBlob,
        disagreements,
        shareId,
        locale,
        videoRef,
        playbackRef,
        capturePhoto,
        startRecording,
        stopRecording,
        playVideo,
        pauseRecording,
        resumeRecording,
        resetRecording,
        resetPhoto,
        confirmRecording,
        routePath,
        setToken,
        setUserLocale,
        submitRecording,
        detectFace,
        takeScreenshot,
        getPaths,
        checkAccuracy,
        sendAdditionalData,
        handleImageChange,
        getUserData,
        user,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export default VideoProvider;
