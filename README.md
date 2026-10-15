# الذهابة — El Dhehaba 🪙✨

**نظام إدارة ونقطة بيع لمتاجر المجوهرات والذهب بالجزائر (سطيف — رو دو قسنطينة وعين الفوارة)**  
*Modern Jewelry POS & Inventory System tailored specifically for Algerian Gold Market trade dynamics.*

---

## 🌟 الميزات الرئيسية (Key Features)

### 1. السوم اليومي الفوري (Dynamic Soum El Youm)
- **لا توجد أسعار ثابتة مخزنة في قاعدة البيانات**: أسعار القطع تُحسب تلقائياً لحظة الاستعلام استناداً إلى السعر اليومي النشط (سوم الجديد وسوم الكاس).
- **شريط علوي دائم (Sticky Rate Banner)**: يتيح لصاحب المحل قفل وتعديل السوم اليومي (`🔒 تعديل السوم`) بنقرة واحدة، وتحديث كل المعروضات فورياً مع تسجيل كامل للتغييرات السابقة (Audit Trail).

### 2. العرض المزدوج: دينار وسنتيم (DZD + Algerian Centimes)
- الواجهة تعرض المبالغ بالدينار الجزائري وبصيغة السوق المتداولة شفهياً (**ملايين وآلاف السنتيم**، مثل: `14 مليون و 550 ألف` و `145,500 د.ج`) لمنع أي التباس بين التاجر والزبون.

### 3. شاشة التبديل الموحدة (Unified Tabdil Workflow)
- يتيح إتمام عمليات التبديل (ذهب جديد للزبون مقابل كاس قديم + الفارق المالي أو المساعدة) في شاشة واحدة متكاملة دون الحاجة لفتح شاشتين منفصلتين للبيع والشراء.

### 4. حاسبة الميزان السريعة (Quick Counter Scale Calculator)
- لوحة أرقام سريعة تعمل باللمس عند الميزان للإجابة الفورية على استفسارات الزبائن ("شحال هذا الخاتم؟") مع خاصية خصم وزن الأحجار غير الذهبية (Zircon) فورياً.

### 5. صندوق الكاس (Casse Vault Tracker)
- تتبع الذهب القديم المتراكم المخصص للذوبان والتصفية (Affineur / التصفية)، مع مؤشر تراكم نحو عتبة الـ 200 غرام والقيمة التقديرية الحالية بالسنتيم.

---

## 🛠️ بنية التقنيات (Tech Stack)

| الطبقة | التقنية المستخدمة | الفائدة |
|---|---|---|
| **Frontend** | Next.js (App Router) + Tailwind CSS | سرعة استجابة عالية ودعم كامل للاتجاه من اليمين لليسار (RTL) |
| **State Management** | Zustand + LocalStorage Persistence | حفظ حالة السلة والسوم محلياً مع أداء سريع |
| **Backend & ORM** | Next.js API Routes + Prisma ORM | تكامل وسهولة إدارة قاعدة البيانات والعمليات المالية |
| **Database** | SQLite (مدمج محلياً) / جاهز للترقية إلى PostgreSQL | يعمل بدون إنترنت على جهاز المحل |
| **Data Fetching** | TanStack React Query | تحديث فوري وإعادة جلب البيانات بسلاسة |

---

## 🚀 التثبيت والتشغيل (Quick Start)

### المتطلبات
- Node.js (الإصدار 18 أو أحدث)
- npm أو pnpm أو yarn

### خطوات التشغيل

1. **استنساخ المستودع (Clone Repository):**
   ```bash
   git clone https://github.com/AssemDrif/el-dhehaba.git
   cd el-dhehaba
   ```

2. **تثبيت الحزم (Install Dependencies):**
   ```bash
   npm install
   ```

3. **إعداد قاعدة البيانات وتوليد البيانات الأولية (Setup & Seed DB):**
   ```bash
   cp .env.example .env
   npm run db:push
   npm run db:seed
   ```

4. **تشغيل خادم التطوير (Run Development Server):**
   ```bash
   npm run dev
   ```

5. افتح المتصفح على: `http://localhost:3000`

---

## 📁 هيكلية المشروع (Project Structure)

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # تخطيط لوحة التحكم مع شريط السوم والشريط الجانبي
│   │   ├── page.tsx                # نقطة البيع (الكاسا) وحاسبة الميزان
│   │   ├── inventory/page.tsx      # إدارة المخزون وبطاقات الأسعار الديناميكية
│   │   ├── casse-vault/page.tsx    # صندوق الكاس وتتبع الذوبان (Affineur)
│   │   └── settings/page.tsx       # سجل السوم التاريخي والإعدادات
│   └── api/
│       ├── rates/                  # واجهة قراءة وتحديث السوم اليومي
│       ├── inventory/              # واجهة إدارة قطع الذهب
│       ├── transactions/           # إتمام المعاملات المالية ذرّياً (Atomic)
│       └── casse-vault/            # إدارة إدخالات صندوق الكاس
├── components/
│   ├── rates/StickyRateBanner.tsx  # شريط السوم المثبت بأعلى الشاشة
│   ├── pos/QuickScaleCalc.tsx      # حاسبة الميزان السريعة مع لوحة أرقام
│   ├── pos/TabdilSplitScreen.tsx   # شاشة التبديل الموحدة
│   └── inventory/JewelFormModal.tsx# نموذج إضافة قطعة جديدة بحقول ديناميكية
└── lib/
    ├── pricingEngine.ts            # محرك الحسابات المالية وصيغة السنتيم
    ├── store.ts                    # حالة التطبيق الشاملة (Zustand)
    └── db.ts                       # نسخة Prisma Client الآمنة
```

---

## 📄 الترخيص (License)
MIT License.
