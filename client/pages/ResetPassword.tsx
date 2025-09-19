import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verifyResetToken, resetPassword } from "@/store/auth";
import { toast } from "sonner";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || undefined;
  const [ok, setOk] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(()=>{
    if(token){
      const r = verifyResetToken(token);
      if(r.ok){ setOk(true); setEmail(r.email); }
      else { toast.error(r.error||"Invalid token"); }
    }
  },[token]);

  const submit = async ()=>{
    if(!token) return;
    if(password.length < 8){ toast.error("Password too short"); return; }
    const r = resetPassword(token, password);
    if(r.ok){ toast.success("Password reset"); navigate('/login'); }
    else toast.error(r.error||"Failed");
  };

  if(!token) return <div className="p-6">No token provided.</div>;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
        </CardHeader>
        <CardContent>
          {ok ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Resetting password for {email}</div>
              <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="New password" />
              <Button className="w-full" onClick={submit}>Set new password</Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Invalid or expired token.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
