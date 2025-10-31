import React, { useState, useMemo } from 'react';
import { SchoolClass, Report, Halaqah } from '../types';
import { MONTHS } from '../constants';
import { CheckCircleIcon, XCircleIcon, PencilIcon, PlusIcon } from './Icons';
import ReportInputModal from './ReportInputModal';

interface BulkInputProps {
  classes: SchoolClass[];
  onUpdateReport: (report: Report) => Promise<void>;
}

const BulkInput: React.FC<BulkInputProps> = ({ classes, onUpdateReport }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ halaqah: Halaqah; schoolClass: SchoolClass } | null>(null);

  const allHalaqahsWithClass = useMemo(() =>
    classes.flatMap(c => c.halaqah.map(h => ({ halaqah: h, schoolClass: c })))
  , [classes]);

  const handleOpenModal = (halaqah: Halaqah, schoolClass: SchoolClass) => {
    setSelectedItem({ halaqah, schoolClass });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">Input Laporan</h1>
          <p className="text-gray-500 mt-1">Pilih halaqah untuk mengisi atau mengedit laporan.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          >
            {MONTHS.map((month, index) => (
              <option key={month} value={index + 1}>{month}</option>
            ))}
          </select>
          <input
            type="number"
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="p-2 w-28 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200/80">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Halaqah</th>
                        <th scope="col" className="px-6 py-3">Status Laporan</th>
                        <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {allHalaqahsWithClass.map(({ halaqah, schoolClass }) => {
                        const currentReport = halaqah.laporan.find(r => r.year === selectedYear && r.month === selectedMonth);
                        return (
                            <tr key={halaqah.id} className="bg-white border-b hover:bg-gray-50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {halaqah.name}
                                    <p className="text-xs text-gray-500 font-normal">{schoolClass.name}</p>
                                </th>
                                <td className="px-6 py-4">
                                    {currentReport ? 
                                        <span className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full w-fit">
                                            <CheckCircleIcon className="w-4 h-4"/> Sudah Diisi
                                        </span> :
                                        <span className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full w-fit">
                                            <XCircleIcon className="w-4 h-4"/> Belum Diisi
                                        </span>
                                    }
                                </td>
                                <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => handleOpenModal(halaqah, schoolClass)} 
                                    className={`inline-flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-all shadow-sm ${
                                        currentReport 
                                        ? 'text-amber-600 bg-amber-100 hover:bg-amber-200' 
                                        : 'text-teal-600 bg-teal-100 hover:bg-teal-200'
                                    }`}
                                >
                                    {currentReport ? <PencilIcon className="w-4 h-4"/> : <PlusIcon className="w-4 h-4"/>}
                                    {currentReport ? 'Edit Laporan' : 'Input Laporan'}
                                </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {isModalOpen && selectedItem && (
        <ReportInputModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          halaqah={selectedItem.halaqah}
          schoolClass={selectedItem.schoolClass}
          onSaveReport={onUpdateReport}
        />
      )}
    </>
  );
};

export default BulkInput;
