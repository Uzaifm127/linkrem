import { tagsParser } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import { CreateLinkRequest, UpdateLinkRequest } from "@/types/server/request";
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
  try {
    const { name, url, tags }: CreateLinkRequest = await req.json();

    if (!name || !url) {
      throw new Error("Invalid Name or URL");
    }

    const tagsObjectArray = tagsParser(tags, true);

    await prisma.link.create({
      data: {
        name,
        url,
        // Optionally creating tags
        ...(tagsObjectArray && {
          tags: {
            connectOrCreate: tagsObjectArray.map((tag) => ({
              where: { tagName: tag },
              create: { tagName: tag },
            })),
          },
        }),
      },
    });

    return NextResponse.json(
      { message: "Link create successfully" },
      { headers }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400, headers }
    );
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    const { name, url, tags, currentLinkName }: UpdateLinkRequest =
      await req.json();

    if (!name || !url) {
      throw new Error("Invalid Name or URL");
    }

    const tagsObjectArray = tagsParser(tags, true);

    let tagsToRemove: Array<never> | Array<string> = [];

    if (!!tagsObjectArray) {
      // Case:- where user adds some tags on a link

      // Finding the current tags from a database associated with the given link
      const currentTags = (
        await prisma.link.findUnique({
          where: {
            name: currentLinkName,
          },
          include: { tags: true },
        })
      )?.tags.map((tag) => tag.tagName) as Array<string> | Array<never>;

      // For adding new tags
      const currentTagsSet = new Set(currentTags);

      // For removing the removed tags
      const tagsObjectArraySet = new Set(tagsObjectArray);

      // Case: 1 - user adds new tag in the previous one.
      const tagsToAdd = tagsObjectArray.filter(
        (tag) => !currentTagsSet.has(tag)
      ); // Array of string

      // Case: 2 - user remove some tags from the previous one.
      tagsToRemove = currentTags.filter((tag) => !tagsObjectArraySet.has(tag));

      await prisma.link.update({
        where: {
          // Name because we aren't invalidating the query by react query so id might be different
          name: currentLinkName,
        },

        data: {
          name,
          url,
          tags: {
            ...(tagsToAdd.length && {
              connectOrCreate: tagsToAdd.map((tag) => {
                const object = { tagName: tag };

                return { where: object, create: object };
              }),
            }),

            ...(tagsToRemove.length && {
              disconnect: tagsToRemove.map((tag) => ({ tagName: tag })),
            }),
          },
        },
      });
    } else {
      // Case:- where user removed all the tags from a link
      await prisma.link.update({
        where: {
          // Name because we aren't invalidating the query by react query so id might be different
          name: currentLinkName,
        },

        data: {
          name,
          url,
          tags: {
            set: [],
          },
        },
      });
    }

    // If user removed all tags or if user removed some of the tags
    if (!tagsObjectArray || tagsToRemove.length) {
      // Removing those tags which aren't connected to any of the link
      await prisma.tag.deleteMany({
        where: {
          links: {
            none: {},
          },
        },
      });
    }

    return NextResponse.json({ message: "Link updated successfully" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const { currentLinkName }: { currentLinkName: string } = await req.json();

    await prisma.link.delete({
      where: {
        name: currentLinkName,
      },
    });

    await prisma.tag.deleteMany({
      where: {
        links: {
          none: {},
        },
      },
    });

    return NextResponse.json(
      { message: "Link deleted successfully" },
      { headers }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400, headers }
    );
  }
};
