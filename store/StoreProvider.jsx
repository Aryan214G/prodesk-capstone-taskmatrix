"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import AuthSync from "@/components/AuthSync";

export default function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthSync />
      {children}
    </Provider>
  );
}