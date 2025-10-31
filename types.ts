export interface User {
  id: string; // uuid
  name: string;
  email: string;
  password?: string; // This should be handled securely, not stored as plain text
  role: 'Koordinator' | 'Guru';
  gender: 'Ikhwan' | 'Akhwat';
}

export type FollowUpStatus = 'Belum Dimulai' | 'Sedang Berjalan' | 'Selesai' | 'Butuh Diskusi';

export interface ReportSection {
  id: string;
  title: string;
  content: string;
}

export interface Report {
  id: string; // uuid
  halaqah_id: string;
  month: number; // 1-12
  year: number;
  main_insight: ReportSection[];
  student_segmentation: ReportSection[];
  identified_challenges: ReportSection[];
  follow_up_recommendations: ReportSection[];
  next_month_target: ReportSection[];
  coordinator_notes?: ReportSection[];
  average_attendance?: number;
  fluent_students?: number;
  students_needing_attention?: number;
  is_read: boolean;
  follow_up_status: FollowUpStatus;
  teacher_notes: string;
}

export interface Halaqah {
  id: string; // uuid
  name: string;
  teacher_id: string; // uuid of a single teacher
  student_count: number;
  class_id: string; // Foreign key to SchoolClass
  laporan: Report[]; // Renamed from 'reports' to match Supabase table name
}

export interface SchoolClass {
  id: string; // uuid
  name: string;
  short_name: string;
  gender: 'Ikhwan' | 'Akhwat';
  halaqah: Halaqah[]; // Renamed from 'halaqahs' to match Supabase table name
}