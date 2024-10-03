"use client";

import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

const Auth = (Component: React.ComponentType) => {
  return function AuthenticatedComponent(props: any) {
    const isAuthenticated = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isAuthenticated === false) {
        router.replace("/error");
      }
    }, [isAuthenticated, router]);

    if (isAuthenticated === null || isAuthenticated === false) {
      return <LoadingSpinner />;
    }

    return <Component {...props} />;
  };
};

export default Auth;
