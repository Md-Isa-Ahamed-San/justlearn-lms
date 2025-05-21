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


