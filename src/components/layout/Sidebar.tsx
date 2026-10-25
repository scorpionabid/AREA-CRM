import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  CalendarCheck,
  QrCode,
  Award,
  BookOpen,
  Wallet,
  MessageSquare,
  Building2,
  UserCog,
  LucideIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shield,
  Briefcase,
  User,
  Crown,
  Target,
  FileSignature,
  ClipboardList
} from 'lucide-react';
import { useCrm, ActiveTab } from '../../context/CrmContext';
import { Role, SystemModuleId } from '../../types/crm';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: LucideIcon;
  count?: number;
  roles: string[];
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentRole,
    setCurrentRole,
    selectedBranchId,
    setSelectedBranchId,
    branches,
    students,
    contracts,
    leads,
    certificates,
    groups,
    users,
    staff,
    currentUser,
    expenses,
    tasks,
    setIsProfileModalOpen,
    can,
  } = useCrm();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);

  const activeStudentsCount = students.filter(s => s.status === 'aktiv').length;
  const activeTasksCount = tasks.filter(t => t.status !== 'tamamlandi' && t.status !== 'texire_salindi').length;
  const activeLeadsCount = leads.filter(l => l.stage !== 'qeydiyyat' && l.stage !== 'imtina').length;
  const pendingExpensesCount = expenses.filter(e => e.approvalStatus === 'gozleyir').length;

  const navModuleMap: Partial<Record<ActiveTab, SystemModuleId>> = {
    dashboard: 'dashboard',
    students: 'students',
    contracts: 'contracts',
    groups: 'groups',
    leads: 'leads',
    attendance: 'attendance',
    'staff-attendance': 'staffAttendance',
    certificates: 'certificates',
    curriculum: 'curriculum',
    finance: 'finance',
    tasks: 'tasks',
    kpi: 'kpi',
    whatsapp: 'whatsapp',
    branches: 'branches',
    users: 'users',
    staff: 'users',
  };

  const isItemVisible = (item: NavItem) => {
    const moduleId = navModuleMap[item.id];
    if (moduleId) {
      return can('view', moduleId);
    }
    return item.roles.includes(currentRole);
  };

  // Branch Submenu Items (Filiallar alt menyusu - şəkildəki ardıcıllıqla)
  const branchSubmenuItems: NavItem[] = [
    {
      id: 'students',
      label: 'Tələbələr',
      icon: Users,
      count: activeStudentsCount,
      roles: ['direktor', 'menecer'],
    },
    {
      id: 'contracts',
      label: 'Müqavilələr',
      icon: FileSignature,
      count: contracts.filter(c => c.status === 'aktiv').length,
      roles: ['direktor', 'menecer'],
    },
    {
      id: 'leads',
      label: 'Lidlər',
      icon: UserCheck,
      count: activeLeadsCount,
      roles: ['direktor', 'menecer'],
    },
    {
      id: 'attendance',
      label: 'Davamiyyət',
      icon: CalendarCheck,
      roles: ['direktor', 'menecer', 'telimci', 'sagird'],
    },
    {
      id: 'staff-attendance',
      label: 'QR Giriş',
      icon: QrCode,
      roles: ['direktor', 'menecer', 'telimci'],
    },
    {
      id: 'groups',
      label: 'Qruplar',
      icon: GraduationCap,
      count: currentRole === 'sagird' ? 1 : groups.length,
      roles: ['direktor', 'menecer', 'telimci', 'sagird'],
    },
    {
      id: 'certificates',
      label: 'Sertifikatlar',
      icon: Award,
      count: certificates.length,
      roles: ['direktor', 'menecer', 'telimci', 'sagird'],
    },
    {
      id: 'branches',
      label: 'Filial Tənzimləmələri',
      icon: Building2,
      count: branches.length,
      roles: ['direktor'],
    },
  ];

  const visibleBranchSubmenuItems = branchSubmenuItems.filter(isItemVisible);
  const isBranchSubmenuActive = visibleBranchSubmenuItems.some(item => item.id === activeTab);

  // Auto-open submenu if user navigates to any branch item from other views
  useEffect(() => {
    if (isBranchSubmenuActive) {
      setIsBranchMenuOpen(true);
    }
  }, [activeTab]);

  // Bottom Navigation Items (Maliyyə və digər modullar)
  const bottomNavigation: NavItem[] = [
    {
      id: 'finance',
      label: 'Maliyyə',
      icon: Wallet,
      count: pendingExpensesCount > 0 ? pendingExpensesCount : undefined,
      roles: ['direktor', 'menecer'],
    },
    {
      id: 'curriculum',
      label: 'Kurikulum',
      icon: BookOpen,
      roles: ['direktor', 'menecer', 'telimci', 'sagird'],
    },
    {
      id: 'tasks',
      label: 'Tapşırıqlar',
      icon: ClipboardList,
      count: activeTasksCount > 0 ? activeTasksCount : undefined,
      roles: ['direktor', 'menecer', 'telimci'],
    },
    {
      id: 'kpi',
      label: 'KPI Sistemi',
      icon: Target,
      roles: ['direktor', 'menecer', 'telimci'],
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageSquare,
      roles: ['direktor', 'menecer'],
    },
    {
      id: 'users',
      label: currentRole === 'menecer' ? 'Təlimçilər & Heyət' : 'İstifadəçilər',
      icon: currentRole === 'menecer' ? GraduationCap : UserCog,
      count: currentRole === 'menecer' ? staff.filter(s => s.role === 'Təlimçi').length : users.length,
      roles: ['direktor', 'menecer'],
    },
  ];

  const visibleBottomItems = bottomNavigation.filter(isItemVisible);

  const rolesList: { role: Role; label: string; icon: LucideIcon }[] = [
    { role: 'direktor', label: 'Direktor', icon: Crown },
    { role: 'menecer', label: 'Menecer', icon: Briefcase },
    { role: 'telimci', label: 'Təlimçi', icon: GraduationCap },
    { role: 'sagird', label: 'Şagird', icon: User },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-56'
      } bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800 select-none transition-all duration-200 relative`}
    >
      {/* Brand Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
            A
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-white font-bold text-sm tracking-tight truncate leading-tight">
                AREA
              </h1>
              <p className="text-[10px] text-slate-400 truncate">CRM Tədris</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Menyunu Aç' : 'Menyunu Yığ'}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1.5 scrollbar-thin">
        {/* 1. İdarəetmə Paneli (Dashboard) */}
        <button
          onClick={() => setActiveTab('dashboard')}
          title="İdarəetmə Paneli"
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
          } py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer group ${
            activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <LayoutDashboard
              className={`w-4 h-4 shrink-0 ${
                activeTab === 'dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
              }`}
            />
            {!isCollapsed && <span className="truncate">İdarəetmə Paneli</span>}
          </div>
        </button>

        {/* 2. Filiallar Section with Accordion Submenu */}
        {visibleBranchSubmenuItems.length > 0 && (
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                  setIsBranchMenuOpen(true);
                } else {
                  setIsBranchMenuOpen(prev => !prev);
                }
              }}
              title="Filiallar"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
              } py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer group ${
                isBranchSubmenuActive && !isBranchMenuOpen
                  ? 'bg-slate-800/90 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Building2
                  className={`w-4 h-4 shrink-0 ${
                    isBranchSubmenuActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && <span className="truncate font-semibold">Filiallar</span>}
              </div>

              {!isCollapsed && (
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isBranchMenuOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              )}

              {isCollapsed && isBranchSubmenuActive && (
                <span className="absolute right-1.5 top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
              )}
            </button>

            {/* Submenu Items List */}
            {!isCollapsed && isBranchMenuOpen && (
              <div className="pl-2 pr-1 py-1 space-y-0.5 border-l border-slate-800 ml-4 bg-slate-950/40 rounded-r-lg">
                {visibleBranchSubmenuItems.map(subItem => {
                  const SubIcon = subItem.icon;
                  const isSubActive = activeTab === subItem.id;

                  return (
                    <button
                      key={subItem.id}
                      onClick={() => setActiveTab(subItem.id)}
                      title={subItem.label}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition-colors text-left cursor-pointer group ${
                        isSubActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <SubIcon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSubActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span className="truncate text-[11.5px]">{subItem.label}</span>
                      </div>

                      {subItem.count !== undefined && (
                        <span
                          className={`text-[9.5px] font-mono-nums px-1.5 py-0.2 rounded text-center shrink-0 ${
                            isSubActive
                              ? 'bg-indigo-700 text-indigo-100'
                              : 'bg-slate-800/80 text-slate-400'
                          }`}
                        >
                          {subItem.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. Bottom Items (Maliyyə, Kurikulum, Tapşırıqlar, KPI, WhatsApp, İstifadəçilər) */}
        {visibleBottomItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
              } py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.count !== undefined && (
                <span
                  className={`text-[10px] font-mono-nums px-1.5 py-0.2 rounded text-center shrink-0 ${
                    isActive
                      ? 'bg-indigo-700 text-indigo-100'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              )}

              {isCollapsed && item.count !== undefined && item.count > 0 && (
                <span className="absolute right-1.5 top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* Compact Role Switcher at Bottom */}
      <div className="p-2 border-t border-slate-800 bg-slate-900/90">
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-1' : 'justify-between gap-1'} p-1 bg-slate-800/80 rounded-lg`}>
          {rolesList.map(r => {
            const RoleIcon = r.icon;
            const isSelected = currentRole === r.role;
            return (
              <button
                key={r.role}
                onClick={() => setCurrentRole(r.role)}
                title={`${r.label} Rolu`}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  isCollapsed ? 'w-full flex justify-center' : 'flex-1 flex justify-center'
                } ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <RoleIcon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        {/* Clickable Profile trigger */}
        {currentUser && (
          <button
            onClick={() => setIsProfileModalOpen(true)}
            title="Profil Tənzimləmələri"
            className={`w-full mt-2 pt-2 border-t border-slate-800/80 flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            } text-xs text-slate-400 hover:text-white transition-colors cursor-pointer group`}
          >
            <div className="flex items-center gap-2 truncate">
              {currentUser.photoURL || currentUser.avatarUrl ? (
                <img
                  src={currentUser.photoURL || currentUser.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-700"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                </div>
              )}
              {!isCollapsed && (
                <span className="truncate text-slate-300 group-hover:text-white font-medium text-[11px]">
                  {currentUser.fullName}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <User className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
