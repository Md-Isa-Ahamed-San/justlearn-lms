'use server';


import { revalidatePath } from 'next/cache';
import { db } from '../../lib/prisma';

export async function handlePersonalDetails(formData) {
  const data = Object.fromEntries(formData.entries());

  const {
    email,
    name,
    profilePicture,
    phone,
    idNumber,
    department,
    designation,
    session,
    bio,
    linkedin,
    facebook,
    github,
    role,
  } = data;

  if (!email || !name) {
    throw new Error("Email and name are required.");
  }

  // Convert idNumber to int if present
  const parsedIdNumber = idNumber ? parseInt(idNumber, 10) : undefined;

  // Social media JSON object
  const socialMedia = {
    linkedin: linkedin || null,
    facebook: facebook || null,
    github: github || null,
  };

  // 1. Find user by email
  const existingUser = await db.user.findUnique({
    where: { email },
    include: {
      instructor: true,
      student: true,
      admin: true,
    },
  });

  if (!existingUser) {
    throw new Error("User not found.");
  }

  // 2. Update user name (other common fields can be added if needed)
  await db.user.update({
    where: { email },
    data: {
      name,
      ...(profilePicture ? { image: profilePicture } : {})
    },
  });

  // 3. Update or create role-specific data
  switch (role) {
    case "instructor":
      if (existingUser.instructor) {
        // update instructor
        await db.instructor.update({
          where: { userId: existingUser.id },
          data: {
            phone: phone || null,
            idNumber: parsedIdNumber,
            department: department || null,
            designation: designation || null,
            bio: bio || null,
            socialMedia,
          },
        });
      } else {
        // create instructor
        await db.instructor.create({
          data: {
            userId: existingUser.id,
            phone: phone || null,
            idNumber: parsedIdNumber,
            department: department || null,
            designation: designation || null,
            bio: bio || null,
            socialMedia,
          },
        });
      }
      break;

    case "student":
      if (existingUser.student) {
        // update student
        await db.student.update({
          where: { userId: existingUser.id },
          data: {
            phone: phone || null,
            idNumber: parsedIdNumber,
            department: department || null,
            session: session || null,
            bio: bio || null,
            socialMedia,
          },
        });
      } else {
        // create student
        await db.student.create({
          data: {
            userId: existingUser.id,
            phone: phone || null,
            idNumber: parsedIdNumber,
            department: department || null,
            session: session || null,
            bio: bio || null,
            socialMedia,
          },
        });
      }
      break;

    case "admin":
      if (existingUser.admin) {
        // update admin
        await db.admin.update({
          where: { userId: existingUser.id },
          data: {
            phone: phone || null,
            idNumber: parsedIdNumber,
            department: department || null,
            designation: designation || null,
            bio: bio || null,
            socialMedia,
          },
        });
      } else {
        // create admin
        await db.admin.create({
          data: {
            userId: existingUser.id,
            phone: phone || null,
            idNumber: parsedIdNumber,
            department: department || null,
            designation: designation || null,
            bio: bio || null,
            socialMedia,
          },
        });
      }
      break;

    default:
      throw new Error("Invalid role provided");
  }

  revalidatePath("/account");

  return { success: true };
}
