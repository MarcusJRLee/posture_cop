"use client";

import { useEffect } from "react";
import { AppConfigProvider } from "@/components/app_config_provider";
import { AppConfig } from "@/lib/app_config/types";
import { logTick } from "@/lib/logs/latency/ticks";

// =========================================================
// 1. **SYNCHRONOUS BOOTSTRAPPING LOGIC GOES HERE**
//    This code runs once on the client before the component
//    even renders/hydrates.
// =========================================================

logTick("client_bootstrap_start");

type AppConfigProviderProps = {
  appConfig: AppConfig;
  children: React.ReactNode;
};

/** The Client Bootstrap component. */
export default function ClientBootstrap({
  appConfig,
  children,
}: AppConfigProviderProps) {
  logTick("client_bootstrap_hydration_start");

  console.log(`TODO(mjrlee): User: ${appConfig.user?.email}`);

  useEffect(() => {
    logTick("client_bootstrap_effect_start");
  }, [appConfig.user]);

  return (
    <AppConfigProvider appConfig={appConfig}>{children}</AppConfigProvider>
  );
}
