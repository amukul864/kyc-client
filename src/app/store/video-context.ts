"use client";

import React from "react";

interface VideoContextType {
  recording: boolean;
  paused: boolean;
  playing: boolean;
  detected: boolean;
  similiar: boolean;
  similiarityScore: null | number;
  time: number;
  videoBlob: Blob | null;
  photoBlob: Blob | null;
  imageBlob: Blob | null;
  disagreements: { url: string; disagreement: string }[];
  shareId: string;
  locale: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  playbackRef: React.RefObject<HTMLVideoElement>;
  capturePhoto: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: (recorder?: MediaRecorder) => void;
  playVideo: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => Promise<void>;
  resetPhoto: () => Promise<() => void>;
  confirmRecording: () => void;
  routePath: (customPath?: string) => void;
  setToken: () => void;
  setUserLocale: (language: string) => void;
  submitRecording: (customerAttributes: any[]) => Promise<void>;
  detectFace: () => Promise<void>;
  takeScreenshot: (urlString: string) => Promise<void>;
  getPaths: () => Promise<void>;
  checkAccuracy: (url: string) => Promise<void>;
  sendAdditionalData: ({
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
  }) => Promise<void>;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getUserData: () => Promise<void>; //correct it
  user: {
    referalNumber: string;
    proposalNumber: string;
    personal: any[];
    plan: any[];
    rider: any[];
  };
}

const VideoContext = React.createContext<VideoContextType>({
  recording: false,
  paused: false,
  playing: false,
  detected: false,
  similiar: false,
  similiarityScore: null,
  time: 0,
  videoBlob: null,
  photoBlob: null,
  imageBlob: null,
  disagreements: [],
  shareId: "",
  locale: "",
  videoRef: { current: null },
  playbackRef: { current: null },
  capturePhoto: async () => {},
  startRecording: async () => {},
  stopRecording: () => {},
  playVideo: () => {},
  pauseRecording: () => {},
  resumeRecording: () => {},
  resetRecording: async () => {},
  resetPhoto: async () => () => {},
  confirmRecording: () => {},
  routePath: (customPath?: string) => {},
  setToken: () => {},
  setUserLocale: (language: string) => {},
  submitRecording: async (customerAttributes: any[]) => {},
  detectFace: async () => {},
  takeScreenshot: async (urlString: string) => {},
  getPaths: async () => {},
  checkAccuracy: async (url: string) => {},
  sendAdditionalData: async ({
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
  }) => {},
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => {},
  getUserData: async () => {},
  user: {
    referalNumber: "",
    proposalNumber: "",
    personal: [],
    plan: [],
    rider: [],
  },
});

export default VideoContext;
