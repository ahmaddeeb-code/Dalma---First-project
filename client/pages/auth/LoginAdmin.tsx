import RoleLogin from "./RoleLogin";
export default function LoginAdmin() {
  return <RoleLogin roleId="r_admin" title="Sign in as Administrator" redirectPath="/admin" />;
}
