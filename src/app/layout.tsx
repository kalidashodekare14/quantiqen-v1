import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import {cn} from '@/lib/utils'
import "./globals.css";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const poppings = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Quantiqen v1",
  description: "Quantiqen application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
       className={cn(
        'h-full',
        'antialiased',
        poppings.className,
        'font-sans',
        geist.variable
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
