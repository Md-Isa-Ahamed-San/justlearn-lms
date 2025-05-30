import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { User, Mail, Briefcase, FileText, Phone, Save, Lock } from "lucide-react"
import ProfilePicture from "../../_component/ProfilePicture"
import FormField from "../../_component/FormField"
import SocialMediaField from "../../_component/SocialMediaField"
import { generateAcademicSessions } from "../../../../../utils/RoleHelpers"

export default function PersonalDetailsTab({ userData }) {
  const academicSessions = generateAcademicSessions()
  const role = userData?.role
  
  // Handle form submission with validation
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    // Check if all required fields are filled
    const requiredFields = ['name', 'phone', 'idNumber', 'department', 'bio']
    const missingFields = requiredFields.filter(field => !formData.get(field)?.trim())
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }
    
    // Check if at least one social media field is filled
    const socialFields = ['linkedin', 'facebook', 'github']
    const hasSocialMedia = socialFields.some(field => formData.get(field)?.trim())
    
    if (!hasSocialMedia) {
      alert('Please fill in at least one social media profile')
      return
    }
    
    // Add role-specific validation
    if (role === 'instructor' || role === 'admin') {
      if (!formData.get('designation')?.trim()) {
        alert('Please fill in your designation')
        return
      }
    }
    
    if (role === 'student') {
      if (!formData.get('session')) {
        alert('Please select your academic session')
        return
      }
    }
    
    // Process form data here
    console.log('Form submitted successfully')
  }
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Personal Details
        </CardTitle>
        <CardDescription>Update your personal information and public profile</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Profile Picture */}
            <ProfilePicture
              src={userData?.image}
              alt="Profile"
              fallback={userData?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "U"}
            />

            {/* Basic Info */}
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

              {/* Email field - read only */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={userData?.email || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-muted border border-input rounded-md text-sm cursor-not-allowed opacity-60"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
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
                <Select name="department" defaultValue={userData?.department} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Role-specific fields */}
              {(role === "instructor" || role === "admin") && (
                <FormField
                  id="designation"
                  name="designation"
                  label="Designation *"
                  placeholder={role === "instructor" ? "e.g., Associate Professor" : "e.g., System Administrator"}
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

            {/* Social Media Section */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Social Profiles *</h4>
              <p className="text-sm text-muted-foreground mb-4">Fill in at least one social media profile</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <SocialMediaField
                  id="linkedin"
                  name="linkedin"
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/username"
                  defaultValue={userData?.socialMedia?.linkedin}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  }
                />

                <SocialMediaField
                  id="facebook"
                  name="facebook"
                  label="Facebook"
                  placeholder="https://facebook.com/username"
                  defaultValue={userData?.socialMedia?.facebook}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  }
                />

                {/* GitHub for all roles, but emphasized for students */}
                <SocialMediaField
                  id="github"
                  name="github"
                  label={role === "student" ? "GitHub (Recommended)" : "GitHub"}
                  placeholder="https://github.com/username"
                  defaultValue={userData?.socialMedia?.github}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                      <path d="M9 18c-4.51 2-5-2-7-2"></path>
                    </svg>
                  }
                />
              </div>
            </div>

         

            <div className="flex justify-end">
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}