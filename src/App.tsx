import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import MobileHeader from './components/MobileHeader'
import QuickAccessSection from './components/QuickAccessSection'
import WelcomeSection from './components/WelcomeSection'
import BlogSection from './components/BlogSection'
import FacilitiesCarousel from './components/FacilitiesCarousel'
import Footer from './components/Footer'
import StickyMobileBottomBar from './components/StickyMobileBottomBar'
import NotFoundPage from './components/NotFoundPage'
import LoginPage from './components/LoginPage'
import PlaceholderPage from './components/PlaceholderPage'
import PopupBanner from './components/PopupBanner'
import AboutPage from './components/AboutPage'
import ContactPage from './components/ContactPage'
import ProgramPage from './components/ProgramPage'
import TeacherDashboard from './components/TeacherDashboard'
import StudentDashboard from './components/StudentDashboard'
import StaffDashboard from './components/StaffDashboard'
import StaffProfile from './components/StaffProfile'
import StaffLayout from './components/StaffLayout'
import StaffBlogList from './components/StaffBlogList'
import StaffBlogEditor from './components/StaffBlogEditor'
import ProtectedRoute from './components/ProtectedRoute'

function HomePage() {
  return (
    <>
      <PopupBanner />
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

function AboutPageWrapper() {
  return (
    <>
      <Header />
      <MobileHeader />
      <AboutPage />
      <Footer />
      <StickyMobileBottomBar />
    </>
  )
}

function ContactPageWrapper() {
  return (
    <>
      <Header />
      <MobileHeader />
      <ContactPage />
      <Footer />
      <StickyMobileBottomBar />
    </>
  )
}

function ProgramPageWrapper() {
  return (
    <>
      <Header />
      <MobileHeader />
      <ProgramPage />
      <Footer />
      <StickyMobileBottomBar />
    </>
  )
}

function TeacherDashboardWrapper() {
  return (
    <ProtectedRoute>
      <TeacherDashboard />
    </ProtectedRoute>
  )
}

function StudentDashboardWrapper() {
  return (
    <ProtectedRoute>
      <StudentDashboard />
    </ProtectedRoute>
  )
}

function StaffLayoutWrapper() {
  return (
    <ProtectedRoute>
      <StaffLayout />
    </ProtectedRoute>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/program" element={<ProgramPageWrapper />} />
        <Route path="/ppdb" element={<PlaceholderPage title="PPDB" />} />
        <Route path="/blog/" element={<PlaceholderPage title="Blog" />} />
        <Route path="/hubungi-kami" element={<ContactPageWrapper />} />
        <Route path="/tentang-kami" element={<AboutPageWrapper />} />
        <Route path="/acara/" element={<PlaceholderPage title="Acara" />} />
        <Route path="/karir/" element={<PlaceholderPage title="Karir / Loker" />} />
        <Route path="/login/teacher" element={<LoginPage role="teacher" />} />
        <Route path="/login/student" element={<LoginPage role="student" />} />
        <Route path="/login/staff" element={<LoginPage role="staff" />} />
        <Route path="/teacher" element={<TeacherDashboardWrapper />} />
        <Route path="/student" element={<StudentDashboardWrapper />} />
        <Route path="/staff" element={<StaffLayoutWrapper />}>
          <Route index element={<StaffDashboard />} />
          <Route path="blog" element={<StaffBlogList />} />
          <Route path="blog/new" element={<StaffBlogEditor />} />
          <Route path="blog/edit/:id" element={<StaffBlogEditor />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="settings" element={<PlaceholderPage title="Pengaturan" />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
