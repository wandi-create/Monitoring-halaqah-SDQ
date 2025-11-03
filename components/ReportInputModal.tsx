import React from 'react';
import { SchoolClass, Halaqah, Report } from '../types';
import ReportCard from './ReportCard';
import { CloseIcon } from './Icons';
import { MONTHS } from '../constants';

interface ReportInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  halaqah: Halaqah | null;
  schoolClass: SchoolClass | null;
  onSaveReport: (report: Report) => Promise<void>;
  initialYear?: number;
  initialMonth?: number;
}

const ReportInputModal: React.FC<ReportInputModalProps> = ({ isOpen, onClose, halaqah, schoolClass, onSaveReport, initialYear, initialMonth }) => {
    if (!isOpen || !halaqah || !schoolClass) return null;

    const handleSave = async (classId: string, halaqahId: string, report: Report) => {
        await onSaveReport(report);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4" onClick={onClose}>
            <button
                onClick={onClose}
                className="bg-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-900 transition-colors mb-4 flex-shrink-0"
                aria-label="Tutup"
            >
                <CloseIcon className="w-7 h-7" />
            </button>
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[85vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <main className="flex-1 overflow-y-auto">
                    <ReportCard
                        schoolClass={schoolClass}
                        halaqah={halaqah}
                        onSaveReport={handleSave}
                        months={MONTHS}
                        initialYear={initialYear}
                        initialMonth={initialMonth}
                    />
                </main>
            </div>
        </div>
    );
};

export default ReportInputModal;