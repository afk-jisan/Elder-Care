import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homePathForRole } from '../lib/rolePaths';
import heroImg from '../assets/hero_new.jpg';
import './HomePage.css';

// SVG Icons matching Clairluna specifications
function ShieldCheckIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LocationIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function VideoIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function WalletIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function DocumentVaultIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function UtilityIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function EmergencySosIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CheckCircleIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="16 9 10 15 7 12" />
    </svg>
  );
}

function ArrowRightIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

const MARQUEE_ITEMS = [
  'Serving Dhaka, Chittagong, Sylhet, Rajshahi & Khulna',
  '50-Meter GPS Radius Check-In & Photo Proof',
  'BMDC Verified Doctors on 100ms Video Consultations',
  'Ring-Fenced Escrow Wallet with OTP Milestone Releases',
  'Direct DESCO, WASA & Titas Gas Bill Settlement',
  '24/7 Emergency SOS Cascade to Hospital Ambulance',
  'End-to-End Encrypted Health Vault & Shareable Links',
];

const PERSONA_DATA = {
  families: {
    title: 'For Remote & Expatriate Families',
    kicker: 'Complete transparency from thousands of miles away',
    steps: [
      {
        num: '01',
        title: 'Choose a Care Plan & Assigned Caregiver',
        text: 'Select a customized Companion, Medical, or Errand plan with vetted background-checked professionals.',
      },
      {
        num: '02',
        title: 'Fund Protected Escrow Wallet',
        text: 'Set monthly budgets with category caps (groceries, medicines). Payouts release only after verified proof.',
      },
      {
        num: '03',
        title: 'Watch Real-Time Status Feed',
        text: 'Receive instant notifications of GPS check-ins, vitals (BP, glucose), task completions, and doctor visit logs.',
      },
    ],
    previewTitle: "Family Oversight Dashboard",
    previewSubtitle: "Live link with Dhanmondi, Dhaka residence",
    stats: [
      { label: 'Current Status', value: 'Caregiver Present' },
      { label: 'Escrow Protected', value: '৳ 32,500' },
    ],
    feedItems: [
      {
        time: '9:15 AM',
        title: 'Caregiver Check-In Verified',
        sub: 'GPS verified within 12 meters of registered flat',
        badge: '50m GPS Match',
      },
      {
        time: '9:40 AM',
        title: 'Morning Vitals Recorded',
        sub: 'BP: 122/82 mmHg • Sugar: 5.9 mmol/L • Status: Normal',
        badge: 'Vitals Logged',
      },
      {
        time: '11:00 AM',
        title: 'Doctor Teleconsult Completed',
        sub: 'Dr. Farhana Ahmed reviewed prescription renewal',
        badge: 'BMDC Signed',
      },
    ],
  },
  caregivers: {
    title: 'For Dedicated Local Caregivers',
    kicker: 'Dignified work, fair compensation, and zero paperwork disputes',
    steps: [
      {
        num: '01',
        title: 'Geo-Fenced Check-In at Elder\'s Doorstep',
        text: 'App validates your physical arrival within 50 meters of the registered residence to activate your daily shift.',
      },
      {
        num: '02',
        title: 'Complete Checklist & Log Vitals',
        text: 'Administer medication, log blood pressure and blood sugar readings, and record behavioral observations.',
      },
      {
        num: '03',
        title: 'Photo Checkout & Automatic Payment',
        text: 'Attach a quick timestamped checkout photo. Milestone payment triggers directly to your account.',
      },
    ],
    previewTitle: "Caregiver Active Shift",
    previewSubtitle: "Assigned Elder: Rokeya Begum",
    stats: [
      { label: 'Today\'s Shift', value: '4h 30m Active' },
      { label: 'Tasks Done', value: '5 of 6 Complete' },
    ],
    feedItems: [
      {
        time: '8:58 AM',
        title: 'GPS Proximity Confirmed',
        sub: 'Arrived at Road 8/A, Dhanmondi, Dhaka',
        badge: 'Verified',
      },
      {
        time: '10:15 AM',
        title: 'Breakfast & Medication',
        sub: 'Anti-hypertensive dose administered with water',
        badge: 'Completed',
      },
      {
        time: '1:00 PM',
        title: 'Doctor Video Call Assist',
        sub: 'Connected elder with consulting geriatrician',
        badge: 'Video Active',
      },
    ],
  },
  doctors: {
    title: 'For BMDC-Licensed Physicians',
    kicker: 'Seamless telehealth consultations with real vitals at your fingertips',
    steps: [
      {
        num: '01',
        title: 'Set Your Weekly Availability Windows',
        text: 'Define your preferred telehealth hours for family consultations or urgent caregiver requests.',
      },
      {
        num: '02',
        title: 'Join High-Definition Video Consults',
        text: 'Connect via 100ms video directly with the elder and on-site caregiver assisting in person.',
      },
      {
        num: '03',
        title: 'Inspect Vitals & Issue Digital Prescriptions',
        text: 'Review past ECGs and uploaded prescriptions from the Medical Vault, and log clinical notes instantly.',
      },
    ],
    previewTitle: "Doctor Clinical Terminal",
    previewSubtitle: "Dr. Farhana Ahmed, MBBS, FCPS",
    stats: [
      { label: 'Teleconsults Done', value: '340+ Sessions' },
      { label: 'Rating', value: '★ 4.97 (BMDC #48921)' },
    ],
    feedItems: [
      {
        time: '10:45 AM',
        title: 'Medical Vault Accessed',
        sub: 'Reviewed previous cardiology report from Square Hospital',
        badge: 'Encrypted Access',
      },
      {
        time: '11:00 AM',
        title: '15-Min Live Consultation',
        sub: 'Elder presented alert and oriented; reviewed dose',
        badge: '100ms HD Call',
      },
      {
        time: '11:18 AM',
        title: 'Prescription Uploaded',
        sub: 'New prescription synced with elder vault and family feed',
        badge: 'Synced',
      },
    ],
  },
};

const FEATURES_LIST = [
  {
    icon: LocationIcon,
    title: '50-Meter GPS Radius Check-In',
    text: 'Caregivers can only begin tasks after their device coordinates match the elder\'s registered home within 50 meters, paired with photo checkout proof.',
    badge: 'Anti-Fraud Protection',
  },
  {
    icon: WalletIcon,
    title: 'Ring-Fenced Escrow Wallet',
    text: 'Preload monthly budgets safely. Funds are escrow-locked and only disbursed upon verified task completion, with mandatory OTP verification for amounts >৳10,000.',
    badge: 'Bank-Grade Security',
  },
  {
    icon: DocumentVaultIcon,
    title: 'Encrypted Medical Vault',
    text: 'Store National IDs, allergy lists, past ECGs, and digital prescriptions in one central repository. Generate temporary 24-hour links for emergency triage.',
    badge: 'Emergency Link Sharing',
  },
  {
    icon: VideoIcon,
    title: 'Integrated Doctor Video Consults',
    text: 'Direct 1-on-1 video consultations via 100ms between elder, caregiver, and licensed BMDC specialists without leaving the app.',
    badge: '100ms Telehealth',
  },
  {
    icon: UtilityIcon,
    title: 'Direct Utility Bill Settlement',
    text: 'Never worry about power or gas cuts. Pay DESCO, DPDC, WASA, and Titas Gas accounts directly through the platform with archived digital receipts.',
    badge: 'Zero Cash Handling',
  },
  {
    icon: EmergencySosIcon,
    title: '24/7 SOS & Hospital Cascade',
    text: 'One-tap emergency trigger simultaneously alerts family members worldwide, on-duty supervisors, and dispatches an ambulance from the nearest hospital.',
    badge: 'Immediate Response',
  },
];

const CAREGIVER_SHOWCASE = [
  {
    initials: 'NR',
    name: 'Nasrin Rahman',
    role: 'Certified Senior Caregiver',
    specialties: ['Dementia Care', 'Mobility Support', 'Vitals Logging'],
    rating: '4.95',
    visits: '420+ visits',
    rate: '৳ 650',
    rateUnit: '/ visit',
    location: 'Dhanmondi, Dhaka',
    online: true,
  },
  {
    initials: 'SH',
    name: 'Sazzad Hossain',
    role: 'Post-Operative Nurse Assistant',
    specialties: ['Post-Op Recovery', 'Physiotherapy', 'Wound Dressing'],
    rating: '4.92',
    visits: '310+ visits',
    rate: '৳ 800',
    rateUnit: '/ visit',
    location: 'Gulshan, Dhaka',
    online: true,
  },
  {
    initials: 'DF',
    name: 'Dr. Farhana Ahmed',
    role: 'Consulting Geriatrician',
    specialties: ['BMDC #48921', 'Chronic Care', 'Cardiology Review'],
    rating: '4.98',
    visits: '510+ consults',
    rate: '৳ 1,200',
    rateUnit: '/ consult',
    location: 'Square Hospital / Online',
    online: true,
  },
];

const PLANS_DATA = [
  {
    tier: 'Companion Care',
    tagline: 'Ideal for independent elders who need friendly company and light routine supervision.',
    price: '৳ 3,000',
    cadence: '/ month',
    featured: false,
    features: [
      '3 scheduled visits per week',
      '50m GPS verified check-in & photo checkout',
      'Daily vitals logging (BP & blood sugar)',
      'Real-time family care status feed',
      'Utility bill payment assistance',
      'Standard customer support',
    ],
  },
  {
    tier: 'Comprehensive Medical',
    tagline: 'Complete peace of mind with daily in-person visits and licensed doctor oversight.',
    price: '৳ 6,000',
    cadence: '/ month',
    featured: true,
    features: [
      'Daily scheduled caregiver visits (7 days/wk)',
      'Bi-weekly BMDC doctor video consults',
      'Continuous vitals & behavioral decline alerts',
      'Ring-fenced escrow budget management',
      'Encrypted Medical Vault with unlimited storage',
      '24/7 Priority Emergency SOS Ambulance dispatch',
    ],
  },
  {
    tier: 'On-Demand / Errand',
    tagline: 'Flexible on-call support for doctor appointments, diagnostics, and urgent errands.',
    price: '৳ 450',
    cadence: '/ visit + expenses',
    featured: false,
    features: [
      'Book verified caregivers on-demand',
      'Hospital chaperone & diagnostic assistance',
      'Prescription pick-up & emergency errand run',
      'Live GPS journey tracking during transit',
      'Pay-per-visit escrow deduction',
      'Instant caregiver rating & review',
    ],
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Living in London while my 79-year-old mother is in Dhanmondi was agonizing. Elder Care gave me complete visibility. Seeing her verified blood pressure reading and a photo of her smiling after lunch brings me immeasurable peace.',
    name: 'Tanvir Mahmud',
    location: 'London, UK (Mother in Dhaka)',
    avatar: 'TM',
  },
  {
    quote:
      'The escrow wallet is brilliant. Before Elder Care, sending money back home for medication and bills was stressful and untracked. Now every taka is released only when tasks are GPS-verified. No disputes, pure accountability.',
    name: 'Sabrina Chowdhury',
    location: 'Toronto, Canada (Parents in Chittagong)',
    avatar: 'SC',
  },
  {
    quote:
      'When Baba had a sudden spike in blood sugar, the caregiver immediately initiated a video session with a BMDC doctor on the platform. The doctor adjusted his insulin within 20 minutes. It literally saved his life.',
    name: 'Asif Ur Rahman',
    location: 'New York, USA (Father in Sylhet)',
    avatar: 'AR',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How does the 50-meter GPS check-in prevent fraud?',
    a: 'Caregivers cannot begin tasks or clock shift hours unless their smartphone\'s verified GPS coordinates are within exactly 50 meters of the elder\'s registered home address. Any location mismatch triggers an instant admin flag and prevents shift activation.',
  },
  {
    q: 'How is our money protected in the Escrow Wallet?',
    a: 'Your monthly care funds are deposited into an escrow ledger. Funds remain ring-fenced and are not transferred to caregivers until daily tasks are marked complete and photo-verified. Furthermore, any one-time release exceeding ৳10,000 requires two-factor OTP confirmation from your device.',
  },
  {
    q: 'How are caregivers and doctors vetted on the platform?',
    a: 'Every caregiver undergoes rigorous background verification, including National ID (NID) checks, criminal record clearance, reference interviews, and elderly care training. Doctors must submit verified Bangladesh Medical and Dental Council (BMDC) registration credentials before conducting consults.',
  },
  {
    q: 'What happens during a medical emergency or SOS alert?',
    a: 'When an SOS alert is triggered by the elder or caregiver, the platform immediately initiates a 3-way cascade: push notifications and automated phone calls to family members, an alert to the nearest vetted rapid responder, and dispatch communication with affiliated hospital ambulances.',
  },
  {
    q: 'Can I pay utility bills like DESCO, DPDC, WASA, or Titas Gas through the app?',
    a: 'Yes. Simply link your parents\' consumer numbers once in the Family Dashboard. The platform tracks due dates, processes settlement via our secure payment gateway, and files the official payment receipt in your elder\'s archive.',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const dashboardPath = user ? homePathForRole(user.role) : '/login';

  const [activePersona, setActivePersona] = useState('families');
  const [activeFaq, setActiveFaq] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPersona = PERSONA_DATA[activePersona];

  return (
    <div className="cl-landing">
      {/* 1. NAVBAR */}
      <header className="cl-navbar">
        <div className="cl-container cl-nav-inner">
          <Link to="/" className="cl-brand">
            <span>Elder Care</span>
          </Link>

          <ul className="cl-nav-links">
            <li>
              <a href="#how-it-works" className="cl-nav-link">How It Works</a>
            </li>
            <li>
              <a href="#features" className="cl-nav-link">Features</a>
            </li>
            <li>
              <a href="#caregivers" className="cl-nav-link">Caregivers & Doctors</a>
            </li>
            <li>
              <a href="#plans" className="cl-nav-link">Care Plans</a>
            </li>
            <li>
              <a href="#faq" className="cl-nav-link">FAQ</a>
            </li>
          </ul>

          <div className="cl-nav-actions">
            {user ? (
              <Link to={dashboardPath} className="cl-btn cl-btn-primary cl-btn-sm">
                Dashboard
                <ArrowRightIcon size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="cl-btn cl-btn-secondary cl-btn-sm">
                  Log in
                </Link>
                <Link to="/register" className="cl-btn cl-btn-primary cl-btn-sm">
                  Get started
                </Link>
              </>
            )}

            <button
              type="button"
              className="cl-nav-mobile-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div className={`cl-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <a
            href="#how-it-works"
            className="cl-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            How It Works
          </a>
          <a
            href="#features"
            className="cl-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#caregivers"
            className="cl-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Caregivers & Doctors
          </a>
          <a
            href="#plans"
            className="cl-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Care Plans
          </a>
          <a
            href="#faq"
            className="cl-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            FAQ
          </a>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {user ? (
              <Link to={dashboardPath} className="cl-btn cl-btn-primary" style={{ width: '100%' }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="cl-btn cl-btn-secondary" style={{ flex: 1 }}>
                  Log in
                </Link>
                <Link to="/register" className="cl-btn cl-btn-primary" style={{ flex: 1 }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* 2. HERO SECTION */}
        <section className="cl-hero">
          <div className="cl-container cl-hero-grid">
            <div className="cl-hero-copy">
              <div className="cl-hero-badge">
                <span>🇧🇩 Dedicated to Elders in Bangladesh</span>
              </div>

              <h1>
                Give your parents<br />
                the care they deserve<br />
                <span className="cl-accent-text" style={{ whiteSpace: 'nowrap' }}>from anywhere in the world.</span>
              </h1>

              <p className="cl-hero-desc">
                Elder Care helps you look after your parents from anywhere. We provide trusted caregivers, remote health tracking, online doctors, and secure payments.
              </p>


              <div className="cl-hero-actions">
                <Link to={user ? dashboardPath : '/register'} className="cl-btn cl-btn-primary">
                  {user ? 'Open Dashboard' : 'Start a Care Plan'}
                  <ArrowRightIcon size={18} />
                </Link>
                <a href="#how-it-works" className="cl-btn cl-btn-secondary">
                  Explore Care Circles
                </a>
              </div>
            </div>

            {/* Hero Image */}
            <div className="cl-hero-image-wrapper">
              <img src={heroImg} alt="Elder Care Platform" className="cl-hero-image" />
            </div>
          </div>
        </section>

        {/* 3. MARQUEE BANNER */}
        <section className="cl-marquee-wrapper" aria-label="Coverage and features ticker">
          <div className="cl-marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
              <span key={idx} className="cl-marquee-item">
                <span className="cl-marquee-item-dot" />
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* 4. THE CARE CIRCLE / PERSONA TABS (Warm Off-White) */}
        <section id="how-it-works" className="cl-section cl-section-warm">
          <div className="cl-container">
            <div className="cl-section-header">
              <div className="cl-eyebrow">
                <ShieldCheckIcon size={16} />
                <span>The Care Circle</span>
              </div>
              <h2 className="cl-heading cl-heading-lg">
                Simple, intentional, <br />
                and <span className="cl-accent-text">grounded.</span>
              </h2>
              <p className="cl-lead" style={{ margin: '0 auto' }}>
                A synchronized system connecting overseas families, local caregivers,
                and licensed doctors into one accountable circle.
              </p>
            </div>

            {/* Persona switcher */}
            <div className="cl-tabs-bar" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activePersona === 'families'}
                className={`cl-tab-btn ${activePersona === 'families' ? 'active' : ''}`}
                onClick={() => setActivePersona('families')}
              >
                For Families
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activePersona === 'caregivers'}
                className={`cl-tab-btn ${activePersona === 'caregivers' ? 'active' : ''}`}
                onClick={() => setActivePersona('caregivers')}
              >
                For Caregivers
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activePersona === 'doctors'}
                className={`cl-tab-btn ${activePersona === 'doctors' ? 'active' : ''}`}
                onClick={() => setActivePersona('doctors')}
              >
                For Doctors
              </button>
            </div>

            <div className="cl-persona-grid">
              <div className="cl-steps-list">
                <div style={{ marginBottom: '0.5rem' }}>
                  <h3 className="cl-heading cl-heading-md" style={{ marginBottom: '0.35rem' }}>
                    {currentPersona.title}
                  </h3>
                  <p style={{ color: 'var(--c-primary)', fontWeight: 600 }}>
                    {currentPersona.kicker}
                  </p>
                </div>

                {currentPersona.steps.map((step) => (
                  <div key={step.num} className="cl-step-item">
                    <div className="cl-step-number">{step.num}</div>
                    <div className="cl-step-content">
                      <h4>{step.title}</h4>
                      <p>{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Persona preview card */}
              <div className="cl-persona-card-preview">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--c-border)', paddingBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontFamily: 'var(--f-display)', fontSize: '1.15rem', color: 'var(--c-navy)' }}>
                      {currentPersona.previewTitle}
                    </h4>
                    <span style={{ fontSize: '0.82rem', color: 'var(--c-text-muted)' }}>
                      {currentPersona.previewSubtitle}
                    </span>
                  </div>
                  <span className="cl-status-pill" style={{ color: 'var(--c-primary)', borderColor: 'var(--c-primary)' }}>
                    Active View
                  </span>
                </div>

                <div className="cl-card-highlight-grid" style={{ marginBottom: '1.5rem' }}>
                  {currentPersona.stats.map((s, idx) => (
                    <div key={idx} className="cl-mock-stat">
                      <div className="cl-mock-stat-label">{s.label}</div>
                      <div className="cl-mock-stat-value">{s.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {currentPersona.feedItems.map((item, idx) => (
                    <div key={idx} style={{ padding: '0.85rem 1rem', background: 'var(--c-warm-bg)', borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--c-navy)' }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--c-primary)', background: 'var(--c-pale-teal)', padding: '0.2rem 0.5rem', borderRadius: 'var(--r-full)' }}>
                          {item.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--c-text-body)' }}>
                        {item.sub}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--c-text-muted)', marginTop: '0.25rem' }}>
                        Timestamp: {item.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CORE PLATFORM PILLARS (White Background) */}
        <section id="features" className="cl-section cl-section-white">
          <div className="cl-container">
            <div className="cl-section-header">
              <div className="cl-eyebrow">
                <ShieldCheckIcon size={16} />
                <span>Platform Pillars</span>
              </div>
              <h2 className="cl-heading cl-heading-lg">
                Built for trust and safety.
              </h2>
              <p className="cl-lead" style={{ margin: '0 auto' }}>
                Every tool built into Elder Care specifically prevents the common points
                of neglect and financial opacity when managing care from afar.
              </p>
            </div>

            <div className="cl-features-grid">
              {FEATURES_LIST.map((feat) => {
                const IconComp = feat.icon;
                return (
                  <article key={feat.title} className="cl-feature-card">
                    <div className="cl-feature-icon-wrap">
                      <IconComp size={26} />
                    </div>
                    <h3>{feat.title}</h3>
                    <p>{feat.text}</p>
                    <span className="cl-feature-badge">{feat.badge}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. REAL-TIME LIVE FEED & ESCROW PREVIEW (Pale Teal Background) */}
        <section id="feed-demo" className="cl-section cl-section-teal">
          <div className="cl-container">
            <div className="cl-section-header">
              <div className="cl-eyebrow">
                <LocationIcon size={16} />
                <span>Live Feed & Escrow Assurance</span>
              </div>
              <h2 className="cl-heading cl-heading-lg">
                Follow every visit in real time, verified at every step.
              </h2>
              <p className="cl-lead" style={{ margin: '0 auto' }}>
                From arrival to departure, you know who entered the house, what vitals
                were measured, and where your money was allocated.
              </p>
            </div>

            <div className="cl-feed-showcase-grid">
              {/* Left Box: Live Feed */}
              <div className="cl-interactive-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 className="cl-heading cl-heading-sm" style={{ margin: 0 }}>
                    Live Status Feed
                  </h3>
                  <span className="cl-status-live">
                    <span className="cl-dot-pulse" />
                    Real-time
                  </span>
                </div>

                <div className="cl-feed-timeline">
                  <div className="cl-feed-row">
                    <div className="cl-feed-row-icon" style={{ background: '#e0f2fe', color: 'var(--c-primary)' }}>
                      <LocationIcon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="cl-feed-row-time">09:12 AM • GPS Radius Match</div>
                      <div className="cl-feed-row-title">Check-in at Dhanmondi Residence</div>
                      <div className="cl-feed-row-sub">
                        Device verified 14m from registered coordinates.
                      </div>
                    </div>
                  </div>

                  <div className="cl-feed-row">
                    <div className="cl-feed-row-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                      <CheckCircleIcon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="cl-feed-row-time">10:05 AM • Vitals Recorded</div>
                      <div className="cl-feed-row-title">Blood Pressure & Glucose Safe</div>
                      <div className="cl-feed-row-sub">
                        BP: 120/80 mmHg • Random Glucose: 6.1 mmol/L. No decline flags.
                      </div>
                    </div>
                  </div>

                  <div className="cl-feed-row">
                    <div className="cl-feed-row-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <VideoIcon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="cl-feed-row-time">11:30 AM • Telehealth Call</div>
                      <div className="cl-feed-row-title">Doctor Consultation via 100ms</div>
                      <div className="cl-feed-row-sub">
                        Dr. Farhana Ahmed reviewed medication and signed updated routine.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Box: Escrow Wallet Security */}
              <div className="cl-interactive-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 className="cl-heading cl-heading-sm" style={{ margin: 0 }}>
                    Protected Escrow Wallet
                  </h3>
                  <span className="cl-status-pill" style={{ color: 'var(--c-navy)', background: '#e2e8f0' }}>
                    Ring-Fenced
                  </span>
                </div>

                <div style={{ background: 'var(--c-warm-bg)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-xl)', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', textTransform: 'uppercase' }}>
                    Available Escrow Reserve
                  </div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--c-navy)' }}>
                    ৳ 35,000.00
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                    <ShieldCheckIcon size={16} /> Protected from unverified payouts
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--c-navy)' }}>Daily Caregiver Shift Release</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>Auto-released upon GPS & Photo checkout</div>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--c-primary)' }}>৳ 650</span>
                  </div>

                  <div style={{ padding: '0.75rem 1rem', background: '#fffbeb', borderRadius: 'var(--r-lg)', border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#92400e' }}>Utility Payment (DESCO)</div>
                      <div style={{ fontSize: '0.75rem', color: '#b45309' }}>Requires Family OTP confirmation</div>
                    </div>
                    <span style={{ fontWeight: 600, color: '#92400e' }}>৳ 4,200</span>
                  </div>

                  <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--c-navy)' }}>Monthly Medicine Replenishment</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>Receipt uploaded to Medical Vault</div>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--c-primary)' }}>৳ 3,800</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. VETTED CAREGIVERS & PHYSICIANS SHOWCASE (Warm Off-White) */}
        <section id="caregivers" className="cl-section cl-section-warm">
          <div className="cl-container">
            <div className="cl-section-header">
              <div className="cl-eyebrow">
                <ShieldCheckIcon size={16} />
                <span>Verified Professionals</span>
              </div>
              <h2 className="cl-heading cl-heading-lg">
                Thoroughly vetted. Rigorously verified.
              </h2>
              <p className="cl-lead" style={{ margin: '0 auto' }}>
                Every caregiver passes police and identity verification. Every doctor is
                licensed with the Bangladesh Medical and Dental Council.
              </p>
            </div>

            <div className="cl-caregivers-grid">
              {CAREGIVER_SHOWCASE.map((person, idx) => (
                <div key={idx} className="cl-profile-card">
                  <div className="cl-profile-card-top">
                    <div className="cl-profile-center-avatar">
                      {person.initials}
                    </div>
                    <div className="cl-profile-header-info">
                      <h4 className="cl-profile-name">{person.name}</h4>
                      <div className="cl-profile-role-title">{person.role}</div>
                      <div className="cl-location-badge" style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', display: 'flex', alignItems: 'center', marginTop: '0.35rem' }}>
                        <LocationIcon size={14} style={{ marginRight: '4px', color: 'var(--c-primary)' }} />
                        {person.location}
                      </div>
                    </div>
                  </div>

                  <div className="cl-profile-badges">
                    <div className="cl-status-pill">
                      {person.online ? (
                        <>
                          <span className="cl-dot-pulse" style={{ background: '#4ade80' }} />
                          <span>Online Now</span>
                        </>
                      ) : (
                        <>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8' }} />
                          <span>Available</span>
                        </>
                      )}
                    </div>
                    <div className="cl-star-badge">
                      <span className="cl-star-icon">★</span> {person.rating}
                    </div>
                  </div>

                  <div className="cl-profile-card-body">
                    <div className="cl-profile-tags">
                      {person.specialties.map((spec, i) => (
                        <span key={i} className="cl-tag-chip">{spec}</span>
                      ))}
                    </div>
                  </div>

                  <div className="cl-profile-footer">
                    <div>
                      <div style={{ fontSize: '1.25rem', fontFamily: 'var(--f-display)', fontWeight: 600, color: 'var(--c-navy)' }}>
                        {person.rate}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>{person.rateUnit}</div>
                    </div>
                    <button className="cl-btn cl-btn-primary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}>
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. CARE PLANS & PRICING (White Background) */}
        <section id="plans" className="cl-section cl-section-white">
          <div className="cl-container">
            <div className="cl-section-header">
              <div className="cl-eyebrow">
                <WalletIcon size={16} />
                <span>Transparent Packages</span>
              </div>
              <h2 className="cl-heading cl-heading-lg">
                Predictable care for every family structure.
              </h2>
              <p className="cl-lead" style={{ margin: '0 auto' }}>
                All packages include the 50m GPS verification, encrypted medical vault,
                and direct escrow security. No hidden charges.
              </p>
            </div>

            <div className="cl-plans-grid">
              {PLANS_DATA.map((plan) => (
                <div
                  key={plan.tier}
                  className={`cl-plan-card ${plan.featured ? 'cl-plan-featured' : 'cl-plan-standard'}`}
                >
                  {plan.featured && (
                    <div className="cl-most-booked-badge">MOST BOOKED</div>
                  )}

                  <h3 className="cl-plan-tier">{plan.tier}</h3>
                  <p className="cl-plan-tagline">{plan.tagline}</p>

                  <div className="cl-plan-price-wrap">
                    <span className="cl-plan-price">{plan.price}</span>
                    <span className="cl-plan-cadence"> {plan.cadence}</span>
                  </div>

                  <ul className="cl-plan-features-list">
                    {plan.features.map((item, idx) => (
                      <li key={idx} className="cl-plan-feature-item">
                        <CheckCircleIcon size={18} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/register"
                    className={`cl-btn ${plan.featured ? 'cl-btn-primary' : 'cl-btn-secondary'}`}
                    style={{ width: '100%' }}
                  >
                    Select {plan.tier}
                    <ArrowRightIcon size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FAMILY STORIES / TESTIMONIALS (Warm Off-White) */}
        <section className="cl-section cl-section-warm">
          <div className="cl-container">
            <div className="cl-section-header">
              <div className="cl-eyebrow">
                <CheckCircleIcon size={16} />
                <span>Expatriate Trust</span>
              </div>
              <h2 className="cl-heading cl-heading-lg">
                Trusted by families living across the globe.
              </h2>
              <p className="cl-lead" style={{ margin: '0 auto' }}>
                Hear how non-resident Bangladeshis maintain unbroken bonds and reliable
                support for their parents back home.
              </p>
            </div>

            <div className="cl-testimonials-grid">
              {TESTIMONIALS.map((t, idx) => (
                <article key={idx} className="cl-testimonial-card">
                  <blockquote className="cl-testimonial-quote">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="cl-testimonial-author">
                    <div className="cl-author-avatar">{t.avatar}</div>
                    <div>
                      <div className="cl-author-name">{t.name}</div>
                      <div className="cl-author-location">{t.location}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 10. FREQUENTLY ASKED QUESTIONS (White Background) */}
        <section id="faq" className="cl-section cl-section-white">
          <div className="cl-container">
            <div className="cl-section-header">
              <div className="cl-eyebrow">
                <ShieldCheckIcon size={16} />
                <span>Clear Answers</span>
              </div>
              <h2 className="cl-heading cl-heading-lg">
                Frequently Asked Questions
              </h2>
              <p className="cl-lead" style={{ margin: '0 auto' }}>
                Everything you need to know about safety protocols, payments, and emergency care.
              </p>
            </div>

            <div className="cl-faq-list">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div key={index} className={`cl-faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="cl-faq-trigger"
                      onClick={() => setActiveFaq(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                    >
                      <span className="cl-faq-question">{item.q}</span>
                      <span className="cl-faq-icon" aria-hidden="true">
                        +
                      </span>
                    </button>
                    {isOpen && <div className="cl-faq-answer">{item.a}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 11. FULL-BLEED BRAND BLUE CTA BANNER */}
        <section className="cl-cta-section">
          <div className="cl-cta-blob" />
          <div className="cl-container cl-cta-content">
            <h2>
              Give your parents the dignity and care they deserve today.
            </h2>
            <p>
              Join hundreds of expatriate families who sleep peacefully knowing their loved
              ones in Bangladesh are protected, visited, and medically supported.
            </p>
            <div className="cl-cta-buttons">
              <Link to="/register" className="cl-btn cl-btn-inverted">
                Register as a Family Member
                <ArrowRightIcon size={18} />
              </Link>
              <Link to="/login" className="cl-btn cl-btn-ghost-dark">
                I Already Have an Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 12. DARK NAVY FOOTER */}
      <footer className="cl-footer">
        <div className="cl-container">
          <div className="cl-footer-grid">
            <div className="cl-footer-brand">
              <h3>Elder Care</h3>
              <p>
                A digital proxy-child platform preventing elderly neglect in Bangladesh.
                Connecting overseas families, verified caregivers, and licensed BMDC doctors.
              </p>
              <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
                📍 Headquartered in Dhanmondi, Dhaka, Bangladesh
              </div>
            </div>

            <div className="cl-footer-col">
              <h4>Platform</h4>
              <ul className="cl-footer-links">
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#features">Geo-Fenced Check-In</a></li>
                <li><a href="#feed-demo">Protected Escrow</a></li>
                <li><a href="#plans">Care Packages</a></li>
                <li><a href="#caregivers">Vetted Specialists</a></li>
              </ul>
            </div>

            <div className="cl-footer-col">
              <h4>Dashboards</h4>
              <ul className="cl-footer-links">
                <li><Link to="/family/care-plan">Family Dashboard</Link></li>
                <li><Link to="/caregiver">Caregiver Portal</Link></li>
                <li><Link to="/doctor">Doctor Clinical Suite</Link></li>
                <li><Link to="/admin">Operations & SOS Admin</Link></li>
              </ul>
            </div>

            <div className="cl-footer-col">
              <h4>Safety & Emergency</h4>
              <ul className="cl-footer-links">
                <li><span style={{ color: '#f87171', fontWeight: 600 }}>24/7 SOS: +880 9612-ELDER</span></li>
                <li><a href="#faq">BMDC Verification</a></li>
                <li><a href="#faq">Escrow OTP Protection</a></li>
                <li><a href="#faq">Privacy & Vault Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="cl-footer-bottom">
            <div>&copy; {new Date().getFullYear()} Elder Care Bangladesh. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>Built with Clairluna Design System</span>
              <span>•</span>
              <span>Care for Seniors</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
