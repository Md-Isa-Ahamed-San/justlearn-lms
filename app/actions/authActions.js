"use server";

import { auth, signIn } from "@/auth"; // Adjust if needed
import { redirect } from "next/navigation";
import { db } from "../../lib/prisma";

export async function credentialLogin(data) {
  console.log("credentialLogin ~ formData:", data);

  return await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirect: false,
  });
}

// export async function doSocialLogin(formData) {
//   const action = formData.get("action");
//   await signIn(action, { redirectTo: "/courses" });
// }

export async function doSocialLogin(formData) {
  const action = formData.get("action");
  console.log("🚀 doSocialLogin called with action:", action);

  await signIn(action, {
    redirectTo: "/googleRedirect/callback", // Create a callback route to handle post-signin logic
  });
}

export const checkProfileCompletion = async (email) => {
  console.log("email in checkProfileCompletion: ", email);

  const user = await db.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // A user is considered complete if they have a role assigned.
  // The role-specific profile (Student/Instructor row) is filled in on the account page.
  const isComplete = !!user.role;

  console.log("Profile completion check:", {
    email,
    role: user.role,
    isComplete,
  });

  return {
    isComplete,
    role: user.role,
    redirectTo: isComplete ? "/courses" : "/roleSelection",
  };
};

export async function submitRole(formData) {
  const role = formData.get("role")

  if (!role) {
    throw new Error("Role not selected")
  }

  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Not authenticated")
  }

  await db.user.update({
    where: { email: session.user.email },
    data: { role },
  })

  redirect("/account")
}