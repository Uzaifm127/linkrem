import { tagsParser } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import { CreateLinkRequest, UpdateLinkRequest } from "@/types/server/request";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { name, url, tags }: CreateLinkRequest = await req.json();

    if (!name || !url) {
      throw new Error("Invalid Name or URL");
    }

    const tagsObjectArray = tagsParser(tags);

    await prisma.link.create({
      data: {
        name,
        url,
        // Optionally creating tags
        ...(tagsObjectArray && {
          tags: {
            connectOrCreate: tagsObjectArray.map((tag) => ({
              where: { tagName: tag.tagName },
              create: { ...tag },
            })),
          },
        }),
      },
    });

    return NextResponse.json({ message: "Link create successfully" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    const { name, url, tags, currentLinkName }: UpdateLinkRequest =
      await req.json();

    if (!name || !url) {
      throw new Error("Invalid Name or URL");
    }

    const tagsObjectArray = tagsParser(tags);

    await prisma.link.update({
      where: {
        // Name because we aren't invalidating the query by react query so id might be different
        name: currentLinkName,
      },

      data: {
        name,
        url,
        tags: {
          ...(tagsObjectArray
            ? {
                connectOrCreate: tagsObjectArray?.map((tag) => ({
                  where: { tagName: tag.tagName },
                  create: { ...tag },
                })),
              }
            : {
                set: [],
              }),
        },
      },
    });

    return NextResponse.json({ message: "Link updated successfully" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
};
