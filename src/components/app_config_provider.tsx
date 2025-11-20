"use client";

import React, { createContext, useContext, useMemo } from "react";
import { AppConfig } from "@/lib/app_config/types";

// Define the AppConfigContext.
const AppConfigContext = createContext<AppConfig | null>(null);

/** The hook to use the app config. This may be used by Client Components. */
export function useAppConfig(): AppConfig {
  const appConfig = useContext(AppConfigContext);
  if (appConfig === null) {
    throw new Error("useAppConfig must be used within a AppConfigProvider");
  }
  return appConfig;
}

type AppConfigProviderProps = {
  appConfig: AppConfig;
  children: React.ReactNode;
};

/** The provider for the AppConfig. */
export function AppConfigProvider({
  appConfig,
  children,
}: AppConfigProviderProps) {
  // Use useMemo to ensure the same object reference is provided on subsequent
  // renders, preventing unnecessary consumer re-renders.
  const configValue = useMemo(() => appConfig, [appConfig]);

  return (
    <AppConfigContext.Provider value={configValue}>
      {children}
    </AppConfigContext.Provider>
  );
}
