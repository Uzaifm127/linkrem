import { prisma } from "@/lib/prisma";
import { DeleteSessionLinkRequest } from "@/types/server/request";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (req: NextRequest) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { sessionId, sessionLinkId }: DeleteSessionLinkRequest =
      await req.json();

    if (!token?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!sessionId || !sessionLinkId) {
      return NextResponse.json(
        { message: "Session and link are required" },
        { status: 400 },
      );
    }

    const session = await prisma.linkSessions.findFirst({
      where: { id: sessionId, userId: token.id },
      select: { id: true },
    });

    if (!session) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 },
      );
    }

    const deletedLink = await prisma.sessionLinks.deleteMany({
      where: { id: sessionLinkId, linkSessionId: session.id },
    });

    if (deletedLink.count === 0) {
      return NextResponse.json(
        { message: "Link not found in this session" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Link removed from session" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
};
