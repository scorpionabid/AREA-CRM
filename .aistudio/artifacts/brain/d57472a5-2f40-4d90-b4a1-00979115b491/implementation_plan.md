# Filial Funksionallıqlarının Submenu Altında Qruplaşdırılması

Naviqasiya menyusunun (Sidebar) təşkilati arxitekturasını yeniləyərək, filiala aid əsas modulları (Tələbələr, Müqavilələr, Lidlər, Davamiyyət, QR Giriş, Qruplar və Sertifikatlar) istifadəçinin təqdim etdiyi interfeys dizaynına uyğun olaraq "Filiallar" alt menyusu (accordion/submenu) daxilində birləşdirmək.

## Təsdiqlənmiş Qərarlar və İstifadəçi Cavabları

> [!IMPORTANT]
> İstifadəçi sorğusu əsasında dəqiqləşdirilmiş seçimlər:

- **İlkin Vəziyyət**: Filiallar alt menyusu səhifə ilk açılanda bağlı (collapsed) qalacaq, istifadəçi başlıq üzərinə kliklədikdə animasiya ilə açılacaq (əgər cari aktiv modul filial alt menyusundadırsa, istifadəçinin konteksti itirməməsi üçün avtomatik açıq göstəriləcək).
- **Filiallar Başlığının Davranışı**: Əsas "Filiallar" düyməsinə kliklədikdə səhifə dəyişməyəcək, yalnız alt menyu açılıb-bağlanacaq (`toggleExpand`).
- **Digər Modulların Yeri**: Şəkildə göstərilməyən "Kurikulum", "Maliyyə", "Tapşırıqlar", "KPI Sistemi", "WhatsApp" və "İstifadəçilər / Heyət" modulları əsas menyu sütununda müstəqil bəndlər kimi qalacaq.

---

### 1. İcmal və Konsept

- **Hədəf**: Sidebar menyusunun vizual sıxlığını azaltmaq, filial idarəetməsi ilə birbaşa əlaqəli olan əməliyyatları vahid məntiqi bölmə altında strukturlaşdırmaq.
- **Dizayn Uyğunluğu**: İstifadəçinin göndərdiyi `Screenshot_2026-10-25_at_13.40.38_9ef0cd8c.png` ekran görüntüsündəki dizayna (yuvarlaqlaşdırılmış alt panel, zərif fon fərqi, ikonlar və chevron oxu) 100% uyğunlaşdırılacaq.

---

### 2. İstifadəçi Təcrübəsi və Vizual Dizayn

#### A. Vizual Struktur və Komponent İyerarxiyası
1. **İdarəetmə Paneli**: Əsas yuxarı naviqasiya bəndi (aktiv olduqda bənövşəyi/indigo qradiyent və ikon).
2. **Filiallar Bölməsi (Accordion Submenu Container)**:
   - Başlıq: `Building2` ikonu, "Filiallar" mətni, sağ tərəfdə vəziyyətə görə dönən `ChevronDown` oxu (`transition-transform duration-200`).
   - Daxili Submenu Paneli:
     - `Tələbələr` (`Users`) - tələbə sayı sayğacı ilə
     - `Müqavilələr` (`FileSignature`) - aktiv müqavilələr sayğacı ilə
     - `Lidlər` (`UserCheck`) - aktiv lidlər sayğacı ilə
     - `Davamiyyət` (`CalendarCheck`)
     - `QR Giriş` (`QrCode`)
     - `Qruplar` (`GraduationCap`) - mövcud qrup sayı ilə
     - `Sertifikatlar` (`Award`) - sertifikat sayı ilə
3. **Müstəqil Əsas Menyu Bəndləri**:
   - `Maliyyə` (`Wallet`)
   - `Kurikulum` (`BookOpen`)
   - `Tapşırıqlar` (`ClipboardList`)
   - `KPI Sistemi` (`Target`)
   - `WhatsApp` (`MessageSquare`)
   - `İstifadəçilər` / `Təlimçilər & Heyət` (`UserCog` / `GraduationCap`)

```
┌──────────────────────────────────────────────┐
│  [A] AREA CRM Tədris                     [<] │
├──────────────────────────────────────────────┤
│  [■] İdarəetmə Paneli                        │
│                                              │
│  [🏢] Filiallar                          [v] │
│  ┌─────────────────────────────────────────┐ │
│  │   [👥] Tələbələr                    (48)│ │
│  │   [📝] Müqavilələr                  (12)│ │
│  │   [👤] Lidlər                        (5)│ │
│  │   [📅] Davamiyyət                       │ │
│  │   [▦] QR Giriş                          │ │
│  │   [🎓] Qruplar                      (10)│ │
│  │   [🎖️] Sertifikatlar                 (8)│ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  [👛] Maliyyə                                │
│  [📖] Kurikulum                              │
│  [📋] Tapşırıqlar                            │
│  [🎯] KPI Sistemi                            │
│  [💬] WhatsApp                               │
│  [⚙️] İstifadəçilər                          │
└──────────────────────────────────────────────┘
```

#### B. Menyunun Yığılmış (Collapsed) Rejimi
- İstifadəçi sidebar-ı yığdıqda (`isCollapsed: true`), "Filiallar" ikonu üzərinə gəldikdə və ya kliklədikdə alt menyu itmir, tooltip / flyout popover şəklində rahat seçim imkanı yaradır.

---

### 3. Texniki Arxitektura və Dəyişikliklər

- **Fayl**: `src/components/layout/Sidebar.tsx`
  - `branchSubmenuItems` massivi tərtib edilir (`students`, `contracts`, `leads`, `attendance`, `staff-attendance`, `groups`, `certificates`).
  - `isBranchMenuOpen` yerli state əlavə edilir (ilkin dəyəri `false`, lakin aktiv tab alt menyudakı elementlərdən biridirsə avtomatik açıq saxlanılır).
  - Şəkildəki estetikaya tam uyğun Tailwind CSS sinifləri tətbiq edilir (`bg-slate-800/60`, `border border-slate-700/50`, `rounded-xl`, `pl-3`).
  - Rol və icazə (`can('view', moduleId)`) yoxlamaları tam qorunur; müvafiq rola aid olmayan alt menyu elementləri təhlükəsiz şəkildə gizlədilir.
  - Heç bir xarici paket tələb olunmur, mövcud `lucide-react` ikonları istifadə edilir.

---

### 4. Yoxlama Planı

1. **İlkin vəziyyətin yoxlanması**: Səhifə yeniləndikdə Filiallar alt menyusunun bağlı olması və yalnız kliklə açılması.
2. **Alt menyu elementlərinin işləkliyi**: `Tələbələr`, `Müqavilələr`, `Lidlər`, `Davamiyyət`, `QR Giriş`, `Qruplar`, `Sertifikatlar` düymələrinə kliklədikdə müvafiq səhifələrin dərhal açılması və aktiv stilin göstərilməsi.
3. **Maliyyə və digər modulların yoxlanması**: `Maliyyə`, `Kurikulum`, `Tapşırıqlar` və s. bəndlərin müstəqil şəkildə aşağıda yerləşməsi və düzgün işləməsi.
4. **Kod yoxlanışı**: `compile_applet` və `lint_applet` vasitəsilə 0 xəta ilə təsdiqlənməsi.
