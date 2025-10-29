import React, { useState, useEffect } from 'react';
import { SchoolClass, Halaqah, User } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, CloseIcon, SaveIcon, ArrowUturnLeftIcon } from './Icons';

interface HalaqahManagementProps {
  classes: SchoolClass[];
  teachers: User[];
  onAddHalaqah: (classId: string, newHalaqah: Omit<Halaqah, 'id'|'reports'>) => void;
  onUpdateHalaqah: (classId: string, updatedHalaqah: Halaqah) => void;
  onDeleteHalaqah: (classId: string, halaqahId: string) => void;
}

const HalaqahFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (halaqahData: Omit<Halaqah, 'id'|'reports'> | Halaqah) => void;
    halaqahData: Omit<Halaqah, 'id'|'reports'|'teacherIds'|'studentCount'> & { teacherIds: string[], studentCount: number } | Halaqah | null;
    teachers: User[];
}> = ({ isOpen, onClose, onSave, halaqahData, teachers }) => {
    const [name, setName] = useState('');
    const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
    const [studentCount, setStudentCount] = useState(0);

    const isEditMode = halaqahData && 'id' in halaqahData;

    useEffect(() => {
        if (halaqahData) {
            setName(halaqahData.name);
            setSelectedTeacherIds(halaqahData.teacherIds || []);
            setStudentCount(halaqahData.studentCount || 0);
        } else {
            setName('');
            setSelectedTeacherIds([]);
            setStudentCount(0);
        }
    }, [halaqahData]);
    
    const handleTeacherToggle = (teacherId: string) => {
        setSelectedTeacherIds(prev =>
            prev.includes(teacherId)
                ? prev.filter(id => id !== teacherId)
                : [...prev, teacherId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = { name, teacherIds: selectedTeacherIds, studentCount };
        if (isEditMode) {
            onSave({ ...halaqahData, ...dataToSave, reports: halaqahData.reports || [] });
        } else {
            onSave(dataToSave);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Halaqah' : 'Tambah Halaqah Baru'}</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-500 hover:text-gray-800" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Halaqah</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="Contoh: Halaqah 1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
                        </div>
                         <div>
                            <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700">Jumlah Murid</label>
                            <input type="number" id="studentCount" value={studentCount} onChange={e => setStudentCount(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pilih Pengajar</label>
                            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                                {teachers.filter(t => t.role === 'Guru').map(teacher => (
                                    <label key={teacher.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedTeacherIds.includes(teacher.id)}
                                            onChange={() => handleTeacherToggle(teacher.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="ml-3 text-gray-700">{teacher.name}</span>
                                    </label>
                                ))}
                                {teachers.length === 0 && <p className="text-sm text-gray-500">Tidak ada data guru. Silakan tambah di Manajemen Guru.</p>}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center gap-2">
                            <ArrowUturnLeftIcon className="w-5 h-5"/> Batal
                        </button>
                        <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center gap-2">
                           <SaveIcon className="w-5 h-5"/> Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const HalaqahManagement: React.FC<HalaqahManagementProps> = ({ classes, teachers, onAddHalaqah, onUpdateHalaqah, onDeleteHalaqah }) => {
    const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHalaqah, setEditingHalaqah] = useState<Halaqah | null>(null);

    const selectedClass = classes.find(c => c.id === selectedClassId);
    
    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'N/A';

    const handleOpenAddModal = () => {
        setEditingHalaqah(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (halaqah: Halaqah) => {
        setEditingHalaqah(halaqah);
        setIsModalOpen(true);
    };

    const handleSave = (halaqahData: Omit<Halaqah, 'id'|'reports'> | Halaqah) => {
        if (!selectedClassId) return;
        if ('id' in halaqahData) {
            onUpdateHalaqah(selectedClassId, halaqahData);
        } else {
            onAddHalaqah(selectedClassId, halaqahData);
        }
    };

    return (
        <>
            <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-teal-600">Manajemen Halaqah</h1>
                    <p className="text-gray-500 mt-1">Tambah, edit, atau hapus data halaqah per kelas</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                        className="block w-full sm:w-64 px-3 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button onClick={handleOpenAddModal} disabled={!selectedClassId} className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-all flex items-center gap-2 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Tambah Halaqah</span>
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200/80">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nama Halaqah</th>
                                <th scope="col" className="px-6 py-3">Jumlah Murid</th>
                                <th scope="col" className="px-6 py-3">Pengajar</th>
                                <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedClass?.halaqahs.map(halaqah => (
                                <tr key={halaqah.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {halaqah.name}
                                    </th>
                                    <td className="px-6 py-4">{halaqah.studentCount}</td>
                                    <td className="px-6 py-4">
                                        {halaqah.teacherIds.map(id => <div key={id}>{getTeacherName(id)}</div>)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleOpenEditModal(halaqah)} className="p-2 text-yellow-500 hover:text-yellow-700">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onDeleteHalaqah(selectedClassId, halaqah.id)} className="p-2 text-red-500 hover:text-red-700">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                             {!selectedClass?.halaqahs.length && (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">
                                        Belum ada data halaqah untuk kelas ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

             <HalaqahFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                halaqahData={editingHalaqah}
                teachers={teachers}
            />
        </>
    );
};

export default HalaqahManagement;