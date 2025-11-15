// actions/testimonials.js
// import { getLoggedInUser } from "@/lib/loggedin-user";
"use server";
import { db } from "@/lib/prisma";

import { revalidatePath } from "next/cache";
// import { chalkLog } from "../../utils/logger";

// 1. Create testimonial
export async function onSubmitTestimonial({
  userId,
  courseId,
  content,
  rating,
}) {
  const response = await db.testimonial.create({
    data: {
      userId,
      courseId,
      content,
      rating,
    },
  });
//   console.log("Testimonial created: ", response);
  if (response) {
    revalidatePath(`/courses/${courseId}`);
  }
}

// 2. Edit testimonial
export async function onEditTestimonial({ id, content, rating }) {
  const response = await db.testimonial.update({
    where: { id },
    data: { content, rating },
  });
//   console.log("Testimonial Updated: ", response);
  if (response) {
    revalidatePath(`/courses/${id}`);
  }
}

// 3. Delete testimonial
export async function onDeleteTestimonial(id) {
  const response = await db.testimonial.delete({
    where: { id },
  });
//   console.log("Testimonial Deleted: ", response);
  if (response) {
    revalidatePath(`/courses/${id}`);
  }
}

// 4. Fetch testimonials with user data
export async function getTestimonials(courseId) {
  return await db.testimonial.findMany({
    where: { courseId },
    include: {
      user: {
        include: {
          student: true,
          instructor: true,
          admin: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
