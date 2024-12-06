import type { Metadata } from "next";
import { headers } from "next/headers";

import "react-notion-x/src/styles.css";
// import "prismjs/themes/prism-tomorrow.css";
// import "katex/dist/katex.min.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "Swipe File - Nikita Morell",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-neutral-900`}>{children}</body>
    </html>
  );
}
