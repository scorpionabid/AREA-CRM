import React, { useState, useMemo } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Award,
  Printer,
  Search,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Download,
  Share2,
  Eye,
  FileCheck,
  Users,
  UserCheck,
  Globe,
  MessageCircle,
  Linkedin,
  Filter,
  X,
  Copy,
  ChevronDown
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { Certificate, Student } from '../../types/crm';
import { formatDateAz, exportToCSV } from '../../utils/formatters';

export const CertificatesView: React.FC = () => {
  const {
    students,
    groups,
    certificates,
    issueCertificate,
    currentRole,
    currentUser,
    showToast,
    can,
  } = useCrm();

  const isStudent = currentRole === 'sagird';
  const canCreateCert = can('create', 'certificates');

  // Navigation tab: 'generate' | 'archive' | 'verify'
  const [activeTab, setActiveTab] = useState<'generate' | 'archive' | 'verify'>(
    canCreateCert ? 'generate' : 'archive'
  );

  // Generation mode: 'single' (Individual student) | 'bulk' (Whole group graduation)
  const [generateMode, setGenerateMode] = useState<'single' | 'bulk'>('single');

  // Form states for Single student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [grade, setGrade] = useState<'Fərqlənmə ilə' | 'Müvəffəqiyyətlə' | 'İştirakçı'>('Fərqlənmə ilə');
  const [templateStyle, setTemplateStyle] = useState<'luxury' | 'modern' | 'cyber'>('luxury');
  const [language, setLanguage] = useState<'az' | 'en' | 'bilingual'>('az');
  const [instructorName, setInstructorName] = useState<string>('Fərid Əliyev');
  const [directorName, setDirectorName] = useState<string>('Elnur Qasımzadə');
  const [completionDate, setCompletionDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Bulk generation states
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');
  const [bulkGrades, setBulkGrades] = useState<Record<string, 'Fərqlənmə ilə' | 'Müvəffəqiyyətlə' | 'İştirakçı'>>({});
  const [bulkIsIssuing, setBulkIsIssuing] = useState(false);

  // Selected student details
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const currentGroup = groups.find(g => g.id === currentStudent?.groupId);

  // Active certificate being previewed or issued
  const [previewCert, setPreviewCert] = useState<Certificate | null>(certificates[0] || null);

  // Full Screen Preview Modal
  const [modalCert, setModalCert] = useState<Certificate | null>(null);

  // Verification tab state
  const [verifySearchId, setVerifySearchId] = useState<string>('');
  const [verifiedResult, setVerifiedResult] = useState<Certificate | null>(null);

  // Archive search and filters
  const [archiveSearch, setArchiveSearch] = useState<string>('');
  const [archiveGroupFilter, setArchiveGroupFilter] = useState<string>('all');
  const [archiveGradeFilter, setArchiveGradeFilter] = useState<string>('all');

  // Students in selected group for bulk issuance
  const bulkGroupStudents = useMemo(() => {
    return students.filter(s => s.groupId === selectedGroupId);
  }, [students, selectedGroupId]);

  // Handle single certificate generation
  const handleGenerateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    try {
      const newCert = await issueCertificate({
        studentId: currentStudent.id,
        studentName: currentStudent.fullName,
        courseName: currentStudent.courseName,
        groupName: currentStudent.groupName,
        curriculumId: currentGroup?.courseId || 'curr-fe',
        grade,
        completionDate,
        instructorName,
        directorName,
        templateStyle,
        language,
      });
      setPreviewCert(newCert);
      showToast(`${currentStudent.fullName} üçün rəsmi sertifikat hazırlandı!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Sertifikat yaradılarkən xəta baş verdi', 'error');
    }
  };

  // Handle bulk group graduation
  const handleBulkIssue = async () => {
    if (!bulkGroupStudents.length) {
      showToast('Bu qrupda tələbə tapılmadı!', 'error');
      return;
    }

    setBulkIsIssuing(true);
    const grp = groups.find(g => g.id === selectedGroupId);

    try {
      let count = 0;
      for (const std of bulkGroupStudents) {
        const studentGrade = bulkGrades[std.id] || 'Müvəffəqiyyətlə';
        await issueCertificate({
          studentId: std.id,
          studentName: std.fullName,
          courseName: std.courseName,
          groupName: std.groupName,
          curriculumId: grp?.courseId || 'curr-fe',
          grade: studentGrade,
          completionDate,
          instructorName: grp?.trainerName || instructorName,
          directorName,
          templateStyle,
          language,
        });
        count++;
      }

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });

      showToast(`${count} tələbə üçün qrup sertifikatları uğurla hazırlandı və təsdiqləndi!`, 'success');
      setActiveTab('archive');
    } catch (err) {
      console.error(err);
      showToast('Toplu generasiya zamanı xəta baş verdi', 'error');
    } finally {
      setBulkIsIssuing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleVerify = (idToVerify: string) => {
    const cleanId = idToVerify.trim().toUpperCase();
    const found = certificates.find(c => c.id.toUpperCase() === cleanId);
    if (found) {
      setVerifiedResult(found);
      showToast('Rəsmi sertifikat bazada təsdiqləndi!', 'success');
    } else {
      setVerifiedResult(null);
      showToast('Bu nömrəli rəsmi sertifikat tapılmadı!', 'error');
    }
  };

  // Generate WhatsApp Share URL
  const getWhatsAppShareUrl = (cert: Certificate) => {
    const text = `Hörmətli ${cert.studentName}! Sizi "${cert.courseName}" kursunu uğurla başa vurmağınız münasibətilə AREA Academy adından təbrik edirik! \n\nRəsmi Sertifikat Nömrəniz: ${cert.id}\nNəticə: ${cert.grade}\n\nSertifikatınızı onlayn yoxlamaq və yükləmək üçün keçid:\n${cert.verificationUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  // Generate LinkedIn Add to Profile URL
  const getLinkedInCertUrl = (cert: Certificate) => {
    const issueYear = cert.issueDate.split('-')[0] || '2026';
    const issueMonth = cert.issueDate.split('-')[1] || '4';
    return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.courseName)}&organizationName=${encodeURIComponent('AREA Academy')}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(cert.verificationUrl)}&certId=${encodeURIComponent(cert.id)}`;
  };

  // Copy Verification URL
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Doğrulama linki kopyalandı!');
  };

  // Filtered certificates for Archive
  const displayCertificates = useMemo(() => {
    let result = isStudent
      ? certificates.filter(
          c =>
            c.studentName.toLowerCase().includes(currentUser?.fullName.toLowerCase() || '') ||
            c.studentId === currentUser?.linkedEntityId
        )
      : certificates;

    if (archiveSearch.trim()) {
      const q = archiveSearch.toLowerCase().trim();
      result = result.filter(
        c =>
          c.studentName.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.courseName.toLowerCase().includes(q) ||
          c.groupName.toLowerCase().includes(q)
      );
    }

    if (archiveGroupFilter !== 'all') {
      result = result.filter(c => c.groupName === archiveGroupFilter);
    }

    if (archiveGradeFilter !== 'all') {
      result = result.filter(c => c.grade === archiveGradeFilter);
    }

    return result;
  }, [certificates, isStudent, currentUser, archiveSearch, archiveGroupFilter, archiveGradeFilter]);

  // Distinct groups in certificates
  const distinctGroups = useMemo(() => {
    return Array.from(new Set(certificates.map(c => c.groupName)));
  }, [certificates]);

  // Render text based on certificate language
  const getCertText = (lang: 'az' | 'en' | 'bilingual' = 'az') => {
    if (lang === 'en') {
      return {
        brand: 'AREA ACADEMY · TRAINING & INNOVATION CENTER',
        title: 'Certificate of Achievement',
        subtitle: 'PROFESSIONAL GRADUATION ACCREDITATION',
        certifyLead: 'This is to officially certify that',
        courseLead: 'has successfully completed the intensive professional training program in',
        andAchieved: 'with final standing grade of',
        trainerTitle: 'Lead Instructor',
        directorTitle: 'Academy Director',
        verifyLabel: 'Official Verified Credential',
      };
    }

    if (lang === 'bilingual') {
      return {
        brand: 'AREA ACADEMY · TƏDRİS VƏ İNNOVASİYA MƏRKƏZİ / INNOVATION CENTER',
        title: 'Məzuniyyət Sertifikatı / Certificate',
        subtitle: 'RƏSMİ PEŞƏKAR TƏSDİQNAMƏ / OFFICIAL ACCREDITATION',
        certifyLead: 'Bu sənəd rəsmi olaraq təsdiq edir ki / This is to certify that',
        courseLead: 'tədris proqramını və praktiki layihələrini uğurla başa vurmuşdur / successfully completed',
        andAchieved: 'Yekun Qiymətləndirmə / Standing Grade:',
        trainerTitle: 'Aparıcı Təlimçi / Lead Instructor',
        directorTitle: 'Akademiya Direktoru / Director',
        verifyLabel: 'Rəsmi Doğrulama / Verified QR',
      };
    }

    return {
      brand: 'AREA ACADEMY · TƏDRİS VƏ İNNOVASİYA MƏRKƏZİ',
      title: 'Məzuniyyət Sertifikatı',
      subtitle: 'PEŞƏKAR MƏZUNİYYƏT VƏ BİTİRMƏ DİPLOMU',
      certifyLead: 'Bu rəsmi sənəd təsdiq edir ki,',
      courseLead: 'peşəkar tədris proqramını və laboratoriya layihələrini',
      andAchieved: 'müvəffəqiyyət dərəcəsi ilə uğurla tamamlamışdır.',
      trainerTitle: 'Aparıcı Təlimçi',
      directorTitle: 'Akademiya Direktoru',
      verifyLabel: 'Rəsmi Onlayn Doğrulama',
    };
  };

  // Helper renderer for Certificate Canvas
  const renderCertificateCanvas = (certData: Certificate | null) => {
    const certLang = certData?.language || language;
    const texts = getCertText(certLang);
    const style = certData?.templateStyle || templateStyle;
    const certStudentName = certData?.studentName || currentStudent?.fullName || 'Tələbə Adı';
    const certCourse = certData?.courseName || currentStudent?.courseName || 'Full-Stack Web Development';
    const certGrade = certData?.grade || grade;
    const certTrainer = certData?.instructorName || instructorName;
    const certDirector = certData?.directorName || directorName;
    const certQr = certData?.qrCodeDataUrl || previewCert?.qrCodeDataUrl;
    const certId = certData?.id || previewCert?.id || 'AREA-2026-CERT';

    return (
      <div
        id="certificate-print-area"
        className={`w-[780px] h-[550px] shrink-0 rounded-xl p-10 relative flex flex-col justify-between select-none shadow-2xl transition-all overflow-hidden ${
          style === 'luxury'
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-8 border-double border-amber-400/80'
            : style === 'modern'
            ? 'bg-white text-slate-900 border-8 border-slate-200 border-l-emerald-600'
            : 'bg-slate-950 text-cyan-50 border-4 border-cyan-500 shadow-cyan-500/20'
        }`}
      >
        {/* Subtle Watermark Seal Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Award className="w-[420px] h-[420px]" />
        </div>

        {/* Top Ornaments & Brand */}
        <div className="text-center space-y-1.5 relative z-10">
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest uppercase">
            <span
              className={
                style === 'luxury'
                  ? 'text-amber-400'
                  : style === 'modern'
                  ? 'text-emerald-600 font-semibold'
                  : 'text-cyan-400 font-mono-nums'
              }
            >
              {texts.brand}
            </span>
          </div>

          <h1
            className={`text-3xl md:text-4xl font-extrabold tracking-wider uppercase font-serif ${
              style === 'luxury'
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100'
                : style === 'modern'
                ? 'text-slate-900'
                : 'text-cyan-400 font-mono-nums'
            }`}
          >
            {texts.title}
          </h1>

          <p className="text-[10px] text-slate-400 tracking-widest uppercase">
            {texts.subtitle}
          </p>
        </div>

        {/* Middle: Student Full Name & Award Statement */}
        <div className="text-center space-y-3 relative z-10 my-auto">
          <p className="text-xs italic text-slate-400">{texts.certifyLead}</p>

          <h2
            className={`text-2xl md:text-3xl font-bold tracking-tight font-serif ${
              style === 'luxury'
                ? 'text-white border-b-2 border-amber-400/60 inline-block px-10 pb-1'
                : style === 'modern'
                ? 'text-slate-900 border-b-2 border-emerald-500 inline-block px-10 pb-1'
                : 'text-cyan-300 border-b border-cyan-500 font-mono-nums inline-block px-10 pb-1'
            }`}
          >
            {certStudentName}
          </h2>

          <p className="text-xs max-w-xl mx-auto text-slate-300 leading-relaxed pt-2">
            AREA Academy-də{' '}
            <strong className="text-white font-bold">"{certCourse}"</strong>{' '}
            {texts.courseLead}{' '}
            <strong
              className={
                style === 'luxury'
                  ? 'text-amber-400'
                  : style === 'modern'
                  ? 'text-emerald-700 font-bold'
                  : 'text-cyan-400'
              }
            >
              {certGrade}
            </strong>{' '}
            {texts.andAchieved}
          </p>
        </div>

        {/* Bottom Row: Signatures, Gold Official Seal, and Verified QR Code */}
        <div className="flex items-end justify-between pt-6 border-t border-slate-700/60 relative z-10">
          {/* Trainer Signature */}
          <div className="text-center space-y-1 w-44">
            <div className="font-serif text-sm italic text-slate-300">
              {certTrainer}
            </div>
            <div className="w-36 h-0.5 bg-slate-600 mx-auto" />
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              {texts.trainerTitle}
            </p>
          </div>

          {/* Golden Official Holographic Seal (Official Accreditation) */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-2 border-amber-400/70 bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-0.5 shadow-lg flex items-center justify-center relative">
              <div className="w-full h-full rounded-full border border-amber-700/40 bg-slate-950 flex flex-col items-center justify-center p-1 text-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[7px] font-bold uppercase tracking-wider text-amber-300 leading-tight">
                  AREA CERTIFIED
                </span>
                <span className="text-[6px] text-amber-200/80 uppercase">
                  OFFICIAL SEAL
                </span>
              </div>
            </div>
            <span className="text-[8px] font-mono-nums text-amber-400/80 mt-1">
              ACC-2026-OK
            </span>
          </div>

          {/* QR Code Online Verification */}
          <div className="text-center flex flex-col items-center">
            <div className="p-1 bg-white rounded-lg shadow-sm">
              {certQr ? (
                <img src={certQr} alt="QR Verifikasiya" className="w-14 h-14" />
              ) : (
                <div className="w-14 h-14 bg-slate-200 flex items-center justify-center text-[8px] text-slate-700">
                  QR Kod
                </div>
              )}
            </div>
            <p className="text-[9px] font-mono-nums text-slate-400 mt-1 font-bold">
              {certId}
            </p>
            <p className="text-[8px] text-slate-400">{texts.verifyLabel}</p>
          </div>

          {/* Director Signature */}
          <div className="text-center space-y-1 w-44">
            <div className="font-serif text-sm italic text-slate-300">
              {certDirector}
            </div>
            <div className="w-36 h-0.5 bg-slate-600 mx-auto" />
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              {texts.directorTitle}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Print Style Injector */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-print-area, #certificate-print-area * {
            visibility: visible;
          }
          #certificate-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 2.5rem !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Sertifikatlar
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono-nums">
              {certificates.length} Verilib
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            QR kodlu rəsmi məzuniyyət sertifikatlarının verilməsi və verifikasiyası.
          </p>
        </div>

        {/* View toggle tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          {canCreateCert && (
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'generate'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Sertifikat Ver</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{isStudent ? 'Sertifikatlarım' : `Arxiv (${certificates.length})`}</span>
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'verify'
                ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Yoxla (QR)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Generate & Live Preview */}
      {activeTab === 'generate' && canCreateCert && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form & Template Controls (no-print) */}
          <div className="lg:col-span-4 space-y-5 no-print">
            {/* Mode Switcher: Single vs Bulk Group */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setGenerateMode('single')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  generateMode === 'single'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Tək Tələbə</span>
              </button>
              <button
                type="button"
                onClick={() => setGenerateMode('bulk')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  generateMode === 'bulk'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Bütün Qrup</span>
              </button>
            </div>

            {/* FORM 1: Single Student Mode */}
            {generateMode === 'single' && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                  Fərdi Sertifikat Parametrləri
                </h3>

                <form onSubmit={handleGenerateCertificate} className="space-y-4">
                  {/* Select Student */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Məzun Tələbə:
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={e => setSelectedStudentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} · {s.courseName} ({s.groupName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Grade / Achievement */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Müvəffəqiyyət Dərəcəsi:
                    </label>
                    <select
                      value={grade}
                      onChange={e => setGrade(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Fərqlənmə ilə">Fərqlənmə ilə (With Honors)</option>
                      <option value="Müvəffəqiyyətlə">Müvəffəqiyyətlə (Success)</option>
                      <option value="İştirakçı">İştirakçı Sertifikatı (Attendance)</option>
                    </select>
                  </div>

                  {/* Language Mode Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Sertifikatın Dili:</span>
                      <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setLanguage('az')}
                        className={`p-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                          language === 'az'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        🇦🇿 Azərbaycanca
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`p-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                          language === 'en'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('bilingual')}
                        className={`p-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                          language === 'bilingual'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        🌐 İkidilli (AZ/EN)
                      </button>
                    </div>
                  </div>

                  {/* Template Style */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Dizayn Şablonu:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setTemplateStyle('luxury')}
                        className={`p-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                          templateStyle === 'luxury'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        Qızılı Prestij
                      </button>
                      <button
                        type="button"
                        onClick={() => setTemplateStyle('modern')}
                        className={`p-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                          templateStyle === 'modern'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        Müasir Minimal
                      </button>
                      <button
                        type="button"
                        onClick={() => setTemplateStyle('cyber')}
                        className={`p-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                          templateStyle === 'cyber'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        Texno Kiber
                      </button>
                    </div>
                  </div>

                  {/* Instructors Signatures */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Təlimçi İmzası:
                      </label>
                      <input
                        type="text"
                        value={instructorName}
                        onChange={e => setInstructorName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Direktor İmzası:
                      </label>
                      <input
                        type="text"
                        value={directorName}
                        onChange={e => setDirectorName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Completion Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Bitmə Tarixi:
                    </label>
                    <input
                      type="date"
                      value={completionDate}
                      onChange={e => setCompletionDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono-nums"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Sertifikatı Təsdiqlə və Reyestrə Yaz</span>
                  </button>
                </form>
              </div>
            )}

            {/* FORM 2: Bulk Group Mode */}
            {generateMode === 'bulk' && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm font-bold text-slate-900">
                    Qrup Məzuniyyət Reyestri
                  </h3>
                  <span className="text-xs font-mono-nums text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    {bulkGroupStudents.length} Tələbə
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Məzun Olan Qrupu Seçin:
                    </label>
                    <select
                      value={selectedGroupId}
                      onChange={e => setSelectedGroupId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500"
                    >
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.name} · {g.courseName} ({g.trainerName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language Mode Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Sertifikatların Dili:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setLanguage('az')}
                        className={`p-1.5 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer ${
                          language === 'az' ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        Azərbaycanca
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`p-1.5 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer ${
                          language === 'en' ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('bilingual')}
                        className={`p-1.5 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer ${
                          language === 'bilingual' ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        İkidilli
                      </button>
                    </div>
                  </div>

                  {/* Students in Group list with grade selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Qrup Tələbələri və Qiymətlər:
                    </label>
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                      {bulkGroupStudents.map(std => {
                        const currentVal = bulkGrades[std.id] || 'Müvəffəqiyyətlə';
                        return (
                          <div key={std.id} className="pt-1.5 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-900 truncate max-w-[140px]">
                              {std.fullName}
                            </span>
                            <select
                              value={currentVal}
                              onChange={e =>
                                setBulkGrades(prev => ({
                                  ...prev,
                                  [std.id]: e.target.value as any,
                                }))
                              }
                              className="text-[11px] bg-white border border-slate-300 rounded px-2 py-1 font-medium"
                            >
                              <option value="Fərqlənmə ilə">Fərqlənmə</option>
                              <option value="Müvəffəqiyyətlə">Müvəffəqiyyət</option>
                              <option value="İştirakçı">İştirakçı</option>
                            </select>
                          </div>
                        );
                      })}
                      {!bulkGroupStudents.length && (
                        <p className="text-xs text-slate-400 italic text-center py-3">
                          Bu qrupda tələbə yoxdur.
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleBulkIssue}
                    disabled={bulkIsIssuing || !bulkGroupStudents.length}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Award className="w-4 h-4 text-emerald-200" />
                    <span>
                      {bulkIsIssuing
                        ? 'Sertifikatlar hazırlanır...'
                        : `Bütün Qrupu Məzun Et (${bulkGroupStudents.length} Sertifikat)`}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions (Print, Export) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Birbaşa Çap & PDF:</span>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Çap Et (A4 Landscape)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Certificate Canvas Preview */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Canlı Sertifikat Baxışı (A4 Landscape · Real-vaxt)
                </h3>
              </div>

              {previewCert && (
                <div className="flex items-center gap-2">
                  <a
                    href={getWhatsAppShareUrl(previewCert)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={getLinkedInCertUrl(previewCert)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              )}
            </div>

            {/* Rendered Certificate Container */}
            <div className="bg-slate-100 p-4 md:p-8 rounded-2xl border border-slate-300 overflow-x-auto shadow-inner flex justify-center">
              {renderCertificateCanvas(previewCert)}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Certificate Archive & Registry */}
      {activeTab === 'archive' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tələbə adı, Sertifikat ID və ya kurs axtarın..."
                  value={archiveSearch}
                  onChange={e => setArchiveSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Group Filter */}
              <select
                value={archiveGroupFilter}
                onChange={e => setArchiveGroupFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
              >
                <option value="all">Bütün Qruplar</option>
                {distinctGroups.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              {/* Grade Filter */}
              <select
                value={archiveGradeFilter}
                onChange={e => setArchiveGradeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
              >
                <option value="all">Bütün Dərəcələr</option>
                <option value="Fərqlənmə ilə">Fərqlənmə ilə</option>
                <option value="Müvəffəqiyyətlə">Müvəffəqiyyətlə</option>
                <option value="İştirakçı">İştirakçı</option>
              </select>

              {/* CSV Export */}
              <button
                onClick={() =>
                  exportToCSV(
                    'AREA_Sertifikatlar_Reyestri',
                    displayCertificates.map(c => ({
                      SertifikatID: c.id,
                      Telebe: c.studentName,
                      Kurs: c.courseName,
                      Qrup: c.groupName,
                      Derece: c.grade,
                      Tarix: c.issueDate,
                      Link: c.verificationUrl,
                    }))
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {isStudent ? 'Sizə Təqdim Edilmiş Rəsmi Sertifikatlar' : 'Verilmiş Sertifikatların Rəsmi Reyestri'}
              </h3>
              <span className="text-xs text-slate-500 font-mono-nums font-semibold">
                Cəmi: {displayCertificates.length} sertifikat
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Sertifikat ID</th>
                    <th className="py-3 px-4">Tələbə</th>
                    <th className="py-3 px-4">Tədris Kursu</th>
                    <th className="py-3 px-4">Qrup</th>
                    <th className="py-3 px-4">Dərəcə</th>
                    <th className="py-3 px-4">Verilmə Tarixi</th>
                    <th className="py-3 px-4 text-right">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayCertificates.map(cert => (
                    <tr key={cert.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono-nums font-bold text-indigo-600">
                        {cert.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{cert.studentName}</td>
                      <td className="py-3 px-4 text-slate-600">{cert.courseName}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono-nums">{cert.groupName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            cert.grade === 'Fərqlənmə ilə'
                              ? 'bg-amber-100 text-amber-800'
                              : cert.grade === 'Müvəffəqiyyətlə'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cert.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono-nums text-slate-500">
                        {formatDateAz(cert.issueDate)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Modal */}
                          <button
                            onClick={() => setModalCert(cert)}
                            title="Tam Ekranda Bax"
                            className="p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* WhatsApp Share */}
                          <a
                            href={getWhatsAppShareUrl(cert)}
                            target="_blank"
                            rel="noreferrer"
                            title="Tələbəyə WhatsApp ilə göndər"
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* LinkedIn Add */}
                          <a
                            href={getLinkedInCertUrl(cert)}
                            target="_blank"
                            rel="noreferrer"
                            title="LinkedIn profilinə əlavə et"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>

                          {/* Verify Portal Link */}
                          <button
                            onClick={() => {
                              setVerifySearchId(cert.id);
                              handleVerify(cert.id);
                              setActiveTab('verify');
                            }}
                            title="Rəsmi Yoxlama"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!displayCertificates.length && (
                <div className="p-10 text-center space-y-2">
                  <Award className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    {isStudent
                      ? 'Adınıza hələ rəsmi sertifikat tərtib edilməyib. Kurs tamamlandıqdan sonra burada əks olunacaq.'
                      : 'Axtarışa uyğun sertifikat tapılmadı.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Online Verification Portal */}
      {activeTab === 'verify' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                AREA Sertifikat Həqiqiliyinin Yoxlanılması
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                İşəgötürənlər, tərəfdaşlar və tələbələr üçün rəsmi QR və ya Sertifikat ID ilə dərhal bazadan yoxlama.
              </p>
            </div>

            {/* Input & Search */}
            <div className="flex gap-2">
              <input
                type="text"
                value={verifySearchId}
                onChange={e => setVerifySearchId(e.target.value)}
                placeholder="Məsələn: AREA-2026-FE-104"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-mono-nums uppercase focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleVerify(verifySearchId)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Yoxla</span>
              </button>
            </div>
          </div>

          {/* Verification Result Card */}
          {verifiedResult && (
            <div className="bg-white rounded-xl border-2 border-emerald-500 p-6 space-y-5 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Sertifikat Həqiqidir və Qüvvədədir
                    </h4>
                    <p className="text-xs text-slate-500">
                      AREA Academy rəsmi tədris bazasında təsdiq olunmuş elektron sənəddir.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModalCert(verifiedResult)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Sertifikata Bax</span>
                  </button>
                  <button
                    onClick={() => handleCopyLink(verifiedResult.verificationUrl)}
                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Linki Kopyala</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tələbənin Tam Adı:</span>
                  <strong className="text-slate-900 text-sm font-semibold">
                    {verifiedResult.studentName}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Sertifikat ID:</span>
                  <strong className="font-mono-nums text-indigo-600 text-sm">
                    {verifiedResult.id}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Tədris Kursu:</span>
                  <span className="text-slate-800 font-medium">{verifiedResult.courseName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Nəticə / Dərəcə:</span>
                  <span className="text-emerald-700 font-semibold">{verifiedResult.grade}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Təsdiq Tarixi:</span>
                  <span className="font-mono-nums text-slate-700">
                    {formatDateAz(verifiedResult.issueDate)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Tədris Mərkəzi:</span>
                  <span className="text-slate-800 font-medium">AREA Academy</span>
                </div>
              </div>

              {/* Social Sharing Actions for Student */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Məzunun Rəsmi Paylaşım Keçidləri:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={getWhatsAppShareUrl(verifiedResult)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={getLinkedInCertUrl(verifiedResult)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn Profilinə Əlavə Et</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Certificate Modal Preview */}
      {modalCert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-4xl w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Rəsmi Sertifikat Nüsxəsi · {modalCert.id}
                </h3>
              </div>
              <button
                onClick={() => setModalCert(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Render */}
            <div className="flex justify-center overflow-x-auto py-2">
              {renderCertificateCanvas(modalCert)}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppShareUrl(modalCert)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp ilə Göndər</span>
                </a>
                <a
                  href={getLinkedInCertUrl(modalCert)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn-ə Əlavə Et</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleCopyLink(modalCert.verificationUrl);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Linki Kopyala</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>A4 Çap Et</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
