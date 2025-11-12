import React, { useState, useEffect, useMemo } from 'react';
import { User, SchoolClass } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, CloseIcon, SaveIcon, ArrowUturnLeftIcon } from './Icons';

interface TeacherManagementProps {
  teachers: User[];
  classes: SchoolClass[];
  onAddTeacher: (newUser: Omit<User, 'id'>) => Promise<void>;
  onUpdateTeacher: (updatedUser: User) => Promise<void>;
  onDeleteTeacher: (userId: string) => Promise<void>;
  currentUser: User;
}

const TeacherFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (teacherData: Omit<User, 'id'> | User) => void;
    teacherData: Omit<User, 'id'> | User | null;
}> = ({ isOpen, onClose, onSave, teacherData }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'Koordinator' | 'Guru' | 'Kepala Sekolah'>('Guru');
    const [gender, setGender] = useState<'Ikhwan' | 'Akhwat'>('Ikhwan');
    
    const isEditMode = teacherData && 'id' in teacherData;

    useEffect(() => {
        if (teacherData) {
            setName(teacherData.name);
            setEmail(teacherData.email);
            setRole(teacherData.role);
            setGender(teacherData.gender || 'Ikhwan');
            setPassword(''); // Don't pre-fill password for security
        } else {
            setName('');
            setEmail('');
            setPassword('');
            setRole('Guru');
            setGender('Ikhwan');
        }
    }, [teacherData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave: Omit<User, 'id' | 'password'> & {password?: string} = { name, email, role, gender };
        if (password) {
            dataToSave.password = password;
        }

        if(isEditMode) {
            onSave({ ...teacherData, ...dataToSave } as User);
        } else {
            if (!password) {
                alert('Password is required for new users.');
                return;
            }
            onSave(dataToSave as User);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit User' : 'Tambah User Baru'}</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-500 hover:text-gray-800" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (untuk login)</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
                        </div>
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={isEditMode ? "Kosongkan jika tidak ingin mengubah" : ""} required={!isEditMode} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Gender</label>
                             <div className="mt-2 flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input type="radio" className="form-radio text-teal-600" value="Ikhwan" checked={gender === 'Ikhwan'} onChange={() => setGender('Ikhwan')} />
                                    <span className="ml-2">Ikhwan (Laki-laki)</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input type="radio" className="form-radio text-pink-600" value="Akhwat" checked={gender === 'Akhwat'} onChange={() => setGender('Akhwat')} />
                                    <span className="ml-2">Akhwat (Perempuan)</span>
                                </label>
                             </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Role</label>
                             <div className="mt-2 flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input type="radio" className="form-radio text-teal-600" value="Guru" checked={role === 'Guru'} onChange={() => setRole('Guru')} />
                                    <span className="ml-2">Guru</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input type="radio" className="form-radio text-purple-600" value="Koordinator" checked={role === 'Koordinator'} onChange={() => setRole('Koordinator')} />
                                    <span className="ml-2">Koordinator</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input type="radio" className="form-radio text-indigo-600" value="Kepala Sekolah" checked={role === 'Kepala Sekolah'} onChange={() => setRole('Kepala Sekolah')} />
                                    <span className="ml-2">Kepala Sekolah</span>
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

const TeacherManagement: React.FC<TeacherManagementProps> = ({ teachers, classes, onAddTeacher, onUpdateTeacher, onDeleteTeacher, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
    const isReadOnly = currentUser.role === 'Kepala Sekolah';

    const handleOpenAddModal = () => {
        setEditingTeacher(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (teacher: User) => {
        setEditingTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleSave = (teacherData: Omit<User, 'id'> | User) => {
        if ('id' in teacherData) {
            onUpdateTeacher(teacherData);
        } else {
            onAddTeacher(teacherData);
        }
    };
    
    const getHalaqahAssignments = (teacherId: string) => {
        return classes
            .flatMap(c => c.halaqah.map(h => ({ ...h, className: c.short_name })))
            .filter(h => h.teacher_id === teacherId)
            .map(h => `${h.className} • ${h.name}`)
            .join(', ');
    };

    const sortedTeachers = useMemo(() => {
        const roleOrder: Record<User['role'], number> = { 'Kepala Sekolah': 1, 'Koordinator': 2, 'Guru': 3 };

        const teacherClassLevelMap = new Map<string, number>();
        classes.forEach(schoolClass => {
            const match = schoolClass.name.match(/Kelas (\d+)/i);
            const level = match ? parseInt(match[1], 10) : Infinity;

            schoolClass.halaqah.forEach(halaqah => {
                if (halaqah.teacher_id) {
                    const currentTeacherLevel = teacherClassLevelMap.get(halaqah.teacher_id) || Infinity;
                    if (level < currentTeacherLevel) {
                        teacherClassLevelMap.set(halaqah.teacher_id, level);
                    }
                }
            });
        });

        return [...teachers].sort((a, b) => {
            const roleA = roleOrder[a.role] || 99;
            const roleB = roleOrder[b.role] || 99;

            if (roleA !== roleB) {
                return roleA - roleB;
            }

            if (a.role === 'Guru' && b.role === 'Guru') {
                const levelA = teacherClassLevelMap.get(a.id) || Infinity;
                const levelB = teacherClassLevelMap.get(b.id) || Infinity;

                if (levelA !== levelB) {
                    return levelA - levelB;
                }
            }

            return a.name.localeCompare(b.name);
        });
    }, [teachers, classes]);

  return (
    <>
      <header className="mb-6 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-teal-600">Manajemen User</h1>
            <p className="text-gray-500 mt-1">Tambah, edit, atau hapus data user (Guru & Koordinator)</p>
        </div>
        {!isReadOnly && (
            <button onClick={handleOpenAddModal} className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-all flex items-center gap-2 shadow-md">
                <PlusIcon className="w-5 h-5"/>
                Tambah User Baru
            </button>
        )}
      </header>
      
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200/80">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Nama / Email</th>
                        <th scope="col" className="px-6 py-3">Role</th>
                        <th scope="col" className="px-6 py-3">Halaqah Diampu</th>
                        <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedTeachers.map(teacher => (
                        <tr key={teacher.id} className="bg-white border-b hover:bg-gray-50">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                {teacher.name}
                                <p className="text-xs text-gray-500 font-normal">{teacher.email}</p>
                            </th>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 text-xs font-semibold rounded-full ${teacher.role === 'Koordinator' ? 'bg-purple-100 text-purple-800' : teacher.role === 'Kepala Sekolah' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                                    {teacher.role}
                                </span>
                            </td>
                             <td className="px-6 py-4 text-xs">{getHalaqahAssignments(teacher.id) || "-"}</td>
                            <td className="px-6 py-4 text-right">
                                {!isReadOnly && (<>
                                    <button onClick={() => handleOpenEditModal(teacher)} className="p-2 text-yellow-500 hover:text-yellow-700">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => onDeleteTeacher(teacher.id)} className="p-2 text-red-500 hover:text-red-700">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </>)}
                            </td>
                        </tr>
                    ))}
                    {sortedTeachers.length === 0 && (
                        <tr>
                            <td colSpan={4} className="text-center py-8 text-gray-500">
                                Belum ada data user.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <TeacherFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        teacherData={editingTeacher}
      />
    </>
  );
};

export default TeacherManagement;