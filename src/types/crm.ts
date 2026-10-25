export type Role = 'direktor' | 'menecer' | 'telimci' | 'sagird';

export type EmploymentType = 'full_stat' | 'yarim_stat' | 'saatliq' | 'ferdi';
export type SalaryCalcType = 'sabit' | 'saatliq' | 'faiz' | 'kombine';

export interface TrainerBranchAssignment {
  branchId: string;
  branchName: string;
  employmentType?: EmploymentType; // 'full_stat' | 'yarim_stat' | 'saatliq' | 'ferdi'
  workSchedule: string; // Məs: 'B.e / Çər / Cüm · 10:00 - 18:00'
  weeklyHours?: number; // 40 (full), 20 (yarım), və ya saatlıq norma
  baseSalary?: number; // Filial üzrə fərdi baza maaşı
  calcType?: SalaryCalcType; // 'sabit' | 'saatliq' | 'faiz' | 'kombine'
  baseRate?: number; // Sabit AZN, saatlıq AZN/saat və ya faiz %
  isPrimary?: boolean;
}

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  photoURL?: string;
  avatarUrl?: string;
  branchId?: string;
  branchName?: string;
  assignedBranchIds?: string[]; // Təlimçinin təhkim olunduğu filialların ID-ləri
  isSuperAdmin?: boolean;
  status: 'aktiv' | 'bloklanib' | 'dondurulub' | 'silinib';
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  lastLogin?: string;
  linkedEntityId?: string;
  notes?: string;
}

export interface Student {
  id: string;
  fullName: string;
  phone: string;
  parentPhone?: string;
  email: string;
  branchId?: string;
  branchName?: string;
  groupId: string;
  groupName: string;
  courseName: string;
  status: 'aktiv' | 'mezun' | 'dondurulub' | 'xaric' | 'silinib';
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  balance: number; // positive = advance, negative = debt
  monthlyFee: number;
  currentMonthDebt?: number; // Cari ay üçün yaranan borc
  lastDebtCreatedAt?: string;
  enrollmentDate: string;
  finCode?: string; // FİN kod və ya ŞV nömrəsi (təkrarlanmanın qarşısını almaq üçün unikal)
  birthDate?: string;
  notes?: string;
  attendanceRate: number; // 0-100
}

export interface Group {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  branchId?: string;
  branchName?: string;
  trainerId: string;
  trainerName: string;
  schedule: string; // e.g., 'B.e / Çər / Cüm 19:00 - 21:00'
  lessonDays?: number[]; // [1, 3, 5] where 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat, 0 = Sun
  lessonStartTime?: string; // '19:00'
  lessonEndTime?: string; // '21:00'
  room: string;
  capacity: number;
  currentStudents: number;
  startDate: string;
  endDate: string;
  status: 'yeni' | 'davam_edir' | 'tamamlandi' | 'silinib';
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  currentModuleId?: string;
  progressPercent: number;
}

export type LeadSource =
  | 'Instagram'
  | 'TikTok'
  | 'WhatsApp'
  | 'Tövsiyə'
  | 'Birbaşa gəliş'
  | 'Onlayn Qeydiyyat Portalı'
  | 'Digər';

export type LeadStage =
  | 'yeni'
  | 'elaqe_saxlanildi'
  | 'sinaq_dersi'
  | 'gozleyir'
  | 'qeydiyyat'
  | 'imtina';

export interface Lead {
  id: string;
  fullName: string;
  parentName?: string;
  studentName?: string;
  phone: string;
  applicationCode?: string; // Məs: AREA-LID-4921
  interestedCourse: string;
  source: LeadSource | string;
  stage: LeadStage;
  createdAt: string;
  nextFollowUp?: string;
  notes?: string;
  assignedManager: string;
  branchId?: string;
  branchName?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late';

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  branchId?: string;
}

export interface PaymentTransaction {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  amount: number;
  type: 'telim_haqqi' | 'derslik' | 'imtahan' | 'diger';
  method: 'Nagd' | 'Bank karti' | 'eManat/MilliOn' | 'Hesaba kocurme';
  date: string;
  receiptNumber: string;
  recordedBy: string;
  contractId?: string;
  discountAmount?: number;
  originalFee?: number;
  parentPhone?: string;
  trainerPhone?: string;
  trainerName?: string;
  note?: string;
  branchId?: string;
  branchName?: string;
}

export interface StudentDebtRecord {
  id: string;
  studentId: string;
  studentName: string;
  contractId: string;
  contractNumber: string;
  courseName: string;
  groupId?: string;
  groupName?: string;
  amount: number;
  month: string; // e.g. '2026-10'
  dueDate: string;
  status: 'odenilmayib' | 'qismen_odenilib' | 'tam_odenilib';
  paidAmount: number;
  remainingAmount: number;
  createdAt: string;
  notes?: string;
}

export interface TrainerSalary {
  id: string;
  trainerId: string;
  trainerName: string;
  branchId?: string; // Filiala aid maaş təyinatı
  branchName?: string;
  role?: string;
  month: string; // '2026-03'
  employmentType?: EmploymentType; // 'full_stat' | 'yarim_stat' | 'saatliq' | 'ferdi'
  calcType: SalaryCalcType;
  baseRate: number; // monthly fixed or % or per hour AZN
  calculatedAmount: number;
  workedHoursTotal?: number; // Faktiki işlənmiş saatlar (QR və Geofence ilə toplanan)
  normHoursTotal?: number; // Aylıq norma saatlar (məs: 160, 80 və ya fərdi)
  
  // Attendance Impact on Salary
  workDaysTotal: number; // Normative work days in month (e.g. 22)
  workDaysAttended: number; // Days checked-in with QR (e.g. 21)
  lateCount: number; // Days late (e.g. 2)
  absentCount: number; // Unexcused absent days (e.g. 1)
  attendanceRate: number; // e.g. 95.5 (%)
  attendanceDeduction: number; // Deductions for absence and late (e.g. 75 AZN)
  attendanceBonus: number; // Bonus for 100% on-time attendance (e.g. 50 AZN)

  // KPI Performance Impact on Salary
  kpiScore: number; // Overall KPI performance percentage (e.g. 104)
  kpiGrade: 'A+' | 'A' | 'B' | 'C';
  kpiBonus: number; // Bonus earned from KPI targets (e.g. 150 AZN)
  kpiPenalty: number; // Deduction if KPI fell below minimum (e.g. 0 AZN)
  kpiBonusPercent?: number; // Total KPI impact as percentage of base salary (e.g. +10%)
  kpiRuleBreakdown?: {
    metricCode: string;
    metricName: string;
    category: string;
    impactPercent: number; // e.g. +3.5%
    impactAmount: number; // e.g. +52.5 AZN
    type: 'bonus' | 'penalty' | 'neutral';
    formulaNote?: string;
  }[];

  bonus: number; // Other arbitrary bonus
  penalty: number; // Other penalty
  totalPaid: number; // Final net payable amount
  status: 'odenilib' | 'gozleyir';
  paymentDate?: string;
  groupsHandled: string[];
  notes?: string;
}

export type KpiCategory = 'tedris' | 'davamiyyet' | 'xidmet' | 'satis';

export interface KpiMetricDefinition {
  id: string;
  name: string;
  code: string; // e.g. 'RETENTION', 'ATTENDANCE', 'CURRICULUM', 'NPS', 'STAFF_PUNCTUALITY', 'COMPETITION', 'LEADS'
  target: number; // Target benchmark (e.g. 90% or 4.8)
  unit: '%' | 'bal' | 'say' | 'saat';
  weight: number; // Percentage weight in total KPI (e.g. 20%)
  category: KpiCategory;
  applicableRoles: ('Direktor' | 'Menecer' | 'Təlimçi')[];
  bonusThreshold: number; // If actual >= this, extra bonus triggers (e.g. 100%)
  penaltyThreshold: number; // If actual < this, penalty triggers (e.g. 75%)
  description: string;
}

export interface KpiMetricResult {
  metricId: string;
  metricCode: string;
  metricName: string;
  target: number;
  actual: number;
  unit: string;
  weight: number;
  achievementRate: number; // actual / target * 100
  weightedScore: number; // (achievementRate * weight) / 100
  note?: string;
}

export interface StaffKpiEvaluation {
  id: string;
  staffId: string;
  staffName: string;
  role: 'Direktor' | 'Menecer' | 'Təlimçi';
  branchId: string;
  branchName: string;
  month: string; // '2026-03' or '2026-04'
  results: KpiMetricResult[];
  totalScore: number; // e.g. 105.4 (%)
  grade: 'A+' | 'A' | 'B' | 'C';
  kpiBonusAmount: number; // Calculated bonus for salary
  kpiPenaltyAmount: number; // Calculated penalty for salary
  evaluatedBy: string;
  evaluatedAt: string;
  directorRemarks?: string;
  status: 'tesdiqlenib' | 'qaralama';
}

export type KpiRuleMode = 'formula' | 'manual_tiers';

export interface KpiMetricFinanceRule {
  id: string;
  metricCode: string; // 'STAFF_PUNCTUALITY' | 'STD_ATTENDANCE' | 'LEAD_CONVERSION' | 'NPS' | 'RETENTION' | 'CURRICULUM_PROG' | 'COMPETITION_PREP'
  metricName: string;
  category: KpiCategory;
  isActive: boolean;
  mode: KpiRuleMode;

  // 1. Automatic Formula Settings
  formulaSettings: {
    baseSalaryMultiplier: number; // e.g. 0.08 (8% of base salary is influenced by this metric)
    scaleFactor: number; // e.g. 1.2 (sensitivity factor)
    targetThreshold: number; // e.g. 95%
    bonusCapPercent: number; // Max bonus % (e.g. 15%)
    penaltyFloorPercent: number; // Max penalty % (e.g. 10%)
    formulaExpression: string; // e.g. "Bonus = BazaMaaş * 8% * ((Faktiki - Hədəf) / Hədəf * 1.5)"
  };

  // 2. Manual Tiered Scale (A+, A, B, C)
  manualTiers: {
    tierAPlusBonusPercent: number; // e.g. 10%
    tierABonusPercent: number; // e.g. 5%
    tierBBonusPercent: number; // e.g. 0%
    tierCPenaltyPercent: number; // e.g. 5%
    impactType: 'percent_of_salary' | 'fixed_azn'; // Maaşın faizi və ya Sabit AZN
  };

  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'icare' | 'kommunal' | 'reklam' | 'ofis_levazimati' | 'avadanliq' | 'vergi' | 'diger';
  amount: number;
  date: string;
  paidTo: string;
  responsiblePerson: string;
  receiptFile?: string;
  receiptUrl?: string; // Image base64 or link to receipt/invoice
  approvalStatus?: 'tesdiqlendi' | 'gozleyir' | 'imtina';
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  notes?: string;
  branchId?: string;
  branchName?: string;
}

export interface ExtraIncome {
  id: string;
  title: string;
  source: 'imtahan_rusumu' | 'kitab_derslik' | 'master_klass' | 'kovorkinq' | 'serfikat_yenileme' | 'diger';
  amount: number;
  date: string;
  payerName: string;
  notes?: string;
  branchId?: string;
  branchName?: string;
}

export interface BranchLocation {
  id: string;
  name: string;
  code?: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // e.g. 120m
  phone?: string;
  managerName?: string;
  managerId?: string;
  roomCount?: number;
  monthlyRent?: number;
  status?: 'aktiv' | 'temirde' | 'planlasdirilir' | 'silinib';
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt?: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  role: 'Direktor' | 'Menecer' | 'Təlimçi' | 'Koordinator' | 'Resepşn';
  email: string;
  phone: string;
  branchId: string;
  branchName: string;
  employmentType?: EmploymentType; // 'full_stat' | 'yarim_stat' | 'saatliq' | 'ferdi'
  weeklyHours?: number; // 40 (full), 20 (yarım)
  assignedBranches?: TrainerBranchAssignment[]; // Çoxfiliallı təyinatlar və qrafiklər
  salary: number;
  workSchedule: string; // '09:00 - 18:00'
  status: 'aktiv' | 'mezuniyyet' | 'ayrilib';
}

export interface StaffAttendanceLog {
  id: string;
  staffId: string;
  staffName: string;
  branchId: string;
  branchName: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInLat?: number;
  checkInLng?: number;
  distanceMeters?: number;
  isInsideGeo: boolean;
  status: 'vaxtinda' | 'gecikme' | 'erken_cixis' | 'qayib';
  workedHours?: number;
  deviceInfo?: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationHours: number;
  description: string;
  homework?: string;
  resources?: { name: string; url: string }[];
  isCompleted?: boolean;
}

export interface CurriculumModule {
  id: string;
  order: number;
  title: string;
  description: string;
  durationWeeks: number;
  lessons: Lesson[];
}

export interface Curriculum {
  id: string;
  courseName: string;
  category:
    | 'Robototexnika & STEM'
    | 'Mühəndislik & Mexanika'
    | 'Dron & Aeronavtika'
    | 'Proqramlaşdırma'
    | 'Süni İntellekt & Data'
    | 'Yarış Hazırlığı'
    | 'Elektronika & Meykerlik'
    | 'Dizayn'
    | 'Biznes & Marketinq';
  totalDurationMonths: number;
  totalHours: number;
  passingGrade: number; // e.g. 75
  description: string;
  subTracks?: string[];
  isCompetitionPrep?: boolean;
  targetAge?: string;
  level?: 'Başlanğıc' | 'Orta' | 'İrəli Səviyyə (Advance)' | 'Yarış Səviyyəsi';
  equipmentNeeded?: string;
  branchesOffered?: string[];
  driveUrl?: string;
  modules: CurriculumModule[];
}

export interface Certificate {
  id: string; // e.g. 'AREA-2026-FE-8120'
  studentId: string;
  studentName: string;
  courseName: string;
  groupName: string;
  curriculumId: string;
  grade: 'Fərqlənmə ilə' | 'Müvəffəqiyyətlə' | 'İştirakçı';
  issueDate: string;
  completionDate: string;
  instructorName: string;
  directorName: string;
  templateStyle: 'luxury' | 'modern' | 'cyber';
  language?: 'az' | 'en' | 'bilingual';
  verificationUrl: string;
  qrCodeDataUrl?: string;
}

export interface StudentContract {
  id: string; // e.g. 'ctr-101'
  contractNumber: string; // e.g. 'AREA-MÜQ-2026-001'
  studentId: string;
  studentName: string;
  curriculumId?: string;
  courseName: string; // e.g. 'Robototexnika & STEM', 'Full Stack Veb'
  branchId?: string;
  branchName?: string;
  groupId?: string;
  groupName?: string;
  trainerId?: string;
  trainerName?: string;
  startDate: string;
  endDate: string;
  monthlyFee: number;
  lessonsPerMonth?: 4 | 8 | number; // Ayda 4 və ya 8 dərs seçimi
  scheduleTime?: string; // e.g. 'Çərşənbə / Cümə 17:00'
  parentPhone?: string;
  totalMonths?: number;
  totalAmount?: number;
  discountPercent?: number;
  discountAmount?: number;
  paymentPlan?: 'ayliq' | 'birdefelik' | 'hisseli';
  status: 'aktiv' | 'tamamlandi' | 'dondurulub' | 'legv_edilib' | 'gozleyir';
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  signedDate: string;
  notes?: string;
  createdAt: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'contracts'
  | 'groups'
  | 'leads'
  | 'attendance'
  | 'staff-attendance'
  | 'certificates'
  | 'curriculum'
  | 'finance'
  | 'whatsapp'
  | 'branches'
  | 'users'
  | 'staff'
  | 'tasks'
  | 'kpi';

export type NotificationCategory = 'maliyye' | 'davamiyyet' | 'lid' | 'akademik' | 'sistem';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  timestamp: string;
  isRead: boolean;
  targetTab?: ActiveTab;
  targetId?: string;
  actionLabel?: string;
  roleScope?: Role[];
  branchId?: string;
}

// Executive Task Tracker Types
export type TaskPriority = 'yuksek' | 'orta' | 'asagi';
export type TaskStatus = 'gozleyir' | 'icradadir' | 'tamamlandi' | 'texire_salindi';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assigneeId?: string;
  assigneeName: string;
  assigneeRole?: string;
  branchId?: string;
  branchName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  createdBy: string;
  completionNote?: string;
  completedAt?: string;
  tags?: string[];
}

// Role-Based Access Control (RBAC) Types
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export type SystemModuleId =
  | 'dashboard'
  | 'students'
  | 'contracts'
  | 'groups'
  | 'leads'
  | 'attendance'
  | 'staffAttendance'
  | 'certificates'
  | 'curriculum'
  | 'finance'
  | 'tasks'
  | 'kpi'
  | 'whatsapp'
  | 'branches'
  | 'users'
  | 'permissions';

export interface ModulePermissionRule {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export type RolePermissionsConfig = Record<Role, Record<SystemModuleId, ModulePermissionRule>>;

export interface SystemModuleMeta {
  id: SystemModuleId;
  label: string;
  category: 'core' | 'academic' | 'management' | 'system';
  description: string;
  actions: {
    view: string;
    create: string;
    edit: string;
    delete: string;
  };
}


