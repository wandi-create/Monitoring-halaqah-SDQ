import { SchoolClass, User } from './types';

export const INITIAL_USERS: User[] = [
  { id: 't0', name: "Koordinator Tahfizh", email: "koordinator@sdq.com", password: "password123", role: "Koordinator" },
  { id: 't1', name: "Ustadzah Chairunnisa Pratiwi", email: "chairunnisa@sdq.com", password: "password123", role: "Guru" },
  { id: 't2', name: "Masayu Ustadzah Khodijah Q", email: "khodijah@sdq.com", password: "password123", role: "Guru" },
  { id: 't3', name: "Ustadz Muhammad Dafa Hizbullah", email: "dafa@sdq.com", password: "password123", role: "Guru" },
  { id: 't4', name: "Ustadz Muhammad Iqbal Ramdani", email: "iqbal@sdq.com", password: "password123", role: "Guru" },
  { id: 't5', name: "Ustadz Raden Syaripin", email: "syaripin@sdq.com", password: "password123", role: "Guru" },
  { id: 't6', name: "Ustadz Erric Suryono", email: "erric@sdq.com", password: "password123", role: "Guru" },
  { id: 't7', name: "Ustadz Fulan A", email: "fulan.a@sdq.com", password: "password123", role: "Guru" },
  { id: 't8', name: "Ustadzah Fulanah B", email: "fulanah.b@sdq.com", password: "password123", role: "Guru" },
];


export const INITIAL_CLASSES: SchoolClass[] = [
  // Ikhwan
  {
    id: 'k1i',
    name: "Kelas 1 Abdullah ibnu Mas'ud",
    shortName: 'Ikhwan • Kelas 1',
    gender: 'Ikhwan',
    halaqahs: [
      { id: 'k1i-h1', name: 'Halaqah 1', reports: [], teacherIds: ['t1'], studentCount: 12 },
      { id: 'k1i-h2', name: 'Halaqah 2', reports: [], teacherIds: ['t2'], studentCount: 11 },
    ],
  },
  {
    id: 'k2i',
    name: 'Kelas 2 Zaid bin Tsabit',
    shortName: 'Ikhwan • Kelas 2',
    gender: 'Ikhwan',
    halaqahs: [
      { id: 'k2i-h1', name: 'Halaqah 1', reports: [], teacherIds: ['t3'], studentCount: 10 },
      { id: 'k2i-h2', name: 'Halaqah 2', reports: [], teacherIds: ['t4'], studentCount: 13 },
    ],
  },
  {
    id: 'k3i',
    name: "Kelas 3 Ubay bin Ka'ab",
    shortName: 'Ikhwan • Kelas 3',
    gender: 'Ikhwan',
    halaqahs: [
        { id: 'k3i-h1', name: 'Halaqah 1', reports: [], teacherIds: ['t5'], studentCount: 14 },
        { id: 'k3i-h2', name: 'Halaqah 2', reports: [], teacherIds: ['t6'], studentCount: 12 },
    ],
  },
  {
    id: 'k4i',
    name: "Kelas 4 Abu Musa Al Asy'ari",
    shortName: 'Ikhwan • Kelas 4',
    gender: 'Ikhwan',
    halaqahs: [
      { id: 'k4i-h1', name: 'Halaqah 1', reports: [], teacherIds: ['t7'], studentCount: 15 },
    ],
  },
  {
    id: 'k5i',
    name: 'Kelas 5 Muadz bin Jabal',
    shortName: 'Ikhwan • Kelas 5',
    gender: 'Ikhwan',
    halaqahs: [{ id: 'k5i-h1', name: 'Halaqah 1', reports: [], teacherIds: ['t7'], studentCount: 13 }],
  },
  {
    id: 'k6i',
    name: 'Kelas 6 Ibnu Abbas',
    shortName: 'Ikhwan • Kelas 6',
    gender: 'Ikhwan',
    halaqahs: [{ id: 'k6i-h1', name: 'Halaqah 1', reports: [], teacherIds: ['t7'], studentCount: 11 }],
  },
  // Akhwat
  {
    id: 'k1a',
    name: 'Kelas 1 Aisyah binti Abu Bakar',
    shortName: 'Akhwat • Kelas 1',
    gender: 'Akhwat',
    halaqahs: [
      { id: 'k1a-h1', name: 'Halaqah 1', reports: [], teacherIds: ['t8'], studentCount: 10 },
    ],
  },
  {
    id: 'k2a',
    name: 'Kelas 2 Fatimah Az-Zahra',
    shortName: 'Akhwat • Kelas 2',
    gender: 'Akhwat',
    halaqahs: [
      { id: 'k2a-h1', name: 'Halaqah 1', reports: [], teacherIds: ['t8'], studentCount: 12 },
    ],
  },
  {
    id: 'k3a',
    name: 'Kelas 3 Khadijah binti Khuwailid',
    shortName: 'Akhwat • Kelas 3',
    gender: 'Akhwat',
    halaqahs: [{ id: 'k3a-h1', name: 'Halaqah 1', reports: [], teacherIds: ['t8'], studentCount: 9 }],
  },
  {
    id: 'k4a',
    name: 'Kelas 4 Hafshah binti Umar',
    shortName: 'Akhwat • Kelas 4',
    gender: 'Akhwat',
    halaqahs: [
      { id: 'k4a-h1', name: 'Halaqah 1', reports: [], teacherIds: ['t8'], studentCount: 14 },
    ],
  },
  {
    id: 'k5a',
    name: 'Kelas 5 Zainab binti Jahsy',
    shortName: 'Akhwat • Kelas 5',
    gender: 'Akhwat',
    halaqahs: [{ id: 'k5a-h1', name: 'Halaqah 1', reports: [], teacherIds: ['t8'], studentCount: 13 }],
  },
  {
    id: 'k6a',
    name: 'Kelas 6 Ummu Salamah',
    shortName: 'Akhwat • Kelas 6',
    gender: 'Akhwat',
    halaqahs: [{ id: 'k6a-h1', name: 'Halaqah 1', reports: [], teacherIds: ['t8'], studentCount: 11 }],
  },
];

export const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];