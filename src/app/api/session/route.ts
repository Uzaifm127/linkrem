import { prisma } from "@/lib/prisma";
import { CreateSessionLinkRequest } from "@/types/server/request";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  try {
    const { name, sessionLinks }: CreateSessionLinkRequest = await req.json();

    await prisma.linkSessions.create({
      data: {
        name,
        user: { connect: { id: token!.id } },
        sessionLinks: {
          create: sessionLinks.map((sessionLink) => ({
            name: sessionLink.name,
            url: sessionLink.url,
          })),
        },
      },
    });

    return NextResponse.json({ message: "Session created successfully" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { currentSessionName }: { currentSessionName: string } =
      await req.json();

    await prisma.linkSessions.delete({
      where: {
        name_userId: {
          name: currentSessionName,
          userId: token!.id,
        },
      },
    });

    return NextResponse.json({ message: "Session deleted successfully" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
};
