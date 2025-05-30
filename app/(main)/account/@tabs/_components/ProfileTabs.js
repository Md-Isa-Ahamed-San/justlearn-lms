"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getRoleColor, getRoleIcon } from "../../../../../utils/RoleHelpers"
import PersonalDetailsTab from "./PersonalDetailsTab"
import PasswordTab from "./PasswordTab"

export default function ProfileTabs({ userData }) {
    
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Role Badge - now shows as locked/assigned */}
      <div className="mb-6 flex items-center gap-2">
        <Badge className={`${getRoleColor(userData?.role)} gap-1 text-sm px-3 py-1`}>
          {getRoleIcon(userData?.role, "h-4 w-4")}
          {userData?.role?.charAt(0).toUpperCase() + userData?.role?.slice(1)}
        </Badge>
       
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-2 mb-8 w-full sm:w-auto">
          <TabsTrigger value="personal" className="text-sm">
            Personal Details
          </TabsTrigger>
          <TabsTrigger value="password" className="text-sm">
            Password
          </TabsTrigger>
        </TabsList>

        {/* Personal Details Tab */}
        <TabsContent value="personal">
          <PersonalDetailsTab userData={userData}/>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <PasswordTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}