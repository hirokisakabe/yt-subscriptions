"use client";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import { Header } from "../parts";

export function DashboardPage() {
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated: () => redirect("/"),
  });

  const [items, setItems] = useState<any[]>([]);

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
      setPageToken(json.subscriptions.nextPageToken);
    })();
  }, [status]);

  const [pageToken, setPageToken] = useState(null);

  const fetchMore = useCallback(async () => {
    const subscriptions = await fetch(
      `/api/subscriptions?pageToken=${pageToken}`,
    );

    const json = await subscriptions.json();
    setItems((prevItems) => [...prevItems, ...json.subscriptions.items]);
    setPageToken(json.subscriptions.nextPageToken);
  }, [pageToken]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <main className="max-w-screen-lg px-3 py-1">
        <Header />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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
                <a href={channelUrl} target="_blank">
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
                  <div className="p-1 text-sm text-blue-600 underline hover:text-red-300">
                    {title}
                  </div>
                </a>
              </div>
            );
          })}
        </div>
        <div>
          <button type="button" onClick={fetchMore}>
            more
          </button>
        </div>
      </main>
    </div>
  );
}
