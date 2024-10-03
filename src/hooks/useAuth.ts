import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VideoContext from "@/app/store/video-context";
import axios from "@/utils/axios";

const useAuth = () => {
  const ctx = useContext(VideoContext);
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("shareId")) {
      setToken(params.get("shareId"));
    }
  }, []);

  useEffect(() => {
    if (ctx.shareId) {
      setToken(ctx.shareId);
    }
    if (ctx.shareId === "" && !params.get("shareId")) {
      setToken("#");
    }
  }, [ctx.shareId]);

  useEffect(() => {
    if (token === "#") {
      setIsAuth(false);
    } else if (token !== null) {
      const checkAuth = async () => {
        const data = new FormData();
        let config = {
          method: "get",
          maxBodyLength: Infinity,
          url: `${process.env.NEXT_PUBLIC_API_URL}/links/validate/${token}`,
          headers: {
            "Content-Type": "multipart/form-data",
          },
          data: data,
        };
        try {
          const response = await axios.request(config);
          if (response.status === 200) {
            setIsAuth(true);
            ctx.setUserLocale(response.data.data.language);
          } else if (response.status === 404) {
            setIsAuth(false);
          }
        } catch (err) {
          setIsAuth(false);
          console.log(err);
        }
      };

      checkAuth();
    }
  }, [token]);

  return isAuth;
};

export default useAuth;
