# Tələbə Əlavə Edərkən Yoxa Çıxma Probleminin Həlli və İnformativ Validasiya Planı

Nərimanov filialına (və digər filiallara) yeni tələbə əlavə edildikdən sonra səhifəni yenilədikdə (F5) məlumatın itməsi səbəbinin aradan qaldırılması, istifadəçi üçün informativ xəta xəbərdarlıqlarının (alert) və xana validasiyalarının qurulması planı.

---

## 1. Dəqiq Səbəbin İzahı (Root Cause Analysis)

Aparılan diaqnostik testlərin nəticəsi:
1. **Firestore `undefined` Qadağası**:
   - `StudentsView.tsx` formasında bəzi xanalar (FİN kod, Doğum tarixi, Valideyn nömrəsi və ya Nərimanovda mövcud qrup olmadığı üçün qrup məlumatları) boş buraxıldıqda, obyektə `undefined` dəyəri ötürülür.
   - Firestore SDK standart rejimdə obyektdə `undefined` sahəsi olduqda əməliyyatı dayandırır və xəta qaytarır:
     `FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined`.
2. **Niyə İlk Əvvəl Göründü, Sonra Yoxa Çıxdı?**:
   - `addStudent` funksiyası çağırıldıqda əvvəlcə React-in lokal yaddaşı (`setStudents`) yenilənir — buna görə də istifadəçi tələbəni dərhal cədvəldə görür.
   - Lakin arxa planda Firestore bazasına `setDoc` göndərilərkən `undefined` səbəbilə baza sorğunu rədd edir və `.catch(console.warn)` xətanı istifadəçiyə bildirmədən udur.
   - İstifadəçi səhifəni yenilədikdə (F5) tətbiq Firestore-dan məlumatları yenidən çəkir. Baza qeydi qəbul etmədiyi üçün tələbə yoxa çıxır.
3. **İnformativ Alert Çatışmazlığı**:
   - İstifadəçi formanı doldurarkən hansı xanaların mütləq olduğunu və hansı formatda yazılmalı olduğunu aydın görə bilmirdi və bazaya yazılma uğursuz olduqda heç bir xəbərdarlıq pəncərəsi (alert) açılmırdı.

---

## 2. İstifadəçi Tərəfindən Təsdiqlənmiş Tələblər

> [!IMPORTANT]
> - **Tələb 1**: İstifadəçinin boş buraxdığı və ya səhv doldurduğu xanalara aydın, vizual və informativ xəta bildirişi (informativ alert / inline xəbərdarlıq) göstərilməlidir.
> - **Tələb 2**: Bazaya yazılma zamanı istifadəçi xətası və ya şəbəkə xətası baş verərsə, səssiz udulmamalı, istifadəçiyə dərhal aydın izahlı Alert dialoqu çıxmalıdır.
> - **Tələb 3**: Boş xanaların Firestore-a maneəsiz ötürülməsi üçün sanitizasiya və `ignoreUndefinedProperties` təhlükəsizliyi təmin edilməlidir.

---

## 3. Texniki İcra Addımları

### Addım 1: Formada İnformativ Xəta və Validasiya Sistemi (`StudentsView.tsx`)
- Məcburi və tövsiyə olunan xanalar üçün real-vaxt validasiyası:
  - **Ad və Soyad**: Boş olduqda qırmızı haşiyə və *"Zəhmət olmasa tələbənin ad və soyadını qeyd edin (məs: Əli Məmmədov)"* xətası.
  - **Əlaqə Nömrəsi**: Boş və ya natamam olduqda *"Əlaqə nömrəsi ən azı 9 rəqəmdən ibarət olmalıdır (məs: 050 123 45 67)"* xətası.
  - **FİN Kod**: Əgər doldurulubsa, dəqiq 7 simvol (hərf/rəqəm) tələbi və format izahı.
  - **Aylıq Tədris Haqqı**: Mənfi və ya boş olduqda xəbərdarlıq.
  - **Filial və Qrup Bildirişi**: Əgər seçilmiş filialda (məs: Nərimanovda) hələ qrup yaradılmayıbsa, formanın üstündə informativ mavi/sarı bildiriş bloku: *"Bu filialda hələ aktiv qrup yoxdur. Tələbə 'Qrup yoxdur (Sonradan təyin et)' statusu ilə qeydiyyata alınacaq."*
- Formanın yuxarısında xətaların ümumi icmalı üçün informativ qırmızı `AlertBanner` komponenti.

### Addım 2: Firestore Təhlükəsizliyi və Boş Sahələrin Sanitizasiyası (`src/firebase/config.ts` & `src/context/CrmContext.tsx`)
- `src/firebase/config.ts` faylında `initializeFirestore` konfiqurasiyasına `ignoreUndefinedProperties: true` əlavə edilməsi.
- `sanitizeForFirestore(data)` köməkçi funksiyasının tətbiqi:
  - Bütün `undefined` sahələri ya təmizlənir, ya da təhlükəsiz `null` / boş string ilə əvəzlənir.
- `addStudent` metodunda Firestore əməliyyatının `await` ilə təsdiqlənməsi:
  - Əgər yazılma uğurlu olarsa -> yaşıl uğur toast-u (`"Tələbə bazaya uğurla yazıldı və yadda saxlanıldı"`).
  - Əgər Firestore hər hansı səbəbdən xəta qaytararsa -> dərhal istifadəçiyə modal xəbərdarlıq (Alert): *"Məlumat bazaya yazıla bilmədi: [Dəqiq səbəb]. Zəhmət olmasa yenidən cəhd edin."*

### Addım 3: Nərimanov və Digər Filiallar Üçün İlkin Qrup Təminatı
- Nərimanov filialında hazırda qrup olmadığı üçün tələbə əlavə edilərkən müqavilə və borc cədvəlində `grp-unassigned` qeydinin təhlükəsiz idarə olunması.

---

## 4. Dəyişdiriləcək Fayllar

1. `src/firebase/config.ts` - `ignoreUndefinedProperties: true` aktivləşdirilməsi.
2. `src/utils/sanitizeFirestore.ts` - Baza üçün məlumatların təhlükəsiz filterlənməsi köməkçisi.
3. `src/context/CrmContext.tsx` - `addStudent` və əlaqəli funksiyalarda təhlükəsiz `await` yazılışı və dəqiq xəta ötürülməsi.
4. `src/components/students/StudentsView.tsx` - İnformativ xəta alertləri, xanaların canlı validasiya mesajları və qırmızı vizual indikatorlar.

---

## 5. Yoxlama və Təhvil

1. Formada bilərəkdən boş sahələrlə (məs: FİN-siz, Doğum tarixisiz) Nərimanov filialına yeni tələbə daxil edilməsi.
2. Tələbənin dərhal Firestore bazasında mövcudluğunun Node skripti ilə təsdiqi.
3. Səhifəni yenilədikdə (F5) tələbənin tam olaraq yerində qaldığının yoxlanılması.
4. Boş ad və ya yanlış nömrə daxil edildikdə informativ alert bildirişinin açılmasının yoxlanılması.
5. `compile_applet` və `lint_applet` ilə tətbiqin xətasız kompayl edilməsi.
