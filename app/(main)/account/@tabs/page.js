// app/account/page.tsx (or .jsx)

import ProfileTabs from "./_components/ProfileTabs";
import { getServerUserData } from "../../../../queries/users";

export default async function RoleBasedProfile({ searchParams }) {
  const selectedRole = searchParams?.role;

  const { user, userData } = await getServerUserData();

  const effectiveUserData = {
    ...userData,
    role: selectedRole || userData?.role,
  };

  return <ProfileTabs userData={effectiveUserData} />;
}
