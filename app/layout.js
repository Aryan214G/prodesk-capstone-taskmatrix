import "./globals.css";

export const metadata = {
  title: "TaskMatrix",
  description: "Agile project management for focused software teams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}