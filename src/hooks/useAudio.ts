import VideoContext from "@/app/store/video-context";
import { useEffect, useState, useContext } from "react";

const useAudio = (url: string) => {
  const [audioSrc, setAudioSrc] = useState<string>("");
  const ctx = useContext(VideoContext);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        setAudioSrc(`/audio/${ctx.locale}/${url}.mp3`);
      } catch (error) {
        console.error("Failed to fetch audio:", error);
      }
    };
    fetchAudio();
    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, []);

  useEffect(() => {
    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audio
        .play()
        .catch(error => console.error("Failed to play audio:", error));
      return () => {
        audio.pause();
        audio.src = "";
      };
    }
  }, [audioSrc]);
};

export default useAudio;
