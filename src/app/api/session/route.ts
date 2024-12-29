import { prisma } from "@/lib/prisma";
import { CreateSessionLinkRequest } from "@/types/server/request";
import { NextRequest, NextResponse } from "next/server";

const headers = {
  // change it later to specific
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
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
  try {
    const { name, links }: CreateSessionLinkRequest = await req.json();

    await prisma.sessionLinks.create({
      data: {
        name,
        links: {
          connectOrCreate: links.map((link) => ({
            where: { name: link.name, url: link.url },
            create: { name: link.name, url: link.url },
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
