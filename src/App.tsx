import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import MobileHeader from './components/MobileHeader'
import QuickAccessSection from './components/QuickAccessSection'
import WelcomeSection from './components/WelcomeSection'
import BlogSection from './components/BlogSection'
import FacilitiesCarousel from './components/FacilitiesCarousel'
import Footer from './components/Footer'
import StickyMobileBottomBar from './components/StickyMobileBottomBar'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy loaded components
const NotFoundPage = lazy(() => import('./components/NotFoundPage'))
const LoginPage = lazy(() => import('./components/LoginPage'))
const PlaceholderPage = lazy(() => import('./components/PlaceholderPage'))
const PopupBanner = lazy(() => import('./components/PopupBanner'))
const AboutPage = lazy(() => import('./components/AboutPage'))
const ContactPage = lazy(() => import('./components/ContactPage'))
const ProgramPage = lazy(() => import('./components/ProgramPage'))
const PublicBlogList = lazy(() => import('./components/PublicBlogList'))
const PublicBlogSingle = lazy(() => import('./components/PublicBlogSingle'))
const PPDBPage = lazy(() => import('./components/PPDBPage'))
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'))
const StudentDashboard = lazy(() => import('./components/StudentDashboard'))
const StaffDashboard = lazy(() => import('./components/StaffDashboard'))
const StaffProfile = lazy(() => import('./components/StaffProfile'))
const StaffLayout = lazy(() => import('./components/StaffLayout'))
const StaffBlogList = lazy(() => import('./components/StaffBlogList'))
const StaffBlogEditor = lazy(() => import('./components/StaffBlogEditor'))

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  )
}

function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <PopupBanner />
      </Suspense>
      <Header />
      <MobileHeader />
      <main>
        <QuickAccessSection />
        <WelcomeSection />
        <BlogSection />
        <FacilitiesCarousel />
      </main>
      <Footer />
      <StickyMobileBottomBar />
    </>
  )
}

function PublicPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <MobileHeader />
      <main>{children}</main>
      <Footer />
      <StickyMobileBottomBar />
    </>
  )
}

function PmbPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <MobileHeader />
      <main>{children}</main>
      <Footer />
      <StickyMobileBottomBar />
    </>
  )
}

function DashboardWrapper({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/program" element={<PublicPageLayout><ProgramPage /></PublicPageLayout>} />
          <Route path="/pmb" element={<PmbPageLayout><PPDBPage /></PmbPageLayout>} />
          <Route path="/blog/" element={<PublicPageLayout><PublicBlogList /></PublicPageLayout>} />
          <Route path="/blog/:slug" element={<PublicPageLayout><PublicBlogSingle /></PublicPageLayout>} />
          <Route path="/hubungi-kami" element={<PublicPageLayout><ContactPage /></PublicPageLayout>} />
          <Route path="/tentang-kami" element={<PublicPageLayout><AboutPage /></PublicPageLayout>} />
          <Route path="/acara/" element={<PlaceholderPage title="Acara" />} />
          <Route path="/karir/" element={<PlaceholderPage title="Karir / Loker" />} />
          <Route path="/login/teacher" element={<LoginPage role="teacher" />} />
          <Route path="/login/student" element={<LoginPage role="student" />} />
          <Route path="/login/parent" element={<LoginPage role="parent" />} />
          <Route path="/login/staff" element={<LoginPage role="staff" />} />
          <Route path="/teacher" element={<DashboardWrapper><TeacherDashboard /></DashboardWrapper>} />
          <Route path="/student" element={<DashboardWrapper><StudentDashboard /></DashboardWrapper>} />
          <Route path="/staff" element={<DashboardWrapper><StaffLayout /></DashboardWrapper>}>
            <Route index element={<StaffDashboard />} />
            <Route path="blog" element={<StaffBlogList />} />
            <Route path="blog/new" element={<StaffBlogEditor />} />
            <Route path="blog/edit/:id" element={<StaffBlogEditor />} />
            <Route path="profile" element={<StaffProfile />} />
            <Route path="settings" element={<PlaceholderPage title="Pengaturan" />} />
          </Route>
          <Route path="/parents" element={<PlaceholderPage title="Portal Orang Tua" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
