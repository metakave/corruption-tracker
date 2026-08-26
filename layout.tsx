import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import DashboardSidebar from "@/components/ui/Sidebar";
import DashboardNavbar from "@/components/ui/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/context/LanguageContext";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import Footer from "@/components/ui/Footer";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoBengali = Noto_Serif_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Bangladesh Violence Tracker | Real-Time Political & Social Incident Map",
  description: "The leading platform for monitoring political violence, election unrest, and violence against women in Bangladesh. Access verified reports, real-time data maps, and media analysis for a safer 'New Bangladesh.'",
  keywords: ["Political violence in Bangladesh", "Bangladesh political unrest", "Election violence monitoring", "Violence against women reporting", "Political clash news"],
  openGraph: {
    title: "Bangladesh Violence Tracker",
    description: "Real-time monitoring of political and social incidents in Bangladesh.",
    url: "https://violencetracker.org",
    siteName: "Violence Tracker BD",
    locale: "bn_BD",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        {/* Microsoft Clarity */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script id="clarity-script" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
            `}
          </Script>
        )}
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-94WC6YS4Z2" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-94WC6YS4Z2');
          `}
        </Script>
        {/* Organization Schema for Google Knowledge Graph */}
        <Script id="org-schema" type="application/ld+json" strategy="afterInteractive">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Bangladesh Violence Tracker",
              "url": "https://violencetracker.org",
              "logo": "https://violencetracker.org/logo.png",
              "sameAs": [
                "https://facebook.com/violencetrackerbd",
                "https://twitter.com/violencetracker"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+880-1700000000",
                "contactType": "customer service"
              }
            }
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoBengali.variable} antialiased min-h-screen bg-gray-50 dark:bg-black`}>
        <ThemeProvider defaultTheme="system" storageKey="pv-theme">
          <LanguageProvider>
            <div className="flex w-full min-h-screen">
              {/* Sidebar is client-only mainly for usePathname */}
              <DashboardSidebar />

              <div className="flex-1 flex flex-col min-w-0">
                <DashboardNavbar />
                <main className="flex-1 bg-gray-50 dark:bg-black transition-colors relative">
                  {children}
                  <Footer />
                  <WhatsAppButton />
                </main>
              </div>
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
