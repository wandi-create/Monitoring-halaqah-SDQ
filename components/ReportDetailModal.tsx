import React, { useState, useEffect } from 'react';
import { Report, User, FollowUpStatus, ReportSection } from '../types';
import { MONTHS } from '../constants';
import { 
    CloseIcon, 
    SaveIcon,
} from './Icons';

type ExtendedReport = Report & {
  halaqahName: string;
  className: string;
  teacherName: string;
};

interface ReportDetailModalProps {
    report: ExtendedReport;
    onClose: () => void;
    onSave: (updatedReport: Report) => Promise<void>;
    currentUser: User;
}

const renderContentToHTML = (text: string) => {
    if (!text || text.trim() === '') {
        return '<p class="italic text-gray-400">Tidak ada konten.</p>';
    }

    const lines = text.split('\n');
    let html = '';
    let inList = false;

    for (const line of lines) {
        const isListItem = line.trim().startsWith('- ');

        if (isListItem) {
            if (!inList) {
                html += '<ul class="list-disc list-inside space-y-1 pl-2">';
                inList = true;
            }
            html += `<li>${line.trim().substring(2)}</li>`;
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            if (line.trim() !== '') {
                html += `<p class="my-1.5">${line.trim()}</p>`;
            }
        }
    }

    if (inList) {
        html += '</ul>';
    }

    return html;
};

const normalizeReportField = (fieldData: any, defaultTitle: string): ReportSection[] => {
  if (Array.isArray(fieldData) && fieldData.every(item => typeof item === 'object' && item !== null && 'id' in item)) {
    return fieldData;
  }
  if (typeof fieldData === 'string' && fieldData.trim() !== '') {
    return [{ id: `migrated-${Date.now()}`, title: defaultTitle, content: fieldData }];
  }
  return [];
};


const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, onClose, onSave, currentUser }) => {
    const [isRead, setIsRead] = useState(report.is_read);
    const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus>(report.follow_up_status);
    const [teacherNotes, setTeacherNotes] = useState(report.teacher_notes);
    const [isModified, setIsModified] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsRead(report.is_read);
        setFollowUpStatus(report.follow_up_status);
        setTeacherNotes(report.teacher_notes);
        setIsModified(false);
    }, [report]);

    useEffect(() => {
        if (report.is_read !== isRead || report.follow_up_status !== followUpStatus || report.teacher_notes !== teacherNotes) {
            setIsModified(true);
        } else {
            setIsModified(false);
        }
    }, [isRead, followUpStatus, teacherNotes, report]);

    const handleSave = async () => {
        setIsSaving(true);
        const { halaqahName, className, teacherName, ...coreReport } = report;
        const updatedReport: Report = {
            ...coreReport,
            is_read: isRead,
            follow_up_status: followUpStatus,
            teacher_notes: teacherNotes,
        };
        await onSave(updatedReport);
        setIsSaving(false);
    };

    const isGuru = currentUser.role === 'Guru';
    const followUpOptions: FollowUpStatus[] = ['Belum Dimulai', 'Sedang Berjalan', 'Selesai', 'Butuh Diskusi'];

    const reportCategories: { label: string; sections: ReportSection[] }[] = [
        { label: 'Insight Utama', sections: normalizeReportField(report.main_insight, 'Insight Utama') },
        { label: 'Segmentasi Murid', sections: normalizeReportField(report.student_segmentation, 'Segmentasi Murid') },
        { label: 'Tantangan Terindikasi', sections: normalizeReportField(report.identified_challenges, 'Tantangan') },
        { label: 'Rekomendasi Tindak Lanjut', sections: normalizeReportField(report.follow_up_recommendations, 'Rekomendasi') },
        { label: 'Target Bulan Depan', sections: normalizeReportField(report.next_month_target, 'Target') },
    ];


    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={onClose}>
            <div 
                className="w-full max-w-2xl bg-gray-50 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-5 border-b bg-white flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">{MONTHS[report.month - 1]} {report.year}</p>
                            <h2 className="text-xl font-bold text-gray-800 mt-1">{report.halaqahName} - {report.className}</h2>
                            <p className="text-sm text-gray-500 mt-1">Pengajar: <span className="font-semibold text-gray-600">{report.teacherName}</span></p>
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>
                
                <main className="flex-1 overflow-y-auto p-6 space-y-8">
                    {reportCategories.map(category => (
                        <div key={category.label}>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-200">{category.label}</h3>
                            <div className="space-y-4">
                                {category.sections.length > 0 ? (
                                    category.sections.map(section => (
                                        <div key={section.id} className="bg-white p-5 rounded-lg border">
                                            <h4 className="text-md font-semibold text-gray-700 mb-2">{section.title}</h4>
                                            <div
                                                className="text-gray-700 leading-relaxed max-w-none prose prose-sm"
                                                dangerouslySetInnerHTML={{ __html: renderContentToHTML(section.content || '') }}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white p-5 rounded-lg border text-center text-gray-500 italic">
                                        Tidak ada data untuk bagian ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    <div className="p-5 border-2 border-teal-600/30 rounded-lg bg-white">
                        <h3 className="text-lg font-bold text-teal-700 mb-4">Area Guru</h3>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    id="isReadModal"
                                    type="checkbox"
                                    checked={isRead}
                                    onChange={(e) => setIsRead(e.target.checked)}
                                    disabled={!isGuru}
                                    className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 disabled:opacity-70"
                                />
                                <label htmlFor="isReadModal" className="ml-3 block text-sm font-medium text-gray-700">
                                    Sudah membaca laporan ini
                                </label>
                            </div>
                            
                            <div>
                                <label htmlFor="followUpStatus" className="block text-sm font-medium text-gray-700 mb-1">Status Tindak Lanjut</label>
                                <select 
                                    id="followUpStatus" 
                                    value={followUpStatus} 
                                    onChange={e => setFollowUpStatus(e.target.value as FollowUpStatus)}
                                    disabled={!isGuru}
                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:opacity-70"
                                >
                                    {followUpOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="teacherNotes" className="block text-sm font-medium text-gray-700 mb-1">Catatan Guru</label>
                                <textarea
                                    id="teacherNotes"
                                    rows={4}
                                    value={teacherNotes}
                                    onChange={(e) => setTeacherNotes(e.target.value)}
                                    disabled={!isGuru}
                                    placeholder="Tuliskan catatan atau progress pelaksanaan tindak lanjut..."
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 transition disabled:bg-gray-100 disabled:opacity-70"
                                />
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="p-4 bg-white border-t flex justify-end items-center gap-3 flex-shrink-0">
                    
                     <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Tutup
                    </button>
                    {isGuru && (
                        <button
                            onClick={handleSave}
                            disabled={!isModified || isSaving}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                           <SaveIcon className="w-5 h-5 mr-2 -ml-1" />
                           {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default ReportDetailModal;