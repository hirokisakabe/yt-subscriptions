"use client";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import Image from "next/image";
import { Header } from "../parts";

export function DashboardPage() {
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated: () => redirect("/"),
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signIn();
    }
  }, [session]);

  useEffect(() => {
    (async () => {
      if (status !== "authenticated") {
        return;
      }

      const subscriptions = await fetch("/api/subscriptions");

      const json = await subscriptions.json();

      setItems(json.subscriptions.items);
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
    <div className="flex flex-col items-center">
      <main className="px-3 py-1 max-w-screen-md">
        <Header />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map((item) => {
            // @ts-ignore
            const title = item.snippet.title;
            // @ts-ignore
            const thumbnailUrl = item.snippet.thumbnails.high.url;
            // @ts-ignore
            const channelUrl = `https://youtube.com/channel/${item.snippet.resourceId.channelId}`;
            return (
              // @ts-ignore
              <div key={item.id}>
                <a href={channelUrl}>
                  <Image
                    src={thumbnailUrl}
                    alt={title}
                    width={360}
                    height={480}
                    priority
                    style={{
                      borderRadius: "10px",
                    }}
                  />
                  <div className="p-1 text-blue-600 underline hover:text-red-300">
                    {title}
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
