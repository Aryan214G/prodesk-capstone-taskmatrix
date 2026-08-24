import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import { Toaster } from "sonner";

export const metadata = {
  title: "TaskMatrix",
  description: "Agile project management for focused software teams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}