"use server";

import open from "open";

// Function to open multiple links
export const openLinks = async (links: Array<string>) => {
  try {
    for (const link of links) {
      // Open each link asynchronously
      await open(link);
      // Introduce a slight delay (optional) to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return { success: true, message: 'All links opened successfully.' };
  } catch (error) {
    console.error('Error opening links:', error);
    return { success: false, message: 'Failed to open links.' };
  }
};
