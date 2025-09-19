import RoleLogin from "./RoleLogin";
export default function LoginFamily() {
  return (
    <RoleLogin
      roleId="r_family"
      title="تسجيل دخول عائلة"
      redirectPath="/family"
    />
  );
}
