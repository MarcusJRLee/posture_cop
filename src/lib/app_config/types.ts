import { User } from "@/lib/auth/types";

/**
 * The application configuration. This is constructed on the server and passed
 * to the web client. This is a read-only set of values.
 */
export type AppConfig = {
  user: User | null;
};
