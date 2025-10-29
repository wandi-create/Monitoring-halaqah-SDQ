import React, { useState, useEffect, useMemo } from 'react';
import { SchoolClass, Report, ReportSection } from '../types';
import { MONTHS } from '../constants';
import { SaveIcon, PlusIcon, TrashIcon } from './Icons';

interface BulkInputProps {
  classes: SchoolClass[];
  onBulkUpdate: (reportsToUpdate: Record<string, Report>) => void;
}

const BLANK_REPORT_FIELDS: Omit<Report, 'id' | 'month' | 'year' | 'isRead' | 'followUpStatus' | 'teacherNotes'> = {
  mainInsight: [],
  studentSegmentation: [],
  identifiedChallenges: [],
  followUpRecommendations: [],
  nextMonthTarget: [],
};

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


const BulkInput: React.FC<BulkInputProps> = ({ classes, onBulkUpdate }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [reportsData, setReportsData] = useState<Record<string, Report>>({});
  const [isModified, setIsModified] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const allHalaqahs = useMemo(() => 
    classes.flatMap(c => c.halaqahs.map(h => ({ ...h, className: c.name, classId: c.id })))
  , [classes]);

  useEffect(() => {
    const reportIdPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const initialData: Record<string, Report> = {};
    
    allHalaqahs.forEach(halaqah => {
      const reportId = reportIdPrefix;
      const existingReport = halaqah.reports.find(r => r.id === reportId);
      
      const reportValues = { ...BLANK_REPORT_FIELDS };
      if(existingReport) {
        reportValues.mainInsight = normalizeReportField(existingReport.mainInsight, 'Insight Utama');
        reportValues.studentSegmentation = normalizeReportField(existingReport.studentSegmentation, 'Segmentasi Murid');
        reportValues.identifiedChallenges = normalizeReportField(existingReport.identifiedChallenges, 'Tantangan');
        reportValues.followUpRecommendations = normalizeReportField(existingReport.followUpRecommendations, 'Rekomendasi');
        reportValues.nextMonthTarget = normalizeReportField(existingReport.nextMonthTarget, 'Target');
      }

      initialData[halaqah.id] = {
        ...reportValues,
        id: reportId,
        year: selectedYear,
        month: selectedMonth,
        isRead: existingReport?.isRead || false,
        followUpStatus: existingReport?.followUpStatus || 'Belum Dimulai',
        teacherNotes: existingReport?.teacherNotes || '',
      };
    });

    setReportsData(initialData);
    setIsModified(false);
  }, [selectedYear, selectedMonth, allHalaqahs]);
  
  const handleSectionChange = (halaqahId: string, field: ReportField, sectionId: string, part: 'title' | 'content', value: string) => {
    setReportsData(prev => {
      const sections = prev[halaqahId][field];
      const updatedSections = sections.map(sec => 
        sec.id === sectionId ? { ...sec, [part]: value } : sec
      );
      return {
        ...prev,
        [halaqahId]: { ...prev[halaqahId], [field]: updatedSections },
      };
    });
    setIsModified(true);
  };

  const handleAddSection = (halaqahId: string, field: ReportField, defaultTitle: string) => {
      setReportsData(prev => {
          const sections = prev[halaqahId][field];
          const newSection: ReportSection = {
              id: `sec-${Date.now()}-${Math.random()}`,
              title: `${defaultTitle} #${sections.length + 1}`,
              content: '',
          };
          return {
              ...prev,
              [halaqahId]: { ...prev[halaqahId], [field]: [...sections, newSection] }
          };
      });
      setIsModified(true);
  };

  const handleRemoveSection = (halaqahId: string, field: ReportField, sectionId: string) => {
      if(!window.confirm('Apakah Anda yakin ingin menghapus bagian ini?')) return;
      setReportsData(prev => {
          const sections = prev[halaqahId][field];
          return {
              ...prev,
              [halaqahId]: { ...prev[halaqahId], [field]: sections.filter(sec => sec.id !== sectionId) }
          };
      });
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

  const handleSaveAll = () => {
    onBulkUpdate(reportsData);
    setIsModified(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  const reportFields: { key: ReportField, label: string, placeholder: string }[] = [
    { key: 'mainInsight', label: 'Insight Utama', placeholder: 'Tuliskan poin-poin insight di sini...' },
    { key: 'studentSegmentation', label: 'Segmentasi Murid', placeholder: 'Jelaskan poin-poin segmentasi murid...' },
    { key: 'identifiedChallenges', label: 'Tantangan yang Teridentifikasi', placeholder: 'Jelaskan poin-poin tantangan...' },
    { key: 'followUpRecommendations', label: 'Rekomendasi Tindak Lanjut', placeholder: 'Jelaskan poin-poin rekomendasi...' },
    { key: 'nextMonthTarget', label: 'Target Bulan Depan', placeholder: 'Jelaskan poin-poin target...' },
  ];


  return (
    <>
      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">Input Laporan Massal</h1>
          <p className="text-gray-500 mt-1">Isi laporan untuk semua halaqah dalam satu halaman.</p>
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

      <div className="space-y-8">
        {allHalaqahs.map(halaqah => (
          <div key={halaqah.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200/80">
            <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">{halaqah.name}</h2>
                <p className="text-sm text-gray-500">{halaqah.className}</p>
            </div>
            <div className="space-y-8">
               {reportFields.map(field => (
                    <div key={field.key}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">{field.label}</h3>
                         <div className="space-y-4">
                            {(reportsData[halaqah.id]?.[field.key] || []).map((section, index) => (
                                <div key={section.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => handleSectionChange(halaqah.id, field.key, section.id, 'title', e.target.value)}
                                        placeholder={`Judul Bagian ${index + 1}`}
                                        className="w-full text-md font-semibold p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 transition mb-2"
                                    />
                                    <textarea
                                        rows={4}
                                        value={section.content}
                                        onKeyDown={handleTextareaKeyDown}
                                        onChange={(e) => handleSectionChange(halaqah.id, field.key, section.id, 'content', e.target.value)}
                                        placeholder={field.placeholder}
                                        className="w-full text-md p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 transition"
                                    />
                                    <button onClick={() => handleRemoveSection(halaqah.id, field.key, section.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={() => handleAddSection(halaqah.id, field.key, field.label)}
                                className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-800 py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg w-full justify-center hover:bg-teal-50 hover:border-teal-400 transition-all"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Tambah Bagian
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        ))}
      </div>

       <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end items-center gap-4 sticky bottom-0 bg-gray-50/80 backdrop-blur-sm py-4 -mx-8 px-8">
        {showSuccess && <p className="text-emerald-600 text-sm font-medium transition-opacity">Semua laporan berhasil disimpan!</p>}
        <button
          onClick={handleSaveAll}
          disabled={!isModified}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          <SaveIcon className="w-5 h-5 mr-2 -ml-1" />
          Simpan Semua Perubahan
        </button>
      </div>
    </>
  );
};

export default BulkInput;