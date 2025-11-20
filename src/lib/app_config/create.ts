"use server";

import { AppClientConfig } from "@/lib/app_config/types";
import { getUser } from "@/lib/auth/server_actions";

/**
 * Creates the AppConfig (modeled after ytConfig). This is a read-only set of
 * values constructed on the server and passed to the client.
 *
 * If any of the fields in here are needed on the server, fetch them directly
 * instead.
 */
export async function createAppConfig(): Promise<AppClientConfig> {
  const appClientConfig: AppClientConfig = {
    user: await getUser(),
  };
  return appClientConfig;
}
