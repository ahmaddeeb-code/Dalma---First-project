import { useMemo, useSyncExternalStore, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { t } from "@/i18n";
import { getCurrentUser, getCurrentUserId, subscribeAuth } from "@/store/auth";
import { effectivePrivileges, loadACL } from "@/store/acl";
import { getSecurity, subscribeSecurity, updateAuth, setPasswordPolicy, upsertRolePerm, setSensitiveAccess, setDataProtection, setCompliance, exportAudits, clearAudits } from "@/store/security";
import { toast } from "sonner";

function useSecurity(){ return useSyncExternalStore((cb)=>subscribeSecurity(cb), ()=>getSecurity(), ()=>getSecurity()); }

export default function SecuritySettings(){
  const s = useSecurity();
  const userId = useSyncExternalStore((cb)=>subscribeAuth(cb), ()=>getCurrentUserId(), ()=>getCurrentUserId());
  const me = useMemo(()=>getCurrentUser(), [userId]);
  const canManage = useMemo(()=>{ if(!me) return false; const acl = loadACL(); const has = effectivePrivileges(me, acl.roles, acl.privileges).some(p=>p.id==="p_manage_security"); const isAdmin = me.roleIds.includes("r_admin"); return has || isAdmin; }, [me]);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Security & Compliance</h1>
        <p className="text-muted-foreground">Authentication, permissions, audits, data protection, and compliance</p>
      </header>

      <Tabs defaultValue="auth">
        <TabsList>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="roles">Role Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="data">Data Protection</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="auth" className="mt-6"><AuthCard canManage={canManage} /></TabsContent>
        <TabsContent value="roles" className="mt-6"><RolesCard canManage={canManage} /></TabsContent>
        <TabsContent value="audit" className="mt-6"><AuditCard canManage={canManage} confirmClear={confirmClear} setConfirmClear={setConfirmClear} /></TabsContent>
        <TabsContent value="data" className="mt-6"><DataProtectionCard canManage={canManage} /></TabsContent>
        <TabsContent value="compliance" className="mt-6"><ComplianceCard canManage={canManage} /></TabsContent>
      </Tabs>
    </div>
  );
}

function AuthCard({ canManage }:{ canManage: boolean }){
  const a = useSecurity().auth;
  const [twoFactor, setTwoFactor] = useState(a.twoFactor);
  const [timeoutMin, setTimeoutMin] = useState(String(a.sessionTimeoutMin));
  const [autoLogout, setAutoLogout] = useState(a.autoLogout);
  const [minLength, setMinLength] = useState(String(a.passwordPolicy.minLength));
  const [upper, setUpper] = useState(a.passwordPolicy.requireUpper);
  const [lower, setLower] = useState(a.passwordPolicy.requireLower);
  const [num, setNum] = useState(a.passwordPolicy.requireNumber);
  const [special, setSpecial] = useState(a.passwordPolicy.requireSpecial);
  const [expiry, setExpiry] = useState(String(a.passwordPolicy.expirationDays));
  return (
    <Card>
      <CardHeader><CardTitle>User Access & Authentication</CardTitle><CardDescription>2FA, password policy, session timeout</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2"><Checkbox checked={twoFactor} onCheckedChange={(v)=>setTwoFactor(v===true)} /> <Label>Enable Two-Factor Authentication</Label></div>
        <div className="grid md:grid-cols-3 gap-3">
          <div><Label>Session timeout (min)</Label><Input type="number" value={timeoutMin} onChange={(e)=>setTimeoutMin(e.target.value)} /></div>
          <div className="flex items-center gap-2 mt-6"><Checkbox checked={autoLogout} onCheckedChange={(v)=>setAutoLogout(v===true)} /> <Label>Auto-logout on timeout</Label></div>
        </div>
        <div>
          <Label>Password policy</Label>
          <div className="grid md:grid-cols-5 gap-3 mt-1">
            <div><Label>Min length</Label><Input type="number" value={minLength} onChange={(e)=>setMinLength(e.target.value)} /></div>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={upper} onCheckedChange={(v)=>setUpper(v===true)} /> Uppercase</label>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={lower} onCheckedChange={(v)=>setLower(v===true)} /> Lowercase</label>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={num} onCheckedChange={(v)=>setNum(v===true)} /> Number</label>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={special} onCheckedChange={(v)=>setSpecial(v===true)} /> Special char</label>
            <div><Label>Expiration (days)</Label><Input type="number" value={expiry} onChange={(e)=>setExpiry(e.target.value)} /></div>
          </div>
        </div>
        <div className="flex justify-end"><Button disabled={!canManage} onClick={()=>{ updateAuth({ twoFactor, sessionTimeoutMin: Number(timeoutMin), autoLogout }); setPasswordPolicy({ minLength: Number(minLength), requireUpper: upper, requireLower: lower, requireNumber: num, requireSpecial: special, expirationDays: Number(expiry) }); toast.success("Saved"); }}>Save</Button></div>
      </CardContent>
    </Card>
  );
}

function RolesCard({ canManage }:{ canManage: boolean }){
  const s = useSecurity();
  const roles = useMemo(()=> loadACL().roles, []);
  const [financialTo, setFinancialTo] = useState<string[]>(s.sensitive.financialVisibleTo);
  const [medicalTo, setMedicalTo] = useState<string[]>(s.sensitive.medicalVisibleTo);
  function toggle(target: string[], set: (v:string[])=>void, id: string){ set(target.includes(id) ? target.filter(x=>x!==id) : [...target, id]); }
  return (
    <Card>
      <CardHeader><CardTitle>Role-Based Permissions</CardTitle><CardDescription>Per-role actions and sensitive field visibility</CardDescription></CardHeader>
      <CardContent className="space-y-6">
        <Table>
          <TableHeader><TableRow><TableHead>Role</TableHead><TableHead>View</TableHead><TableHead>Edit</TableHead><TableHead>Delete</TableHead><TableHead>Export</TableHead></TableRow></TableHeader>
          <TableBody>
            {roles.map(r => {
              const cur = s.rolePerms.find(p=>p.roleId===r.id) || { roleId: r.id, view: true, edit: false, del: false, export: false };
              return (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  {(["view","edit","del","export"] as const).map((k)=>(
                    <TableCell key={k}><Checkbox checked={(cur as any)[k]} onCheckedChange={(v)=>{ const next = { ...cur, [k]: v===true }; upsertRolePerm(next); }} /></TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div>
          <Label>Sensitive fields visibility</Label>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            <div>
              <div className="text-sm font-medium">Financial info visible to</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {roles.map(r => (<Button key={r.id} size="sm" variant={financialTo.includes(r.id)?"default":"secondary"} onClick={()=>toggle(financialTo, setFinancialTo, r.id)}>{r.name}</Button>))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Medical info visible to</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {roles.map(r => (<Button key={r.id} size="sm" variant={medicalTo.includes(r.id)?"default":"secondary"} onClick={()=>toggle(medicalTo, setMedicalTo, r.id)}>{r.name}</Button>))}
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-3"><Button disabled={!canManage} onClick={()=>{ setSensitiveAccess({ financialVisibleTo: financialTo, medicalVisibleTo: medicalTo }); toast.success("Saved"); }}>Save</Button></div>
        </div>
      </CardContent>
    </Card>
  );
}

function AuditCard({ canManage, confirmClear, setConfirmClear }:{ canManage: boolean; confirmClear: boolean; setConfirmClear: (v:boolean)=>void; }){
  const s = useSecurity();
  return (
    <Card>
      <CardHeader className="flex items-center justify-between"><div><CardTitle>Audit Logs</CardTitle><CardDescription>Track actions with timestamps and actor</CardDescription></div><div className="flex items-center gap-2"><Button variant="secondary" onClick={()=>{ const blob = new Blob([exportAudits()], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "audit-logs.json"; a.click(); }}>Export</Button><Button variant="destructive" onClick={()=>setConfirmClear(true)}>Clear</Button></div></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Old</TableHead><TableHead>New</TableHead></TableRow></TableHeader>
          <TableBody>
            {s.audits.slice(0,300).map(a => (
              <TableRow key={a.id}><TableCell>{new Date(a.at).toLocaleString()}</TableCell><TableCell>{a.userId || "system"}</TableCell><TableCell>{a.action}</TableCell><TableCell>{a.entity || "-"}</TableCell><TableCell className="max-w-[240px] truncate text-xs">{a.oldValue ? JSON.stringify(a.oldValue) : "-"}</TableCell><TableCell className="max-w-[240px] truncate text-xs">{a.newValue ? JSON.stringify(a.newValue) : "-"}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <AlertDialog open={confirmClear}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Clear all logs?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={()=>setConfirmClear(false)}>Cancel</AlertDialogCancel><AlertDialogAction onClick={()=>{ clearAudits(); setConfirmClear(false); toast.success("Cleared"); }}>Clear</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </Card>
  );
}

function DataProtectionCard({ canManage }:{ canManage: boolean }){
  const d = useSecurity().data;
  const [enc, setEnc] = useState(d.encryptSensitive);
  const [freq, setFreq] = useState(d.backupFrequency);
  const [retDays, setRetDays] = useState(String(d.backupRetentionDays));
  const [years, setYears] = useState(String(d.retentionYears));
  return (
    <Card>
      <CardHeader><CardTitle>Data Protection</CardTitle><CardDescription>Encryption, backups, retention</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2"><Checkbox checked={enc} onCheckedChange={(v)=>setEnc(v===true)} /> <Label>Enable encryption for sensitive fields</Label></div>
        <div className="grid md:grid-cols-3 gap-3">
          <div><Label>Backup frequency</Label><select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={freq} onChange={(e)=>setFreq(e.target.value as any)}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
          <div><Label>Backup retention (days)</Label><Input type="number" value={retDays} onChange={(e)=>setRetDays(e.target.value)} /></div>
          <div><Label>Archive records after (years)</Label><Input type="number" value={years} onChange={(e)=>setYears(e.target.value)} /></div>
        </div>
        <div className="flex justify-end"><Button disabled={!canManage} onClick={()=>{ setDataProtection({ encryptSensitive: enc, backupFrequency: freq, backupRetentionDays: Number(retDays), retentionYears: Number(years) }); toast.success("Saved"); }}>Save</Button></div>
      </CardContent>
    </Card>
  );
}

function ComplianceCard({ canManage }:{ canManage: boolean }){
  const c = useSecurity().compliance;
  const [gdpr, setGdpr] = useState(c.gdpr);
  const [hipaa, setHipaa] = useState(c.hipaa);
  const [consent, setConsent] = useState(c.consentRequired);
  return (
    <Card>
      <CardHeader><CardTitle>Compliance Settings</CardTitle><CardDescription>GDPR/HIPAA, consent, and privacy tools</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2"><Checkbox checked={gdpr} onCheckedChange={(v)=>setGdpr(v===true)} /> <Label>GDPR mode</Label></div>
        <div className="flex items-center gap-2"><Checkbox checked={hipaa} onCheckedChange={(v)=>setHipaa(v===true)} /> <Label>HIPAA mode</Label></div>
        <div className="flex items-center gap-2"><Checkbox checked={consent} onCheckedChange={(v)=>setConsent(v===true)} /> <Label>Require consent (guardian/patient)</Label></div>
        <div className="flex gap-2">
          <Button disabled={!canManage} onClick={()=>{ setCompliance({ gdpr, hipaa, consentRequired: consent }); toast.success("Saved"); }}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
