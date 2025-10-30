import React, { useState, useEffect, useCallback } from 'react';
import { SchoolClass, Halaqah, Report, ReportSection } from '../types';
import { CheckCircleIcon, SaveIcon, PlusIcon, TrashIcon, CloseIcon } from './Icons';

interface ReportInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: Report, halaqahId: string) => Promise<void>;
  schoolClass: SchoolClass;
  halaqah: Halaqah;
  existingReport?: Report;
  months: string[];
}

const BLANK_REPORT_FIELDS: Omit<Report, 'id' | 'halaqah_id' | 'month' | 'year' | 'is_read' | 'follow_up_status' | 'teacher_notes'> = {
  main_insight: [],
  student_segmentation: [],
  identified_challenges: [],
  follow_up_recommendations: [],
  next_month_target: [],
};

type ReportField = keyof typeof BLANK_REPORT_FIELDS;

const normalizeReportField = (fieldData: any, defaultTitle: string): ReportSection[] => {
  if (Array.isArray(fieldData) && fieldData.length > 0 && typeof fieldData[0] === 'object' && 'id' in fieldData[0]) {
    return fieldData;
  }
  if (typeof fieldData === 'string' && fieldData.trim() !== '') {
    return [{ id: `migrated-${Date.now()}`, title: defaultTitle, content: fieldData }];
  }
  return [];
};

const ReportInputModal: React.FC<ReportInputModalProps> = ({ isOpen, onClose, onSave, schoolClass, halaqah, existingReport, months }) => {
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getReportForDate = useCallback((): Report => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    
    const reportValues = { ...BLANK_REPORT_FIELDS };
    if (existingReport) {
      reportValues.main_insight = normalizeReportField(existingReport.main_insight, 'Insight Utama');
      reportValues.student_segmentation = normalizeReportField(existingReport.student_segmentation, 'Segmentasi Murid');
      reportValues.identified_challenges = normalizeReportField(existingReport.identified_challenges, 'Tantangan');
      reportValues.follow_up_recommendations = normalizeReportField(existingReport.follow_up_recommendations, 'Rekomendasi');
      reportValues.next_month_target = normalizeReportField(existingReport.next_month_target, 'Target');
    }

    return { 
        ...existingReport,
        ...reportValues, 
        id: existingReport?.id || '', 
        halaqah_id: halaqah.id,
        year, 
        month,
        is_read: existingReport?.is_read || false,
        follow_up_status: existingReport?.follow_up_status || 'Belum Dimulai',
        teacher_notes: existingReport?.teacher_notes || '',
    };
  }, [existingReport, halaqah.id]);

  useEffect(() => {
    if (isOpen) {
        setCurrentReport(getReportForDate());
        setIsModified(false);
        setShowSuccess(false);
    }
  }, [isOpen, getReportForDate]);
  
  const handleSectionChange = (field: ReportField, sectionId: string, part: 'title' | 'content', value: string) => {
    if (!currentReport) return;
    const sections = currentReport[field] || [];
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
      const currentSections = currentReport[field] || [];
      setCurrentReport(prev => prev ? { ...prev, [field]: [...currentSections, newSection] } : null);
      setIsModified(true);
  };

  const handleRemoveSection = (field: ReportField, sectionId: string) => {
      if (!currentReport || !window.confirm('Apakah Anda yakin ingin menghapus bagian ini?')) return;
      const currentSections = currentReport[field] || [];
      setCurrentReport(prev => prev ? { ...prev, [field]: currentSections.filter(sec => sec.id !== sectionId)} : null);
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

  const handleSave = async () => {
    if (currentReport) {
      await onSave(currentReport, halaqah.id);
      setIsModified(false);
      setShowSuccess(true);
      setTimeout(() => {
          onClose();
      }, 2000);
    }
  };
  
  const reportFields: { key: ReportField; label: string; placeholder: string }[] = [
    { key: 'main_insight', label: 'Insight Utama', placeholder: 'Tuliskan poin-poin insight di sini...' },
    { key: 'student_segmentation', label: 'Segmentasi Murid', placeholder: 'Jelaskan poin-poin segmentasi murid...' },
    { key: 'identified_challenges', label: 'Tantangan Terindikasi', placeholder: 'Jelaskan poin-poin tantangan...' },
    { key: 'follow_up_recommendations', label: 'Rekomendasi Tindak Lanjut', placeholder: 'Jelaskan poin-poin rekomendasi...' },
    { key: 'next_month_target', label: 'Target Bulan Depan', placeholder: 'Jelaskan poin-poin target...' },
  ];

  if (!isOpen || !currentReport) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div 
            className="bg-white w-full max-w-3xl h-[90vh] rounded-2xl shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
            onClick={e => e.stopPropagation()}
        >
            <header className="p-5 border-b bg-gray-50 flex-shrink-0 rounded-t-2xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500">{months[currentReport.month - 1]} {currentReport.year}</p>
                        <h2 className="text-xl font-bold text-gray-800 mt-1">{halaqah.name} - {schoolClass.name}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-6 space-y-8">
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
                                    className="w-full text-md font-semibold p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition mb-2"
                                />
                                <textarea
                                    rows={4}
                                    value={section.content}
                                    onKeyDown={handleTextareaKeyDown}
                                    onChange={(e) => handleSectionChange(field.key, section.id, 'content', e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full text-md p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                                <button onClick={() => handleRemoveSection(field.key, section.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button 
                            onClick={() => handleAddSection(field.key, `Bagian Baru`)}
                            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg w-full justify-center hover:bg-blue-50 hover:border-blue-400 transition-all"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Tambah Bagian
                        </button>
                        </div>
                    </div>
                ))}
            </main>

            <footer className="p-4 bg-gray-50 border-t flex justify-end items-center gap-3 flex-shrink-0 rounded-b-2xl">
                {showSuccess && <p className="text-green-600 text-sm font-medium transition-opacity flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Laporan berhasil disimpan!</p>}
                <button
                onClick={handleSave}
                disabled={!isModified || showSuccess}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                <SaveIcon className="w-5 h-5 mr-2 -ml-1" />
                Simpan Laporan
                </button>
            </footer>
        </div>
    </div>
  );
};

export default ReportInputModal;