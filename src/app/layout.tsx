import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "קבליט - הפקת קבלות PDF אוטומטית",
  description: "מערכת פשוטה וחכמה להפקת קבלות PDF מקובצי Excel. מתאים לעסקים קטנים ועצמאים בישראל.",
  keywords: ["קבלות", "PDF", "אקסל", "עסק קטן", "חשבונית", "עצמאים"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
