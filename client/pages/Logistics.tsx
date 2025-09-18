import { useMemo, useState, useSyncExternalStore, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { t, getLocale, subscribeLocale } from "@/i18n";
import { effectivePrivileges, loadACL } from "@/store/acl";
import { getCurrentUser, getCurrentUserId, subscribeAuth } from "@/store/auth";
import {
  Building,
  Room,
  RoomSchedule,
  Equipment,
  RoomType,
  subscribeLogistics,
  getLogistics,
  uid,
  upsertBuilding,
  removeBuilding,
  upsertRoom,
  removeRoom,
  upsertSchedule,
  removeSchedule,
  upsertEquipment,
  removeEquipment,
  hasScheduleConflict,
  type Localized,
} from "@/store/logistics";
import { Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";

function useLocaleValue() {
  return useSyncExternalStore(
    (cb) => subscribeLocale(cb),
    () => getLocale(),
    () => getLocale(),
  );
}
function useLogistics() {
  return useSyncExternalStore(
    (cb) => subscribeLogistics(cb),
    () => getLogistics(),
    () => getLogistics(),
  );
}
function L(loc: "en" | "ar", v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && ("en" in v || "ar" in v))
    return (v[loc] as string) || (v.en as string) || "";
  return String(v);
}

export default function Logistics() {
  const state = useLogistics();
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
      (p) => p.id === "p_manage_logistics",
    );
    const isAdmin = me.roleIds.includes("r_admin");
    return has || isAdmin;
  }, [me]);

  const [search, setSearch] = useState("");
  const buildings = state.buildings.filter((b) =>
    L(loc, b.name).toLowerCase().includes(search.toLowerCase()),
  );
  const rooms = state.rooms.filter((r) =>
    L(loc, r.name).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {loc === "ar" ? "إدارة الخدمات اللوجستية" : "Logistics Management"}
        </h1>
        <p className="text-muted-foreground">
          {loc === "ar"
            ? "إدارة المباني، الغرف، الجداول، والمعدات"
            : "Manage buildings, rooms, scheduling, and equipment"}
        </p>
      </header>

      {!canManage && (
        <Alert>
          <ShieldAlert className="ml-2 h-4 w-4" />
          <AlertTitle>{t("common.readOnly")}</AlertTitle>
          <AlertDescription>
            {loc === "ar"
              ? "صلاحية القراءة فقط. اطلب إذن إدارة اللوجستيات."
              : "Read-only. Ask for logistics management permission."}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("common.search")}
        />
      </div>

      <Tabs defaultValue="buildings">
        <TabsList>
          <TabsTrigger value="buildings">
            {loc === "ar" ? "المباني" : "Buildings"}
          </TabsTrigger>
          <TabsTrigger value="rooms">
            {loc === "ar" ? "الغرف" : "Rooms"}
          </TabsTrigger>
          <TabsTrigger value="schedules">
            {loc === "ar" ? "الجدولة" : "Scheduling"}
          </TabsTrigger>
          <TabsTrigger value="resources">
            {loc === "ar" ? "الموارد" : "Resources"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buildings" className="mt-6">
          <BuildingsTab
            loc={loc}
            canManage={canManage}
            buildings={buildings}
            allRooms={state.rooms}
          />
        </TabsContent>
        <TabsContent value="rooms" className="mt-6">
          <RoomsTab
            loc={loc}
            canManage={canManage}
            buildings={state.buildings}
            rooms={rooms}
          />
        </TabsContent>
        <TabsContent value="schedules" className="mt-6">
          <SchedulesTab
            loc={loc}
            canManage={canManage}
            buildings={state.buildings}
            rooms={state.rooms}
            schedules={state.schedules}
          />
        </TabsContent>
        <TabsContent value="resources" className="mt-6">
          <ResourcesTab
            loc={loc}
            canManage={canManage}
            buildings={state.buildings}
            rooms={state.rooms}
            equipment={state.equipment}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BuildingsTab({
  loc,
  canManage,
  buildings,
  allRooms,
}: {
  loc: "en" | "ar";
  canManage: boolean;
  buildings: Building[];
  allRooms: Room[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Building | null>(null);
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>
            {loc === "ar" ? "إدارة المباني" : "Buildings Management"}
          </CardTitle>
          <CardDescription>
            {loc === "ar"
              ? "إضافة وتعديل وحذف المباني وربط الغرف"
              : "Add/edit/delete buildings and link rooms"}
          </CardDescription>
        </div>
        {canManage && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="ml-1 h-4 w-4" /> {t("common.add")}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{loc === "ar" ? "العنوان" : "Address"}</TableHead>
              <TableHead>{loc === "ar" ? "الطوابق" : "Floors"}</TableHead>
              <TableHead>{t("common.total")}</TableHead>
              <TableHead>{loc === "ar" ? "الغرف" : "Rooms"}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buildings.map((b) => {
              const rooms = allRooms.filter((r) => r.buildingId === b.id);
              return (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="font-medium">{L(loc, b.name)}</div>
                    <div className="text-xs text-muted-foreground">
                      {L(loc, b.description)}
                    </div>
                  </TableCell>
                  <TableCell>{L(loc, b.address)}</TableCell>
                  <TableCell>{b.floors}</TableCell>
                  <TableCell>{b.capacity}</TableCell>
                  <TableCell>{rooms.length}</TableCell>
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
                          <Pencil className="ml-1 h-4 w-4" /> {t("common.edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            removeBuilding(b.id);
                            toast.success(t("pages.medical.saved"));
                          }}
                        >
                          {t("common.delete")}
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <BuildingDialog
        loc={loc}
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

function BuildingDialog({
  loc,
  open,
  onOpenChange,
  editing,
}: {
  loc: "en" | "ar";
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Building | null;
}) {
  const [nameEn, setNameEn] = useState(editing?.name.en || "");
  const [nameAr, setNameAr] = useState(editing?.name.ar || "");
  const [addrEn, setAddrEn] = useState(editing?.address?.en || "");
  const [addrAr, setAddrAr] = useState(editing?.address?.ar || "");
  const [floors, setFloors] = useState(String(editing?.floors ?? 1));
  const [capacity, setCapacity] = useState(String(editing?.capacity ?? 0));
  const [descEn, setDescEn] = useState(editing?.description?.en || "");
  const [descAr, setDescAr] = useState(editing?.description?.ar || "");
  const [photo, setPhoto] = useState(editing?.photo || "");
  useEffect(() => {
    setNameEn(editing?.name.en || "");
    setNameAr(editing?.name.ar || "");
    setAddrEn(editing?.address?.en || "");
    setAddrAr(editing?.address?.ar || "");
    setFloors(String(editing?.floors ?? 1));
    setCapacity(String(editing?.capacity ?? 0));
    setDescEn(editing?.description?.en || "");
    setDescAr(editing?.description?.ar || "");
    setPhoto(editing?.photo || "");
  }, [editing, open]);
  const valid = nameEn.trim().length >= 1 || nameAr.trim().length >= 1;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? t("common.edit") : t("common.add")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>EN — {t("common.name")}</Label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {t("common.name")}</Label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>EN — {loc === "ar" ? "العنوان" : "Address"}</Label>
              <Input
                value={addrEn}
                onChange={(e) => setAddrEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {loc === "ar" ? "العنوان" : "Address"}</Label>
              <Input
                value={addrAr}
                onChange={(e) => setAddrAr(e.target.value)}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>{loc === "ar" ? "الطوابق" : "Floors"}</Label>
              <Input
                type="number"
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
              />
            </div>
            <div>
              <Label>{t("common.total")}</Label>
              <Input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>EN — {t("pages.medical.common.description")}</Label>
              <Input
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {t("pages.medical.common.description")}</Label>
              <Input
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>{loc === "ar" ? "الصورة" : "Photo"}</Label>
            <Input
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const b: Building = {
                id: editing?.id || uid("b"),
                name: { en: nameEn.trim(), ar: nameAr.trim() },
                address: { en: addrEn.trim(), ar: addrAr.trim() },
                floors: Number(floors),
                capacity: Number(capacity),
                description: { en: descEn.trim(), ar: descAr.trim() },
                photo: photo.trim(),
              };
              upsertBuilding(b);
              toast.success(t("pages.medical.saved"));
              onOpenChange(false);
            }}
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoomsTab({
  loc,
  canManage,
  buildings,
  rooms,
}: {
  loc: "en" | "ar";
  canManage: boolean;
  buildings: Building[];
  rooms: Room[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [filterBuilding, setFilterBuilding] = useState<string | "all">("all");
  const types: { value: RoomType; label: string }[] = [
    { value: "therapy", label: loc === "ar" ? "علاجية" : "Therapy" },
    { value: "dormitory", label: loc === "ar" ? "سكن" : "Dormitory" },
    { value: "medical", label: loc === "ar" ? "طبية" : "Medical" },
    { value: "office", label: loc === "ar" ? "مكتب" : "Office" },
    { value: "recreational", label: loc === "ar" ? "ترفيه" : "Recreational" },
  ];
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>
            {loc === "ar" ? "إدارة الغرف" : "Rooms Management"}
          </CardTitle>
          <CardDescription>
            {loc === "ar"
              ? "إضافة وتعديل وحذف الغرف داخل المباني"
              : "Add/edit/delete rooms within buildings"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
          >
            <option value="all">
              {loc === "ar" ? "كل المباني" : "All buildings"}
            </option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {L(loc, b.name)}
              </option>
            ))}
          </select>
          {canManage && (
            <Button onClick={() => setOpen(true)}>
              <Plus className="ml-1 h-4 w-4" /> {t("common.add")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{loc === "ar" ? "المبنى" : "Building"}</TableHead>
              <TableHead>{loc === "ar" ? "الطابق" : "Floor"}</TableHead>
              <TableHead>{loc === "ar" ? "النوع" : "Type"}</TableHead>
              <TableHead>{loc === "ar" ? "السعة" : "Capacity"}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms
              .filter(
                (r) =>
                  filterBuilding === "all" || r.buildingId === filterBuilding,
              )
              .map((r) => {
                const bName = L(
                  loc,
                  buildings.find((b) => b.id === r.buildingId)?.name,
                );
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-medium">{L(loc, r.name)}</div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                        {r.accessibility.map((a, i) => (
                          <Badge key={i} variant="secondary">
                            {L(loc, a)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{bName}</TableCell>
                    <TableCell>{r.floor}</TableCell>
                    <TableCell className="capitalize">{r.type}</TableCell>
                    <TableCell>{r.capacity}</TableCell>
                    <TableCell>
                      {r.active
                        ? t("common.active")
                        : loc === "ar"
                          ? "غير نشط"
                          : "Inactive"}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {canManage && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditing(r);
                              setOpen(true);
                            }}
                          >
                            <Pencil className="ml-1 h-4 w-4" />{" "}
                            {t("common.edit")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              removeRoom(r.id);
                              toast.success(t("pages.medical.saved"));
                            }}
                          >
                            {t("common.delete")}
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </CardContent>
      <RoomDialog
        loc={loc}
        buildings={buildings}
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

function RoomDialog({
  loc,
  buildings,
  open,
  onOpenChange,
  editing,
}: {
  loc: "en" | "ar";
  buildings: Building[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Room | null;
}) {
  const [buildingId, setBuildingId] = useState(
    editing?.buildingId || buildings[0]?.id || "",
  );
  const [nameEn, setNameEn] = useState(editing?.name.en || "");
  const [nameAr, setNameAr] = useState(editing?.name.ar || "");
  const [floor, setFloor] = useState(String(editing?.floor ?? 0));
  const [type, setType] = useState<RoomType>(editing?.type || "therapy");
  const [capacity, setCapacity] = useState(String(editing?.capacity ?? 0));
  const [accEn, setAccEn] = useState("");
  const [accAr, setAccAr] = useState("");
  const [accList, setAccList] = useState<Localized[]>(
    editing?.accessibility || [],
  );
  const [active, setActive] = useState<boolean>(editing?.active ?? true);
  useEffect(() => {
    setBuildingId(editing?.buildingId || buildings[0]?.id || "");
    setNameEn(editing?.name.en || "");
    setNameAr(editing?.name.ar || "");
    setFloor(String(editing?.floor ?? 0));
    setType(editing?.type || "therapy");
    setCapacity(String(editing?.capacity ?? 0));
    setAccList(editing?.accessibility || []);
    setAccEn("");
    setAccAr("");
    setActive(editing?.active ?? true);
  }, [editing, open]);
  const valid =
    (nameEn.trim().length >= 1 || nameAr.trim().length >= 1) && !!buildingId;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? t("common.edit") : t("common.add")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>{loc === "ar" ? "المبنى" : "Building"}</Label>
            <select
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {L(loc, b.name)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>EN — {t("common.name")}</Label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {t("common.name")}</Label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label>{loc === "ar" ? "الطابق" : "Floor"}</Label>
              <Input
                type="number"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
            </div>
            <div>
              <Label>{loc === "ar" ? "النوع" : "Type"}</Label>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as RoomType)}
              >
                <option value="therapy">
                  {loc === "ar" ? "علاجية" : "Therapy"}
                </option>
                <option value="dormitory">
                  {loc === "ar" ? "سكن" : "Dormitory"}
                </option>
                <option value="medical">
                  {loc === "ar" ? "طبية" : "Medical"}
                </option>
                <option value="office">
                  {loc === "ar" ? "مكتب" : "Office"}
                </option>
                <option value="recreational">
                  {loc === "ar" ? "ترفيه" : "Recreational"}
                </option>
              </select>
            </div>
            <div>
              <Label>{loc === "ar" ? "السعة" : "Capacity"}</Label>
              <Input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>
              {loc === "ar" ? "ميزات الوصول" : "Accessibility features"}
            </Label>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="flex gap-2">
                <Input
                  value={accEn}
                  onChange={(e) => setAccEn(e.target.value)}
                  placeholder="EN"
                />
                <Button
                  onClick={() => {
                    if (accEn.trim()) {
                      setAccList([{ en: accEn.trim(), ar: "" }, ...accList]);
                      setAccEn("");
                    }
                  }}
                >
                  {t("common.add")}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={accAr}
                  onChange={(e) => setAccAr(e.target.value)}
                  placeholder="AR"
                />
                <Button
                  onClick={() => {
                    if (accAr.trim()) {
                      setAccList([{ en: "", ar: accAr.trim() }, ...accList]);
                      setAccAr("");
                    }
                  }}
                >
                  {t("common.add")}
                </Button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {accList.map((x, i) => (
                <Badge
                  key={i}
                  className="cursor-pointer"
                  variant="secondary"
                  onClick={() => setAccList(accList.filter((_, j) => j !== i))}
                >
                  {L(loc, x)}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={active}
              onCheckedChange={(v) => setActive(v === true)}
            />{" "}
            <Label>{t("common.active")}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const r: Room = {
                id: editing?.id || uid("r"),
                buildingId,
                name: { en: nameEn.trim(), ar: nameAr.trim() },
                floor: Number(floor),
                type,
                capacity: Number(capacity),
                accessibility: accList,
                active,
              };
              upsertRoom(r);
              toast.success(t("pages.medical.saved"));
              onOpenChange(false);
            }}
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SchedulesTab({
  loc,
  canManage,
  buildings,
  rooms,
  schedules,
}: {
  loc: "en" | "ar";
  canManage: boolean;
  buildings: Building[];
  rooms: Room[];
  schedules: RoomSchedule[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomSchedule | null>(null);
  const [filterRoom, setFilterRoom] = useState<string | "all">("all");
  const data = schedules.filter(
    (s) => filterRoom === "all" || s.roomId === filterRoom,
  );
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>
            {loc === "ar" ? "جدولة الغرف" : "Room Scheduling"}
          </CardTitle>
          <CardDescription>
            {loc === "ar"
              ? "منع التداخل والتكرار الأسبوعي"
              : "Conflict detection and weekly recurrence"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
          >
            <option value="all">
              {loc === "ar" ? "كل الغرف" : "All rooms"}
            </option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {L(loc, r.name)}
              </option>
            ))}
          </select>
          {canManage && (
            <Button onClick={() => setOpen(true)}>
              <Plus className="ml-1 h-4 w-4" /> {t("common.add")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{loc === "ar" ? "الغرفة" : "Room"}</TableHead>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{loc === "ar" ? "النوع" : "Type"}</TableHead>
              <TableHead>{loc === "ar" ? "البداية" : "Start"}</TableHead>
              <TableHead>{loc === "ar" ? "النهاية" : "End"}</TableHead>
              <TableHead>Recurrence</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((s) => {
              const room = rooms.find((r) => r.id === s.roomId);
              return (
                <TableRow key={s.id}>
                  <TableCell>{room ? L(loc, room.name) : ""}</TableCell>
                  <TableCell>{L(loc, s.title)}</TableCell>
                  <TableCell className="capitalize">{s.kind}</TableCell>
                  <TableCell>{new Date(s.start).toLocaleString()}</TableCell>
                  <TableCell>{new Date(s.end).toLocaleString()}</TableCell>
                  <TableCell>
                    {s.recurrence.type === "weekly"
                      ? loc === "ar"
                        ? "أسبوعي"
                        : "Weekly"
                      : loc === "ar"
                        ? "بدون"
                        : "None"}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {canManage && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditing(s);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="ml-1 h-4 w-4" /> {t("common.edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            removeSchedule(s.id);
                            toast.success(t("pages.medical.saved"));
                          }}
                        >
                          {t("common.delete")}
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <ScheduleDialog
        loc={loc}
        open={open}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
          setOpen(v);
        }}
        editing={editing}
        rooms={rooms}
      />
    </Card>
  );
}

function ScheduleDialog({
  loc,
  rooms,
  open,
  onOpenChange,
  editing,
}: {
  loc: "en" | "ar";
  rooms: Room[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: RoomSchedule | null;
}) {
  const [roomId, setRoomId] = useState(editing?.roomId || rooms[0]?.id || "");
  const [titleEn, setTitleEn] = useState(editing?.title.en || "");
  const [titleAr, setTitleAr] = useState(editing?.title.ar || "");
  const [kind, setKind] = useState<"therapy" | "medical" | "activity">(
    editing?.kind || "therapy",
  );
  const [start, setStart] = useState<string>(
    editing
      ? editing.start.slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  );
  const [end, setEnd] = useState<string>(
    editing
      ? editing.end.slice(0, 16)
      : new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
  );
  const [weekly, setWeekly] = useState<boolean>(
    editing?.recurrence.type === "weekly" || false,
  );
  const [days, setDays] = useState<number[]>(
    editing?.recurrence.type === "weekly" ? editing?.recurrence.days || [] : [],
  );
  useEffect(() => {
    setRoomId(editing?.roomId || rooms[0]?.id || "");
    setTitleEn(editing?.title.en || "");
    setTitleAr(editing?.title.ar || "");
    setKind(editing?.kind || "therapy");
    setStart(
      editing
        ? editing.start.slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    );
    setEnd(
      editing
        ? editing.end.slice(0, 16)
        : new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    );
    setWeekly(editing?.recurrence.type === "weekly" || false);
    setDays(
      editing?.recurrence.type === "weekly"
        ? editing?.recurrence.days || []
        : [],
    );
  }, [editing, open]);
  const valid =
    !!roomId && (titleEn.trim().length >= 1 || titleAr.trim().length >= 1);
  function toggleDay(d: number) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? t("common.edit") : t("common.add")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>{loc === "ar" ? "الغرفة" : "Room"}</Label>
            <select
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {L(loc, r.name)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>EN — {t("common.name")}</Label>
              <Input
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {t("common.name")}</Label>
              <Input
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label>{loc === "ar" ? "النوع" : "Type"}</Label>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={kind}
                onChange={(e) => setKind(e.target.value as any)}
              >
                <option value="therapy">
                  {loc === "ar" ? "علاجية" : "Therapy"}
                </option>
                <option value="medical">
                  {loc === "ar" ? "طبية" : "Medical"}
                </option>
                <option value="activity">
                  {loc === "ar" ? "نشاط" : "Activity"}
                </option>
              </select>
            </div>
            <div>
              <Label>{loc === "ar" ? "البداية" : "Start"}</Label>
              <Input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div>
              <Label>{loc === "ar" ? "النهاية" : "End"}</Label>
              <Input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Checkbox
              checked={weekly}
              onCheckedChange={(v) => setWeekly(v === true)}
            />{" "}
            <Label>{loc === "ar" ? "تكرار أسبوعي" : "Weekly recurrence"}</Label>
          </div>
          {weekly && (
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <Button
                  key={d}
                  type="button"
                  variant={days.includes(d) ? "default" : "secondary"}
                  size="sm"
                  onClick={() => toggleDay(d)}
                >
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]}
                </Button>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const sc: RoomSchedule = {
                id: editing?.id || uid("s"),
                roomId,
                title: { en: titleEn.trim(), ar: titleAr.trim() },
                kind,
                start: new Date(start).toISOString(),
                end: new Date(end).toISOString(),
                recurrence: weekly
                  ? { type: "weekly", days }
                  : { type: "none" },
              };
              if (hasScheduleConflict(sc)) {
                toast.error(
                  loc === "ar" ? "تداخل في الحجز" : "Schedule conflict",
                );
                return;
              }
              const res = upsertSchedule(sc);
              if (!res.ok) {
                toast.error(
                  loc === "ar" ? "تداخل في الحجز" : "Schedule conflict",
                );
                return;
              }
              toast.success(t("pages.medical.saved"));
              onOpenChange(false);
            }}
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResourcesTab({
  loc,
  canManage,
  buildings,
  rooms,
  equipment,
}: {
  loc: "en" | "ar";
  canManage: boolean;
  buildings: Building[];
  rooms: Room[];
  equipment: Equipment[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "available" | "maintenance" | "in_use"
  >("all");
  const list = equipment.filter(
    (e) => filterStatus === "all" || e.status === filterStatus,
  );
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>
            {loc === "ar" ? "الموارد والمعدات" : "Resources & Equipment"}
          </CardTitle>
          <CardDescription>
            {loc === "ar" ? "تتبع حالة المعدات" : "Track equipment status"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">{t("common.all")}</option>
            <option value="available">
              {loc === "ar" ? "متاح" : "Available"}
            </option>
            <option value="maintenance">
              {loc === "ar" ? "صيانة" : "Maintenance"}
            </option>
            <option value="in_use">
              {loc === "ar" ? "قيد الاستخدام" : "In use"}
            </option>
          </select>
          {canManage && (
            <Button onClick={() => setOpen(true)}>
              <Plus className="ml-1 h-4 w-4" /> {t("common.add")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{loc === "ar" ? "الغرفة" : "Room"}</TableHead>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{loc === "ar" ? "الحالة" : "Status"}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((e) => {
              const room = rooms.find((r) => r.id === e.roomId);
              return (
                <TableRow key={e.id}>
                  <TableCell>{room ? L(loc, room.name) : ""}</TableCell>
                  <TableCell>{L(loc, e.name)}</TableCell>
                  <TableCell className="capitalize">{e.status}</TableCell>
                  <TableCell className="flex gap-2">
                    {canManage && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditing(e);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="ml-1 h-4 w-4" /> {t("common.edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            removeEquipment(e.id);
                            toast.success(t("pages.medical.saved"));
                          }}
                        >
                          {t("common.delete")}
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <EquipmentDialog
        loc={loc}
        open={open}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
          setOpen(v);
        }}
        editing={editing}
        rooms={rooms}
      />
    </Card>
  );
}

function EquipmentDialog({
  loc,
  rooms,
  open,
  onOpenChange,
  editing,
}: {
  loc: "en" | "ar";
  rooms: Room[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Equipment | null;
}) {
  const [roomId, setRoomId] = useState(editing?.roomId || rooms[0]?.id || "");
  const [nameEn, setNameEn] = useState(editing?.name.en || "");
  const [nameAr, setNameAr] = useState(editing?.name.ar || "");
  const [status, setStatus] = useState<"available" | "maintenance" | "in_use">(
    editing?.status || "available",
  );
  useEffect(() => {
    setRoomId(editing?.roomId || rooms[0]?.id || "");
    setNameEn(editing?.name.en || "");
    setNameAr(editing?.name.ar || "");
    setStatus(editing?.status || "available");
  }, [editing, open]);
  const valid =
    (nameEn.trim().length >= 1 || nameAr.trim().length >= 1) && !!roomId;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? t("common.edit") : t("common.add")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>{loc === "ar" ? "الغرفة" : "Room"}</Label>
            <select
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {L(loc, r.name)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>EN — {t("common.name")}</Label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {t("common.name")}</Label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>{loc === "ar" ? "الحالة" : "Status"}</Label>
            <select
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="available">
                {loc === "ar" ? "متاح" : "Available"}
              </option>
              <option value="maintenance">
                {loc === "ar" ? "صيانة" : "Maintenance"}
              </option>
              <option value="in_use">
                {loc === "ar" ? "قيد الاستخدام" : "In use"}
              </option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const eq: Equipment = {
                id: editing?.id || uid("e"),
                roomId,
                name: { en: nameEn.trim(), ar: nameAr.trim() },
                status,
              };
              upsertEquipment(eq);
              toast.success(t("pages.medical.saved"));
              onOpenChange(false);
            }}
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
