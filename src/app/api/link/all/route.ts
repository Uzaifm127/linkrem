import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const GET = async () => {
  try {
    const links = await prisma.link.findMany({ include: { tags: true } });

    // Sending out the CORS headers to the frontend
    return NextResponse.json({ links }, { headers });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      // Sending out the CORS headers to the frontend
      { status: 400, headers }
    );
  }
};
