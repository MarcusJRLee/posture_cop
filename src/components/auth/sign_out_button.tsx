"use client";

import { logOut } from "@/lib/auth/server_actions";
import type { ReactNode } from "react";

export function SignOutButton(): ReactNode {
  return (
    <div className="flex justify-center my-4">
      <form
        action={logOut}
        className="bg-slate-700 rounded-lg p-4 shadow flex justify-center"
      >
        <button
          type="submit"
          className="text-white font-semibold px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
