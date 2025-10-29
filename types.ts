export interface User {
  id: string;
  name: string;
  email: string;
  // NOTE: In a real application, this should be a securely hashed password.
  // Storing plain text passwords is not secure.
  password?: string; 
  role: 'Koordinator' | 'Guru';
}

export type FollowUpStatus = 'Belum Dimulai' | 'Sedang Berjalan' | 'Selesai' | 'Butuh Diskusi';

export interface ReportSection {
  id: string;
  title: string;
  content: string;
}

export interface Report {
  id: string; // YYYY-MM format
  month: number; // 1-12
  year: number;
  mainInsight: ReportSection[];
  studentSegmentation: ReportSection[];
  identifiedChallenges: ReportSection[];
  followUpRecommendations: ReportSection[];
  nextMonthTarget: ReportSection[];
  isRead: boolean;
  followUpStatus: FollowUpStatus;
  teacherNotes: string;
}

export interface Halaqah {
  id: string;
  name: string;
  teacherIds: string[];
  studentCount: number;
  reports: Report[];
}

export interface SchoolClass {
  id: string;
  name: string;
  shortName: string;
  gender: 'Ikhwan' | 'Akhwat';
  halaqahs: Halaqah[];
}