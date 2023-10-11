import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { AuthOptions, TokenSet } from "next-auth";

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Missing GOOGLE_CLIENT_ID");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing GOOGLE_CLIENT_SECRET");
}

const prisma = new PrismaClient();

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube.readonly",
        },
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session({ session, user }: any) {
      if (user) {
        session.user.id = user.id;
        session.user.name = user.name;
        session.user.email = user.email;
        session.user.image = user.picture;
      }

      const [google] = await prisma.account.findMany({
        where: { userId: user.id, provider: "google" },
      });
      if (google.expires_at && google.expires_at * 1000 < Date.now()) {
        // If the access token has expired, try to refresh it
        try {
          // https://accounts.google.com/.well-known/openid-configuration
          // We need the `token_endpoint`.
          const response = await fetch("https://oauth2.googleapis.com/token", {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID || "",
              client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
              grant_type: "refresh_token",
              refresh_token: google.refresh_token || "",
            }),
            method: "POST",
          });

          const tokens: TokenSet = await response.json();

          if (!response.ok) throw tokens;

          await prisma.account.update({
            data: {
              access_token: tokens.access_token,
              // @ts-ignore
              expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
              refresh_token: tokens.refresh_token ?? google.refresh_token,
            },
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: google.providerAccountId,
              },
            },
          });
        } catch (error) {
          console.error("Error refreshing access token", error);
          // The error property will be used client-side to handle the refresh token error
          session.error = "RefreshAccessTokenError";
        }
      }
      return session;
    },
  },
};

export const nextAuth = { authOptions };

declare module "next-auth" {
  interface Session {
    error?: "RefreshAccessTokenError";
  }
}
