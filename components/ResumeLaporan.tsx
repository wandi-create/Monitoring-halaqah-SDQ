import React, { useState, useMemo } from 'react';
import { SchoolClass, User, Report, FollowUpStatus } from '../types';
import { MONTHS } from '../constants';
import { 
  CheckCircleIcon, 
  ClockIcon,
  DocumentMagnifyingGlassIcon,
} from './Icons';
import ReportDetailModal from './ReportDetailModal';

type ExtendedReport = Report & {
  halaqahName: string;
  className: string;
  teacherNames: string[];
};

interface ResumeLaporanProps {
  classes: SchoolClass[];
  teachers: User[];
  currentUser: User;
  onUpdateReport: (report: Report) => Promise<void>;
}

const StatusPill: React.FC<{ isDone: boolean; textDone: string; textNotDone: string }> = ({ isDone, textDone, textNotDone }) => (
    <div className={`flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${isDone ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
      {isDone ? <CheckCircleIcon className="w-4 h-4 mr-1.5 flex-shrink-0" /> : <ClockIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />}
      <span>{isDone ? textDone : textNotDone}</span>
    </div>
);

const FollowUpStatusPill: React.FC<{ status: FollowUpStatus }> = ({ status }) => {
  const statusStyles: Record<FollowUpStatus, string> = {
    'Belum Dimulai': 'bg-gray-100 text-gray-800',
    'Sedang Berjalan': 'bg-blue-100 text-blue-800',
    'Selesai': 'bg-green-100 text-green-800',
    'Butuh Diskusi': 'bg-red-100 text-red-800',
  };
  return (
    <div className={`flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[status]}`}>
      <span>{status}</span>
    </div>
  );
};


const ResumeLaporan: React.FC<ResumeLaporanProps> = ({ classes, teachers, currentUser, onUpdateReport }) => {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<ExtendedReport | null>(null);
  
  const years = useMemo(() => {
    const allYears = new Set<number>();
    classes.forEach(c => c.halaqah.forEach(h => h.laporan?.forEach(r => allYears.add(r.year))));
    if (!allYears.has(currentYear)) {
      allYears.add(currentYear);
    }
    return Array.from(allYears).sort((a, b) => b - a);
  }, [classes, currentYear]);


  const filteredReports = useMemo((): ExtendedReport[] => {
    return classes.flatMap(schoolClass =>
      schoolClass.halaqah.flatMap(halaqah =>
        (halaqah.laporan || []).map(report => ({
          ...report,
          halaqahName: halaqah.name,
          className: schoolClass.name,
          teacherNames: halaqah.teacher_ids.map(id => teachers.find(t => t.id === id)?.name || 'N/A')
        }))
      )
    )
    .filter(report => 
      (selectedMonth === 'all' || report.month === parseInt(selectedMonth)) &&
      (selectedYear === 'all' || report.year === parseInt(selectedYear))
    )
    .sort((a, b) => new Date(b.year, b.month - 1).getTime() - new Date(a.year, a.month - 1).getTime());
  }, [classes, teachers, selectedMonth, selectedYear]);

  return (
    <>
      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">Resume Laporan</h1>
          <p className="text-gray-500 mt-1">Tinjau semua laporan yang telah diinput.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">Semua Bulan</option>
            {MONTHS.map((month, index) => (
              <option key={month} value={index + 1}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">Semua Tahun</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReports.length > 0 ? (
          filteredReports.map(report => {
            const mainInsightContent = (report.main_insight || []).length > 0 ? report.main_insight[0].content : '';
            return (
              <div 
                key={`${report.id}-${report.halaqahName}`} 
                onClick={() => setSelectedReport(report)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl hover:ring-2 hover:ring-teal-400 transition-all duration-300 p-5 border border-gray-200/80 cursor-pointer flex flex-col justify-between"
              >
                  <div>
                    <div className="border-b-2 border-gray-100 pb-3 mb-4">
                        <p className="text-xs text-gray-500">{MONTHS[report.month - 1]} {report.year}</p>
                        <h2 className="text-md font-bold text-gray-800 mt-1 truncate">{report.halaqahName} - {report.className}</h2>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-semibold text-gray-600">{report.teacherNames.join(', ')}</span>
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Insight Utama:</h3>
                        <p className="text-sm text-gray-600 line-clamp-3">{mainInsightContent || <span className="italic text-gray-400">Tidak ada insight utama.</span>}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                     <StatusPill isDone={report.is_read} textDone="Sudah Dibaca" textNotDone="Belum Dibaca"/>
                     <FollowUpStatusPill status={report.follow_up_status} />
                  </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-lg shadow-sm border-2 border-dashed">
            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-semibold text-gray-800">Tidak Ada Laporan Ditemukan</h3>
            <p className="mt-1 text-gray-500">Ubah filter pencarian Anda atau input laporan baru untuk menampilkannya di sini.</p>
          </div>
        )}
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
};

export default ResumeLaporan;
