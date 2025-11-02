
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
      // Step 1: Fetch all users and classes/halaqahs as a base.
      // Users are needed for coordinators to manage teachers.
      const { data: usersData, error: usersError } = await supabase.from('guru').select('*');
      if (usersError) throw usersError;
      setUsers(usersData as User[]);
      
      if (currentUser) {
        const refreshedUser = (usersData as User[]).find(u => u.id === currentUser.id);
        if (refreshedUser && JSON.stringify(refreshedUser) !== JSON.stringify(currentUser)) {
          setCurrentUser(refreshedUser);
        }
      }

      const { data: classesData, error: classesError } = await supabase
        .from('kelas')
        .select(`
          *,
          halaqah (
            *,
            guru(*)
          )
        `)
        .order('name', { ascending: true });
        
      if (classesError) throw classesError;

      // Step 2: Fetch reports separately. Filter at the database level for 'Guru'.
      let reportsData: any[] = [];
      if (currentUser) {
        if (currentUser.role === 'Guru') {
          if (currentUser.id) {
            // FIXED: The user ID is a string (UUID) and must not be converted to a Number.
            // This ensures the database filter works correctly.
            const { data, error } = await supabase
              .from('laporan')
              .select('*')
              .eq('teacher_id', currentUser.id); // Use string ID directly
            if (error) throw error;
            reportsData = data || [];
          }
        } else { // 'Koordinator' gets all reports
          const { data, error } = await supabase.from('laporan').select('*');
          if (error) throw error;
          reportsData = data || [];
        }
      }
      
      let processedData = classesData;
      // Step 3: Apply application-side filtering for 'Guru' role.
      if (currentUser && currentUser.role === 'Guru') {
        const currentUserId = currentUser.id;
        processedData = classesData
          .map(schoolClass => {
            // Filter halaqahs to only include those belonging to the current teacher
            const halaqahsForTeacher = (schoolClass.halaqah || []).filter(
              (halaqah: any) => halaqah.teacher_id === currentUserId
            );
            return { ...schoolClass, halaqah: halaqahsForTeacher };
          })
          // Filter classes to only include those that still have halaqahs after filtering
          .filter(schoolClass => schoolClass.halaqah.length > 0);
      }
      
      // Step 4: Manually merge the correctly fetched reports into the (now filtered) halaqahs.
      const classesWithReports = processedData.map(c => ({
        ...c,
        halaqah: (c.halaqah || []).map((h: any) => ({
          ...h,
          laporan: reportsData.filter(r => r.halaqah_id === h.id)
        }))
      }));
      
      // Step 5: Format the final data structure for the application state.
      const formattedClasses = classesWithReports.map(c => ({
          ...c,
          halaqah: (c.halaqah || []).map((h: any) => {
            const reportsArray = Array.isArray(h.laporan) ? h.laporan : (h.laporan ? [h.laporan] : []);
            const mappedLaporan = reportsArray.map((r: any): Report => ({
              id: r.id,
              halaqah_id: r.halaqah_id,
              month: r.month || 0,
              year: r.year || 0,
              main_insight: r.main_insight || [],
              student_segmentation: r.student_segmentation || [],
              identified_challenges: r.identified_challenges || [],
              follow_up_recommendations: r.follow_up_recommendations || [],
              next_month_target: r.next_month_target || [],
              coordinator_notes: r.coordinator_notes || [],
              average_attendance: r.average_attendance ?? 0,
              fluent_students: r.fluent_students ?? 0,
              students_needing_attention: r.students_needing_attention ?? 0,
              is_read: r.is_read || false,
              follow_up_status: r.follow_up_status || 'Belum Dimulai',
              teacher_notes: r.teacher_notes || '',
            }));

            return {
              ...h,
              laporan: mappedLaporan,
            };
          }),
      }));
      
      setClasses(formattedClasses as unknown as SchoolClass[]);

    } catch (error: any) {
      console.error("Error fetching data:", error);
      alert(`Gagal memuat data dari database: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);


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
        teacher_id: newHalaqah.teacher_id,
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
        teacher_id: updatedHalaqah.teacher_id,
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
        c.halaqah.some(h => h.teacher_id === userId)
    );

    if (isTeacherAssigned) {
        alert('Tidak dapat menghapus user ini karena masih terdaftar sebagai pengajar di salah satu halaqah.');
        setIsMutating(false);
        return;
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus data user ini?')) {
        const { error } = await supabase.from('guru').delete().eq('id', userId);
        if (error) {
            console.error('Error deleting user:', error);
            alert(`Gagal menghapus user: ${error.message}`);
        }
        await fetchData();
    }
    setIsMutating(false);
  };

  // Report CRUD
  const handleUpdateReport = async (report: Report) => {
    setIsMutating(true);
    const { id, ...updateData } = report;

    const allHalaqahs = classes.flatMap(c => c.halaqah);
    const targetHalaqah = allHalaqahs.find(h => h.id === report.halaqah_id);

    if (!targetHalaqah) {
        // This case might happen if data is stale, fetchData will resolve it
        console.warn('Could not find halaqah for report in current state, fetching latest data.');
    }
    
    // Always attach teacher_id from the halaqah to the report payload for consistency
    const payload = {
        ...updateData,
        teacher_id: targetHalaqah?.teacher_id || currentUser?.id,
    };

    try {
        const { error } = await supabase
            .from('laporan')
            .upsert(payload, { onConflict: 'halaqah_id,month,year' }); // Adjusted onConflict

        if (error) throw error;
        
    } catch (error: any) {
        console.error("Error saving report:", error);
        alert(`Gagal menyimpan laporan: ${error.message}`);
    } finally {
        await fetchData();
        setIsMutating(false);
    }
  };


  if (isLoading && !currentUser) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader/>
        </div>
    )
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {(isLoading || isMutating) && <Loader />}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        user={currentUser}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col sm:ml-72">
        <header className="sm:hidden p-4 bg-white shadow-md flex justify-between items-center z-20 sticky top-0">
          <h1 className="text-xl font-bold text-teal-600">{activeView}</h1>
          <button onClick={() => setIsSidebarOpen(true)}>
            <MenuIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          {activeView === 'Dashboard Guru' && <TeacherDashboard currentUser={currentUser} classes={classes} onUpdateReport={handleUpdateReport} />}
          {activeView === 'Monitoring' && <MonitoringDashboard currentUser={currentUser} classes={classes} onUpdateReport={handleUpdateReport} />}
          {activeView === 'Resume Laporan' && <ResumeLaporan currentUser={currentUser} classes={classes} onUpdateReport={handleUpdateReport} />}
          {activeView === 'Input Laporan' && <BulkInput classes={classes} onUpdateReport={handleUpdateReport} />}
          {activeView === 'Manajemen Kelas' && <ClassManagement classes={classes} onAddClass={handleAddClass} onUpdateClass={handleUpdateClass} onDeleteClass={handleDeleteClass} />}
          {activeView === 'Manajemen Halaqah' && <HalaqahManagement classes={classes} teachers={users} onAddHalaqah={handleAddHalaqah} onUpdateHalaqah={handleUpdateHalaqah} onDeleteHalaqah={handleDeleteHalaqah} />}
          {activeView === 'Manajemen Guru' && <TeacherManagement teachers={users} classes={classes} onAddTeacher={handleAddUser} onUpdateTeacher={handleUpdateUser} onDeleteTeacher={handleDeleteUser} />}
        </main>
      </div>
    </div>
  );
};

export default App;
