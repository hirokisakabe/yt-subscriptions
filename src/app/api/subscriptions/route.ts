import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/server";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = await getAccessToken();

  if (accessToken.isFailure) {
    console.error(accessToken.error);

    return NextResponse.json(
      {
        error: "Failed to get subscriptions.",
      },
      { status: 500 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const pageToken = searchParams.get("pageToken");

  const paramsObj = {
    part: "snippet",
    mine: "true",
    maxResults: "20",
  };
  const searchParamsForYouTubeAPI = new URLSearchParams(paramsObj);
  if (pageToken) {
    searchParamsForYouTubeAPI.append("pageToken", pageToken);
  }

  const subscriptions = await fetch(
    `https://www.googleapis.com/youtube/v3/subscriptions?${searchParamsForYouTubeAPI.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken.value}` } },
  );

  return NextResponse.json({ subscriptions: await subscriptions.json() });
}
