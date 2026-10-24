import React, { useState } from 'react';
import {
  Home,
  Bot,
  UserCheck,
  HeartHandshake,
  Video,
  Pill,
  FileText,
  Clock,
  ShieldAlert,
  Bell,
  RefreshCw,
  LogOut,
  ChevronRight,
  Shield,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../types/platform.ts';
import { platformStore } from '../services/platformStore.ts';

export type ActiveNavTab =
  | 'dashboard'
  | 'triage'
  | 'doctors'
  | 'caregivers'
  | 'consultation'
  | 'medicines'
  | 'history'
  | 'reports'
  | 'appointments'
  | 'admin'
  | 'benchmark';

interface NavigationSidebarProps {
  currentTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  onEmergencyClick: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentTab,
  onSelectTab,
  onEmergencyClick
}) => {
  const [storeState, setStoreState] = useState(platformStore.getState());
  const [showNotifications, setShowNotifications] = useState(false);

  React.useEffect(() => {
    return platformStore.subscribe(() => {
      setStoreState({ ...platformStore.getState() });
    });
  }, []);

  const { currentRole, currentUser, notifications } = storeState;
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRoleChange = (role: UserRole) => {
    platformStore.switchRole(role);
    if (role === 'admin') {
      onSelectTab('admin');
    } else {
      onSelectTab('dashboard');
    }
  };

  const navItems = [
    { id: 'dashboard', label: currentRole === 'doctor' ? 'Doctor Dashboard' : currentRole === 'caregiver' ? 'Caregiver Dashboard' : currentRole === 'admin' ? 'Admin Overview' : 'Patient Home', icon: Home, roles: ['patient', 'doctor', 'caregiver', 'admin'] },
    { id: 'triage', label: 'AI Care Triage', icon: Bot, roles: ['patient', 'doctor', 'caregiver', 'admin'], highlight: true },
    { id: 'doctors', label: 'Find Doctors', icon: UserCheck, roles: ['patient', 'admin'] },
    { id: 'caregivers', label: 'Caregiver Roster', icon: HeartHandshake, roles: ['patient', 'admin'] },
    { id: 'consultation', label: 'Consultation Room', icon: Video, roles: ['patient', 'doctor', 'admin'] },
    { id: 'medicines', label: 'Medicines & Stores', icon: Pill, roles: ['patient', 'admin'] },
    { id: 'history', label: 'Medical History', icon: Activity, roles: ['patient', 'doctor', 'admin'] },
    { id: 'reports', label: 'PDF Reports', icon: FileText, roles: ['patient', 'doctor', 'admin'] },
    { id: 'appointments', label: 'Appointments', icon: Clock, roles: ['patient', 'doctor', 'caregiver', 'admin'] },
    { id: 'admin', label: 'Admin Console', icon: Shield, roles: ['admin'] },
    { id: 'benchmark', label: 'Benchmark & API', icon: Sparkles, roles: ['patient', 'doctor', 'caregiver', 'admin'] }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <>
      {/* Desktop Sidebar (w-64) */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-100 border-r border-slate-800 shrink-0 select-none">
        {/* Brand & Role Switcher Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center font-black text-slate-950 text-base shadow-sm">
                C
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                CareCompass
              </span>
            </div>
            {/* Notifications Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* Quick Interactive Role Switcher */}
          <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-teal-400" />
                Active Demo Role
              </span>
              <span className="text-teal-400 capitalize">{currentRole}</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(['patient', 'doctor', 'caregiver', 'admin'] as UserRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`py-1 text-[11px] font-bold rounded capitalize transition-all cursor-pointer ${
                    currentRole === role
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {role === 'caregiver' ? 'Nurse' : role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current User Card */}
        <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-sm shrink-0 border border-slate-700">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-[11px] text-teal-400 truncate capitalize font-medium">{currentUser.role} Account</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as ActiveNavTab)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white font-bold shadow-sm'
                    : item.highlight
                    ? 'text-teal-300 hover:bg-teal-950/40 hover:text-teal-200'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Persistent Emergency 112 Button */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={onEmergencyClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>🚨 112 EMERGENCY CALL</span>
          </button>

          <button
            onClick={() => platformStore.resetToSeed()}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
            title="Reloads complete fictional sample dataset"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>

      {/* Notifications Drawer Popover */}
      {showNotifications && (
        <div className="fixed top-16 left-64 z-50 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Notifications ({notifications.length})
            </span>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-2">
            {notifications.slice(0, 5).map(n => (
              <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{n.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{n.timestamp}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (h-16) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around px-2 py-1">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg cursor-pointer ${
            currentTab === 'dashboard' ? 'text-teal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => onSelectTab('triage')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg cursor-pointer ${
            currentTab === 'triage' ? 'text-teal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Bot className="w-4 h-4 text-teal-400" />
          <span className="text-[10px] mt-0.5 font-bold">AI Triage</span>
        </button>

        <button
          onClick={() => onSelectTab('doctors')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg cursor-pointer ${
            currentTab === 'doctors' ? 'text-teal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Doctors</span>
        </button>

        <button
          onClick={() => onSelectTab('medicines')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg cursor-pointer ${
            currentTab === 'medicines' ? 'text-teal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Pharmacy</span>
        </button>

        <button
          onClick={() => onSelectTab('reports')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg cursor-pointer ${
            currentTab === 'reports' ? 'text-teal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Reports</span>
        </button>

        <button
          onClick={onEmergencyClick}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-red-500 font-bold cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] mt-0.5">112</span>
        </button>
      </nav>
    </>
  );
};
