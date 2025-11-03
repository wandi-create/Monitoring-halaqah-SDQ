import React, { useState, useEffect, useCallback } from 'react';
import { SchoolClass, Halaqah, Report, ReportSection } from '../types';
import { SaveIcon, PlusIcon, TrashIcon } from './Icons';

interface ReportCardProps {
  schoolClass: SchoolClass;
  halaqah: Halaqah;
  onSaveReport: (classId: string, halaqahId: string, report: Report) => void;
  months: string[];
  initialYear?: number;
  initialMonth?: number;
}

// UPDATED to include coordinator_notes and adjust Omit<>
const BLANK_REPORT_FIELDS: Omit<Report, 'id' | 'halaqah_id' | 'month' | 'year' | 'is_read' | 'follow_up_status' | 'teacher_notes'> = {
  main_insight: [],
  student_segmentation: [],
  identified_challenges: [],
  follow_up_recommendations: [],
  next_month_target: [],
  coordinator_notes: [],
};

// SIMPLIFIED to cover all fields in the new blank object.
type ReportField = keyof typeof BLANK_REPORT_FIELDS;


const normalizeReportField = (fieldData: any, defaultTitle: string): ReportSection[] => {
  if (Array.isArray(fieldData)) {
    return fieldData;
  }
  if (typeof fieldData === 'string' && fieldData.trim() !== '') {
    return [{ id: `migrated-${Date.now()}`, title: defaultTitle, content: fieldData }];
  }
  return [];
};


const ReportCard: React.FC<ReportCardProps> = ({ schoolClass, halaqah, onSaveReport, months, initialYear, initialMonth }) => {
  const getPreviousMonthAndYear = () => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      return {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
      };
  };

  const { year: defaultYear, month: defaultMonth } = getPreviousMonthAndYear();

  const [selectedYear, setSelectedYear] = useState(initialYear !== undefined ? initialYear : defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth !== undefined ? initialMonth : defaultMonth);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getReportForDate = useCallback((year: number, month: number): Report => {
    const existingReport = halaqah.laporan.find(r => r.year === year && r.month === month);
    
    const reportValues = { ...BLANK_REPORT_FIELDS };
    if (existingReport) {
      reportValues.main_insight = normalizeReportField(existingReport.main_insight, 'Insight Utama');
      reportValues.student_segmentation = normalizeReportField(existingReport.student_segmentation, 'Segmentasi Murid');
      reportValues.identified_challenges = normalizeReportField(existingReport.identified_challenges, 'Tantangan');
      reportValues.follow_up_recommendations = normalizeReportField(existingReport.follow_up_recommendations, 'Rekomendasi');
      reportValues.next_month_target = normalizeReportField(existingReport.next_month_target, 'Target');
      reportValues.coordinator_notes = normalizeReportField(existingReport.coordinator_notes, 'Catatan Koordinator');
    }

    return { 
        ...reportValues,
        id: existingReport?.id || '', 
        halaqah_id: halaqah.id,
        year, 
        month,
        is_read: existingReport?.is_read || false,
        follow_up_status: existingReport?.follow_up_status || 'Belum Dimulai',
        teacher_notes: existingReport?.teacher_notes || '',
    };
  }, [halaqah.laporan, halaqah.id]);

  useEffect(() => {
    setCurrentReport(getReportForDate(selectedYear, selectedMonth));
    setIsModified(false);
  }, [selectedYear, selectedMonth, halaqah, getReportForDate]);
  
  const handleSectionChange = (field: ReportField, sectionId: string, part: 'title' | 'content', value: string) => {
    if (!currentReport) return;
    const sections = (currentReport as any)[field] as ReportSection[];
    const updatedSections = sections.map(sec => 
        sec.id === sectionId ? { ...sec, [part]: value } : sec
    );
    setCurrentReport(prev => prev ? { ...prev, [field]: updatedSections } : null);
    setIsModified(true);
  };

  const handleAddSection = (field: ReportField, defaultTitle: string) => {
      if (!currentReport) return;
      const newSection: ReportSection = {
          id: `sec-${Date.now()}-${Math.random()}`,
          title: defaultTitle,
          content: '',
      };
      setCurrentReport(prev => prev ? { ...prev, [field]: [...((prev as any)[field] || []), newSection] } : null);
      setIsModified(true);
  };

  const handleRemoveSection = (field: ReportField, sectionId: string) => {
      if (!currentReport || !window.confirm('Apakah Anda yakin ingin menghapus bagian ini?')) return;
      setCurrentReport(prev => prev ? { ...prev, [field]: (prev as any)[field]?.filter((sec: ReportSection) => sec.id !== sectionId)} : null);
      setIsModified(true);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        const textarea = e.currentTarget;
        const { value, selectionStart } = textarea;
        
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        const currentLine = value.substring(lineStart, selectionStart);
        
        const bulletMatch = currentLine.match(/^(\s*)-(\s*)/);

        if (bulletMatch) {
            e.preventDefault();
            
            const indent = bulletMatch[1] || '';
            const contentAfterBullet = currentLine.substring(bulletMatch[0].length);

            if (contentAfterBullet.trim() === '') {
                const newValue = value.substring(0, lineStart) + value.substring(selectionStart);
                textarea.value = newValue;
                textarea.selectionStart = textarea.selectionEnd = lineStart;
            } else {
                const nextBullet = `\n${indent}- `;
                const newValue = value.substring(0, selectionStart) + nextBullet + value.substring(selectionStart);
                textarea.value = newValue;
                const newCursorPos = selectionStart + nextBullet.length;
                textarea.selectionStart = textarea.selectionEnd = newCursorPos;
            }

            const event = new Event('input', { bubbles: true });
            textarea.dispatchEvent(event);
        }
    }
  };

  const handleSave = () => {
    if (currentReport) {
      onSaveReport(schoolClass.id, halaqah.id, currentReport);
      setIsModified(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };
  
  // FIX: Use snake_case keys
  const reportFields: { key: ReportField, label: string, placeholder: string }[] = [
    { key: 'main_insight', label: 'Insight Utama', placeholder: 'Tuliskan poin-poin insight di sini...' },
    { key: 'student_segmentation', label: 'Segmentasi Murid', placeholder: 'Jelaskan poin-poin segmentasi murid...' },
    { key: 'identified_challenges', label: 'Tantangan Terindikasi', placeholder: 'Jelaskan poin-poin tantangan...' },
    { key: 'follow_up_recommendations', label: 'Rekomendasi Tindak Lanjut', placeholder: 'Jelaskan poin-poin rekomendasi...' },
    { key: 'next_month_target', label: 'Target Bulan Depan', placeholder: 'Jelaskan poin-poin target...' },
    { key: 'coordinator_notes', label: 'Catatan Koordinator', placeholder: 'Tuliskan catatan atau feedback untuk guru...' },
  ];

  if (!currentReport) {
    return <div className="p-6">Loading report...</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 pb-4 mb-6">
        <div>
            <h2 className="text-2xl font-bold text-emerald-700">{halaqah.name}</h2>
            <p className="text-slate-500">{schoolClass.name}</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <select 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="p-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          >
            {months.map((month, index) => (
              <option key={month} value={index + 1}>{month}</option>
            ))}
          </select>
          <input 
            type="number" 
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="p-2 w-28 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="space-y-8">
        {reportFields.map(field => (
            <div key={field.key}>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{field.label}</h3>
                <div className="space-y-4">
                  {(currentReport[field.key] || []).map((section, index) => (
                    <div key={section.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                        <input
                            type="text"
                            value={section.title}
                            onChange={(e) => handleSectionChange(field.key, section.id, 'title', e.target.value)}
                            placeholder={`Judul Bagian ${index + 1}`}
                            className="w-full text-md font-semibold p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 transition mb-2"
                        />
                        <textarea
                            rows={4}
                            value={section.content}
                            onKeyDown={handleTextareaKeyDown}
                            onChange={(e) => handleSectionChange(field.key, section.id, 'content', e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full text-md p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 transition"
                        />
                         <button onClick={() => handleRemoveSection(field.key, section.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => handleAddSection(field.key, `Bagian Baru`)}
                    className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-800 py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg w-full justify-center hover:bg-teal-50 hover:border-teal-400 transition-all"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Tambah Bagian
                  </button>
                </div>
            </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end items-center gap-4">
        {showSuccess && <p className="text-emerald-600 text-sm font-medium transition-opacity">Laporan berhasil disimpan!</p>}
        <button
          onClick={handleSave}
          disabled={!isModified}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          <SaveIcon className="w-5 h-5 mr-2 -ml-1" />
          Simpan Laporan
        </button>
      </div>
    </div>
  );
};

export default ReportCard;