import React, { useState, useEffect } from 'react';
import { SchoolClass, Halaqah, User } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, CloseIcon, SaveIcon, ArrowUturnLeftIcon } from './Icons';

interface HalaqahManagementProps {
  classes: SchoolClass[];
  teachers: User[];
  onAddHalaqah: (classId: string, newHalaqah: Omit<Halaqah, 'id'|'laporan'>) => Promise<void>;
  onUpdateHalaqah: (classId: string, updatedHalaqah: Halaqah) => Promise<void>;
  onDeleteHalaqah: (classId: string, halaqahId: string) => Promise<void>;
}

const HalaqahFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (classId: string, halaqahData: Omit<Halaqah, 'id'|'laporan'> | Halaqah) => void;
    editingData: { halaqah: Halaqah | null, classId: string | null };
    teachers: User[];
    classes: SchoolClass[];
}> = ({ isOpen, onClose, onSave, editingData, teachers, classes }) => {
    const [classId, setClassId] = useState<string>('');
    const [name, setName] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
    const [studentCount, setStudentCount] = useState(0);

    const isEditMode = !!editingData.halaqah;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && editingData.halaqah) {
                setClassId(editingData.classId || '');
                setName(editingData.halaqah.name);
                setSelectedTeacherId(editingData.halaqah.teacher_id || '');
                setStudentCount(editingData.halaqah.student_count || 0);
            } else {
                setClassId(classes[0]?.id || '');
                setName('');
                setSelectedTeacherId('');
                setStudentCount(0);
            }
        }
    }, [isOpen, editingData, isEditMode, classes]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!classId) {
            alert('Silakan pilih kelas terlebih dahulu.');
            return;
        }
        if (!selectedTeacherId) {
            alert('Silakan pilih pengajar terlebih dahulu.');
            return;
        }

        const dataToSave = { name, teacher_id: selectedTeacherId, student_count: studentCount };
        if (isEditMode && editingData.halaqah) {
            onSave(classId, { ...editingData.halaqah, ...dataToSave, laporan: editingData.halaqah.laporan || [] });
        } else {
            onSave(classId, dataToSave as any);
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
                            <label htmlFor="classId" className="block text-sm font-medium text-gray-700">Kelas</label>
                            <select
                                id="classId"
                                value={classId}
                                onChange={e => setClassId(e.target.value)}
                                required
                                disabled={isEditMode}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100"
                            >
                                <option value="" disabled>-- Pilih Kelas --</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Halaqah</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="Contoh: Halaqah 1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
                        </div>
                         <div>
                            <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700">Jumlah Murid</label>
                            <input type="number" id="studentCount" value={studentCount} onChange={e => setStudentCount(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
                        </div>
                        <div>
                            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">Pilih Pengajar</label>
                            <select
                                id="teacherId"
                                value={selectedTeacherId}
                                onChange={e => setSelectedTeacherId(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="" disabled>-- Pilih Pengajar --</option>
                                {teachers.filter(t => t.role === 'Guru').map(teacher => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name}
                                    </option>
                                ))}
                            </select>
                            {teachers.filter(t => t.role === 'Guru').length === 0 && <p className="mt-2 text-sm text-gray-500">Tidak ada data guru. Silakan tambah di Manajemen Guru.</p>}
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<{ halaqah: Halaqah | null, classId: string | null }>({ halaqah: null, classId: null });
    
    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'N/A';

    const handleOpenAddModal = () => {
        setEditingData({ halaqah: null, classId: null });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (classId: string, halaqah: Halaqah) => {
        setEditingData({ halaqah, classId });
        setIsModalOpen(true);
    };

    const handleSave = (classId: string, halaqahData: Omit<Halaqah, 'id'|'laporan'> | Halaqah) => {
        if ('id' in halaqahData) {
            onUpdateHalaqah(classId, halaqahData);
        } else {
            onAddHalaqah(classId, halaqahData);
        }
    };

    return (
        <>
            <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-teal-600">Manajemen Halaqah</h1>
                    <p className="text-gray-500 mt-1">Tambah, edit, atau hapus data halaqah</p>
                </div>
                <button 
                    onClick={handleOpenAddModal} 
                    className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-all flex items-center gap-2 shadow-md"
                >
                    <PlusIcon className="w-5 h-5"/>
                    <span>Tambah Halaqah Baru</span>
                </button>
            </header>

            <div className="space-y-6">
                {classes.map(schoolClass => (
                    <div key={schoolClass.id} className="bg-white rounded-xl shadow-md p-5 border border-gray-200/80">
                         <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">{schoolClass.name}</h2>
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
                                    {schoolClass.halaqah.map(halaqah => (
                                        <tr key={halaqah.id} className="bg-white border-b hover:bg-gray-50">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                {halaqah.name}
                                            </th>
                                            <td className="px-6 py-4">{halaqah.student_count}</td>
                                            <td className="px-6 py-4">
                                                {getTeacherName(halaqah.teacher_id)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleOpenEditModal(schoolClass.id, halaqah)} className="p-2 text-yellow-500 hover:text-yellow-700">
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => onDeleteHalaqah(schoolClass.id, halaqah.id)} className="p-2 text-red-500 hover:text-red-700">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                     {!schoolClass.halaqah.length && (
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
                ))}
            </div>

             <HalaqahFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                editingData={editingData}
                teachers={teachers}
                classes={classes}
            />
        </>
    );
};

export default HalaqahManagement;