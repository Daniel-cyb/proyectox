"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("91fd148a-0a5e-49a8-978c-338f2398c59c");
  }, []);

  return null;
};
