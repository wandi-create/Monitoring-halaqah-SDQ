import React, { useState, useMemo } from 'react';
import { SchoolClass, User, Report, Halaqah, ReportSection } from '../types';
import { ClockIcon, EyeIcon, CheckCircleIcon, XCircleIcon, UsersIcon, DocumentTextIcon, PencilIcon, ExclamationTriangleIcon, BookOpenIcon } from './Icons';
import ReportDetailModal from './ReportDetailModal';
import { MONTHS } from '../constants';


type ExtendedReport = Report & {
  halaqahName: string;
  className: string;
  teacherName: string;
};

interface MonitoringDashboardProps {
  classes: SchoolClass[];
  currentUser: User;
  onUpdateReport: (report: Report) => Promise<void>;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-md border flex items-center gap-4" style={{borderColor: color}}>
        <div className="p-3 rounded-full" style={{backgroundColor: `${color}20`, color: color}}>
           {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

// Helper function to determine if a report is considered "substantive" or "finished"
const isReportSubstantive = (report: Report): boolean => {
  // A report is considered substantive if at least one of its main content sections has been filled out.
  const fieldsToCheck: (keyof Report)[] = [
    'main_insight',
    'student_segmentation',
    'identified_challenges',
    'follow_up_recommendations',
    'next_month_target',
    'coordinator_notes',
  ];

  return fieldsToCheck.some(field => {
    const sections = report[field] as ReportSection[];
    // Check if the field is an array and contains at least one section with non-empty content.
    return Array.isArray(sections) && sections.some(section => section.content && section.content.trim() !== '');
  });
};


const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ classes, currentUser, onUpdateReport }) => {
  const [activeTab, setActiveTab] = useState<'Ikhwan' | 'Akhwat'>('Ikhwan');
  const [selectedReport, setSelectedReport] = useState<ExtendedReport | null>(null);

  const getPreviousMonthAndYear = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
    };
  };

  const { year: defaultYear, month: defaultMonth } = getPreviousMonthAndYear();
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const ikhwanClasses = classes.filter(c => c.gender === 'Ikhwan');
  const akhwatClasses = classes.filter(c => c.gender === 'Akhwat');

  const displayedClasses = activeTab === 'Ikhwan' ? ikhwanClasses : akhwatClasses;
  
  const handleViewReport = (report: Report, halaqah: Halaqah, schoolClass: SchoolClass) => {
    const extendedReport: ExtendedReport = {
        ...report,
        halaqahName: halaqah.name,
        className: schoolClass.name,
        teacherName: halaqah.guru?.name || 'N/A'
    };
    setSelectedReport(extendedReport);
  };

  const allHalaqahs = useMemo(() =>
    classes.flatMap(c => c.halaqah)
  , [classes]);

  const submittedReportsCount = useMemo(() =>
    allHalaqahs.filter(h => h.laporan?.some(r => r.year === selectedYear && r.month === selectedMonth && isReportSubstantive(r))).length
  , [allHalaqahs, selectedYear, selectedMonth]);

  const reportsForSelectedPeriod = useMemo(() =>
    allHalaqahs
      .flatMap(h => h.laporan?.filter(r => r.year === selectedYear && r.month === selectedMonth) || [])
      // MUTLAK: Filter only reports that are considered complete/substantive by the coordinator.
      .filter(isReportSubstantive)
  , [allHalaqahs, selectedYear, selectedMonth]);

  const belumDibacaCount = useMemo(() => reportsForSelectedPeriod.filter(r => !r.is_read).length, [reportsForSelectedPeriod]);
  const sudahDibacaCount = useMemo(() => reportsForSelectedPeriod.filter(r => r.is_read).length, [reportsForSelectedPeriod]);
  const sedangBerjalanCount = useMemo(() => reportsForSelectedPeriod.filter(r => r.follow_up_status === 'Sedang Berjalan').length, [reportsForSelectedPeriod]);
  const selesaiCount = useMemo(() => reportsForSelectedPeriod.filter(r => r.follow_up_status === 'Selesai').length, [reportsForSelectedPeriod]);
  const butuhDiskusiCount = useMemo(() => reportsForSelectedPeriod.filter(r => r.follow_up_status === 'Butuh Diskusi').length, [reportsForSelectedPeriod]);


  const TabButton: React.FC<{ title: string; count: number; active: boolean; onClick: () => void; }> = ({ title, count, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 text-sm font-bold rounded-full transition-all duration-300 ease-in-out transform focus:outline-none ${
        active 
          ? 'bg-cyan-500 text-white shadow-lg scale-105' 
          : 'bg-white text-gray-500 hover:bg-gray-200'
      }`}
    >
      {title} ({count} kelas)
    </button>
  );

  return (
    <>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 flex-wrap">
            <div>
                <h1 className="text-3xl font-bold text-teal-600">Monitoring Halaqah Al Qur'an</h1>
                <p className="text-gray-500 mt-1">SDQ Mutiara Sunnah - Sistem Monitoring Bulanan</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
              >
                {MONTHS.map((month, index) => (
                  <option key={month} value={index + 1}>{month}</option>
                ))}
              </select>
              <input
                type="number"
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="p-2 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard icon={<DocumentTextIcon className="w-6 h-6"/>} title="Laporan Bulan Ini" value={`${submittedReportsCount} / ${allHalaqahs.length}`} color="#34d399" />
          <StatCard icon={<CheckCircleIcon className="w-6 h-6"/>} title="Total Halaqah" value={allHalaqahs.length} color="#a78bfa" />
      </div>

       <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Status Akuntabilitas Guru</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard icon={<ClockIcon className="w-6 h-6"/>} title="Belum Dibaca" value={belumDibacaCount} color="#9ca3af" />
            <StatCard icon={<BookOpenIcon className="w-6 h-6"/>} title="Sudah Dibaca" value={sudahDibacaCount} color="#f59e0b" />
            <StatCard icon={<PencilIcon className="w-6 h-6"/>} title="Sedang Berjalan" value={sedangBerjalanCount} color="#3b82f6" />
            <StatCard icon={<CheckCircleIcon className="w-6 h-6"/>} title="Selesai" value={selesaiCount} color="#10b981" />
            <StatCard icon={<ExclamationTriangleIcon className="w-6 h-6"/>} title="Butuh Diskusi" value={butuhDiskusiCount} color="#ef4444" />
        </div>
      </div>


      <div className="flex items-center space-x-2 bg-white p-2 rounded-full shadow-sm max-w-md">
        <TabButton 
          title="Kelas Ikhwan" 
          count={ikhwanClasses.length}
          active={activeTab === 'Ikhwan'}
          onClick={() => setActiveTab('Ikhwan')}
        />
        <TabButton 
          title="Kelas Akhwat" 
          count={akhwatClasses.length}
          active={activeTab === 'Akhwat'}
          onClick={() => setActiveTab('Akhwat')}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayedClasses.map(schoolClass => (
          <div key={schoolClass.id} className="bg-white rounded-xl shadow-md p-5 border border-gray-200/80 hover:shadow-lg hover:border-teal-300 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{schoolClass.name}</h2>
                <p className="text-sm text-gray-500">{schoolClass.short_name}</p>
              </div>
              <span className="bg-teal-400 text-white text-xs font-bold px-3 py-1 rounded-full">{schoolClass.halaqah.length} Halaqah</span>
            </div>
            <div className="mt-4 space-y-3">
              {schoolClass.halaqah.map(halaqah => {
                const currentReport = halaqah.laporan?.find(r => r.year === selectedYear && r.month === selectedMonth);

                return (
                  <div key={halaqah.id} className="bg-gray-100/70 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-700">{halaqah.name}</h3>
                        <p className="text-xs text-gray-500 leading-tight mt-1">{halaqah.guru?.name || 'N/A'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {currentReport ? (
                            currentReport.is_read ? (
                               <div className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                                 <CheckCircleIcon className="w-4 h-4 mr-1"/>
                                 Sudah Dibaca
                               </div>
                            ) : (
                               <div className="flex items-center bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">
                                 <ClockIcon className="w-4 h-4 mr-1"/>
                                 Belum Dibaca
                               </div>
                            )
                        ) : (
                           <div className="flex items-center bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
                             <XCircleIcon className="w-4 h-4 mr-1"/>
                             Belum Diisi
                           </div>
                        )}
                        {currentReport && (
                            <button onClick={() => handleViewReport(currentReport, halaqah, schoolClass)} className="p-2 text-gray-500 hover:text-white hover:bg-teal-500 rounded-md transition-all" aria-label="Lihat Laporan">
                                <BookOpenIcon className="w-5 h-5"/>
                            </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      {selectedReport && (
        <ReportDetailModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onSave={async (updatedReport) => {
              await onUpdateReport(updatedReport);
              setSelectedReport(null);
            }}
            currentUser={currentUser}
        />
      )}
    </>
  );
}

export default MonitoringDashboard;
