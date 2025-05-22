"use server";

import { signIn } from "@/auth"; // Adjust if needed

export async function credentialLogin(data) {
  console.log("credentialLogin ~ formData:", data);
  try {
    return await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/", // ✅ redirect target
      redirect: true,
    });
  } catch (error) {
    console.error("credentialLogin ~ error:", error);
    throw error; // Let the client handle this
  }
}

export async function doSocialLogin(formData) {
  const action = formData.get("action");
  await signIn(action, { redirectTo: "/courses" });
}
