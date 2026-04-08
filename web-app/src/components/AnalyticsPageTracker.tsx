"use client";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/src/analytics/googleAnalytics";

export function AnalyticsPageTracker() {
  const { hash, pathname, search } = useLocation();

  useEffect(() => {
    trackPageView(`${pathname}${search}${hash}`);
  }, [hash, pathname, search]);

  return null;
}
