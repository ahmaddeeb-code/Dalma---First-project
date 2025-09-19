import { useMemo, useSyncExternalStore, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import TableToolbar from "@/components/ui/table-toolbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { t, getLocale, subscribeLocale } from "@/i18n";
import { getCurrentUser, getCurrentUserId, subscribeAuth } from "@/store/auth";
import { effectivePrivileges, loadACL } from "@/store/acl";
import {
  subscribeOrgSettings,
  getOrgSettings,
  updateBasic,
  upsertBranch,
  removeBranch,
  updateBranding,
  updatePrefs,
  previewId,
  uid,
} from "@/store/org-settings";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, ShieldAlert } from "lucide-react";

function useLocaleValue() {
  return useSyncExternalStore(
    (cb) => subscribeLocale(cb),
    () => getLocale(),
    () => getLocale(),
  );
}
function useOrg() {
  return useSyncExternalStore(
    (cb) => subscribeOrgSettings(cb),
    () => getOrgSettings(),
    () => getOrgSettings(),
  );
}

export default function OrganizationSettings() {
  const state = useOrg();
  const loc = useLocaleValue();
  const userId = useSyncExternalStore(
    (cb) => subscribeAuth(cb),
    () => getCurrentUserId(),
    () => getCurrentUserId(),
  );
  const me = useMemo(() => getCurrentUser(), [userId]);
  const canManage = useMemo(() => {
    if (!me) return false;
    const acl = loadACL();
    const has = effectivePrivileges(me, acl.roles, acl.privileges).some(
      (p) => p.id === "p_manage_org_settings",
    );
    const isAdmin = me.roleIds.includes("r_admin");
    return has || isAdmin;
  }, [me]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {loc === "ar" ? "إعدادات المؤسسة" : "Organization Settings"}
        </h1>
        <p className="text-muted-foreground">
          {loc === "ar"
            ? "معلومات أساسية والفروع والتفضيلات"
            : "Basic info, branches, and preferences"}
        </p>
      </header>

      {!canManage && (
        <div className="border rounded-md p-3 flex items-start gap-2 text-sm">
          <ShieldAlert className="ml-2 h-4 w-4" />
          <div>
            <div className="font-medium">{t("common.readOnly")}</div>
            <div className="text-muted-foreground">
              {loc === "ar"
                ? "لا تملك صلاحية التعديل"
                : "You don't have edit permission."}
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">
            {loc === "ar" ? "المعلومات الأساسية" : "Basic Info"}
          </TabsTrigger>
          <TabsTrigger value="branches">
            {loc === "ar" ? "الفروع" : "Branches"}
          </TabsTrigger>
          <TabsTrigger value="config">
            {loc === "ar" ? "الإعدادات العامة" : "General Config"}
          </TabsTrigger>
          <TabsTrigger value="branding">
            {loc === "ar" ? "الهوية" : "Branding"}
          </TabsTrigger>
          <TabsTrigger value="prefs">
            {loc === "ar" ? "تفضيلات النظام" : "System Preferences"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicInfoCard canManage={canManage} />
        </TabsContent>
        <TabsContent value="branches" className="mt-6">
          <BranchesCard canManage={canManage} />
        </TabsContent>
        <TabsContent value="config" className="mt-6">
          <GeneralConfigCard canManage={canManage} />
        </TabsContent>
        <TabsContent value="branding" className="mt-6">
          <BrandingCard canManage={canManage} />
        </TabsContent>
        <TabsContent value="prefs" className="mt-6">
          <PreferencesCard canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BasicInfoCard({ canManage }: { canManage: boolean }) {
  const s = useOrg().basic;
  const [name, setName] = useState(s.name);
  const [phone, setPhone] = useState(s.phone || "");
  const [email, setEmail] = useState(s.email || "");
  const [address, setAddress] = useState(s.address || "");
  const [logo, setLogo] = useState(s.logoUrl || "");
  const [timezone, setTimezone] = useState(s.timezone || "");
  const [language, setLanguage] = useState(s.language || "en");
  const [days, setDays] = useState<number[]>(s.hours.days);
  const [start, setStart] = useState(s.hours.start);
  const [end, setEnd] = useState(s.hours.end);
  useEffect(() => {
    setName(s.name);
    setPhone(s.phone || "");
    setEmail(s.email || "");
    setAddress(s.address || "");
    setLogo(s.logoUrl || "");
    setTimezone(s.timezone || "");
    setLanguage(s.language || "en");
    setDays(s.hours.days);
    setStart(s.hours.start);
    setEnd(s.hours.end);
  }, [s]);
  const valid = name.trim().length > 1;
  function toggleDay(d: number) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Name, contacts, and hours</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label requiredMark>Organization name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Logo URL</Label>
            <Input
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <Label>Timezone</Label>
            <Input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Asia/Riyadh"
            />
          </div>
          <div>
            <Label>Language</Label>
            <select
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
        <div>
          <Label>Operating days</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days.includes(d) ? "default" : "secondary"}
                onClick={() => toggleDay(d)}
              >
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>Start</Label>
            <Input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <Label>End</Label>
            <Input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            disabled={!valid || !canManage}
            onClick={() => {
              updateBasic({
                name,
                phone,
                email,
                address,
                logoUrl: logo,
                timezone,
                language,
                hours: { days, start, end },
              });
              toast.success("Saved");
            }}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BranchesCard({ canManage }: { canManage: boolean }) {
  const st = useOrg();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Branches / Locations</CardTitle>
          <CardDescription>Manage locations and contacts</CardDescription>
        </div>
        {canManage && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="ml-1 h-4 w-4" /> Add
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {st.branches.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.name}</TableCell>
                <TableCell>{b.address}</TableCell>
                <TableCell>{b.phone}</TableCell>
                <TableCell>{b.contactPerson}</TableCell>
                <TableCell className="flex gap-2">
                  {canManage && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(b);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="ml-1 h-4 w-4" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setConfirmId(b.id)}
                      >
                        <Trash2 className="ml-1 h-4 w-4" /> Delete
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <BranchDialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
          setOpen(v);
        }}
        editing={editing}
      />
      <AlertDialog open={!!confirmId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete branch?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmId) {
                  removeBranch(confirmId);
                  setConfirmId(null);
                  toast.success("Deleted");
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function BranchDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: any;
}) {
  const [name, setName] = useState(editing?.name || "");
  const [address, setAddress] = useState(editing?.address || "");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [contactPerson, setContactPerson] = useState(
    editing?.contactPerson || "",
  );
  useEffect(() => {
    setName(editing?.name || "");
    setAddress(editing?.address || "");
    setPhone(editing?.phone || "");
    setContactPerson(editing?.contactPerson || "");
  }, [editing, open]);
  const valid = name.trim().length > 1;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Add"} Branch</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>Contact person</Label>
            <Input
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              upsertBranch({
                id: editing?.id || uid("br"),
                name: name.trim(),
                address: address.trim(),
                phone: phone.trim(),
                contactPerson: contactPerson.trim(),
              });
              toast.success("Saved");
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GeneralConfigCard({ canManage }: { canManage: boolean }) {
  const s = useOrg().prefs;
  const [benefFmt, setBenefFmt] = useState({
    prefix: s.idFormats.beneficiary.prefix,
    includeYear: s.idFormats.beneficiary.includeYear,
    width: String(s.idFormats.beneficiary.width),
    suffix: s.idFormats.beneficiary.suffix,
  });
  const [staffFmt, setStaffFmt] = useState({
    prefix: s.idFormats.staff.prefix,
    includeYear: s.idFormats.staff.includeYear,
    width: String(s.idFormats.staff.width),
    suffix: s.idFormats.staff.suffix,
  });
  const [currency, setCurrency] = useState(s.currency);
  const [country, setCountry] = useState(s.country || "");
  const [region, setRegion] = useState(s.region || "");
  useEffect(() => {
    setBenefFmt({
      prefix: s.idFormats.beneficiary.prefix,
      includeYear: s.idFormats.beneficiary.includeYear,
      width: String(s.idFormats.beneficiary.width),
      suffix: s.idFormats.beneficiary.suffix,
    });
    setStaffFmt({
      prefix: s.idFormats.staff.prefix,
      includeYear: s.idFormats.staff.includeYear,
      width: String(s.idFormats.staff.width),
      suffix: s.idFormats.staff.suffix,
    });
    setCurrency(s.currency);
    setCountry(s.country || "");
    setRegion(s.region || "");
  }, [s]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Configuration</CardTitle>
        <CardDescription>ID formats, currency and region</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Beneficiary ID format</Label>
            <div className="grid md:grid-cols-4 gap-2 mt-1">
              <Input
                value={benefFmt.prefix}
                onChange={(e) =>
                  setBenefFmt({ ...benefFmt, prefix: e.target.value })
                }
                placeholder="Prefix"
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={benefFmt.includeYear}
                  onCheckedChange={(v) =>
                    setBenefFmt({ ...benefFmt, includeYear: v === true })
                  }
                />{" "}
                <Label>Year</Label>
              </div>
              <Input
                type="number"
                value={benefFmt.width}
                onChange={(e) =>
                  setBenefFmt({ ...benefFmt, width: e.target.value })
                }
                placeholder="Width"
              />
              <Input
                value={benefFmt.suffix}
                onChange={(e) =>
                  setBenefFmt({ ...benefFmt, suffix: e.target.value })
                }
                placeholder="Suffix"
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Preview:{" "}
              <span className="font-mono">{previewId("beneficiary")}</span>
            </div>
          </div>
          <div>
            <Label>Staff ID format</Label>
            <div className="grid md:grid-cols-4 gap-2 mt-1">
              <Input
                value={staffFmt.prefix}
                onChange={(e) =>
                  setStaffFmt({ ...staffFmt, prefix: e.target.value })
                }
                placeholder="Prefix"
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={staffFmt.includeYear}
                  onCheckedChange={(v) =>
                    setStaffFmt({ ...staffFmt, includeYear: v === true })
                  }
                />{" "}
                <Label>Year</Label>
              </div>
              <Input
                type="number"
                value={staffFmt.width}
                onChange={(e) =>
                  setStaffFmt({ ...staffFmt, width: e.target.value })
                }
                placeholder="Width"
              />
              <Input
                value={staffFmt.suffix}
                onChange={(e) =>
                  setStaffFmt({ ...staffFmt, suffix: e.target.value })
                }
                placeholder="Suffix"
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Preview: <span className="font-mono">{previewId("staff")}</span>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Currency</Label>
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="SAR"
            />
          </div>
          <div>
            <Label>Country</Label>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="SA"
            />
          </div>
          <div>
            <Label>Region</Label>
            <Input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Riyadh"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              updatePrefs({
                idFormats: {
                  beneficiary: {
                    ...s.idFormats.beneficiary,
                    prefix: benefFmt.prefix,
                    includeYear: benefFmt.includeYear,
                    width: Number(benefFmt.width),
                    suffix: benefFmt.suffix,
                  },
                  staff: {
                    ...s.idFormats.staff,
                    prefix: staffFmt.prefix,
                    includeYear: staffFmt.includeYear,
                    width: Number(staffFmt.width),
                    suffix: staffFmt.suffix,
                  },
                },
                currency,
                country,
                region,
              });
              toast.success("Saved");
            }}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BrandingCard({ canManage }: { canManage: boolean }) {
  const b = useOrg().branding;
  const [logo, setLogo] = useState(b.logoUrl || "");
  const [favicon, setFavicon] = useState(b.faviconUrl || "");
  const [primary, setPrimary] = useState(b.primaryColor || "#2563eb");
  const [secondary, setSecondary] = useState(b.secondaryColor || "#10b981");
  useEffect(() => {
    setLogo(b.logoUrl || "");
    setFavicon(b.faviconUrl || "");
    setPrimary(b.primaryColor || "#2563eb");
    setSecondary(b.secondaryColor || "#10b981");
  }, [b]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>Logo, favicon and colors</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-3">
        <div>
          <Label>Logo URL</Label>
          <Input
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div>
          <Label>Favicon URL</Label>
          <Input
            value={favicon}
            onChange={(e) => setFavicon(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div>
          <Label>Primary Color</Label>
          <Input
            type="color"
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
          />
        </div>
        <div>
          <Label>Secondary Color</Label>
          <Input
            type="color"
            value={secondary}
            onChange={(e) => setSecondary(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button
            onClick={() => {
              updateBranding({
                logoUrl: logo,
                faviconUrl: favicon,
                primaryColor: primary,
                secondaryColor: secondary,
              });
              toast.success("Saved");
            }}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PreferencesCard({ canManage }: { canManage: boolean }) {
  const p = useOrg().prefs;
  const [single, setSingle] = useState(p.singleCenterMode);
  const [widgets, setWidgets] = useState<string[]>(p.dashboardWidgets);
  const [modules, setModules] = useState<Record<string, boolean>>(p.modules);
  useEffect(() => {
    setSingle(p.singleCenterMode);
    setWidgets(p.dashboardWidgets);
    setModules(p.modules);
  }, [p]);
  function toggleWidget(w: string) {
    setWidgets((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w],
    );
  }
  function toggleModule(m: string) {
    setModules((prev) => ({ ...prev, [m]: !prev[m] }));
  }
  const allWidgets = [
    "kpi_beneficiaries",
    "appointments",
    "alerts",
    "team",
    "reviews",
    "notifications",
  ];
  const allModules = [
    "finance",
    "notifications",
    "education",
    "logistics",
    "medical",
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Preferences</CardTitle>
        <CardDescription>
          Single/multi-branch, dashboard and modules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={single}
            onCheckedChange={(v) => setSingle(v === true)}
          />{" "}
          <Label>Single-center mode</Label>
        </div>
        <div>
          <Label>Dashboard widgets</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {allWidgets.map((w) => (
              <Button
                key={w}
                size="sm"
                variant={widgets.includes(w) ? "default" : "secondary"}
                onClick={() => toggleWidget(w)}
              >
                {w}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <Label>Modules</Label>
          <div className="grid md:grid-cols-3 gap-2 mt-1">
            {allModules.map((m) => (
              <label key={m} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={!!modules[m]}
                  onCheckedChange={() => toggleModule(m)}
                />{" "}
                {m}
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              updatePrefs({
                singleCenterMode: single,
                dashboardWidgets: widgets,
                modules,
              });
              toast.success("Saved");
            }}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
