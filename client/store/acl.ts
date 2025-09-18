export type Privilege = {
  id: string;
  name: string;
  description?: string;
  category?: string;
};
export type Role = {
  id: string;
  name: string;
  description?: string;
  privilegeIds: string[];
};
export type User = {
  id: string;
  name: string;
  email: string;
  roleIds: string[];
  privilegeIds: string[];
  phone?: string;
  department?: string;
  title?: string;
  active?: boolean;
};

export type ACLState = {
  users: User[];
  roles: Role[];
  privileges: Privilege[];
};

const STORAGE_KEY = "acl_data_v1";

const subs = new Set<() => void>();
function notify() {
  subs.forEach((cb) => cb());
}
export function subscribeACL(cb: () => void) {
  subs.add(cb);
  return () => subs.delete(cb);
}

const seed: ACLState = {
  privileges: [
    {
      id: "p_view_records",
      name: "View Records",
      description: "Read beneficiary records",
      category: "Records",
    },
    {
      id: "p_edit_records",
      name: "Edit Records",
      description: "Create & update records",
      category: "Records",
    },
    {
      id: "p_manage_users",
      name: "Manage Users",
      description: "Create roles and assign privileges",
      category: "Administration",
    },
    {
      id: "p_view_reports",
      name: "View Reports",
      description: "See KPI dashboards",
      category: "Reporting",
    },
    {
      id: "p_export_reports",
      name: "Export Reports",
      description: "Export to PDF/Excel",
      category: "Reporting",
    },
  ],
  roles: [
    {
      id: "r_admin",
      name: "Administrator",
      description: "Full platform access",
      privilegeIds: [
        "p_view_records",
        "p_edit_records",
        "p_manage_users",
        "p_view_reports",
        "p_export_reports",
      ],
    },
    {
      id: "r_staff",
      name: "Staff",
      description: "Operational staff access",
      privilegeIds: ["p_view_records", "p_edit_records", "p_view_reports"],
    },
    {
      id: "r_doctor",
      name: "Doctor",
      description: "Medical staff with patient editing permissions",
      privilegeIds: ["p_view_records", "p_edit_records", "p_view_reports"],
    },
    {
      id: "r_therapist",
      name: "Therapist",
      description: "Therapy staff with patient editing permissions",
      privilegeIds: ["p_view_records", "p_edit_records", "p_view_reports"],
    },
    {
      id: "r_family",
      name: "Family",
      description: "Read-only family access",
      privilegeIds: ["p_view_records"],
    },
    {
      id: "r_beneficiary",
      name: "Beneficiary",
      description: "Personal record access",
      privilegeIds: ["p_view_records"],
    },
  ],
  users: [
    {
      id: "u1",
      name: "System Admin",
      email: "admin@dalma.org",
      roleIds: ["r_admin"],
      privilegeIds: [],
      active: true,
    },
    {
      id: "u2",
      name: "Field Staff",
      email: "staff@dalma.org",
      roleIds: ["r_staff"],
      privilegeIds: [],
      active: true,
    },
    {
      id: "u3",
      name: "Parent A",
      email: "parent@dalma.org",
      roleIds: ["r_family"],
      privilegeIds: [],
      active: true,
    },
    {
      id: "u4",
      name: "Beneficiary A",
      email: "beneficiary@dalma.org",
      roleIds: ["r_beneficiary"],
      privilegeIds: [],
      active: true,
    },
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
    if (!parsed.users || !parsed.roles || !parsed.privileges)
      throw new Error("Invalid ACL data");
    return parsed;
  } catch {
    saveACL(seed);
    return seed;
  }
}

export function saveACL(state: ACLState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  notify();
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

export function effectivePrivileges(
  user: User,
  roles: Role[],
  privileges: Privilege[],
): Privilege[] {
  const rolePrivIds = new Set(
    user.roleIds.flatMap(
      (rid) => roles.find((r) => r.id === rid)?.privilegeIds || [],
    ),
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

export function removeById<T extends { id: string }>(
  list: T[],
  id: string,
): T[] {
  return list.filter((x) => x.id !== id);
}

// Helpers for managing users/roles/privileges
export function listUsers() {
  return loadACL().users;
}
export function listRoles() {
  return loadACL().roles;
}
export function listPrivileges() {
  return loadACL().privileges;
}
export function getUserById(id: string) {
  return loadACL().users.find((u) => u.id === id) || null;
}
export function upsertUser(user: User) {
  const state = loadACL();
  state.users = upsert(state.users, user);
  saveACL(state);
}
export function removeUser(id: string) {
  const state = loadACL();
  state.users = removeById(state.users, id);
  saveACL(state);
}
export function assignRole(userId: string, roleId: string, add: boolean) {
  const u = getUserById(userId);
  if (!u) return;
  const set = new Set(u.roleIds);
  if (add) set.add(roleId);
  else set.delete(roleId);
  upsertUser({ ...u, roleIds: Array.from(set) });
}
export function assignPrivilege(
  userId: string,
  privilegeId: string,
  add: boolean,
) {
  const u = getUserById(userId);
  if (!u) return;
  const set = new Set(u.privilegeIds);
  if (add) set.add(privilegeId);
  else set.delete(privilegeId);
  upsertUser({ ...u, privilegeIds: Array.from(set) });
}
