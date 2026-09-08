"use client";

import { Provider } from "react-redux";
import { makeStore } from "@/redux/store";
import { useRef } from "react";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(makeStore());
  return <Provider store={storeRef.current}>{children}</Provider>;
}
