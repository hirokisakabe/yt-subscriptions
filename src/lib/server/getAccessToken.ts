import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { Result } from "result-type-ts";
import { nextAuth } from "@/lib/nextAuth";

const prisma = new PrismaClient();

export async function getAccessToken(): Promise<Result<string, string>> {
  const session = await getServerSession(nextAuth.authOptions);

  if (!session) {
    return Result.failure("Failed to get session.");
  }

  // @ts-ignore
  const userId = session?.user?.id;

  if (typeof userId !== "string") {
    return Result.failure("Failed to get userId.");
  }

  const account = await prisma.account.findFirst({ where: { userId } });

  if (!account) {
    return Result.failure("Failed to get account.");
  }

  const accessToken = account.access_token;

  if (!accessToken) {
    return Result.failure("Failed to get accessToken.");
  }

  return Result.success(accessToken);
}
