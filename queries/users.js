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

      
  const user = await db.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: await bcrypt.hash(data.password, 10),
      role: data.role,
    },
  });
  return user;
};
