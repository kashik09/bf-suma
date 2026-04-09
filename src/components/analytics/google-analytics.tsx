"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { isDoNotTrackEnabled, trackEvent } from "@/lib/analytics";

const GA_MEASUREMENT_ID = (process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "").trim();

function getPagePath(pathname: string): string {
  if (typeof window === "undefined") return pathname;
  return `${pathname}${window.location.search || ""}`;
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const [trackingAllowed, setTrackingAllowed] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      setTrackingAllowed(false);
      return;
    }

    setTrackingAllowed(!isDoNotTrackEnabled());
  }, []);

  useEffect(() => {
    if (!trackingAllowed || !scriptLoaded) return;

    const pagePath = getPagePath(pathname || "/");
    trackEvent("page_view", {
      page_path: pagePath,
      page_location: typeof window === "undefined" ? pagePath : window.location.href,
      page_title: typeof document === "undefined" ? "BF Suma" : document.title
    });
  }, [pathname, scriptLoaded, trackingAllowed]);

  if (!GA_MEASUREMENT_ID || !trackingAllowed) return null;

  return (
    <>
      <Script
        onLoad={() => setScriptLoaded(true)}
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
