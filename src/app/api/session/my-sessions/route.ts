import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const headers = {
  // change it later to specific
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const GET = async (req: NextRequest) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const sessions = await prisma.sessionLinks.findMany({
      where: {
        // token must be here as it is protected route
        userId: token!.id,
      },

      include: {
        links: { include: { tags: true } },
      },
    });

    return NextResponse.json({ sessions }, { headers });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400, headers }
    );
  }
};
