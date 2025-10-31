import React, { useState, useMemo } from 'react';
import { SchoolClass, User, Report, Halaqah } from '../types';
import { MONTHS } from '../constants';
import { UsersIcon, DocumentTextIcon, CheckCircleIcon, EyeIcon, ClockIcon, PencilIcon } from './Icons';
import ReportDetailModal from './ReportDetailModal';
import ReportInputModal from './ReportInputModal';


interface TeacherDashboardProps {
  currentUser: User;
  classes: SchoolClass[];
  teachers: User[];
  onUpdateReport: (report: Report) => Promise<void>;
}

type ExtendedHalaqah = Halaqah & {
    className: string;
    classId: string;
}

type ExtendedReport = Report & {
  halaqahName: string;
  className: string;
  teacherName: string;
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-md border flex items-center gap-4" style={{borderColor: color}}>
        <div className="p-3 rounded-full" style={{backgroundColor: `${color}20`, color: color}}>
           {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ currentUser, classes, teachers, onUpdateReport }) => {
    const [selectedReportForDetail, setSelectedReportForDetail] = useState<ExtendedReport | null>(null);
    const [editingHalaqah, setEditingHalaqah] = useState<ExtendedHalaqah | null>(null);


    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();

    const allHalaqahs: ExtendedHalaqah[] = useMemo(() => 
        classes.flatMap(c => c.halaqah.map(h => ({ ...h, className: c.name, classId: c.id } as ExtendedHalaqah)))
    , [classes]);

    const totalStudents = useMemo(() => {
        return allHalaqahs.reduce((sum, halaqah) => sum + (halaqah.student_count || 0), 0);
    }, [allHalaqahs]);

    const submittedReportsCount = useMemo(() => {
        return allHalaqahs.filter(h => h.laporan?.some(r => r.year === currentYear && r.month === currentMonth)).length;
    }, [allHalaqahs, currentMonth, currentYear]);

    
    const handleOpenDetailModal = (report: Report, halaqah: ExtendedHalaqah) => {
        setSelectedReportForDetail({
            ...report,
            halaqahName: halaqah.name,
            className: halaqah.className,
            teacherName: teachers.find(t => t.id === halaqah.teacher_id)?.name || 'N/A'
        });
    }

    const handleSaveReport = async (report: Report, halaqahId: string) => {
      await onUpdateReport(report);
    };

    return (
        <div className="relative isolate">
             <div
                aria-hidden="true"
                className="absolute inset-0 -z-10"
                style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><g fill="%234a2e72" fill-opacity="0.05" fill-rule="evenodd"><path d="M14 0l1.4 1.4-1.4 1.4-1.4-1.4L14 0zm0 28l1.4-1.4-1.4-1.4-1.4 1.4L14 28zm14-14l-1.4 1.4-1.4-1.4L28 14zm-28 0l1.4 1.4-1.4 1.4L0 14zM7 7l1.4 1.4-1.4 1.4-1.4-1.4L7 7zm14 0l1.4 1.4-1.4 1.4-1.4-1.4L21 7zm0 14l1.4 1.4-1.4 1.4-1.4-1.4L21 21zm-14 0l1.4 1.4-1.4 1.4-1.4-1.4L7 21z"/></g></svg>')`,
                    backgroundSize: '28px 28px',
                }}
            />
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Assalamu'alaikum, {currentUser.name.split(' ')[0]}!</h1>
                <p className="text-gray-500 mt-2">Selamat datang di dashboard Anda. Mari kita lihat progres halaqah bulan ini.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard icon={<UsersIcon className="w-6 h-6"/>} title="Total Murid" value={totalStudents} color="#38bdf8" />
                <StatCard icon={<DocumentTextIcon className="w-6 h-6"/>} title="Laporan Bulan Ini" value={`${submittedReportsCount} / ${allHalaqahs.length}`} color="#34d399" />
                <StatCard icon={<CheckCircleIcon className="w-6 h-6"/>} title="Bulan Laporan" value={`${MONTHS[currentMonth-1]} ${currentYear}`} color="#a78bfa" />
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border">
                <h2 className="text-2xl font-bold text-gray-800 mb-5">Laporan Halaqah Anda ({MONTHS[currentMonth-1]} {currentYear})</h2>
                <div className="space-y-4">
                    {allHalaqahs.map(halaqah => {
                        const currentReport = halaqah.laporan?.find(r => r.year === currentYear && r.month === currentMonth);

                        return (
                            <div key={halaqah.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-4 rounded-lg border hover:bg-gray-50/80 transition-colors">
                                <div className="md:col-span-2">
                                    <h3 className="font-bold text-lg text-gray-800">{halaqah.name}</h3>
                                    <p className="text-sm text-gray-500">{halaqah.className}</p>
                                </div>
                                <div className="flex items-center justify-start md:justify-end gap-3">
                                    {currentReport ? (
                                         <div className="flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-100 px-3 py-1.5 rounded-full">
                                            <CheckCircleIcon className="w-5 h-5"/>
                                            <span>Sudah Diisi</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 bg-amber-100 px-3 py-1.5 rounded-full">
                                            <ClockIcon className="w-4 h-4"/>
                                            <span>Belum Diisi</span>
                                        </div>
                                    )}
                                    
                                     <button 
                                        onClick={() => setEditingHalaqah(halaqah)}
                                        className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-md transition-all"
                                        aria-label={currentReport ? "Edit Laporan" : "Input Laporan"}
                                    >
                                        <PencilIcon className="w-4 h-4"/>
                                        <span>{currentReport ? "Edit" : "Input"}</span>
                                    </button>

                                    {currentReport && (
                                        <button 
                                            onClick={() => handleOpenDetailModal(currentReport, halaqah)}
                                            className="flex items-center gap-2 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 px-3 py-1.5 rounded-md transition-all"
                                            aria-label="Lihat Laporan"
                                        >
                                            <EyeIcon className="w-4 h-4"/>
                                            <span>Lihat</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            
            {selectedReportForDetail && (
                <ReportDetailModal
                    report={selectedReportForDetail}
                    onClose={() => setSelectedReportForDetail(null)}
                    onSave={async (updatedReport) => {
                      await onUpdateReport(updatedReport);
                      setSelectedReportForDetail(null);
                    }}
                    currentUser={currentUser}
                />
            )}

            {editingHalaqah && (
                <ReportInputModal 
                  isOpen={!!editingHalaqah}
                  onClose={() => setEditingHalaqah(null)}
                  onSave={handleSaveReport}
                  schoolClass={classes.find(c => c.id === editingHalaqah.classId)!}
                  halaqah={editingHalaqah}
                  existingReport={editingHalaqah.laporan?.find(r => r.year === currentYear && r.month === currentMonth)}
                  months={MONTHS}
                />
            )}
        </div>
    );
};

export default TeacherDashboard;