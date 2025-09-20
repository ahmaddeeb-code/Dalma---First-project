import { useMemo, useState, useSyncExternalStore } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Building,
  Room,
  subscribeLogistics,
  getLogistics,
  upsertRoom,
  removeRoom,
  upsertBuilding,
  uid,
  type Localized,
} from "@/store/logistics";
import { getLocale, subscribeLocale } from "@/i18n";
import TableActions, { createDeleteAction, createEditAction } from "@/components/ui/table-actions";

function useLocale() {
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
function L(loc: "en" | "ar", v: Localized): string {
  return (v?.[loc] as string) || v?.en || "";
}

export default function RoomBuildingManagement() {
  const loc = useLocale();
  const state = useLogistics();

  const rows = useMemo(() => {
    const bMap = new Map(state.buildings.map((b) => [b.id, b] as const));
    return state.rooms.map((r) => ({
      id: r.id,
      building: bMap.get(r.buildingId) as Building | undefined,
      room: r,
    }));
  }, [state]);

  const [showRoomDialog, setShowRoomDialog] = useState<{
    open: boolean;
    editing?: Room | null;
  }>({ open: false });

  const [showBuildingDialog, setShowBuildingDialog] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Room & Building Management</CardTitle>
        </CardHeader>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={() => setShowBuildingDialog(true)}>
          Add New Building
        </Button>
        <Button onClick={() => setShowRoomDialog({ open: true })}>Add New Room</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <TableV2
            columns={[
              { key: "buildingName", label: "Building Name", sortable: true },
              { key: "roomName", label: "Room Name", sortable: true },
              { key: "floor", label: "Floor", sortable: true },
              { key: "capacity", label: "Capacity", sortable: true },
              { key: "status", label: "Status", sortable: true },
              {
                key: "actions",
                label: "Actions",
                sortable: false,
                render: (r) => (
                  <div className="flex justify-end">
                    <TableActions
                      actions={[
                        createEditAction(() => setShowRoomDialog({ open: true, editing: r.__room })),
                        createDeleteAction(() => removeRoom(r.id), "Delete room"),
                      ]}
                      maxVisibleActions={2}
                    />
                  </div>
                ),
              },
            ]}
            rows={rows.map(({ id, building, room }) => ({
              id,
              buildingName: building ? L(loc, building.name) : "-",
              roomName: L(loc, room.name),
              floor: room.floor,
              capacity: room.capacity,
              status: room.active ? "Active" : "Inactive",
              __room: room,
            }))}
            paginationEnabled
            pageSize={10}
            pageSizeOptions={[10, 25, 50]}
            sortable
            defaultSort={{ key: "buildingName", dir: "asc" }}
          />
        </CardContent>
      </Card>

      <RoomDialog
        open={showRoomDialog.open}
        onOpenChange={(o) => setShowRoomDialog((s) => ({ ...s, open: o }))}
        editing={showRoomDialog.editing || null}
      />

      <BuildingDialog open={showBuildingDialog} onOpenChange={setShowBuildingDialog} />
    </div>
  );
}

function RoomDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Room | null;
}) {
  const state = useLogistics();
  const loc = useLocale();
  const [buildingId, setBuildingId] = useState<string>(editing?.buildingId || state.buildings[0]?.id || "");
  const [name, setName] = useState<string>(editing ? L(loc, editing.name) : "");
  const [floor, setFloor] = useState<number>(editing?.floor ?? 0);
  const [capacity, setCapacity] = useState<number>(editing?.capacity ?? 0);
  const [active, setActive] = useState<boolean>(editing?.active ?? true);

  function save() {
    const id = editing?.id || uid("r");
    const localized: Localized = { en: name, ar: name };
    const room: Room = {
      id,
      buildingId: buildingId || state.buildings[0]?.id || "",
      name: localized,
      floor: Number(floor) || 0,
      type: editing?.type || "therapy",
      capacity: Number(capacity) || 0,
      accessibility: editing?.accessibility || [],
      assigned: editing?.assigned,
      active,
    };
    upsertRoom(room);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Room" : "Add New Room"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rb-building">Building</Label>
              <select
                id="rb-building"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
              >
                {state.buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {L(loc, b.name)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rb-name">Room Name</Label>
              <Input id="rb-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rb-floor">Floor</Label>
              <Input
                id="rb-floor"
                type="number"
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rb-capacity">Capacity</Label>
              <Input
                id="rb-capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="rb-active" checked={active} onCheckedChange={(v) => setActive(Boolean(v))} />
              <Label htmlFor="rb-active">Active</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{editing ? "Save" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BuildingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState("");
  const [floors, setFloors] = useState(1);
  const [capacity, setCapacity] = useState(0);

  function save() {
    const building: Building = {
      id: uid("b"),
      name: { en: name, ar: name },
      floors: Number(floors) || 1,
      capacity: Number(capacity) || 0,
    } as Building;
    upsertBuilding(building);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Building</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bld-name">Building Name</Label>
            <Input id="bld-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bld-floors">Floors</Label>
            <Input
              id="bld-floors"
              type="number"
              value={floors}
              onChange={(e) => setFloors(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bld-capacity">Capacity</Label>
            <Input
              id="bld-capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
