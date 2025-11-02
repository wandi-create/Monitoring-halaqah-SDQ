import React, { useState } from 'react';
import { SchoolClass, User, Report, Halaqah } from '../types';
import { ClockIcon, EyeIcon, CheckCircleIcon, XCircleIcon } from './Icons';
import ReportDetailModal from './ReportDetailModal';


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

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ classes, currentUser, onUpdateReport }) => {
  const [activeTab, setActiveTab] = useState<'Ikhwan' | 'Akhwat'>('Ikhwan');
  const [selectedReport, setSelectedReport] = useState<ExtendedReport | null>(null);

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
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-teal-600">Monitoring Halaqah Al Qur'an</h1>
        <p className="text-gray-500 mt-1">SDQ Mutiara Sunnah - Sistem Monitoring Bulanan</p>
      </header>

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
                const date = new Date();
                const currentMonth = date.getMonth() + 1;
                const currentYear = date.getFullYear();
                const currentReport = halaqah.laporan?.find(r => r.year === currentYear && r.month === currentMonth);

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
                                <EyeIcon className="w-5 h-5"/>
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