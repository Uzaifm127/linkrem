import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// // Added the OPTIONS method to allow CORS
// export const OPTIONS = async () => {
//   return NextResponse.json(null, {
//     status: 200,
//     headers,
//   });
// };

export const GET = async (req: NextRequest) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  try {
    const links = await prisma.link.findMany({
      where: {
        // token must be here as it is protected route
        userId: token!.id,
      },

      include: {
        tags: true,
      },
    });

    return NextResponse.json({ links });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
};
