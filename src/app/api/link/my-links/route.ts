import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const headers = {
  // change it later to specific
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// // Added the OPTIONS method to allow CORS
// export const OPTIONS = async () => {
//   return NextResponse.json(null, {
//     status: 200,
//     headers,
//   });
// };

export const GET = async (req: NextRequest) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const links = await prisma.link.findMany({
      where: {
        // token must be here as it is protected route
        userId: token!.id,
      },

      include: {
        tags: true,
      },
    });

    return NextResponse.json({ links }, { headers });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400, headers }
    );
  }
};
