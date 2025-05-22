"use server";

import { signIn } from "@/auth"; // Adjust if needed

export async function credentialLogin(data) {
  console.log("credentialLogin ~ formData:", data);

  return await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirectTo: "/", // ✅ redirect target
   redirect: false
  });
}

export async function doSocialLogin(formData) {
  const action = formData.get("action");
  await signIn(action, { redirectTo: "/courses" });
}
