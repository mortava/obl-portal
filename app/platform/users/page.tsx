import { listPlatformUsers } from "@/lib/data/profiles";
import { UsersTable } from "@/components/platform/tables/UsersTable";

export default async function PlatformUsersPage() {
  const users = await listPlatformUsers();
  return <UsersTable users={users} />;
}
