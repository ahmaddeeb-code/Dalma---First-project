import RoleLogin from "./RoleLogin";
export default function LoginBeneficiary() {
  return (
    <RoleLogin
      roleId="r_beneficiary"
      title="تسجيل دخول مستفيد"
      redirectPath="/beneficiaries"
    />
  );
}
