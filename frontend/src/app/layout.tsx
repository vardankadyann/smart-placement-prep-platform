import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Placement Copilot — Your Personal AI Career Mentor",
  description:
    "Complete AI-powered career preparation ecosystem for placements, internships, and job preparation. Resume analysis, mock interviews, coding prep, and more.",
  keywords: ["placement preparation", "AI career mentor", "mock interview", "resume analyzer", "DSA preparation"],
  openGraph: {
    title: "AI Placement Copilot",
    description: "Your Personal AI Career Mentor for Placements, Internships, and Job Preparation",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
