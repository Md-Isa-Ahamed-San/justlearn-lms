"use server"
import { db } from "@/lib/prisma";

// MARK: Toggle user active status

import { revalidatePath } from "next/cache";


export const toggleUserStatus = async (userId) => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const newStatus = !user.isActive;

    await db.user.update({
      where: { id: userId },
      data: { isActive: newStatus },
    });

    revalidatePath("/admin-dashboard"); // Keep this for full page reloads

    return { success: true };



  } catch (error) {
    console.error("Error in toggleUserStatus action:", error);
    return { success: false, error: "Failed to toggle user status." };
  }
};