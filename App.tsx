import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_CLASSES, INITIAL_USERS } from './constants';
import { SchoolClass, Halaqah, Report, User } from './types';
import Sidebar from './components/Sidebar';
import MonitoringDashboard from './components/MonitoringDashboard';
import ClassManagement from './components/ClassManagement';
import HalaqahManagement from './components/HalaqahManagement';
import BulkInput from './components/BulkInput';
import ResumeLaporan from './components/ResumeLaporan';
import TeacherManagement from './components/TeacherManagement';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import { MenuIcon } from './components/Icons';

type View = 'Dashboard Guru' | 'Monitoring' | 'Resume Laporan' | 'Input Laporan' | 'Manajemen Kelas' | 'Manajemen Halaqah' | 'Manajemen Guru';

type AppData = {
  classes: SchoolClass[];
  users: User[];
};

const App: React.FC = () => {
  const [appData, setAppData] = useState<AppData>(() => {
    try {
      const savedData = localStorage.getItem('halaqahData');
       if (!savedData) {
            return { classes: INITIAL_CLASSES, users: INITIAL_USERS };
        }
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData) || !parsedData.users || !parsedData.classes) {
            // Old format or corrupted data, start fresh
            return { classes: INITIAL_CLASSES, users: INITIAL_USERS };
        }
        // Ensure users have roles
        parsedData.users = parsedData.users.map((u: User) => ({ ...u, role: u.role || 'Guru' }));
        return parsedData;
    } catch (error) {
      console.error("Could not parse localStorage data:", error);
      return { classes: INITIAL_CLASSES, users: INITIAL_USERS };
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
        const savedUser = sessionStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    } catch {
        return null;
    }
  });

  const [activeView, setActiveView] = useState<View>('Monitoring');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('halaqahData', JSON.stringify(appData));
  }, [appData]);

  useEffect(() => {
    if (currentUser) {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        // Set default view based on role
        setActiveView(currentUser.role === 'Guru' ? 'Dashboard Guru' : 'Monitoring');
    } else {
        sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const setClasses = (updater: (prev: SchoolClass[]) => SchoolClass[]) => {
    setAppData(prev => ({ ...prev, classes: updater(prev.classes) }));
  };

  const setUsers = (updater: (prev: User[]) => User[]) => {
    setAppData(prev => ({ ...prev, users: updater(prev.users) }));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveView(user.role === 'Guru' ? 'Dashboard Guru' : 'Monitoring');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  // Class CRUD
  const handleAddClass = (newClass: Omit<SchoolClass, 'id' | 'halaqahs'>) => {
    setClasses(prev => [...prev, { ...newClass, id: `c-${Date.now()}`, halaqahs: [] }]);
  };
  
  const handleUpdateClass = (updatedClass: SchoolClass) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const handleDeleteClass = (classId: string) => {
    if(window.confirm('Apakah Anda yakin ingin menghapus kelas ini? Semua data halaqah di dalamnya juga akan terhapus.')){
        setClasses(prev => prev.filter(c => c.id !== classId));
    }
  };

  // Halaqah CRUD
  const handleAddHalaqah = (classId: string, newHalaqah: Omit<Halaqah, 'id' | 'reports'>) => {
    const newHalaqahWithId: Halaqah = { ...newHalaqah, id: `h-${Date.now()}`, reports: [] };
    setClasses(prev => prev.map(c => 
        c.id === classId 
        ? { ...c, halaqahs: [...c.halaqahs, newHalaqahWithId] } 
        : c
    ));
  };

  const handleUpdateHalaqah = (classId: string, updatedHalaqah: Halaqah) => {
     setClasses(prev => prev.map(c => 
        c.id === classId 
        ? { ...c, halaqahs: c.halaqahs.map(h => h.id === updatedHalaqah.id ? updatedHalaqah : h) }
        : c
    ));
  };
  
  const handleDeleteHalaqah = (classId: string, halaqahId: string) => {
    if(window.confirm('Apakah Anda yakin ingin menghapus halaqah ini?')){
      setClasses(prev => prev.map(c => 
          c.id === classId 
          ? { ...c, halaqahs: c.halaqahs.filter(h => h.id !== halaqahId) }
          : c
      ));
    }
  };

  // User/Teacher CRUD
  const handleAddUser = (newUser: Omit<User, 'id'>) => {
    setUsers(prev => [...prev, { ...newUser, id: `t-${Date.now()}` }]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(t => t.id === updatedUser.id ? updatedUser : t));
  };
  
  const handleDeleteUser = (userId: string) => {
    const isTeacherAssigned = appData.classes.some(c => 
        c.halaqahs.some(h => h.teacherIds.includes(userId))
    );

    if (isTeacherAssigned) {
        alert('Tidak dapat menghapus user ini karena masih terdaftar sebagai pengajar di salah satu halaqah.');
        return;
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus data user ini?')) {
        setUsers(prev => prev.filter(t => t.id !== userId));
    }
  };

  // Report CRUD
  const handleBulkUpdateReports = (reportsToUpdate: Record<string, Report>) => {
    setClasses(prevClasses => {
        const newClasses = JSON.parse(JSON.stringify(prevClasses));

        for (const classItem of newClasses) {
            for (const halaqah of classItem.halaqahs) {
                if (reportsToUpdate[halaqah.id]) {
                    const updatedReport = reportsToUpdate[halaqah.id];
                    const reportIndex = halaqah.reports.findIndex((r: Report) => r.id === updatedReport.id);

                    if (reportIndex !== -1) {
                        halaqah.reports[reportIndex] = { ...halaqah.reports[reportIndex], ...updatedReport };
                    } else {
                        halaqah.reports.push(updatedReport);
                    }
                }
            }
        }
        return newClasses;
    });
};

const handleUpdateReport = (updatedReport: Report) => {
    setClasses(prevClasses => {
        const newClasses = JSON.parse(JSON.stringify(prevClasses));
        let found = false;
        for (const classItem of newClasses) {
            for (const halaqah of classItem.halaqahs) {
                const reportIndex = halaqah.reports.findIndex((r: Report) => r.id === updatedReport.id);
                if (reportIndex !== -1) {
                    const originalHalaqahReport = halaqah.reports[reportIndex];
                    const fullUpdatedReport = { ...originalHalaqahReport, ...updatedReport };
                    halaqah.reports[reportIndex] = fullUpdatedReport;

                    found = true;
                    break;
                }
            }
            if(found) break;
        }
        return newClasses;
    });
};


  const filteredClasses = useMemo(() => {
    if (!currentUser || currentUser.role === 'Koordinator') {
        return appData.classes;
    }
    // Filter for 'Guru'
    return appData.classes.map(c => ({
        ...c,
        halaqahs: c.halaqahs.filter(h => h.teacherIds.includes(currentUser.id))
    })).filter(c => c.halaqahs.length > 0);
  }, [appData.classes, currentUser]);


  if (!currentUser) {
    return <Login users={appData.users} onLogin={handleLogin} />;
  }
  
  const renderContent = () => {
    switch(activeView) {
      case 'Dashboard Guru':
        return <TeacherDashboard 
                  currentUser={currentUser}
                  classes={filteredClasses}
                  teachers={appData.users}
                  onUpdateReportStatus={handleUpdateReport}
                />;
      case 'Manajemen Guru':
        return <TeacherManagement
                teachers={appData.users}
                classes={appData.classes}
                onAddTeacher={handleAddUser}
                onUpdateTeacher={handleUpdateUser}
                onDeleteTeacher={handleDeleteUser}
            />;
      case 'Manajemen Kelas':
        return <ClassManagement 
                classes={appData.classes} 
                onAddClass={handleAddClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
            />;
      case 'Manajemen Halaqah':
        return <HalaqahManagement
                classes={appData.classes}
                teachers={appData.users}
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
            teachers={appData.users} 
            currentUser={currentUser}
            onUpdateReport={handleUpdateReport}
        />;
      case 'Monitoring':
      default:
        return <MonitoringDashboard 
                    classes={filteredClasses} 
                    teachers={appData.users}
                    currentUser={currentUser}
                    onUpdateReport={handleUpdateReport}
                />;
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
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