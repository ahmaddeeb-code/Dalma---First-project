import RoleLogin from "./RoleLogin";
export default function LoginStaff() {
  return <RoleLogin roleId="r_staff" title="Sign in as Staff" redirectPath="/employees" />;
}
