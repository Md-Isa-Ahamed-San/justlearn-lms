"use client";

import {
  Mail,
  Briefcase,
  FileText,
  Phone,
  Save,
  Lock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import ProfilePicture from "../../_component/ProfilePicture";
import FormField from "../../_component/FormField";
import SocialMediaField from "../../_component/SocialMediaField";
import { toast } from "sonner";
import { handlePersonalDetails } from "../../../../actions/formActions";
import { useState } from "react";

export default function PersonalDetailsForm({ userData, academicSessions }) {
  const role = userData?.role;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log(" handleSubmit ~ formData:", e);

    console.log("----- Form Data -----");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const socialFields = ["linkedin", "facebook", "github"];
    const hasSocialMedia = socialFields.some((field) =>
      formData.get(field)?.trim()
    );

    if (!hasSocialMedia) {
      toast.error("Please fill in at least one social media profile.");
      return;
    }
    try {
      const result = await handlePersonalDetails(formData);

      if (result.success) {
        toast.success("Details updated successfully.");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update details.");
    } finally {
      setIsSubmitting(false);
    }
    // Process form data
    // toast.success("Form submitted successfully.");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <ProfilePicture
          src={userData?.image}
          alt="Profile"
          fallback={
            userData?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "U"
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            id="name"
            name="name"
            label="Full Name *"
            placeholder="Enter your full name"
            defaultValue={userData?.name}
            required
            icon={<User />}
          />

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Address
              <Lock className="h-3 w-3 text-muted-foreground" />
            </label>
            <input
              id="email"
              type="email"
              value={userData?.email || ""}
              readOnly
              className="w-full px-3 py-2 bg-muted border border-input rounded-md text-sm cursor-not-allowed opacity-60"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <FormField
            id="phone"
            name="phone"
            label="Phone Number *"
            type="tel"
            placeholder="Enter your phone number"
            defaultValue={userData?.phone}
            required
            icon={<Phone />}
          />

          <FormField
            id="idNumber"
            name="idNumber"
            label="ID Number *"
            type="number"
            placeholder="Enter your ID number"
            defaultValue={userData?.idNumber}
            required
            icon={<FileText />}
          />

          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-medium">
              Department *
            </label>
            <Select
              name="department"
              defaultValue={userData?.department}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Computer Science",
                  "Mathematics",
                  "Physics",
                  "Chemistry",
                  "Biology",
                  "Engineering",
                ].map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(role === "instructor" || role === "admin") && (
            <FormField
              id="designation"
              name="designation"
              label="Designation *"
              placeholder={
                role === "instructor"
                  ? "e.g., Associate Professor"
                  : "e.g., System Administrator"
              }
              defaultValue={userData?.designation}
              required
              icon={<Briefcase />}
            />
          )}

          {role === "student" && (
            <div className="space-y-2">
              <label htmlFor="session" className="text-sm font-medium">
                Academic Session *
              </label>
              <Select name="session" defaultValue={userData?.session} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {academicSessions.map((session) => (
                    <SelectItem key={session} value={session}>
                      {session}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <FormField
            id="bio"
            name="bio"
            label="Bio *"
            placeholder="Tell us about yourself"
            defaultValue={userData?.bio}
            required
            isTextarea
            icon={<FileText />}
            className="sm:col-span-2 lg:col-span-3"
          />
        </div>

        {/* Social Media */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Social Profiles *</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Fill in at least one social media profile
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SocialMediaField
              id="linkedin"
              name="linkedin"
              label="LinkedIn"
              placeholder="https://linkedin.com/in/username"
              defaultValue={userData?.socialMedia?.linkedin}
            />
            <SocialMediaField
              id="facebook"
              name="facebook"
              label="Facebook"
              placeholder="https://facebook.com/username"
              defaultValue={userData?.socialMedia?.facebook}
            />
            <SocialMediaField
              id="github"
              name="github"
              label={role === "student" ? "GitHub (Recommended)" : "GitHub"}
              placeholder="https://github.com/username"
              defaultValue={userData?.socialMedia?.github}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Processing..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
