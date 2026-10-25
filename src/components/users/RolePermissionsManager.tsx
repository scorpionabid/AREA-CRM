import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  PlusCircle,
  Edit3,
  Trash2,
  Search,
  Filter,
  CheckSquare,
  Square,
  Lock,
  Sparkles,
  Users,
  Info,
  Crown,
  Briefcase,
  GraduationCap,
  User,
  SlidersHorizontal,
  TableProperties,
  LayoutGrid
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { Role, SystemModuleId, PermissionAction, ModulePermissionRule } from '../../types/crm';
import { SYSTEM_MODULES, ROLE_DETAILS, DEFAULT_ROLE_PERMISSIONS } from '../../utils/permissions';

export const RolePermissionsManager: React.FC = () => {
  const {
    rolePermissions,
    updateRolePermissions,
    bulkUpdateRolePermissions,
    resetRolePermissions,
    currentRole,
    setCurrentRole,
    currentUser,
    users,
    showToast,
    confirmAction,
  } = useCrm();

  const [selectedRole, setSelectedRole] = useState<Role>('menecer');
  const [viewMode, setViewMode] = useState<'detail' | 'matrix'>('detail');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'academic' | 'management' | 'system'>('all');

  const isSuperAdminUser = currentUser?.isSuperAdmin || currentUser?.role === 'direktor' || currentRole === 'direktor';

  // Role user counts
  const roleCounts = useMemo(() => {
    return {
      direktor: users.filter(u => u.role === 'direktor').length,
      menecer: users.filter(u => u.role === 'menecer').length,
      telimci: users.filter(u => u.role === 'telimci').length,
      sagird: users.filter(u => u.role === 'sagird').length,
    };
  }, [users]);

  // Filter modules
  const filteredModules = useMemo(() => {
    return SYSTEM_MODULES.filter(m => {
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const matchesSearch =
        m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const activeRoleConfig = rolePermissions[selectedRole];
  const activeRoleDetails = ROLE_DETAILS[selectedRole];

  // Quick Action: Grant All Permissions for current selected role
  const handleGrantAll = () => {
    confirmAction({
      title: `${activeRoleDetails.label} üçün Bütün Səlahiyyətləri Ver`,
      message: `"${activeRoleDetails.label}" rolu üçün bütün sistem modulları üzrə baxış, əlavə, redaktə və silmə hüquqlarını aktivləşdirmək istəyirsiniz?`,
      confirmText: 'Bəli, Hamısını Ver',
      danger: false,
      onConfirm: async () => {
        const fullRules: Record<SystemModuleId, ModulePermissionRule> = {} as any;
        SYSTEM_MODULES.forEach(m => {
          fullRules[m.id] = { view: true, create: true, edit: true, delete: true };
        });
        await bulkUpdateRolePermissions(selectedRole, fullRules);
      },
    });
  };

  // Quick Action: View Only Mode
  const handleViewOnly = () => {
    confirmAction({
      title: `${activeRoleDetails.label} üçün Yalnız Baxış Rejimi`,
      message: `"${activeRoleDetails.label}" rolu üçün əlavə, redaktə və silmə hüquqları ləğv ediləcək, yalnız baxış icazəsi saxlanılacaq. Təsdiq edirsiniz?`,
      confirmText: 'Bəli, Yalnız Baxış Et',
      danger: false,
      onConfirm: async () => {
        const viewRules: Record<SystemModuleId, ModulePermissionRule> = {} as any;
        SYSTEM_MODULES.forEach(m => {
          viewRules[m.id] = {
            view: true,
            create: false,
            edit: false,
            delete: false,
          };
        });
        // Ensure safety guard for Direktor
        if (selectedRole === 'direktor') {
          viewRules.permissions = { view: true, create: true, edit: true, delete: true };
        }
        await bulkUpdateRolePermissions(selectedRole, viewRules);
      },
    });
  };

  // Quick Action: Reset to Defaults for this role or all
  const handleResetRole = (roleToReset: Role) => {
    const targetDetails = ROLE_DETAILS[roleToReset];
    confirmAction({
      title: `${targetDetails.label} Standart Qaydalara Sıfırlansın?`,
      message: `Bu əməliyyat "${targetDetails.label}" rolunun bütün fərdi dəyişikliklərini siləcək və ilkin təhlükəsiz sistem standartlarına bərpa edəcək. Davam edilsin?`,
      confirmText: 'Bəli, Sıfırla',
      danger: true,
      onConfirm: async () => {
        await resetRolePermissions(roleToReset);
      },
    });
  };

  // Quick Action: Reset all roles to defaults
  const handleResetAllRoles = () => {
    confirmAction({
      title: 'Bütün Rolları Standart Qaydalara Sıfırla',
      message: 'Sistemdəki bütün 4 rolun (Direktor, Menecer, Təlimçi, Şagird) səlahiyyətləri standart ilkin təhlükəsizlik vəziyyətinə qaytarılacaq. Bu əməliyyat geri qaytarıla bilməz.',
      confirmText: 'Bəli, Bütün Rolları Sıfırla',
      danger: true,
      onConfirm: async () => {
        await resetRolePermissions();
      },
    });
  };

  // Toggle all actions for a specific module in current role
  const handleToggleModuleAll = (moduleId: SystemModuleId) => {
    const currentModuleRule = activeRoleConfig[moduleId];
    const allActive = currentModuleRule.view && currentModuleRule.create && currentModuleRule.edit && currentModuleRule.delete;
    const nextVal = !allActive;

    // Safety guard
    if (selectedRole === 'direktor' && moduleId === 'permissions' && !nextVal) {
      showToast('Təhlükəsizlik xətası: Superadmin səlahiyyət idarəetmə hüququndan məhrum edilə bilməz!', 'error');
      return;
    }

    updateRolePermissions(selectedRole, moduleId, 'view', nextVal);
    updateRolePermissions(selectedRole, moduleId, 'create', nextVal);
    updateRolePermissions(selectedRole, moduleId, 'edit', nextVal);
    updateRolePermissions(selectedRole, moduleId, 'delete', nextVal);
  };

  // Calculate statistics for the active role
  const roleStats = useMemo(() => {
    let totalActions = 0;
    let grantedActions = 0;
    SYSTEM_MODULES.forEach(m => {
      const rule = activeRoleConfig[m.id];
      if (rule) {
        totalActions += 4;
        if (rule.view) grantedActions++;
        if (rule.create) grantedActions++;
        if (rule.edit) grantedActions++;
        if (rule.delete) grantedActions++;
      }
    });
    const percentage = totalActions > 0 ? Math.round((grantedActions / totalActions) * 100) : 0;
    return { totalActions, grantedActions, percentage };
  }, [activeRoleConfig]);

  const rolesList: { role: Role; label: string; icon: React.FC<{ className?: string }> }[] = [
    { role: 'direktor', label: 'Direktor (Superadmin)', icon: Crown },
    { role: 'menecer', label: 'Menecer', icon: Briefcase },
    { role: 'telimci', label: 'Təlimçi / Müəllim', icon: GraduationCap },
    { role: 'sagird', label: 'Şagird / Tələbə', icon: User },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Superadmin Status & Info */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Superadmin Rol & Səlahiyyət İdarəetmə Mərkəzi
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                  RBAC · Modul & Əməliyyat
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Firestore Canlı Sinxronizasiya
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Bu panel vasitəsilə 4 sistem rolu üzrə hər bir modulun 4 əsas əməliyyat hüququnu
                (<span className="text-indigo-300 font-semibold">Baxış, Əlavə, Redaktə, Silmə</span>) dəqiq təyin edə bilərsiniz. Dəyişikliklər dərhal tətbiq olunur və yadda saxlanılır.
              </p>
            </div>
          </div>

          {/* Global Reset All Action */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleResetAllRoles}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700/50 transition-all cursor-pointer shadow-xs"
              title="Bütün rolları standart vəziyyətə sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Bütün Rolları Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Safety Lockout Notice */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3 text-[11px] text-slate-400 flex-wrap">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-300 font-medium">Təhlükəsizlik Kilidi Qorunması:</strong> Direktor (Superadmin) hesabı üçün səlahiyyətlər modulunun idarəsi daimi aktiv saxlanılır, sistemdən kənarda qalma riski aradan qaldırılıb.
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/60 px-3 py-1 rounded-md border border-slate-700/50">
            <span className="text-slate-400">Cari Test Rolu:</span>
            <span className="font-bold text-indigo-300 capitalize">{currentRole}</span>
            <span className="text-slate-500">|</span>
            <button
              onClick={() => {
                setCurrentRole(selectedRole);
                showToast(`Sistemə baxış rolu "${selectedRole.toUpperCase()}" olaraq təyin edildi`);
              }}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 cursor-pointer"
            >
              Bu rolu canlı sınaqdan keçir
            </button>
          </div>
        </div>
      </div>

      {/* Role Selector Cards (4 Roles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {rolesList.map(({ role, label, icon: IconComponent }) => {
          const isSelected = selectedRole === role;
          const details = ROLE_DETAILS[role];
          const count = roleCounts[role];

          // Compute permissions summary for this role
          let activeCount = 0;
          SYSTEM_MODULES.forEach(m => {
            const rule = rolePermissions[role]?.[m.id];
            if (rule) {
              if (rule.view) activeCount++;
              if (rule.create) activeCount++;
              if (rule.edit) activeCount++;
              if (rule.delete) activeCount++;
            }
          });
          const totalCount = SYSTEM_MODULES.length * 4;
          const pct = Math.round((activeCount / totalCount) * 100);

          return (
            <div
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`relative rounded-xl p-4 transition-all cursor-pointer border text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${details.bgLightClass}`}
                  >
                    {details.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{label}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {details.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Aktiv Hüquqlar:</span>
                  <span className="font-semibold text-slate-700 tabular-nums">
                    {activeCount} / {totalCount} ({pct}%)
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pct > 70 ? 'bg-indigo-600' : pct > 30 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>Hesab sayı: <strong className="text-slate-600">{count}</strong></span>
                  {isSelected && (
                    <span className="text-indigo-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Seçilib
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Header & Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Active Role Title & Quick Actions */}
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${activeRoleDetails.bgLightClass}`}>
              {activeRoleDetails.label}
            </div>
            <div className="text-xs text-slate-500">
              Səlahiyyət əhatəsi: <strong className="text-slate-800">{roleStats.grantedActions}</strong> / {roleStats.totalActions} ({roleStats.percentage}%)
            </div>
          </div>

          {/* Quick Buttons for the Selected Role */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleGrantAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
              title="Bütün modullara tam hüquq ver"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Bütün Hüquqları Ver</span>
            </button>

            <button
              onClick={handleViewOnly}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Yalnız oxuma/baxış hüququ saxla"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Yalnız Baxış Rejimi</span>
            </button>

            <button
              onClick={() => handleResetRole(selectedRole)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors cursor-pointer"
              title="Bu rol üçün standart ilkin qaydalara qaytar"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Standart Qaydaya Sıfırla</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-1">
              <button
                onClick={() => setViewMode('detail')}
                className={`p-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'detail'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Detallı kartlar görünüşü"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Detallı</span>
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`p-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'matrix'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Müqayisəli matris cədvəli"
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">4 Rol Matrisi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Modul adı və ya təsvir üzrə axtarış..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1 hidden md:inline">Kateqoriya:</span>
            {[
              { id: 'all', label: 'Bütün Modullar' },
              { id: 'core', label: 'Əsas CRM' },
              { id: 'academic', label: 'Akademik' },
              { id: 'management', label: 'İdarəetmə' },
              { id: 'system', label: 'Sistem' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded-md font-medium text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main View Mode: Detail vs Matrix */}
      {viewMode === 'detail' ? (
        /* Detailed Module Cards View for the Selected Role */
        <div className="space-y-3">
          {filteredModules.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Heç bir modul tapılmadı</p>
              <p className="text-xs text-slate-400 mt-0.5">Axtarış sözünü dəyişin və ya kateqoriyanı sıfırlayın.</p>
            </div>
          ) : (
            filteredModules.map(moduleMeta => {
              const rule = activeRoleConfig[moduleMeta.id] || { view: false, create: false, edit: false, delete: false };
              const isLockedSuperAdmin = selectedRole === 'direktor' && moduleMeta.id === 'permissions';
              const allSelected = rule.view && rule.create && rule.edit && rule.delete;

              return (
                <div
                  key={moduleMeta.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all p-4 shadow-2xs"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Module Title & Description */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 mt-0.5">
                        {moduleMeta.id.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">{moduleMeta.label}</h4>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              moduleMeta.category === 'core'
                                ? 'bg-blue-50 text-blue-700'
                                : moduleMeta.category === 'academic'
                                ? 'bg-amber-50 text-amber-700'
                                : moduleMeta.category === 'management'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {moduleMeta.category === 'core'
                              ? 'Əsas CRM'
                              : moduleMeta.category === 'academic'
                              ? 'Akademik'
                              : moduleMeta.category === 'management'
                              ? 'İdarəetmə'
                              : 'Sistem'}
                          </span>

                          {isLockedSuperAdmin && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Lock className="w-3 h-3 text-amber-600" />
                              Superadmin Kilidi
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {moduleMeta.description}
                        </p>
                      </div>
                    </div>

                    {/* Quick Select All for this module */}
                    <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                      <button
                        type="button"
                        disabled={isLockedSuperAdmin}
                        onClick={() => handleToggleModuleAll(moduleMeta.id)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer border ${
                          allSelected
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        } ${isLockedSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {allSelected ? 'Hamısını Ləğv Et' : 'Hamısını Seç'}
                      </button>
                    </div>
                  </div>

                  {/* 4 Permission Operation Switches (View, Create, Edit, Delete) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3.5 pt-3.5 border-t border-slate-100">
                    {/* 1. Baxış (View) */}
                    <label
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                        rule.view
                          ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                          : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100/60'
                      } ${isLockedSuperAdmin ? 'pointer-events-none opacity-80' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={rule.view}
                        disabled={isLockedSuperAdmin}
                        onChange={e => updateRolePermissions(selectedRole, moduleMeta.id, 'view', e.target.checked)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>1. Baxış (View)</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {moduleMeta.actions.view}
                        </p>
                      </div>
                    </label>

                    {/* 2. Əlavə (Create) */}
                    <label
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                        rule.create
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100/60'
                      } ${isLockedSuperAdmin ? 'pointer-events-none opacity-80' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={rule.create}
                        disabled={isLockedSuperAdmin}
                        onChange={e => updateRolePermissions(selectedRole, moduleMeta.id, 'create', e.target.checked)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <PlusCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>2. Əlavə (Create)</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {moduleMeta.actions.create}
                        </p>
                      </div>
                    </label>

                    {/* 3. Redaktə (Edit) */}
                    <label
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                        rule.edit
                          ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                          : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100/60'
                      } ${isLockedSuperAdmin ? 'pointer-events-none opacity-80' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={rule.edit}
                        disabled={isLockedSuperAdmin}
                        onChange={e => updateRolePermissions(selectedRole, moduleMeta.id, 'edit', e.target.checked)}
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Edit3 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>3. Redaktə (Edit)</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {moduleMeta.actions.edit}
                        </p>
                      </div>
                    </label>

                    {/* 4. Silmə (Delete) */}
                    <label
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                        rule.delete
                          ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                          : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100/60'
                      } ${isLockedSuperAdmin ? 'pointer-events-none opacity-80' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={rule.delete}
                        disabled={isLockedSuperAdmin}
                        onChange={e => updateRolePermissions(selectedRole, moduleMeta.id, 'delete', e.target.checked)}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>4. Silmə (Delete)</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {moduleMeta.actions.delete}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Comparative 4-Role Matrix Table View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                4 Rol Üzrə Müqayisəli Səlahiyyət Matrisi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Direktor, Menecer, Təlimçi və Şagird rollarının bütün modullar üzrə əməliyyat icazələrini birbaşa cədvəldən klikləyərək dəyişə bilərsiniz.
              </p>
            </div>
            <div className="text-[11px] text-slate-500 hidden sm:block">
              Hər sütun: <span className="font-semibold text-slate-700">B</span>(Baxış) · <span className="font-semibold text-slate-700">Ə</span>(Əlavə) · <span className="font-semibold text-slate-700">R</span>(Redaktə) · <span className="font-semibold text-slate-700">S</span>(Silmə)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 min-w-[200px]">Modul & Funksionallıq</th>
                  <th className="py-3 px-3 text-center border-l border-slate-200 bg-indigo-50/40">
                    <span className="text-indigo-800 uppercase block font-bold">Direktor</span>
                    <span className="text-[10px] text-slate-400 font-normal">B · Ə · R · S</span>
                  </th>
                  <th className="py-3 px-3 text-center border-l border-slate-200 bg-blue-50/40">
                    <span className="text-blue-800 uppercase block font-bold">Menecer</span>
                    <span className="text-[10px] text-slate-400 font-normal">B · Ə · R · S</span>
                  </th>
                  <th className="py-3 px-3 text-center border-l border-slate-200 bg-amber-50/40">
                    <span className="text-amber-800 uppercase block font-bold">Təlimçi</span>
                    <span className="text-[10px] text-slate-400 font-normal">B · Ə · R · S</span>
                  </th>
                  <th className="py-3 px-3 text-center border-l border-slate-200 bg-emerald-50/40">
                    <span className="text-emerald-800 uppercase block font-bold">Şagird</span>
                    <span className="text-[10px] text-slate-400 font-normal">B · Ə · R · S</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredModules.map(moduleMeta => {
                  const roles: Role[] = ['direktor', 'menecer', 'telimci', 'sagird'];
                  return (
                    <tr key={moduleMeta.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{moduleMeta.label}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{moduleMeta.description}</div>
                      </td>

                      {roles.map(role => {
                        const rule = rolePermissions[role]?.[moduleMeta.id] || { view: false, create: false, edit: false, delete: false };
                        const isLocked = role === 'direktor' && moduleMeta.id === 'permissions';

                        return (
                          <td key={role} className="py-2.5 px-2 text-center border-l border-slate-100">
                            <div className="inline-flex items-center gap-1.5 justify-center">
                              {/* View */}
                              <button
                                type="button"
                                disabled={isLocked}
                                onClick={() => updateRolePermissions(role, moduleMeta.id, 'view', !rule.view)}
                                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer ${
                                  rule.view
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                } ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                                title={`${moduleMeta.label} - Baxış: ${rule.view ? 'Aktiv' : 'Deaktiv'}`}
                              >
                                B
                              </button>

                              {/* Create */}
                              <button
                                type="button"
                                disabled={isLocked}
                                onClick={() => updateRolePermissions(role, moduleMeta.id, 'create', !rule.create)}
                                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer ${
                                  rule.create
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                } ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                                title={`${moduleMeta.label} - Əlavə: ${rule.create ? 'Aktiv' : 'Deaktiv'}`}
                              >
                                Ə
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                disabled={isLocked}
                                onClick={() => updateRolePermissions(role, moduleMeta.id, 'edit', !rule.edit)}
                                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer ${
                                  rule.edit
                                    ? 'bg-amber-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                } ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                                title={`${moduleMeta.label} - Redaktə: ${rule.edit ? 'Aktiv' : 'Deaktiv'}`}
                              >
                                R
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                disabled={isLocked}
                                onClick={() => updateRolePermissions(role, moduleMeta.id, 'delete', !rule.delete)}
                                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer ${
                                  rule.delete
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                } ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                                title={`${moduleMeta.label} - Silmə: ${rule.delete ? 'Aktiv' : 'Deaktiv'}`}
                              >
                                S
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
