import { GraduationCap, User, Shield, ArrowRight, CheckCircle } from 'lucide-react'
import { getRoleDescription } from "../../../utils/RoleHelpers"
import { submitRole } from "../../actions/authActions"
// Add this to pages that use headers(), cookies(), etc.
export const dynamic = 'force-dynamic'
export default function RoleSelection() {
  const getRoleIcon = (role) => {
    switch (role) {
      case "instructor":
        return <GraduationCap className="h-5 w-5" />
      case "student":
        return <User className="h-5 w-5" />
      case "admin":
        return <Shield className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 h-screen mt-8 md:mt-14 lg:mt-20">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Choose Your Role</h2>
          <p className="text-muted-foreground mt-2">
            Select the role that best describes how you will use the platform
          </p>
        </div>

        <form action={submitRole} className="space-y-4">
          <div className="space-y-3">
            {["instructor", "student", "admin"].map((role) => (
              <div key={role} className="relative">
                <input
                  type="radio"
                  id={`role-${role}`}
                  name="role"
                  value={role}
                  required
                  className="peer sr-only "
                />
                <label
                  htmlFor={`role-${role}`}
                  className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer peer-checked:border-primary"
                >
                  <div className="flex-shrink-0">
                    {getRoleIcon(role)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold capitalize">{role}</h4>
                      <CheckCircle className="h-4 w-4 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getRoleDescription(role)}
                    </p>
                  </div>
                </label>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-md font-medium"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}