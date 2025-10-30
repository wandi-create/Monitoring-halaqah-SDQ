import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { SchoolClass, Halaqah, Report, User } from './types';

import Sidebar from './components/Sidebar';
import MonitoringDashboard from './components/MonitoringDashboard';
import ClassManagement from './components/ClassManagement';
import HalaqahManagement from './components/HalaqahManagement';
import BulkInput from './components/BulkInput';
import ResumeLaporan from './components/ResumeLaporan';
import TeacherManagement from './components/TeacherManagement';
import TeacherDashboard from './components/TeacherDashboard';
import Login from './components/Login';
import { MenuIcon } from './components/Icons';
import Loader from './components/Loader';

type View = 'Dashboard Guru' | 'Monitoring' | 'Resume Laporan' | 'Input Laporan' | 'Manajemen Kelas' | 'Manajemen Halaqah' | 'Manajemen Guru';

const App: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
        const storedUser = sessionStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Gagal memuat user dari session storage", error);
        return null;
    }
  });

  const [activeView, setActiveView] = useState<View>('Monitoring');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase.from('guru').select('*');
      if (usersError) throw usersError;
      setUsers(usersData as User[]);

      const { data: classesData, error: classesError } = await supabase
        .from('kelas')
        .select(`*, halaqah(*, laporan(*))`)
        .order('name', { ascending: true });
        
      if (classesError) throw classesError;
      
      const formattedClasses = classesData.map(c => ({
          ...c,
          halaqah: (c.halaqah || []).map(h => ({
              ...h,
              teacher_ids: Array.isArray(h.teacher_ids) ? h.teacher_ids : [],
              laporan: h.laporan || []
          }))
      }));
      
      setClasses(formattedClasses as unknown as SchoolClass[]);

    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal memuat data dari database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [currentUser, fetchData]);


  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      setActiveView(currentUser.role === 'Guru' ? 'Dashboard Guru' : 'Monitoring');
    } else {
      sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  // Class CRUD
  const handleAddClass = async (newClass: Omit<SchoolClass, 'id' | 'halaqah'>) => {
    setIsMutating(true);
    const { error } = await supabase.from('kelas').insert({ 
      name: newClass.name, 
      short_name: newClass.short_name, 
      gender: newClass.gender 
    });
    if (error) alert(error.message);
    await fetchData();
    setIsMutating(false);
  };
  
  const handleUpdateClass = async (updatedClass: SchoolClass) => {
    setIsMutating(true);
    const { error } = await supabase.from('kelas').update({ 
      name: updatedClass.name, 
      short_name: updatedClass.short_name, 
      gender: updatedClass.gender 
    }).eq('id', updatedClass.id);
    if (error) alert(error.message);
    await fetchData();
    setIsMutating(false);
  };

  const handleDeleteClass = async (classId: string) => {
    if(window.confirm('Apakah Anda yakin ingin menghapus kelas ini? Semua data halaqah di dalamnya juga akan terhapus.')){
        setIsMutating(true);
        const { error } = await supabase.from('kelas').delete().eq('id', classId);
        if (error) alert(error.message);
        await fetchData();
        setIsMutating(false);
    }
  };

  // Halaqah CRUD
  const handleAddHalaqah = async (classId: string, newHalaqah: Omit<Halaqah, 'id' | 'laporan'>) => {
    setIsMutating(true);
    const { error } = await supabase.from('halaqah').insert({
        class_id: classId,
        name: newHalaqah.name,
        teacher_ids: newHalaqah.teacher_ids,
        student_count: newHalaqah.student_count
    });
    if (error) alert(error.message);
    await fetchData();
    setIsMutating(false);
  };

  const handleUpdateHalaqah = async (classId: string, updatedHalaqah: Halaqah) => {
     setIsMutating(true);
     const { error } = await supabase.from('halaqah').update({
        name: updatedHalaqah.name,
        teacher_ids: updatedHalaqah.teacher_ids,
        student_count: updatedHalaqah.student_count
     }).eq('id', updatedHalaqah.id);
     if (error) alert(error.message);
     await fetchData();
     setIsMutating(false);
  };
  
  const handleDeleteHalaqah = async (classId: string, halaqahId: string) => {
    if(window.confirm('Apakah Anda yakin ingin menghapus halaqah ini?')){
      setIsMutating(true);
      const { error } = await supabase.from('halaqah').delete().eq('id', halaqahId);
      if (error) alert(error.message);
      await fetchData();
      setIsMutating(false);
    }
  };

  // User/Teacher CRUD
  const handleAddUser = async (newUser: Omit<User, 'id'>) => {
    setIsMutating(true);
    // In a real app, you should use Supabase Auth to create users securely.
    const { error } = await supabase.from('guru').insert(newUser);
    if (error) alert(error.message);
    await fetchData();
    setIsMutating(false);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setIsMutating(true);
    const { id, ...updateData } = updatedUser;
    const { error } = await supabase.from('guru').update(updateData).eq('id', id);
    if (error) alert(error.message);
    await fetchData();
    setIsMutating(false);
  };
  
  const handleDeleteUser = async (userId: string) => {
    setIsMutating(true);
    const isTeacherAssigned = classes.some(c => 
        c.halaqah.some(h => h.teacher_ids.includes(userId))
    );

    if (isTeacherAssigned) {
        alert('Tidak dapat menghapus user ini karena masih terdaftar sebagai pengajar di salah satu halaqah.');
        setIsMutating(false);
        return;
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus data user ini?')) {
        const { error } = await supabase.from('guru').delete().eq('id', userId);
        if (error) alert(error.message);
        await fetchData();
    }
    setIsMutating(false);
  };

  // Report CRUD
  const handleBulkUpdateReports = async (reportsToUpdate: Record<string, Report>) => {
    setIsMutating(true);
    const upsertData = Object.entries(reportsToUpdate).map(([halaqahId, report]) => ({
      halaqah_id: halaqahId,
      year: report.year,
      month: report.month,
      main_insight: report.main_insight,
      student_segmentation: report.student_segmentation,
      identified_challenges: report.identified_challenges,
      follow_up_recommendations: report.follow_up_recommendations,
      next_month_target: report.next_month_target,
      is_read: report.is_read,
      follow_up_status: report.follow_up_status,
      teacher_notes: report.teacher_notes,
    }));

    const { error } = await supabase.from('laporan').upsert(upsertData, {
        onConflict: 'halaqah_id, year, month',
    });
    
    if (error) {
        alert("Gagal menyimpan laporan: " + error.message);
    }
    await fetchData();
    setIsMutating(false);
};

const handleUpdateReport = async (updatedReport: Report) => {
    setIsMutating(true);
    const { id, ...reportData } = updatedReport;
    const dbReport = {
        id: id,
        halaqah_id: reportData.halaqah_id,
        month: reportData.month,
        year: reportData.year,
        main_insight: reportData.main_insight,
        student_segmentation: reportData.student_segmentation,
        identified_challenges: reportData.identified_challenges,
        follow_up_recommendations: reportData.follow_up_recommendations,
        next_month_target: reportData.next_month_target,
        is_read: reportData.is_read,
        follow_up_status: reportData.follow_up_status,
        teacher_notes: reportData.teacher_notes,
    };

    const { error } = await supabase.from('laporan').upsert(dbReport, {
        onConflict: 'halaqah_id, year, month',
    });

    if (error) {
        alert("Gagal memperbarui laporan: " + error.message);
    }
    await fetchData();
    setIsMutating(false);
};


  const filteredClasses = useMemo(() => {
    if (!currentUser || currentUser.role === 'Koordinator') {
        return classes;
    }
    // Filter for 'Guru'
    return classes.map(c => ({
        ...c,
        halaqah: c.halaqah.filter(h => h.teacher_ids.includes(currentUser.id))
    })).filter(c => c.halaqah.length > 0);
  }, [classes, currentUser]);


  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }
  
  const renderContent = () => {
    if (isLoading) return <Loader />;

    switch(activeView) {
      case 'Dashboard Guru':
        return <TeacherDashboard 
                  currentUser={currentUser}
                  classes={filteredClasses}
                  teachers={users}
                  onUpdateReport={handleUpdateReport}
                />;
      case 'Manajemen Guru':
        return <TeacherManagement
                teachers={users}
                classes={classes}
                onAddTeacher={handleAddUser}
                onUpdateTeacher={handleUpdateUser}
                onDeleteTeacher={handleDeleteUser}
            />;
      case 'Manajemen Kelas':
        return <ClassManagement 
                classes={classes} 
                onAddClass={handleAddClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
            />;
      case 'Manajemen Halaqah':
        return <HalaqahManagement
                classes={classes}
                teachers={users}
                onAddHalaqah={handleAddHalaqah}
                onUpdateHalaqah={handleUpdateHalaqah}
                onDeleteHalaqah={handleDeleteHalaqah}
            />;
      case 'Input Laporan':
        return <BulkInput
                  classes={filteredClasses}
                  onBulkUpdate={handleBulkUpdateReports}
                />;
      case 'Resume Laporan':
        return <ResumeLaporan 
            classes={filteredClasses} 
            teachers={users} 
            currentUser={currentUser}
            onUpdateReport={handleUpdateReport}
        />;
      case 'Monitoring':
      default:
        return <MonitoringDashboard 
                    classes={filteredClasses} 
                    teachers={users}
                    currentUser={currentUser}
                    onUpdateReport={handleUpdateReport}
                />;
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {isMutating && <Loader />}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        user={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 sm:ml-72 p-6 lg:p-8 overflow-y-auto">
         <div className="flex items-center mb-4 sm:hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
              aria-label="Open menu"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
         </div>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;