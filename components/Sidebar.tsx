import React from 'react';
import { User } from '../types';
import { BookOpenIcon, ReportIcon, BulkInputIcon, ClassManagementIcon, HalaqahManagementIcon, CloseIcon, UsersIcon, CheckCircleIcon } from './Icons';

type View = 'Dashboard Guru' | 'Monitoring' | 'Resume Laporan' | 'Input Laporan' | 'Manajemen Kelas' | 'Manajemen Halaqah' | 'Manajemen Guru';

interface NavItemProps {
  id: View;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  active: boolean;
  onClick: (view: View) => void;
  disabled?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ id, icon, title, subtitle, active, onClick, disabled }) => (
  <button 
     onClick={() => !disabled && onClick(id)} 
     disabled={disabled}
     className={`flex items-center p-3 mx-4 rounded-lg transition-all duration-200 w-[calc(100%-2rem)] text-left ${
        active ? 'text-white' : 'text-gray-300 hover:bg-white/10'
     } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
     style={active ? { background: 'linear-gradient(90deg, #F97794 0%, #623AA2 100%)' } : {}}
  >
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">{icon}</div>
    <div className="ml-3">
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs opacity-80">{subtitle}</p>
    </div>
    {active && <div className="w-2 h-2 bg-white rounded-full ml-auto mr-2"></div>}
  </button>
);

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: User | null;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen, user, onLogout }) => {
  const allNavItems: { id: View; icon: React.ReactNode; title: string; subtitle: string; roles: ('Koordinator' | 'Guru')[]; }[] = [
    { id: 'Dashboard Guru', icon: <CheckCircleIcon className="w-5 h-5"/>, title: "Dashboard", subtitle: "Tugas & Laporan Anda", roles: ['Guru'] },
    { id: 'Monitoring', icon: <BookOpenIcon className="w-5 h-5"/>, title: "Monitoring", subtitle: "Lihat monitoring halaqah", roles: ['Koordinator'] },
    { id: 'Resume Laporan', icon: <ReportIcon className="w-5 h-5"/>, title: "Resume Laporan", subtitle: "Ringkasan laporan bulanan", roles: ['Koordinator', 'Guru'] },
    { id: 'Input Laporan', icon: <BulkInputIcon className="w-5 h-5"/>, title: "Input Laporan", subtitle: "Input laporan massal", roles: ['Koordinator'] },
    { id: 'Manajemen Guru', icon: <UsersIcon className="w-5 h-5"/>, title: "Manajemen Guru", subtitle: "Kelola data pengajar", roles: ['Koordinator'] },
    { id: 'Manajemen Kelas', icon: <ClassManagementIcon className="w-5 h-5"/>, title: "Manajemen Kelas", subtitle: "Kelola data kelas", roles: ['Koordinator'] },
    { id: 'Manajemen Halaqah', icon: <HalaqahManagementIcon className="w-5 h-5"/>, title: "Manajemen Halaqah", subtitle: "Kelola data halaqah", roles: ['Koordinator'] },
  ];
  
  const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 sm:hidden" onClick={() => setIsOpen(false)}></div>}
      <aside 
        className={`w-72 text-white flex-col h-screen fixed sm:flex flex-shrink-0 z-40 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0`}
        style={{background: 'linear-gradient(180deg, #4A2E72 0%, #2E1A47 100%)'}}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-bold tracking-wider" style={{color: '#E879F9'}}>Monitoring Halaqah</h1>
            <p className="text-sm opacity-80">SDQ Mutiara Sunnah</p>
          </div>
          <button className="sm:hidden" onClick={() => setIsOpen(false)}>
            <CloseIcon className="w-6 h-6 opacity-70 cursor-pointer hover:opacity-100" />
          </button>
        </div>

        <nav className="flex-1 py-8 space-y-2">
          {navItems.map(item => (
              <NavItem 
                  key={item.id} 
                  id={item.id}
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  active={activeView === item.id}
                  onClick={(view) => {
                    setActiveView(view);
                    setIsOpen(false); // Close sidebar on mobile after navigation
                  }}
              />
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="text-sm">
            <p className="font-semibold">{user?.name}</p>
            <p className="opacity-70">{user?.role}</p>
          </div>
           <button 
             onClick={onLogout}
             className="w-full mt-3 text-left p-2 rounded-md text-sm font-semibold text-red-300 hover:bg-white/10"
           >
             Logout
           </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;