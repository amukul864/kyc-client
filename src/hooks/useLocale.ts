import VideoContext from "@/app/store/video-context";
import { useEffect, useContext, useState } from "react";

const useLocale = (data: any) => {
  const ctx = useContext(VideoContext);
  const [locale, setLocale] = useState<any>(null);

  useEffect(() => {
    const locale = ctx.locale;

    if (data[locale]) {
      setLocale(data[locale]);
    }
  }, [ctx.locale]);

  return locale;
};

export default useLocale;
