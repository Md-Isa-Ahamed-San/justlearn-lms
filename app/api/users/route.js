// app/api/users/route.js
import bcrypt from 'bcrypt';
import { NextResponse } from "next/server";
import { db } from "../../../lib/prisma";
export async function GET() {
  try {
    // Use `prisma.user.findMany()`
    // console.log(db)
    const users = await db.user.findMany();
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

    // Prepare social media data if provided
    const socialMedia = data.socialMedia
      ? typeof data.socialMedia === "string"
        ? JSON.parse(data.socialMedia)
        : data.socialMedia
      : {};

    // Create user with role-specific handling
    const user = await db.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: await bcrypt.hash(data.password, 10), // Ensure bcrypt is imported
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
