import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/server";

export async function GET(request: Request) {
  const accessToken = await getAccessToken();

  if (accessToken.isFailure) {
    console.error(accessToken.error);

    return NextResponse.json(
      {
        error: "Failed to get subscriptions.",
      },
      { status: 500 }
    );
  }

  const subscriptions = await fetch(
    "https://www.googleapis.com/youtube/v3/subscriptions?part=snippet,contentDetails&mine=true",
    { headers: { Authorization: `Bearer ${accessToken.value}` } }
  );

  return NextResponse.json({ subscriptions: await subscriptions.json() });
}
