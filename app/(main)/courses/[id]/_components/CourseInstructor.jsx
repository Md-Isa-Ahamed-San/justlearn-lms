import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  MessageSquare,
  Star,
  Users,
  Twitter,
  Linkedin,
  Facebook,
} from "lucide-react";
import { getInstructorDetailedStats } from "@/queries/courses";

const CourseInstructor = async ({ courseDetails }) => {
  // Extract instructor data once to avoid repetition
  const instructorProfile = courseDetails?.user?.instructor;
  const userProfile = courseDetails?.user
  // Early return if no instructor data
  if (!instructorProfile) {
    return (
      <TabsContent value="instructor" className="mt-6">
        <div className="p-8 text-center text-gray-500">
          No instructor information available
        </div>
      </TabsContent>
    );
  }

  // Get instructor stats
  const { courseCount, totalStudents, averageRating, testimonialCount } =
    await getInstructorDetailedStats(instructorProfile.id);

  // Extract commonly used values
  const fullName = `${userProfile.name}`;
  const profileImage = instructorProfile.profilePicture || "/placeholder.svg?height=250&width=250";
  const socialMedia = instructorProfile.socialMedia;

  // Stats configuration for DRY rendering
  const stats = [
    {
      icon: GraduationCap,
      value: courseCount,
      label: "Courses"
    },
    {
      icon: Users,
      value: totalStudents,
      label: "Students"
    },
    {
      icon: MessageSquare,
      value: testimonialCount,
      label: "Reviews"
    },
    {
      icon: Star,
      value: averageRating,
      label: "Star"
    }
  ];

  // Social media links configuration
  const socialLinks = [
    {
      platform: "twitter",
      icon: Twitter,
      url: socialMedia?.twitter ? `https://twitter.com/${socialMedia.twitter}` : null
    },
    {
      platform: "linkedin", 
      icon: Linkedin,
      url: socialMedia?.linkedin
    },
    {
      platform: "facebook",
      icon: Facebook,
      url: socialMedia?.facebook
    }
  ];

  return (
    <TabsContent value="instructor" className="mt-6">
      <div className="overflow-hidden rounded-xl bg-muted/30 p-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <Image
              src={profileImage}
              alt={fullName}
              width={250}
              height={250}
              className="rounded-xl object-cover"
              quality={50}
            />
          </div>

          {/* Instructor Details */}
          <div className="flex-1">
            <h3 className="text-3xl font-bold">{fullName}</h3>
            <p className="mb-4 text-lg">{instructorProfile.designation}</p>

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>{value} {label}</div>
                </div>
              ))}
            </div>

            {/* Bio */}
            <p className="text-gray-600">{instructorProfile.bio}</p>

            {/* Social Media Links */}
            {socialMedia && (
              <div className="mt-6 flex gap-4">
                {socialLinks
                  .filter(({ url }) => url) // Only show links that exist
                  .map(({ platform, icon: Icon, url }) => (
                    <Link
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className=""
                    >
                      <Icon className="h-5 w-5 text-primary hover:text-destructive transition-colors" />
                    </Link>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </TabsContent>
  );
};

export default CourseInstructor;