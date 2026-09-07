"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  position: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export async function updateAgentProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name");
  const email = formData.get("email");
  const position = formData.get("position");
  const avatarUrl = formData.get("avatarUrl");

  const parsed = updateProfileSchema.safeParse({ name, email, position, avatarUrl });
  
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message || "Validation failed" };
  }

  try {
    // Check if email is already taken by another agent
    if (parsed.data.email !== session.user.email) {
      const existing = await prisma.agent.findUnique({
        where: { email: parsed.data.email },
      });
      if (existing) {
        return { success: false, error: "Email is already in use by another agent" };
      }
    }

    await prisma.agent.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        position: parsed.data.position || null,
        avatarUrl: parsed.data.avatarUrl || null,
      },
    });

    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
