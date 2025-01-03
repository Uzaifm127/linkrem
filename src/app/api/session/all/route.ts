import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const headers = {
  // Change the CORS policy later to a specific origin if needed
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const GET = async () => {
  try {
    // Fetch all sessions from the session table
    const sessions = await prisma.sessionLinks.findMany({
      include: { links: true },
    });

    // Return the fetched sessions in the response
    return NextResponse.json({ sessions }, { headers });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Handle any errors during the query
    return NextResponse.json(
      { message: error.message },
      { status: 400, headers }
    );
  }
};
