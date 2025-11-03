import React, { useState, useMemo } from 'react';
import { SchoolClass, User, Report, FollowUpStatus } from '../types';
import { MONTHS } from '../constants';
import { 
  CheckCircleIcon, 
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  EyeIcon,
} from './Icons';
import ReportDetailModal from './ReportDetailModal';

type ExtendedReport = Report & {
  halaqahName: string;
  className: string;
  teacherName: string;
};

interface ResumeLaporanProps {
  classes: SchoolClass[];
  currentUser: User;
  onUpdateReport: (report: Report) => Promise<void>;
}

const StatusPill: React.FC<{ isDone: boolean; textDone: string; textNotDone: string }> = ({ isDone, textDone, textNotDone }) => (
    <div className={`flex items-center text-xs font-medium px-2.5 py-1 rounded-full w-fit ${isDone ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
    <div className={`flex items-center text-xs font-medium px-2.5 py-1 rounded-full w-fit ${statusStyles[status]}`}>
      <span>{status}</span>
    </div>
  );
};


const ResumeLaporan: React.FC<ResumeLaporanProps> = ({ classes, currentUser, onUpdateReport }) => {
  const getPreviousMonthAndYear = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
    };
  };

  const { year: defaultYear, month: defaultMonth } = getPreviousMonthAndYear();

  const [selectedMonth, setSelectedMonth] = useState<string>(String(defaultMonth));
  const [selectedYear, setSelectedYear] = useState<string>(String(defaultYear));
  const [selectedReport, setSelectedReport] = useState<ExtendedReport | null>(null);
  
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const allYears = new Set<number>();
    classes.forEach(c => c.halaqah.forEach(h => h.laporan?.forEach(r => allYears.add(r.year))));
    if (!allYears.has(currentYear)) {
      allYears.add(currentYear);
    }
    return Array.from(allYears).sort((a, b) => b - a);
  }, [classes]);


  const filteredReports = useMemo((): ExtendedReport[] => {
    return classes.flatMap(schoolClass =>
      schoolClass.halaqah.flatMap(halaqah =>
        (halaqah.laporan || []).map(report => ({
          ...report,
          halaqahName: halaqah.name,
          className: schoolClass.name,
          teacherName: halaqah.guru?.name || 'N/A'
        }))
      )
    )
    .filter(report => 
      (selectedMonth === 'all' || report.month === parseInt(selectedMonth)) &&
      (selectedYear === 'all' || report.year === parseInt(selectedYear))
    )
    .sort((a, b) => new Date(b.year, b.month - 1).getTime() - new Date(a.year, a.month - 1).getTime());
  }, [classes, selectedMonth, selectedYear]);

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

      <div className="bg-white rounded-xl shadow-md border border-gray-200/80">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Halaqah</th>
                        <th scope="col" className="px-6 py-3">Periode</th>
                        <th scope="col" className="px-6 py-3">Status Baca</th>
                        <th scope="col" className="px-6 py-3">Status Tindak Lanjut</th>
                        <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredReports.length > 0 ? (
                        filteredReports.map(report => (
                            <tr key={report.id} className="bg-white border-b hover:bg-gray-50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {report.halaqahName} - {report.className}
                                    <p className="text-xs text-gray-500 font-normal">{report.teacherName}</p>
                                </th>
                                <td className="px-6 py-4">
                                    {MONTHS[report.month - 1]} {report.year}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusPill isDone={report.is_read} textDone="Sudah Dibaca" textNotDone="Belum Dibaca"/>
                                </td>
                                <td className="px-6 py-4">
                                    <FollowUpStatusPill status={report.follow_up_status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedReport(report)}
                                        className="inline-flex items-center gap-1.5 text-sm font-semibold py-2 px-3 rounded-lg transition-all shadow-sm text-teal-600 bg-teal-100 hover:bg-teal-200"
                                        aria-label="Lihat Detail Laporan"
                                    >
                                        <EyeIcon className="w-4 h-4"/>
                                        <span>Lihat Detail</span>
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5}>
                                <div className="text-center py-20">
                                    <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-xl font-semibold text-gray-800">Tidak Ada Laporan Ditemukan</h3>
                                    <p className="mt-1 text-gray-500">Ubah filter pencarian Anda atau input laporan baru untuk menampilkannya di sini.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
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