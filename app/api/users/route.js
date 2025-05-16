// app/api/users/route.js
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { db } from "../../../lib/prisma";
import { getAllUsers, postUser } from "../../../queries/users";
export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Basic validation
    if (
      !data.firstName ||
      !data.lastName ||
      !data.email ||
      !data.password ||
      !data.role
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    // Validate social media data
    if (
      data.socialMedia &&
      typeof data.socialMedia !== "string" &&
      typeof data.socialMedia !== "object"
    ) {
      return NextResponse.json(
        { message: "Invalid social media data" },
        { status: 400 }
      );
    }

    // Check for existing user with same email
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 409 }
      );
    }

    // Create user with role-specific handling
    const user = await postUser(data);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
