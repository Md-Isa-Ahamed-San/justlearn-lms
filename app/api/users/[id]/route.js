export async function GET(request, { params }) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        bio: true,
        socialMedia: true,
        profilePicture: true,
        designation: true,
        // Include role-specific relations based on the user's role
        ...(await shouldIncludeRoleSpecificData(params.id)),
      },
    });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Helper function to determine which relations to include based on user role
async function shouldIncludeRoleSpecificData(userId) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    if (!user) return {};
    
    switch (user.role) {
      case 'instructor':
        return {
          taughtCourses: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnail: true,
              status: true,
            }
          }
        };
      case 'student':
        return {
          enrollments: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  thumbnail: true,
                }
              }
            }
          },
          reports: true,
          watches: true,
        };
      case 'admin':
        // Admin might need access to everything
        return {
          taughtCourses: true,
          enrollments: true,
          reports: true,
        };
      default:
        return {};
    }
  } catch (error) {
    console.error("Error determining role-specific data:", error);
    return {};
  }
}