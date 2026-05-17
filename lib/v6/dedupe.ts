import type { V6AttendanceRecord, V6Database, V6Group, V6MediaItem, V6Notification, V6Product, V6User } from "./types";

type MaybeTimestamped = { id: string; updatedAt?: string; savedAt?: string; createdAt?: string };

function compactUnique(values: Array<string | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function timestampValue(item: MaybeTimestamped) {
  const value = item.updatedAt ?? item.savedAt ?? item.createdAt ?? "";
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

export function dedupeById<T extends MaybeTimestamped>(items: T[]) {
  const byId = new Map<string, T>();
  items.forEach((item) => {
    if (!item.id) return;
    const existing = byId.get(item.id);
    if (!existing || timestampValue(item) >= timestampValue(existing)) byId.set(item.id, item);
  });
  return Array.from(byId.values());
}

export function dedupeByCompositeKey<T extends MaybeTimestamped>(items: T[], keyFor: (item: T) => string) {
  const byKey = new Map<string, T>();
  items.forEach((item) => {
    const key = keyFor(item);
    if (!key) return;
    const existing = byKey.get(key);
    if (!existing || timestampValue(item) >= timestampValue(existing)) byKey.set(key, item);
  });
  return Array.from(byKey.values());
}

function normalizedText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("he");
}

export function dedupeShopProducts(products: V6Product[]) {
  return dedupeByCompositeKey(dedupeById(products).map((product) => ({
    ...product,
    title: product.title.trim(),
    description: product.description.trim(),
    category: product.category.trim(),
    imageMediaIds: compactUnique(product.imageMediaIds),
    groupIds: compactUnique(product.groupIds ?? []),
    danceStyleIds: compactUnique(product.danceStyleIds ?? []),
    sizes: product.sizes ? compactUnique(product.sizes) : undefined,
    colors: product.colors ? compactUnique(product.colors) : undefined
  })), (product) => [
    product.studioId,
    normalizedText(product.title),
    normalizedText(product.category),
    product.type ?? "physical",
    product.priceMode ?? "paid",
    product.price
  ].join(":"));
}

export function dedupeParentStudentLinks(users: V6User[]) {
  const studentIds = new Set(users.filter((user) => user.role === "student").map((user) => user.id));
  const parentIds = new Set(users.filter((user) => user.role === "parent").map((user) => user.id));
  const parentIdsByStudent = new Map<string, string[]>();
  const studentIdsByParent = new Map<string, string[]>();

  users.filter((user) => user.role === "parent").forEach((parent) => {
    compactUnique(parent.linkedStudentIds).filter((studentId) => studentIds.has(studentId)).forEach((studentId) => {
      parentIdsByStudent.set(studentId, compactUnique([...(parentIdsByStudent.get(studentId) ?? []), parent.id]));
      studentIdsByParent.set(parent.id, compactUnique([...(studentIdsByParent.get(parent.id) ?? []), studentId]));
    });
  });

  users.filter((user) => user.role === "student").forEach((student) => {
    compactUnique(student.linkedParentIds ?? []).filter((parentId) => parentIds.has(parentId)).forEach((parentId) => {
      parentIdsByStudent.set(student.id, compactUnique([...(parentIdsByStudent.get(student.id) ?? []), parentId]));
      studentIdsByParent.set(parentId, compactUnique([...(studentIdsByParent.get(parentId) ?? []), student.id]));
    });
  });

  return users.map((user) => {
    const groupIds = compactUnique(user.groupIds);
    const linkedStudentIds = compactUnique(user.linkedStudentIds).filter((studentId) => studentIds.has(studentId));
    const linkedParentIds = compactUnique(user.linkedParentIds ?? []).filter((parentId) => parentIds.has(parentId));
    if (user.role === "student") {
      return { ...user, groupIds, linkedStudentIds: [], linkedParentIds: compactUnique([...(parentIdsByStudent.get(user.id) ?? []), ...linkedParentIds]), active: user.active ?? user.status !== "inactive", status: user.status ?? (user.active ? "active" : "inactive") };
    }
    if (user.role === "parent") {
      return { ...user, groupIds: [], linkedStudentIds: compactUnique([...linkedStudentIds, ...(studentIdsByParent.get(user.id) ?? [])]), linkedParentIds: [], active: user.active ?? user.status !== "inactive", status: user.status ?? (user.active ? "active" : "inactive") };
    }
    return { ...user, groupIds, linkedStudentIds: [], linkedParentIds: [], active: user.active ?? user.status !== "inactive", status: user.status ?? (user.active ? "active" : "inactive") };
  });
}

export function dedupeTeacherGroupAssignments(users: V6User[], groups: V6Group[]) {
  const groupIds = new Set(groups.map((group) => group.id));
  const groupIdsByUser = new Map<string, string[]>();
  groups.forEach((group) => {
    compactUnique(group.teacherIds).forEach((userId) => groupIdsByUser.set(userId, compactUnique([...(groupIdsByUser.get(userId) ?? []), group.id])));
    compactUnique(group.studentIds).forEach((userId) => groupIdsByUser.set(userId, compactUnique([...(groupIdsByUser.get(userId) ?? []), group.id])));
  });
  const normalizedUsers = users.map((user) => ({
    ...user,
    groupIds: compactUnique([...user.groupIds, ...(groupIdsByUser.get(user.id) ?? [])]).filter((groupId) => groupIds.has(groupId)),
    danceStyleIds: compactUnique(user.danceStyleIds ?? [])
  }));
  const normalizedGroups = dedupeById(groups).map((group) => ({
    ...group,
    teacherIds: compactUnique(normalizedUsers.filter((user) => (user.role === "teacher" || user.role === "management") && user.groupIds.includes(group.id)).map((user) => user.id)),
    studentIds: compactUnique(normalizedUsers.filter((user) => user.role === "student" && user.groupIds.includes(group.id)).map((user) => user.id))
  }));
  return { users: normalizedUsers, groups: normalizedGroups };
}

function dedupeAttendance(records: V6AttendanceRecord[]) {
  return dedupeByCompositeKey(dedupeById(records), (record) => [
    record.studioId ?? "",
    record.lessonId,
    record.groupId ?? "",
    record.classDate ?? "",
    record.studentId
  ].join(":"));
}

function dedupeNotifications(notifications: V6Notification[]) {
  return dedupeByCompositeKey(dedupeById(notifications).map((notification) => ({
    ...notification,
    userIds: compactUnique(notification.userIds).sort(),
    readBy: compactUnique(notification.readBy)
  })), (notification) => [
    notification.studioId,
    notification.userIds.join(","),
    normalizedText(notification.title),
    normalizedText(notification.body),
    notification.type,
    notification.tab ?? "",
    notification.screen ?? ""
  ].join(":"));
}

function dedupeMedia(media: V6MediaItem[]) {
  return dedupeByCompositeKey(dedupeById(media), (item) => [
    item.studioId,
    normalizedText(item.title),
    item.fileName,
    item.mediaType,
    item.linkedGroupId ?? "",
    item.linkedProductId ?? ""
  ].join(":"));
}

export function normalizeV6Database(db: V6Database): V6Database {
  const usersById = dedupeById(db.users).map((user) => ({
    ...user,
    name: user.name.trim(),
    phone: user.phone.trim(),
    groupIds: compactUnique(user.groupIds),
    linkedStudentIds: compactUnique(user.linkedStudentIds),
    linkedParentIds: compactUnique(user.linkedParentIds ?? []),
    danceStyleIds: compactUnique(user.danceStyleIds ?? [])
  }));
  const usersWithLinks = dedupeParentStudentLinks(usersById);
  const { users, groups } = dedupeTeacherGroupAssignments(usersWithLinks, db.groups);
  return {
    ...db,
    version: 6,
    studios: dedupeById(db.studios),
    users,
    credentials: dedupeByCompositeKey(db.credentials.map((credential) => ({ ...credential, id: credential.userId })), (credential) => credential.userId).map(({ id: _id, ...credential }) => credential),
    groups,
    lessons: dedupeById(db.lessons),
    messages: dedupeById(db.messages),
    notifications: dedupeNotifications(db.notifications),
    products: dedupeShopProducts(db.products),
    privateLessons: dedupeById(db.privateLessons),
    media: dedupeMedia(db.media),
    attendance: dedupeAttendance(db.attendance),
    tasks: dedupeById(db.tasks),
    events: dedupeById(db.events),
    achievements: dedupeById(db.achievements),
    auditLog: dedupeById(db.auditLog).slice(0, 300)
  };
}

export function mergeV6Database(base: V6Database, incoming: V6Database): V6Database {
  return normalizeV6Database({
    ...base,
    ...incoming,
    version: 6,
    studios: dedupeById([...base.studios, ...(incoming.studios ?? [])]),
    users: dedupeById([...base.users, ...(incoming.users ?? [])]),
    credentials: dedupeByCompositeKey(
      [...base.credentials, ...(incoming.credentials ?? [])].map((credential) => ({ ...credential, id: credential.userId })),
      (credential) => credential.userId
    ).map(({ id: _id, ...credential }) => credential),
    groups: dedupeById([...base.groups, ...(incoming.groups ?? [])]),
    lessons: dedupeById([...base.lessons, ...(incoming.lessons ?? [])]),
    messages: dedupeById([...base.messages, ...(incoming.messages ?? [])]),
    notifications: dedupeById([...base.notifications, ...(incoming.notifications ?? [])]),
    products: dedupeById([...base.products, ...(incoming.products ?? [])]),
    privateLessons: dedupeById([...base.privateLessons, ...(incoming.privateLessons ?? [])]),
    media: dedupeById([...base.media, ...(incoming.media ?? [])]),
    attendance: dedupeById([...base.attendance, ...(incoming.attendance ?? [])]),
    tasks: dedupeById([...base.tasks, ...(incoming.tasks ?? [])]),
    events: dedupeById([...base.events, ...(incoming.events ?? [])]),
    achievements: dedupeById([...base.achievements, ...(incoming.achievements ?? [])]),
    auditLog: dedupeById([...base.auditLog, ...(incoming.auditLog ?? [])]).slice(0, 300),
    editableTexts: { ...base.editableTexts, ...(incoming.editableTexts ?? {}) },
    aiPrompts: { ...base.aiPrompts, ...(incoming.aiPrompts ?? {}) },
    aiInsights: dedupeById([...base.aiInsights, ...(incoming.aiInsights ?? [])]),
    featureFlags: { ...base.featureFlags, ...(incoming.featureFlags ?? {}) }
  });
}
