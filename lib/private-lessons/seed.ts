import { getFacultyRecords } from "@/lib/faculty/faculty-access";
import { seedFacultyRecords } from "@/lib/studio/faculty-seed-data";
import { getDirectoryUsers } from "@/lib/directory-store";
import { STUDIO_LK } from "@/lib/platform/constants";
import { danceStylesLabelHe } from "@/lib/studio/dance-style";
import { privateLessonFocusForStyles } from "@/lib/private-lessons/specialties";
import type { PrivateLessonBooking, PrivateLessonProduct } from "@/lib/types";
import { PRIVATE_LESSON_WARMUP_POLICY, defaultPrivateLessonDurations } from "./constants";
import { privateLessonProductId } from "./logic";

function buildProduct(row: {
  teacherId: string;
  teacherName: string;
  danceStyles: ReturnType<typeof getFacultyRecords>[0]["danceStyles"];
}): PrivateLessonProduct {
  const stylesHe = danceStylesLabelHe(row.danceStyles);
  return {
    id: privateLessonProductId(row.teacherId),
    studioId: STUDIO_LK,
    teacherId: row.teacherId,
    teacherName: row.teacherName,
    teacherStyles: row.danceStyles.map((s) => danceStylesLabelHe([s])),
    title: `שיעור פרטי עם ${row.teacherName}`,
    description: privateLessonFocusForStyles(row.danceStyles).join(" · "),
    durations: defaultPrivateLessonDurations(),
    availabilityNote: "לפי יומן המורה · תיאום דרך האפליקציה",
    warmupPolicy: PRIVATE_LESSON_WARMUP_POLICY,
    isActive: true
  };
}

export function seedPrivateLessonProducts(): PrivateLessonProduct[] {
  const byId = new Map<string, PrivateLessonProduct>();
  const faculty = getFacultyRecords(STUDIO_LK).length ? getFacultyRecords(STUDIO_LK) : seedFacultyRecords();
  for (const f of faculty) {
    if (!f.privateLessonEnabled || !f.danceStyles.length) continue;
    byId.set(f.userId, buildProduct({ teacherId: f.userId, teacherName: f.fullName, danceStyles: f.danceStyles }));
  }
  for (const u of getDirectoryUsers()) {
    if (!u.permissions.isTeacher || u.studioId !== STUDIO_LK) continue;
    if (!byId.has(u.id)) {
      byId.set(
        u.id,
        buildProduct({
          teacherId: u.id,
          teacherName: u.name,
          danceStyles: []
        })
      );
    }
  }
  return [...byId.values()];
}

export function seedPrivateLessonBookings(): PrivateLessonBooking[] {
  const now = new Date("2026-05-10T10:00:00+03:00").toISOString();
  return [
    {
      id: "plb_demo_1",
      studioId: STUDIO_LK,
      studentId: "u_maya",
      studentName: "מאיה כהן",
      teacherId: "u_t_yakir",
      teacherName: "יקיר גבאי",
      productId: privateLessonProductId("u_t_yakir"),
      durationMinutes: 45,
      price: 225,
      currency: "ILS",
      paymentStatus: "paid",
      bookingStatus: "requested",
      createdAt: now
    }
  ];
}
