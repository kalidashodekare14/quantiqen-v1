import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { AppProviders } from "@/providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const poppings = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quantiqen v1",
  description: "Enterprise Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", poppings.className, "font-sans", geist.variable)}
    >
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
