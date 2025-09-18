import RoleLogin from "./RoleLogin";
export default function LoginStaff() {
  return <RoleLogin roleId="r_staff" title="تسجيل دخول موظف" redirectPath="/employees" />;
}
