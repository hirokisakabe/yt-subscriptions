"use client";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function DashboardPage() {
  const { status } = useSession({
    required: true,
    onUnauthenticated: () => redirect("/"),
  });

  useEffect(() => {
    (async () => {
      if (status !== "authenticated") {
        return;
      }

      const subscriptions = await fetch("/api/subscriptions");

      console.log(await subscriptions.json());
    })();
  }, [status]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <div>
      <main className="px-3 py-1">
        <button type="button" onClick={() => signOut()}>
          Sign out
        </button>
      </main>
    </div>
  );
}
