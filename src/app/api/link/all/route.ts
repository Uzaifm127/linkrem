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

    return NextResponse.json({ links }, {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message }
      // { status: 400, headers }
    );
  }
};
