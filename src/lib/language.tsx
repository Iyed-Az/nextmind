import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { PublicProgram } from "@/lib/programs.server";
import { cn } from "@/lib/utils";

export type Lang = "ar" | "en";

const dict = {
  /* ---------- Shared / nav ---------- */
  programs: { ar: "الدورات", en: "Programs" },
  howItWorks: { ar: "كيف نشتغل؟", en: "How it works" },
  about: { ar: "من نحن", en: "About" },
  findUs: { ar: "موقعنا", en: "Find us" },
  campus: { ar: "فضاءاتنا", en: "Our spaces" },
  studentLogin: { ar: "دخول الطالب", en: "Student login" },
  mySpace: { ar: "فضائي", en: "My space" },
  bookConsultation: { ar: "احجز استشارة", en: "Book a consultation" },
  bookFreeConsultation: { ar: "احجز استشارة مجانية", en: "Book a free consultation" },
  explorePrograms: { ar: "اكتشف الدورات", en: "Explore programs" },
  skipToContent: { ar: "الانتقال إلى المحتوى", en: "Skip to content" },

  /* ---------- Hero ---------- */
  heroEyebrow: {
    ar: "الفنون الرقمية · التصميم · الابتكار",
    en: "Digital Arts · Design · Innovation",
  },
  heroTitleA: { ar: "مهارات إبداعية لـ", en: "Creative skills for the" },
  heroTitleAccent: { ar: "الجيل القادم", en: "next generation" },
  heroTitleB: { ar: "— وللجميع.", en: "— and everyone else." },
  heroIntro: {
    ar: "تقدم أكاديمية نكست مايند ورشات ودورات عملية للأطفال والمراهقين والكبار في الفنون الرقمية والتصميم والابتكار. أقسام صغيرة. مشاريع حقيقية. مشرفون يعملون في الميدان.",
    en: "NextMind Academy runs hands-on workshops and courses for kids, teens and adults across digital arts, design and innovation. Small classes. Real projects. Mentors who work in the field.",
  },
  statAcademies: { ar: "أكاديميات في مكان واحد", en: "Academies in one" },
  statTracks: { ar: "مسارات ورشات", en: "Workshop tracks" },
  statMentor: { ar: "مشرف لكل متعلمين", en: "Mentor to learner" },
  statProjects: { ar: "تعلّم بالمشاريع", en: "Project-based" },

  /* ---------- Campus ---------- */
  campusEyebrow: { ar: "داخل نكست مايند", en: "Inside NextMind" },
  campusTitle: { ar: "مساحات صُممت للأفكار الكبيرة", en: "Spaces made for big ideas" },
  campusIntro: {
    ar: "من الاستقبال الهادئ إلى قاعات العمل الجماعي، كل زاوية في الأكاديمية تساعد المتعلم على التركيز والتجربة والإبداع.",
    en: "From a calm welcome area to collaborative classrooms, every corner of the academy helps learners focus, experiment and create.",
  },
  campusWelcome: { ar: "مساحة استقبال مريحة", en: "A welcoming first step" },
  campusClassroom: { ar: "قاعات مجهزة للتعلّم", en: "Equipped learning rooms" },
  campusCollaboration: { ar: "بيئة للعمل الجماعي", en: "Built for collaboration" },
  campusIdeas: { ar: "حيث تبدأ الفكرة", en: "Where ideas begin" },

  /* ---------- Programs section ---------- */
  programsTitle: { ar: "ثلاث أكاديميات في حرم واحد", en: "Three academies, one campus" },
  programsIntro: {
    ar: "كل مسار يتوفر كورشة قصيرة أو دورة كاملة، من المبتدئين إلى المحترفين.",
    en: "Every track runs as a short workshop or a full course, for beginners through to working professionals.",
  },
  emptyPrograms: {
    ar: "يتم تحضير دورات جديدة — عد قريباً.",
    en: "New programs are being prepared — check back soon.",
  },
  price: { ar: "السعر", en: "Price" },
  duration: { ar: "المدة", en: "Duration" },
  schedule: { ar: "التوقيت", en: "Schedule" },
  starts: { ar: "البداية", en: "Starts" },
  seats: { ar: "المقاعد", en: "Seats" },
  seatsLeft: { ar: "مقاعد متبقية", en: "seats left" },
  fullWaitlist: {
    ar: "مكتملة — انضم لقائمة الانتظار عبر الاستشارة",
    en: "Full — join the waitlist via consultation",
  },
  enrollNow: { ar: "سجّل الآن", en: "Enroll now" },

  /* ---------- How it works ---------- */
  howTitle: {
    ar: "من أول مكالمة إلى أول مشروع في أسبوع",
    en: "From first call to first project in a week",
  },
  step1Title: { ar: "احجز استشارة", en: "Book a consultation" },
  step1Copy: {
    ar: "محادثة قصيرة ومجانية عن عمر المتعلم واهتماماته وجدوله.",
    en: "A short, free conversation about the learner's age, interests and schedule.",
  },
  step2Title: { ar: "احصل على مسار تعلّم", en: "Get a learning path" },
  step2Copy: {
    ar: "نقترح عليك الورشة أو الدورة وصيغة القسم المناسبة.",
    en: "We recommend the right workshop or course track and class format.",
  },
  step3Title: { ar: "ابدأ الإبداع", en: "Start creating" },
  step3Copy: {
    ar: "أقسام صغيرة، مشاريع حقيقية، وتوجيه من المشرفين منذ الأسبوع الأول.",
    en: "Small classes, real projects, and mentor feedback from week one.",
  },

  /* ---------- About ---------- */
  aboutEyebrow: { ar: "من نحن", en: "About us" },
  aboutTitle: { ar: "نعلّم الإبداع كحرفة", en: "We teach creativity as a craft" },
  aboutP1: {
    ar: "بُنيت أكاديمية نكست مايند للفضوليين — الطفل الذي يرسم على كل سطح، والمراهق الذي يصمم شعارات لأصدقائه، والكبير الذي ينتقل إلى عالم التصميم أو التقنية. نحافظ على أقسام صغيرة، ونضع الأدوات بين الأيدي منذ اليوم الأول، ونقيس التقدم بالأعمال المنجزة لا بساعات الشرح.",
    en: "NextMind Academy was built for curious people — the eight-year-old who draws on every surface, the teenager designing logos for friends, the adult switching into design or tech. We keep classes small, put tools in hands on day one, and measure progress in finished work rather than lecture hours.",
  },
  aboutP2: {
    ar: "تُقام الورشات حضورياً وعن بُعد، للأفراد والعائلات والمدارس والفرق.",
    en: "Workshops run in-person and online, for individuals, families, schools and teams.",
  },
  instagramCta: { ar: "شاهد أعمالنا على إنستغرام", en: "See our work on Instagram" },
  featSmall: { ar: "أقسام صغيرة", en: "Small classes" },
  featSmallC: {
    ar: "ستة متعلمين لكل مشرف، فلا يضيع أحد.",
    en: "Six learners per mentor, so nobody gets lost.",
  },
  featReal: { ar: "مشاريع حقيقية", en: "Real projects" },
  featRealC: {
    ar: "يخرج الجميع بأعمال جاهزة للمحفظة.",
    en: "Everyone leaves with portfolio-ready work.",
  },
  featAges: { ar: "لكل الأعمار", en: "All ages" },
  featAgesC: {
    ar: "أطفال ومراهقون وكبار، لكلٍّ مساره.",
    en: "Kids, teens and adults, each on their own track.",
  },
  featFlex: { ar: "مرونة", en: "Flexible" },
  featFlexC: {
    ar: "ورشات نهاية الأسبوع، مخيمات العطل ودورات كاملة.",
    en: "Weekend workshops, holiday camps and full courses.",
  },

  /* ---------- Location ---------- */
  locationTitle: { ar: "زر الأكاديمية", en: "Visit the academy" },
  locationP: {
    ar: "قاعاتنا مفتوحة للورشات والدورات والزيارات. اضغط الزر أدناه للحصول على الاتجاهات خطوة بخطوة من أي مكان.",
    en: "Our studio classrooms are open for workshops, courses and visits. Tap the button below for turn-by-turn directions from wherever you are.",
  },
  coordinates: { ar: "الإحداثيات:", en: "Coordinates:" },
  getDirections: { ar: "احصل على الاتجاهات", en: "Get directions" },

  /* ---------- Booking / consultation form ---------- */
  bookingEyebrow: { ar: "احجز استشارة", en: "Book a consultation" },
  bookingTitle: { ar: "لنختر المسار المناسب", en: "Let's find the right track" },
  bookingP: {
    ar: "أخبرنا من سيتعلم وما يثير فضوله. سنرد عليك باقتراح ورشة أو دورة، مع التواريخ والأسعار — دون أي التزام.",
    en: "Tell us who's learning and what they're curious about. We'll reply with a recommended workshop or course, dates and pricing — no obligation.",
  },
  preferChat: { ar: "تفضّل المحادثة؟ راسلنا على", en: "Prefer to chat? Message us on" },
  fullName: { ar: "الاسم الكامل", en: "Full name" },
  namePlaceholder: { ar: "أمينة بن علي", en: "Ada Obi" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  whoLearning: { ar: "من سيتعلم؟", en: "Who is learning?" },
  learnerChild: { ar: "طفل", en: "A child" },
  learnerTeen: { ar: "مراهق", en: "A teenager" },
  learnerAdult: { ar: "كبير", en: "An adult" },
  learnerGroup: { ar: "مجموعة / مدرسة", en: "A group / school" },
  interest: { ar: "مجال الاهتمام", en: "Area of interest" },
  interestArts: { ar: "الفنون الرقمية", en: "Digital Arts" },
  interestDesign: { ar: "التصميم", en: "Design" },
  interestTech: { ar: "الابتكار والتكنولوجيا", en: "Innovation & Tech" },
  interestUnsure: { ar: "لست متأكداً بعد", en: "Not sure yet" },
  achieve: { ar: "ماذا تريد أن تحقق؟", en: "What would you like to achieve?" },
  achievePlaceholder: {
    ar: "أخبرنا قليلاً عن أهدافك وجدولك ومستوى خبرتك.",
    en: "Tell us a little about your goals, schedule and experience level.",
  },
  requestConsultation: { ar: "اطلب استشارتي المجانية", en: "Request my free consultation" },
  consultSent: {
    ar: "مسودة بريدك جاهزة — أرسلها وسنرد خلال يوم عمل واحد.",
    en: "Your email draft is ready — send it and we'll reply within one working day.",
  },

  /* ---------- Footer ---------- */
  footerTagline: {
    ar: "الفنون الرقمية · التصميم · الابتكار — للأطفال والمراهقين والكبار.",
    en: "Digital Arts · Design · Innovation — for kids, teens and adults.",
  },
  staffLogin: { ar: "دخول الطاقم", en: "Staff login" },
  footerRights: { ar: "جميع الحقوق محفوظة.", en: "All rights reserved." },
  footerNav: { ar: "روابط", en: "Navigate" },
  footerConnect: { ar: "تواصل معنا", en: "Connect" },

  /* ---------- Auth ---------- */
  studentArea: { ar: "فضاء الطالب", en: "Student area" },
  welcomeBack: { ar: "مرحباً بعودتك", en: "Welcome back" },
  createYourAccount: { ar: "أنشئ حسابك", en: "Create your account" },
  signinSub: {
    ar: "سجّل الدخول لرؤية دوراتك وملفك الشخصي.",
    en: "Sign in to see your formations and profile.",
  },
  signupSub: {
    ar: "سجّل مرة واحدة، ثم التحق بأي دورة بنقرة واحدة.",
    en: "Register once, then enroll in any formation in a click.",
  },
  signIn: { ar: "تسجيل الدخول", en: "Sign in" },
  signUp: { ar: "إنشاء حساب", en: "Sign up" },
  signingIn: { ar: "جارٍ تسجيل الدخول…", en: "Signing in…" },
  creatingAccount: { ar: "جارٍ إنشاء الحساب…", en: "Creating account…" },
  createAccountBtn: { ar: "إنشاء الحساب", en: "Create account" },
  password: { ar: "كلمة المرور", en: "Password" },
  studentFullName: { ar: "الاسم الكامل للطالب", en: "Student full name" },
  phone: { ar: "الهاتف", en: "Phone" },
  birthDate: { ar: "تاريخ الميلاد", en: "Date of birth" },
  guardianIfMinor: { ar: "ولي الأمر (إن كان دون 18)", en: "Parent / guardian (if under 18)" },
  city: { ar: "المدينة", en: "City" },
  staffQuestion: { ar: "من طاقم الأكاديمية؟", en: "Academy staff?" },
  invalidCreds: {
    ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    en: "Email or password is incorrect.",
  },
  accountExists: {
    ar: "يوجد حساب بهذا البريد. جرّب تسجيل الدخول.",
    en: "An account with this email already exists. Try signing in.",
  },
  welcomeToast: { ar: "مرحباً بك في أكاديمية نكست مايند!", en: "Welcome to NextMind Academy!" },
  profileSaveFailed: {
    ar: "تم إنشاء الحساب، لكن تعذّر حفظ ملفك. يمكنك إكماله لاحقاً.",
    en: "Account created, but we could not save your profile. You can complete it later.",
  },
  forgotPassword: { ar: "نسيت كلمة المرور؟", en: "Forgot password?" },
  resetPasswordTitle: { ar: "استعادة كلمة المرور", en: "Reset your password" },
  resetPasswordSub: {
    ar: "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.",
    en: "Enter your email and we'll send you a link to reset your password.",
  },
  sendResetLink: { ar: "إرسال رابط الاستعادة", en: "Send reset link" },
  sendingResetLink: { ar: "جارٍ الإرسال…", en: "Sending…" },
  resetLinkSent: {
    ar: "إذا كان هذا البريد مسجلاً لدينا، ستصلك رسالة تحتوي على رابط الاستعادة خلال دقائق.",
    en: "If that email is registered, a reset link is on its way — check your inbox in a few minutes.",
  },
  backToSignIn: { ar: "العودة لتسجيل الدخول", en: "Back to sign in" },
  setNewPasswordTitle: { ar: "عيّن كلمة مرور جديدة", en: "Set a new password" },
  setNewPasswordSub: {
    ar: "اختر كلمة مرور جديدة لحسابك. يجب أن تتكون من 8 أحرف على الأقل.",
    en: "Choose a new password for your account. It must be at least 8 characters.",
  },
  newPassword: { ar: "كلمة المرور الجديدة", en: "New password" },
  updatePassword: { ar: "تحديث كلمة المرور", en: "Update password" },
  updatingPassword: { ar: "جارٍ التحديث…", en: "Updating…" },
  passwordUpdated: { ar: "تم تحديث كلمة المرور بنجاح.", en: "Your password has been updated." },
  passwordUpdateFailed: {
    ar: "تعذّر تحديث كلمة المرور. حاول مرة أخرى.",
    en: "Could not update your password. Please try again.",
  },

  /* ---------- Dashboard ---------- */
  signOut: { ar: "تسجيل الخروج", en: "Sign out" },
  hello: { ar: "مرحباً،", en: "Hello," },
  dashIntro: {
    ar: "تابع دوراتك، اطلب دورات جديدة وحافظ على ملفك محدثاً.",
    en: "Follow your formations, request new ones and keep your profile up to date.",
  },
  tabMyCourses: { ar: "دوراتي", en: "My formations" },
  tabBrowse: { ar: "الالتحاق بدورة", en: "Enroll in a formation" },
  tabProfile: { ar: "ملفي الشخصي", en: "My profile" },
  completeProfileHint: {
    ar: "أكمل ملفك حتى تتمكن الأكاديمية من التواصل معك بشأن دوراتك.",
    en: "Complete your profile so the academy can contact you about your formations.",
  },
  completeProfile: { ar: "أكمل الملف", en: "Complete profile" },
  loadingFormations: { ar: "جارٍ تحميل الدورات…", en: "Loading formations…" },
  loadingYours: { ar: "جارٍ تحميل دوراتك…", en: "Loading your formations…" },
  noFormations: { ar: "لا توجد دورات بعد", en: "No formations yet" },
  noFormationsP: {
    ar: "اختر دورة وأرسل طلب التحاق — ستؤكدها الأكاديمية قريباً.",
    en: "Pick a formation and send an enrollment request — the academy will confirm it shortly.",
  },
  browseFormations: { ar: "تصفح الدورات", en: "Browse formations" },
  noneOpen: { ar: "لا توجد دورات مفتوحة حالياً.", en: "No formations are open right now." },
  requestedOn: { ar: "طُلب في", en: "Requested on" },
  cancelRequest: { ar: "إلغاء الطلب", en: "Cancel request" },
  requestCancelled: { ar: "تم إلغاء الطلب", en: "Request cancelled" },
  cancelFailed: { ar: "تعذّر إلغاء الطلب", en: "Could not cancel the request" },
  statusPending: { ar: "بانتظار الموافقة", en: "Awaiting approval" },
  statusApproved: { ar: "مسجَّل", en: "Enrolled" },
  statusDeclined: { ar: "مرفوض", en: "Declined" },
  alreadyRequested: { ar: "طلبتها مسبقاً", en: "Already requested" },
  fullLabel: { ar: "مكتملة", en: "Full" },
  messageForAcademy: { ar: "رسالة للأكاديمية (اختياري)", en: "Message for the academy (optional)" },
  requestEnrollment: { ar: "إرسال طلب الالتحاق", en: "Request enrollment" },
  completeToEnroll: { ar: "أكمل ملفك للالتحاق", en: "Complete profile to enroll" },
  requestSent: {
    ar: "أُرسل الطلب! ستؤكد الأكاديمية مكانك.",
    en: "Request sent! The academy will confirm your place.",
  },
  requestFailed: { ar: "تعذّر إرسال الطلب", en: "Could not send the request" },
  ofSeatsLeft: { ar: "متبقية من", en: "of" },
  seatsLeftSuffix: { ar: "", en: "left" },
  yourDetails: { ar: "بياناتك", en: "Your details" },
  parentGuardian: { ar: "ولي الأمر", en: "Parent / guardian" },
  notesOptional: {
    ar: "أي شيء يجب أن تعرفه الأكاديمية (اختياري)",
    en: "Anything the academy should know (optional)",
  },
  saveProfile: { ar: "حفظ الملف", en: "Save profile" },
  saving: { ar: "جارٍ الحفظ…", en: "Saving…" },
  profileSaved: { ar: "تم حفظ الملف", en: "Profile saved" },
  profileSaveError: {
    ar: "تعذّر حفظ ملفك. تأكد أن الاسم يتجاوز حرفين.",
    en: "Could not save your profile. Check the name is at least 2 characters.",
  },
  loadingProfile: { ar: "جارٍ تحميل الملف…", en: "Loading profile…" },
  formationLabel: { ar: "دورة", en: "Formation" },
} satisfies Record<string, Record<Lang, string>>;

export type TKey = keyof typeof dict;

type LangContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey) => string;
  isRTL: boolean;
};

const LangContext = createContext<LangContextValue>({
  lang: "ar",
  setLang: () => {},
  t: (k) => dict[k].ar,
  isRTL: true,
});

const STORAGE_KEY = "nm-lang";

function initialLang(): Lang {
  if (typeof window === "undefined") return "ar";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" ? "en" : "ar";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, isRTL]);

  const value: LangContextValue = {
    lang,
    setLang: setLangState,
    t: (k) => dict[k][lang],
    isRTL,
  };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLanguage() {
  return useContext(LangContext);
}

/** Small pill switch between Arabic and English. */
export function LanguageToggle({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const { lang, setLang } = useLanguage();
  const dark = tone === "dark";
  const option = (code: Lang, label: string) => (
    <button
      type="button"
      onClick={() => setLang(code)}
      aria-pressed={lang === code}
      className={cn(
        "min-h-8 rounded-full px-3.5 py-1 transition-colors",
        lang === code
          ? "bg-brand-warm text-brand-deep"
          : dark
            ? "text-white/75 hover:text-white"
            : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center rounded-full border p-1 text-xs font-bold",
        dark ? "border-white/25 bg-white/10" : "border-border bg-card",
        className,
      )}
    >
      {option("ar", "عربية")}
      {option("en", "EN")}
    </div>
  );
}

/** Pick the Arabic variant of a program's text when it exists. */
export function localizedProgram(p: PublicProgram, lang: Lang) {
  const ar = lang === "ar";
  return {
    title: ar && p.title_ar ? p.title_ar : p.title,
    description: ar && p.description_ar ? p.description_ar : p.description,
    points: ar && p.points_ar.length > 0 ? p.points_ar : p.points,
  };
}
