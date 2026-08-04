import { prisma } from "@/lib/prisma";
import { sessionSchema } from "@/lib/zod-schemas";
import {
  CreateSessionLinkRequest,
  DeleteSessionRequest,
} from "@/types/server/request";
import { Prisma } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const requestBody: CreateSessionLinkRequest = await req.json();
    const result = sessionSchema.safeParse(requestBody);

    if (!token?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.errors[0]?.message ?? "Invalid session" },
        { status: 400 },
      );
    }

    const uniqueSessionLinks = Array.from(
      new Map(
        result.data.sessionLinks.map((sessionLink) => [
          sessionLink.url,
          sessionLink,
        ]),
      ).values(),
    );

    const createdSession = await prisma.linkSessions.create({
      data: {
        name: result.data.name,
        user: { connect: { id: token.id } },
        sessionLinks: {
          create: uniqueSessionLinks.map((sessionLink) => ({
            name: sessionLink.name,
            url: sessionLink.url,
          })),
        },
      },
      include: { sessionLinks: true },
    });

    return NextResponse.json(
      { message: "Session created successfully", session: createdSession },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "A session with this name already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Invalid session" },
      { status: 400 },
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { sessionId, currentSessionName }: DeleteSessionRequest =
      await req.json();

    if (!token?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!sessionId && !currentSessionName) {
      return NextResponse.json(
        { message: "Session is required" },
        { status: 400 },
      );
    }

    const deletedSession = await prisma.linkSessions.deleteMany({
      where: {
        userId: token.id,
        ...(sessionId ? { id: sessionId } : { name: currentSessionName }),
      },
    });

    if (deletedSession.count === 0) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
};
