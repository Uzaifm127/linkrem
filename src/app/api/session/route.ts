import { sessionLinkTagName } from "@/constants";
import { prisma } from "@/lib/prisma";
import { CreateSessionLinkRequest } from "@/types/server/request";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const headers = {
  // change it later to specific
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Added the OPTIONS method to allow CORS
export const OPTIONS = async () => {
  return NextResponse.json(null, {
    status: 200,
    headers,
  });
};

export const POST = async (req: NextRequest) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  try {
    const { name, links }: CreateSessionLinkRequest = await req.json();

    await prisma.sessionLinks.create({
      data: {
        name,
        user: { connect: { id: token!.id } },
        links: {
          connectOrCreate: links.map((link) => ({
            // choosen url because we need to connect with same urls for session not with name with different URLs
            where: { url: link.url },
            create: {
              name: link.name,
              url: link.url,
              tags: {
                connectOrCreate: [
                  {
                    where: { tagName: sessionLinkTagName },
                    create: { tagName: sessionLinkTagName, locked: true },
                  },
                ],
              },
              user: { connect: { id: token!.id } },
            },
          })),
        },
      },
    });

    return NextResponse.json({ message: "Session created successfully" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400, headers }
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { currentSessionName }: { currentSessionName: string } =
      await req.json();

    await prisma.sessionLinks.delete({
      where: {
        name: currentSessionName,
        userId: token?.id,
      },
    });

    return NextResponse.json({ message: "Session deleted successfully" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400, headers }
    );
  }
};
