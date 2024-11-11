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
            create: tagsObjectArray,
          },
        }),
      },
    });

    return NextResponse.json({ message: "Link create successfully" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    const { name, url, tags, id }: UpdateLinkRequest = await req.json();

    if (!name || !url) {
      throw new Error("Invalid Name or URL");
    }

    if (!id) {
      throw new Error("Link doesn't exist");
    }

    const tagsObjectArray = tagsParser(tags);

    await prisma.link.upsert({
      where: {
        id,
      },

      update: {
        name,
        url,
        tags: {
          set: !!tagsObjectArray ? tagsObjectArray : [],
        },
      },
      create: {
        name,
        url,
        tags: {
          set: !!tagsObjectArray ? tagsObjectArray : [],
        },
      },
    });

    return NextResponse.json({ message: "Link updated successfully" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
};
