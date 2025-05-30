"use server";

import { auth, signIn } from "@/auth"; // Adjust if needed
import { db } from "../../lib/prisma";
import { redirect } from "next/navigation";
import { chalkLog } from "../../utils/logger";

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
    include: {
      student: true,
      instructor: true,
      admin: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const roleRecord = user[user.role];
  const isComplete = roleRecord !== null && roleRecord !== undefined;

  console.log("Profile completion check:", {
    email,
    role: user.role,
    hasRoleRecord: !!roleRecord,
    isComplete,
  });

  return {
    isComplete,
    role: user.role,
    redirectTo: isComplete ? "/courses" : "/account",
  };
};

export async function submitRole(formData) {
  const role = formData.get("role")

  if (!role) {
    throw new Error("Role not selected")
  }

  // Optionally: update DB here

  redirect(`/account?role=${role}`) // Navigate without reload
}