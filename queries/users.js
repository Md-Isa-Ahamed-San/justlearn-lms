import { db } from "../lib/prisma";
import bcrypt from 'bcrypt';
export const getAllUsers = async () => {
  try {
    const users = await db.user.findMany();
    return users;
  } catch (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
};
export const getUser = async (id) => {
  
}
export const postUser = async (data) => {
    // Prepare social media data if provided
    const socialMedia = data.socialMedia
      ? typeof data.socialMedia === "string"
        ? JSON.parse(data.socialMedia)
        : data.socialMedia
      : {};
      
  const user = await db.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: await bcrypt.hash(data.password, 10),
      phone: data.phone || null,
      role: data.role,
      bio: data.bio || null,
      socialMedia: socialMedia,
      profilePicture: data.profilePicture || null,
      designation: data.designation || null,
      // Note: Role-specific relations like taughtCourses are handled separately
      // through their own endpoints after user creation
    },
  });
  return user;
};
