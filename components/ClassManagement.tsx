import React, { useState, useEffect } from 'react';
import { SchoolClass } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, CloseIcon, SaveIcon, ArrowUturnLeftIcon } from './Icons';

interface ClassManagementProps {
  classes: SchoolClass[];
  onAddClass: (newClass: Omit<SchoolClass, 'id' | 'halaqahs'>) => void;
  onUpdateClass: (updatedClass: SchoolClass) => void;
  onDeleteClass: (classId: string) => void;
}

const ClassFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (classData: Omit<SchoolClass, 'id' | 'halaqahs'> | SchoolClass) => void;
    classData: Omit<SchoolClass, 'id' | 'halaqahs'> | SchoolClass | null;
}> = ({ isOpen, onClose, onSave, classData }) => {
    const [name, setName] = useState('');
    const [shortName, setShortName] = useState('');
    const [gender, setGender] = useState<'Ikhwan' | 'Akhwat'>('Ikhwan');
    
    const isEditMode = classData && 'id' in classData;

    useEffect(() => {
        if (classData) {
            setName(classData.name);
            setShortName(classData.shortName);
            setGender(classData.gender);
        } else {
            setName('');
            setShortName('');
            setGender('Ikhwan');
        }
    }, [classData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = { name, shortName, gender };
        if(isEditMode) {
            onSave({ ...classData, ...dataToSave });
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
                    <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-500 hover:text-gray-800" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Kelas Lengkap</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
                        </div>
                        <div>
                            <label htmlFor="shortName" className="block text-sm font-medium text-gray-700">Nama Pendek / Keterangan</label>
                            <input type="text" id="shortName" value={shortName} onChange={e => setShortName(e.target.value)} placeholder="Contoh: Ikhwan • Kelas 1" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Gender</label>
                             <div className="mt-2 flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input type="radio" className="form-radio text-teal-600" value="Ikhwan" checked={gender === 'Ikhwan'} onChange={() => setGender('Ikhwan')} />
                                    <span className="ml-2">Ikhwan</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input type="radio" className="form-radio text-pink-600" value="Akhwat" checked={gender === 'Akhwat'} onChange={() => setGender('Akhwat')} />
                                    <span className="ml-2">Akhwat</span>
                                </label>
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

const ClassManagement: React.FC<ClassManagementProps> = ({ classes, onAddClass, onUpdateClass, onDeleteClass }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

    const handleOpenAddModal = () => {
        setEditingClass(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (schoolClass: SchoolClass) => {
        setEditingClass(schoolClass);
        setIsModalOpen(true);
    };

    const handleSave = (classData: Omit<SchoolClass, 'id' | 'halaqahs'> | SchoolClass) => {
        if ('id' in classData) {
            onUpdateClass(classData);
        } else {
            onAddClass(classData);
        }
    };

  return (
    <>
      <header className="mb-6 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-teal-600">Manajemen Kelas</h1>
            <p className="text-gray-500 mt-1">Tambah, edit, atau hapus data kelas</p>
        </div>
        <button onClick={handleOpenAddModal} className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-all flex items-center gap-2 shadow-md">
            <PlusIcon className="w-5 h-5"/>
            Tambah Kelas Baru
        </button>
      </header>
      
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200/80">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Nama Kelas</th>
                        <th scope="col" className="px-6 py-3">Gender</th>
                        <th scope="col" className="px-6 py-3">Jumlah Halaqah</th>
                        <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {classes.map(schoolClass => (
                        <tr key={schoolClass.id} className="bg-white border-b hover:bg-gray-50">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                {schoolClass.name}
                                <p className="text-xs text-gray-500 font-normal">{schoolClass.shortName}</p>
                            </th>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${schoolClass.gender === 'Ikhwan' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                                    {schoolClass.gender}
                                </span>
                            </td>
                            <td className="px-6 py-4">{schoolClass.halaqahs.length}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => handleOpenEditModal(schoolClass)} className="p-2 text-yellow-500 hover:text-yellow-700">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => onDeleteClass(schoolClass.id)} className="p-2 text-red-500 hover:text-red-700">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      <ClassFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        classData={editingClass}
      />
    </>
  );
};

export default ClassManagement;
