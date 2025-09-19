import RoleLogin from "./RoleLogin";
export default function LoginAdmin() {
  return (
    <RoleLogin
      roleId="r_admin"
      title="تسجيل دخول مدير النظام"
      redirectPath="/admin"
    />
  );
}
