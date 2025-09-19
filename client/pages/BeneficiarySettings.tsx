import { useMemo, useState, useSyncExternalStore, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { t, getLocale, subscribeLocale } from "@/i18n";
import { getCurrentUser, getCurrentUserId, subscribeAuth } from "@/store/auth";
import { effectivePrivileges, loadACL } from "@/store/acl";
import { toast } from "sonner";
import {
  BeneficiarySettingsState,
  subscribeBeneficiarySettings,
  getBeneficiarySettings,
  setIdConfig,
  previewNextBeneficiaryId,
  setRequiredFields,
  addCustomField,
  upsertCustomField,
  removeCustomField,
  addDisabilityCategory,
  removeDisabilityCategory,
  upsertCarePlan,
  removeCarePlan,
  upsertDocCategory,
  removeDocCategory,
  setProfileConfig,
  addListItem,
  removeListItem,
  uid,
} from "@/store/beneficiary-settings";
import { Plus, Pencil, Trash2 } from "lucide-react";

function useLocaleValue() {
  return useSyncExternalStore(
    (cb) => subscribeLocale(cb),
    () => getLocale(),
    () => getLocale(),
  );
}
function useSettings() {
  return useSyncExternalStore(
    (cb) => subscribeBeneficiarySettings(cb),
    () => getBeneficiarySettings(),
    () => getBeneficiarySettings(),
  );
}

export default function BeneficiarySettings() {
  const s = useSettings();
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
      (p) => p.id === "p_manage_beneficiary_settings",
    );
    const isAdmin = me.roleIds.includes("r_admin");
    return has || isAdmin;
  }, [me]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {loc === "ar" ? "إعدادات المستفيد" : "Beneficiary Settings"}
        </h1>
        <p className="text-muted-foreground">
          {loc === "ar"
            ? "تهيئة التسجيل وإدارة المستفيدين"
            : "Configure registration and management"}
        </p>
      </header>

      <Tabs defaultValue="id">
        <TabsList>
          <TabsTrigger value="id">
            {loc === "ar" ? "معرف المستفيد" : "Beneficiary ID"}
          </TabsTrigger>
          <TabsTrigger value="required">
            {loc === "ar" ? "الحقول المطلوبة" : "Required Fields"}
          </TabsTrigger>
          <TabsTrigger value="categories">
            {loc === "ar" ? "فئات الإعاقة" : "Disability Categories"}
          </TabsTrigger>
          <TabsTrigger value="careplans">
            {loc === "ar" ? "قوالب الرعاية" : "Care Plans"}
          </TabsTrigger>
          <TabsTrigger value="documents">
            {loc === "ar" ? "مستندات" : "Documents"}
          </TabsTrigger>
          <TabsTrigger value="profile">
            {loc === "ar" ? "الملف" : "Profile"}
          </TabsTrigger>
          <TabsTrigger value="lists">
            {loc === "ar" ? "القوائم" : "Lists"}
          </TabsTrigger>
          <TabsTrigger value="custom">
            {loc === "ar" ? "حقول مخصصة" : "Custom Fields"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="id" className="mt-6">
          <IdConfigCard s={s} canManage={canManage} />
        </TabsContent>
        <TabsContent value="required" className="mt-6">
          <RequiredFieldsCard s={s} canManage={canManage} />
        </TabsContent>
        <TabsContent value="categories" className="mt-6">
          <CategoriesCard s={s} canManage={canManage} />
        </TabsContent>
        <TabsContent value="careplans" className="mt-6">
          <CarePlansCard s={s} canManage={canManage} />
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <DocumentsCard s={s} canManage={canManage} />
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <ProfileCard s={s} canManage={canManage} />
        </TabsContent>
        <TabsContent value="lists" className="mt-6">
          <ListsCard s={s} canManage={canManage} />
        </TabsContent>
        <TabsContent value="custom" className="mt-6">
          <CustomFieldsCard s={s} canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IdConfigCard({
  s,
  canManage,
}: {
  s: BeneficiarySettingsState;
  canManage: boolean;
}) {
  const [prefix, setPrefix] = useState(s.id.prefix);
  const [includeYear, setIncludeYear] = useState(s.id.includeYear);
  const [suffix, setSuffix] = useState(s.id.suffix);
  const [width, setWidth] = useState(String(s.id.width));
  useEffect(() => {
    setPrefix(s.id.prefix);
    setIncludeYear(s.id.includeYear);
    setSuffix(s.id.suffix);
    setWidth(String(s.id.width));
  }, [s.id]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Beneficiary ID</CardTitle>
        <CardDescription>Define pattern and auto-increment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <Label>Prefix</Label>
            <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Checkbox
              checked={includeYear}
              onCheckedChange={(v) => setIncludeYear(v === true)}
            />{" "}
            <Label>Include Year (YYYY)</Label>
          </div>
          <div>
            <Label>Suffix</Label>
            <Input value={suffix} onChange={(e) => setSuffix(e.target.value)} />
          </div>
          <div>
            <Label>Number width</Label>
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">Preview:</span>{" "}
            <span className="font-mono">{previewNextBeneficiaryId()}</span>
          </div>
          <Button
            disabled={!canManage}
            onClick={() => {
              setIdConfig({
                prefix,
                includeYear,
                suffix,
                width: Number(width),
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

function RequiredFieldsCard({
  s,
  canManage,
}: {
  s: BeneficiarySettingsState;
  canManage: boolean;
}) {
  const r = s.required;
  const items: { key: keyof typeof r; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "dob", label: "Date of birth" },
    { key: "gender", label: "Gender" },
    { key: "civilId", label: "Civil ID" },
    { key: "guardianName", label: "Guardian name" },
    { key: "guardianPhone", label: "Guardian phone" },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Required at registration</CardTitle>
        <CardDescription>Choose which fields are mandatory</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-3">
          {items.map(({ key, label }) => (
            <label
              key={key as string}
              className="flex items-center gap-2 text-sm"
            >
              <Checkbox
                checked={!!r[key]}
                onCheckedChange={(v) =>
                  setRequiredFields({ [key]: v === true } as any)
                }
              />{" "}
              {label}
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CategoriesCard({
  s,
  canManage,
}: {
  s: BeneficiarySettingsState;
  canManage: boolean;
}) {
  const [val, setVal] = useState("");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Disability Categories</CardTitle>
        <CardDescription>Manage list used in registration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Add category"
          />
          <Button
            disabled={!val.trim()}
            onClick={() => {
              addDisabilityCategory(val.trim());
              setVal("");
            }}
          >
            Add
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {s.disabilityCategories.map((c) => (
            <Badge
              key={c}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => removeDisabilityCategory(c)}
            >
              {c}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CarePlansCard({
  s,
  canManage,
}: {
  s: BeneficiarySettingsState;
  canManage: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{
    id: string;
    name: string;
    goals: string[];
    interventions: string[];
    metrics: string[];
  } | null>(null);
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Care Plan Templates</CardTitle>
          <CardDescription>
            Reusable goals, interventions and metrics
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <TableToolbar
            onAdd={() => setOpen(true)}
            addLabel="Add"
            onExport={(type) => {
              const cols = [
                { header: 'Name', accessor: (r:any) => r.name },
                { header: 'Goals', accessor: (r:any) => (r.goals || []).join(', ') },
                { header: 'Interventions', accessor: (r:any) => (r.interventions || []).join(', ') },
                { header: 'Metrics', accessor: (r:any) => (r.metrics || []).join(', ') },
              ];
              import('@/lib/export').then((m)=>m.exportAll(s.carePlanTemplates, cols, type, 'careplans'));
            }}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Goals</TableHead>
              <TableHead>Interventions</TableHead>
              <TableHead>Metrics</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {s.carePlanTemplates.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.goals.join(", ")}</TableCell>
                <TableCell>{t.interventions.join(", ")}</TableCell>
                <TableCell>{t.metrics.join(", ")}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditing(t);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="ml-1 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      removeCarePlan(t.id);
                      toast.success("Removed");
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CarePlanDialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
          setOpen(v);
        }}
        editing={editing}
      />
    </Card>
  );
}

function CarePlanDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: any;
}) {
  const [name, setName] = useState(editing?.name || "");
  const [goal, setGoal] = useState("");
  const [goals, setGoals] = useState<string[]>(editing?.goals || []);
  const [intervention, setIntervention] = useState("");
  const [interventions, setInterventions] = useState<string[]>(
    editing?.interventions || [],
  );
  const [metric, setMetric] = useState("");
  const [metrics, setMetrics] = useState<string[]>(editing?.metrics || []);
  useEffect(() => {
    setName(editing?.name || "");
    setGoals(editing?.goals || []);
    setInterventions(editing?.interventions || []);
    setMetrics(editing?.metrics || []);
    setGoal("");
    setIntervention("");
    setMetric("");
  }, [editing, open]);
  const valid = name.trim().length > 1;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Add"} Care Plan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Goals</Label>
            <div className="flex gap-2">
              <Input value={goal} onChange={(e) => setGoal(e.target.value)} />
              <Button
                onClick={() => {
                  if (goal.trim()) {
                    setGoals([goal.trim(), ...goals]);
                    setGoal("");
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {goals.map((g, i) => (
                <Badge
                  key={i}
                  className="cursor-pointer"
                  onClick={() => setGoals(goals.filter((x) => x !== g))}
                  variant="secondary"
                >
                  {g}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>Interventions</Label>
            <div className="flex gap-2">
              <Input
                value={intervention}
                onChange={(e) => setIntervention(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (intervention.trim()) {
                    setInterventions([intervention.trim(), ...interventions]);
                    setIntervention("");
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {interventions.map((g, i) => (
                <Badge
                  key={i}
                  className="cursor-pointer"
                  onClick={() =>
                    setInterventions(interventions.filter((x) => x !== g))
                  }
                  variant="secondary"
                >
                  {g}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>Metrics</Label>
            <div className="flex gap-2">
              <Input
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (metric.trim()) {
                    setMetrics([metric.trim(), ...metrics]);
                    setMetric("");
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {metrics.map((g, i) => (
                <Badge
                  key={i}
                  className="cursor-pointer"
                  onClick={() => setMetrics(metrics.filter((x) => x !== g))}
                  variant="secondary"
                >
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              upsertCarePlan({
                id: editing?.id || uid("tpl"),
                name: name.trim(),
                goals,
                interventions,
                metrics,
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

function DocumentsCard({
  s,
  canManage,
}: {
  s: BeneficiarySettingsState;
  canManage: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Document Categories</CardTitle>
          <CardDescription>
            Configure categories, expiry and alerts
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <TableToolbar
            onAdd={() => setOpen(true)}
            addLabel="Add"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Alert (days)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {s.documentCategories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.expires ? "Yes" : "No"}</TableCell>
                <TableCell>
                  {c.expires ? c.alertBeforeDays || 0 : "-"}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditing(c);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="ml-1 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      removeDocCategory(c.id);
                      toast.success("Removed");
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <DocDialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
          setOpen(v);
        }}
        editing={editing}
      />
    </Card>
  );
}

function DocDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: any;
}) {
  const [name, setName] = useState(editing?.name || "");
  const [expires, setExpires] = useState<boolean>(!!editing?.expires);
  const [alertDays, setAlertDays] = useState(
    String(editing?.alertBeforeDays || 0),
  );
  useEffect(() => {
    setName(editing?.name || "");
    setExpires(!!editing?.expires);
    setAlertDays(String(editing?.alertBeforeDays || 0));
  }, [editing, open]);
  const valid = name.trim().length > 1;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit" : "Add"} Document Category
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={expires}
              onCheckedChange={(v) => setExpires(v === true)}
            />{" "}
            <Label>Expires</Label>
          </div>
          {expires && (
            <div>
              <Label>Alert before (days)</Label>
              <Input
                type="number"
                value={alertDays}
                onChange={(e) => setAlertDays(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              upsertDocCategory({
                id: editing?.id || uid("dc"),
                name: name.trim(),
                expires,
                alertBeforeDays: Number(alertDays),
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

function ProfileCard({
  s,
  canManage,
}: {
  s: BeneficiarySettingsState;
  canManage: boolean;
}) {
  const [requirePhoto, setRequirePhoto] = useState(s.profile.requirePhoto);
  const [mode, setMode] = useState(s.profile.guardiansMode);
  const [emCount, setEmCount] = useState(
    String(s.profile.emergencyContactsRequired),
  );
  useEffect(() => {
    setRequirePhoto(s.profile.requirePhoto);
    setMode(s.profile.guardiansMode);
    setEmCount(String(s.profile.emergencyContactsRequired));
  }, [s.profile]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Configuration</CardTitle>
        <CardDescription>
          Photo requirement, guardians, and emergency contacts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={requirePhoto}
            onCheckedChange={(v) => setRequirePhoto(v === true)}
          />
          <Label>Require profile photo</Label>
        </div>
        <div>
          <Label>Guardian linking</Label>
          <select
            className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
          >
            <option value="one">One guardian</option>
            <option value="multiple">Multiple guardians</option>
          </select>
        </div>
        <div>
          <Label>Emergency contacts required</Label>
          <Input
            type="number"
            value={emCount}
            onChange={(e) => setEmCount(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setProfileConfig({
                requirePhoto,
                guardiansMode: mode,
                emergencyContactsRequired: Number(emCount),
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

function ListsCard({
  s,
  canManage,
}: {
  s: BeneficiarySettingsState;
  canManage: boolean;
}) {
  const entries: {
    key: keyof BeneficiarySettingsState["lists"];
    label: string;
  }[] = [
    { key: "gender", label: "Gender" },
    { key: "maritalStatus", label: "Marital Status" },
    { key: "educationLevel", label: "Education Level" },
    { key: "supportPrograms", label: "Support Programs" },
    { key: "sponsorshipTypes", label: "Sponsorship Types" },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lists & Dropdowns</CardTitle>
        <CardDescription>
          Customize enumerations used across the system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {entries.map(({ key, label }) => (
          <div key={key as string}>
            <Label>{label}</Label>
            <div className="mt-1 flex gap-2">
              <ListEditor
                items={s.lists[key] as string[]}
                onAdd={(v) => addListItem(key as any, v)}
                onRemove={(v) => removeListItem(key as any, v)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ListEditor({
  items,
  onAdd,
  onRemove,
}: {
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [val, setVal] = useState("");
  return (
    <div className="w-full">
      <div className="flex gap-2">
        <Input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Add value"
        />
        <Button
          disabled={!val.trim()}
          onClick={() => {
            onAdd(val.trim());
            setVal("");
          }}
        >
          Add
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((x) => (
          <Badge
            key={x}
            className="cursor-pointer"
            variant="secondary"
            onClick={() => onRemove(x)}
          >
            {x}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function CustomFieldsCard({
  s,
  canManage,
}: {
  s: BeneficiarySettingsState;
  canManage: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Custom Fields</CardTitle>
          <CardDescription>
            Add extra fields for registration and profile
          </CardDescription>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="ml-1 h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {s.customFields.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.key}</TableCell>
                <TableCell>{f.label}</TableCell>
                <TableCell>{f.type}</TableCell>
                <TableCell>{f.options?.join(", ") || "-"}</TableCell>
                <TableCell>{f.required ? "Yes" : "No"}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditing(f);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="ml-1 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      removeCustomField(f.id);
                      toast.success("Removed");
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CustomFieldDialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
          setOpen(v);
        }}
        editing={editing}
      />
    </Card>
  );
}

function CustomFieldDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: any;
}) {
  const [key, setKey] = useState(editing?.key || "");
  const [label, setLabel] = useState(editing?.label || "");
  const [type, setType] = useState<"text" | "select">(editing?.type || "text");
  const [optVal, setOptVal] = useState("");
  const [options, setOptions] = useState<string[]>(editing?.options || []);
  const [required, setRequired] = useState<boolean>(!!editing?.required);
  useEffect(() => {
    setKey(editing?.key || "");
    setLabel(editing?.label || "");
    setType(editing?.type || "text");
    setOptions(editing?.options || []);
    setOptVal("");
    setRequired(!!editing?.required);
  }, [editing, open]);
  const valid = key.trim().length > 1 && label.trim().length > 1;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Add"} Field</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>Key</Label>
              <Input value={key} onChange={(e) => setKey(e.target.value)} />
            </div>
            <div>
              <Label>Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Type</Label>
            <select
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="text">Text</option>
              <option value="select">Select</option>
            </select>
          </div>
          {type === "select" && (
            <div>
              <Label>Options</Label>
              <div className="flex gap-2">
                <Input
                  value={optVal}
                  onChange={(e) => setOptVal(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (optVal.trim()) {
                      setOptions([optVal.trim(), ...options]);
                      setOptVal("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {options.map((o, i) => (
                  <Badge
                    key={i}
                    className="cursor-pointer"
                    onClick={() => setOptions(options.filter((x) => x !== o))}
                    variant="secondary"
                  >
                    {o}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={required}
              onCheckedChange={(v) => setRequired(v === true)}
            />{" "}
            <Label>Required</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const f = {
                id: editing?.id || undefined,
                key: key.trim(),
                label: label.trim(),
                type,
                options,
                required,
              } as any;
              if (editing) upsertCustomField({ ...f, id: editing.id });
              else addCustomField(f);
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
