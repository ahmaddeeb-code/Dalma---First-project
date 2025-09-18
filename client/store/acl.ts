export type Privilege = { id: string; name: string; description?: string; category?: string };
export type Role = { id: string; name: string; description?: string; privilegeIds: string[] };
export type User = { id: string; name: string; email: string; roleIds: string[]; privilegeIds: string[] };

export type ACLState = { users: User[]; roles: Role[]; privileges: Privilege[] };

const STORAGE_KEY = "acl_data_v1";

const seed: ACLState = {
  privileges: [
    { id: "p_view_records", name: "View Records", description: "Read beneficiary records", category: "Records" },
    { id: "p_edit_records", name: "Edit Records", description: "Create & update records", category: "Records" },
    { id: "p_manage_users", name: "Manage Users", description: "Create roles and assign privileges", category: "Administration" },
    { id: "p_view_reports", name: "View Reports", description: "See KPI dashboards", category: "Reporting" },
    { id: "p_export_reports", name: "Export Reports", description: "Export to PDF/Excel", category: "Reporting" },
  ],
  roles: [
    { id: "r_admin", name: "Administrator", description: "Full platform access", privilegeIds: ["p_view_records","p_edit_records","p_manage_users","p_view_reports","p_export_reports"] },
    { id: "r_staff", name: "Staff", description: "Operational staff access", privilegeIds: ["p_view_records","p_edit_records","p_view_reports"] },
    { id: "r_family", name: "Family", description: "Read-only family access", privilegeIds: ["p_view_records"] },
  ],
  users: [
    { id: "u1", name: "System Admin", email: "admin@dalma.org", roleIds: ["r_admin"], privilegeIds: [] },
    { id: "u2", name: "Field Staff", email: "staff@dalma.org", roleIds: ["r_staff"], privilegeIds: [] },
    { id: "u3", name: "Parent A", email: "parent@dalma.org", roleIds: ["r_family"], privilegeIds: [] },
  ],
};

export function loadACL(): ACLState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveACL(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as ACLState;
    // Basic shape validation
    if (!parsed.users || !parsed.roles || !parsed.privileges) throw new Error("Invalid ACL data");
    return parsed;
  } catch {
    saveACL(seed);
    return seed;
  }
}

export function saveACL(state: ACLState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

export function effectivePrivileges(user: User, roles: Role[], privileges: Privilege[]): Privilege[] {
  const rolePrivIds = new Set(
    user.roleIds.flatMap((rid) => roles.find((r) => r.id === rid)?.privilegeIds || []),
  );
  user.privilegeIds.forEach((pid) => rolePrivIds.add(pid));
  return privileges.filter((p) => rolePrivIds.has(p.id));
}

export function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) {
    const clone = [...list];
    clone[idx] = item;
    return clone;
  }
  return [...list, item];
}

export function removeById<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((x) => x.id !== id);
}
