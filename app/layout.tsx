import type { Metadata } from "next";
import { Geist_Mono, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "bachelor. | Hire ambitious student talent",
  description:
    "A student skill marketplace connecting ambitious university freelancers with real projects.",
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
        "h-full",
        "font-sans",
        "antialiased",
        geistMono.variable,
        playfairDisplayHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
