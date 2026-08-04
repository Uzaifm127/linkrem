import { prisma } from "@/lib/prisma";
import { CreateLinkRequest, UpdateLinkRequest } from "@/types/server/request";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { maxLinkShortcuts, validateShortcut } from "@/lib/shortcut";

export const POST = async (req: NextRequest) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { name, url, tags, shortcut }: CreateLinkRequest = await req.json();

    if (!name || !url) {
      throw new Error("Invalid Name or URL");
    }

    const isTagsExist = tags.length > 0;
    const shortcutValidation = validateShortcut(shortcut ?? "", {
      optional: true,
    });

    if (!shortcutValidation.valid) {
      throw new Error(shortcutValidation.message);
    }

    const normalizedShortcut = shortcutValidation.shortcut;

    if (normalizedShortcut) {
      const shortcutCount = await prisma.shortcut.count({
        where: {
          shortcutKey: { not: "" },
          link: { is: { userId: token!.id } },
        },
      });

      if (shortcutCount >= maxLinkShortcuts) {
        throw new Error(
          `You can assign shortcuts to a maximum of ${maxLinkShortcuts} links.`,
        );
      }

      const shortcutExists = await prisma.shortcut.findFirst({
        where: {
          shortcutKey: normalizedShortcut,
          link: { is: { userId: token!.id } },
        },
      });

      if (shortcutExists) {
        throw new Error("This shortcut is already assigned to another link.");
      }
    }

    // Only create link for the same user if it doesn't exist
    await prisma.link.create({
      data: {
        name,
        url,
        // This is to make the many to many relation
        // Optionally creating tags
        ...(isTagsExist && {
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: {
                tagName_userId: { tagName: tag, userId: token!.id },
              },
              create: { tagName: tag, user: { connect: { id: token!.id } } },
            })),
          },
        }),
        // This is the convenient way to connect the already existing entity
        // userId
        user: {
          connect: { id: token!.id },
        },
        ...(normalizedShortcut && {
          shortcut: {
            create: {
              shortcutKey: normalizedShortcut,
            },
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
    const {
      name,
      url,
      tags,
      currentLinkName,
      URLChange,
      nameChange,
      tagChange,
      shortcut,
    }: UpdateLinkRequest = await req.json();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!name || !url) {
      throw new Error("Invalid Name or URL");
    }

    const isTagsExist = tags.length > 0;
    const shortcutValidation = validateShortcut(shortcut ?? "", {
      optional: true,
    });

    if (!shortcutValidation.valid) {
      throw new Error(shortcutValidation.message);
    }

    const currentLink = await prisma.link.findUnique({
      where: {
        name_userId: {
          userId: token!.id,
          name: currentLinkName,
        },
      },
      include: { shortcut: true, tags: true },
    });

    if (!currentLink) {
      throw new Error("Link not found");
    }

    const normalizedShortcut =
      shortcut === undefined
        ? currentLink.shortcut?.shortcutKey ?? ""
        : shortcutValidation.shortcut;

    if (normalizedShortcut) {
      const isUsingNewShortcutSlot =
        !currentLink.shortcut?.shortcutKey.trim();

      if (isUsingNewShortcutSlot) {
        const shortcutCount = await prisma.shortcut.count({
          where: {
            shortcutKey: { not: "" },
            link: { is: { userId: token!.id } },
          },
        });

        if (shortcutCount >= maxLinkShortcuts) {
          throw new Error(
            `You can assign shortcuts to a maximum of ${maxLinkShortcuts} links.`,
          );
        }
      }

      const shortcutExists = await prisma.shortcut.findFirst({
        where: {
          shortcutKey: normalizedShortcut,
          linkId: { not: currentLink.id },
          link: { is: { userId: token!.id } },
        },
      });

      if (shortcutExists) {
        throw new Error("This shortcut is already assigned to another link.");
      }
    }

    const shortcutChange =
      currentLink.shortcut?.shortcutKey !== normalizedShortcut ||
      (!!currentLink.shortcut && !normalizedShortcut);
    const shortcutUpdate = shortcutChange
      ? normalizedShortcut
        ? currentLink.shortcut
          ? { shortcut: { update: { shortcutKey: normalizedShortcut } } }
          : { shortcut: { create: { shortcutKey: normalizedShortcut } } }
        : { shortcut: { delete: true } }
      : {};

    let tagsToRemove: Array<never> | Array<string> = [];

    if (isTagsExist) {
      let currentTags: Array<never> | Array<string>;
      let currentTagsSet: Set<string>;
      let tagsSet: Set<string>;
      let tagsToAdd: Array<string> | Array<never> = [];

      // Only doing get tag operation if there is a change in tags
      if (tagChange) {
        // Case:- where user adds some tags on a link

        // Finding the current tags from a database associated with the given link
        currentTags = currentLink.tags.map((tag) => tag.tagName);

        // For adding new tags
        currentTagsSet = new Set(currentTags);

        // For removing the removed tags
        tagsSet = new Set(tags);

        // Case: 1 - user adds new tag in the previous one.
        tagsToAdd = tags.filter((tag) => !currentTagsSet.has(tag)); // Array of string

        // Case: 2 - user remove some tags from the previous one.
        tagsToRemove = currentTags.filter((tag) => !tagsSet.has(tag));
      }

      await prisma.link.update({
        where: {
          name_userId: {
            // Name because we aren't invalidating the query by react query so id might be different
            userId: token!.id,
            name: currentLinkName,
          },
        },

        data: {
          ...(nameChange && { name }),
          ...(URLChange && { url }),
          ...shortcutUpdate,
          ...(tagChange && {
            tags: {
              ...(tagsToAdd.length > 0 && {
                connectOrCreate: tagsToAdd.map((tag) => {
                  return {
                    where: {
                      tagName_userId: { tagName: tag, userId: token!.id },
                    },
                    create: {
                      tagName: tag,
                      user: { connect: { id: token!.id } },
                    },
                  };
                }),
              }),

              ...(tagsToRemove.length > 0 && {
                disconnect: tagsToRemove.map((tag) => ({
                  tagName_userId: { tagName: tag, userId: token!.id },
                })),
              }),
            },
          }),
        },
      });
    } else {
      // Case:- where user removed all the tags from a link
      await prisma.link.update({
        where: {
          name_userId: {
            // Name because we aren't invalidating the query by react query so id might be different
            userId: token!.id,
            name: currentLinkName,
          },
        },

        data: {
          ...(nameChange && { name }),
          ...(URLChange && { url }),
          ...shortcutUpdate,
          ...(tagChange && {
            tags: {
              set: [],
            },
          }),
        },
      });
    }

    // If user removed all tags or if user removed some of the tags
    if (!isTagsExist || tagsToRemove.length) {
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
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { currentLinkName }: { currentLinkName: string } = await req.json();

    await prisma.link.delete({
      where: {
        name_userId: {
          userId: token!.id,
          name: currentLinkName,
        },
      },
    });

    await prisma.tag.deleteMany({
      where: {
        links: {
          none: {},
        },
      },
    });

    return NextResponse.json({ message: "Link deleted successfully" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
};
