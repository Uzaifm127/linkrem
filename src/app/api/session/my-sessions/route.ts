import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const sessions = await prisma.linkSessions.findMany({
      where: {
        // token must be here as it is protected route
        userId: token!.id,
      },

      include: {
        sessionLinks: true,
      },
    });

    return NextResponse.json({ sessions });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
};
