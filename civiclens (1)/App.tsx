
import React, { useState, useEffect, useCallback } from 'react';
import { Page, UserRole } from './types';
import * as api from './services/api';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SubmitReportPage from './pages/SubmitReportPage';
import ReportDetailPage from './pages/ReportDetailPage';
import WorkersPage from './pages/WorkersPage';
import UsersPage from './pages/UsersPage';
import ContactPage from './pages/ContactPage';
import FeedbackPage from './pages/FeedbackPage';
import LiveMapPage from './pages/LiveMapPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(Page.Home);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
    setIsSidebarOpen(false); // Close sidebar on navigation
  };
  
  const checkCurrentUser = useCallback(async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error checking current user:", error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkCurrentUser();
  }, [checkCurrentUser]);

  // Theme management
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    navigate(Page.Dashboard);
  };

  const handleLogout = async () => {
    await api.logoutUser();
    setCurrentUser(null);
    navigate(Page.Home);
  };

  const handleSignUpSuccess = () => {
    navigate(Page.Login);
  };

  const viewReport = (report: any) => {
    setSelectedReport(report);
    navigate(Page.ViewReport);
  };

  const handleReportSubmitted = () => {
    navigate(Page.Dashboard);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Home:
        return <HomePage navigate={() => navigate(currentUser ? Page.Dashboard : Page.Login)} />;
      case Page.Login:
        return <LoginPage onLogin={handleLogin} navigateToSignUp={() => navigate(Page.SignUp)} />;
      case Page.SignUp:
        return <SignUpPage onSignUpSuccess={handleSignUpSuccess} navigateToLogin={() => navigate(Page.Login)} />;
      case Page.AdminLogin:
        return <AdminLoginPage onLogin={handleLogin} />;
      case Page.Dashboard:
        if (!currentUser) {
          navigate(Page.Login);
          return null;
        }
        return currentUser.role === UserRole.Admin ?
          <AdminDashboard viewReport={viewReport} /> :
          <CitizenDashboard currentUser={currentUser} viewReport={viewReport} navigateToSubmitReport={() => navigate(Page.SubmitReport)} />;
      case Page.SubmitReport:
        return currentUser ? <SubmitReportPage currentUser={currentUser} onReportSubmitted={handleReportSubmitted} onBack={() => navigate(Page.Dashboard)} /> : <LoginPage onLogin={handleLogin} navigateToSignUp={() => navigate(Page.SignUp)} />;
      case Page.ViewReport:
        return selectedReport ? <ReportDetailPage report={selectedReport} currentUser={currentUser} onBack={() => navigate(Page.Dashboard)} /> : <div>Report not found.</div>;
      case Page.Workers:
        return currentUser?.role === UserRole.Admin ? <WorkersPage /> : <div>Access Denied</div>;
      case Page.Users:
        return currentUser?.role === UserRole.Admin ? <UsersPage /> : <div>Access Denied</div>;
      case Page.Contact:
        return <ContactPage onSubmit={() => navigate(Page.Home)} />;
      case Page.Feedback:
        return <FeedbackPage onSubmit={() => navigate(Page.Home)} currentUser={currentUser} />;
      case Page.LiveMap:
        return <LiveMapPage viewReport={viewReport} />;
      default:
        return <HomePage navigate={() => navigate(currentUser ? Page.Dashboard : Page.Login)} />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const isMapPage = currentPage === Page.LiveMap;

  return (
    <div className={`min-h-screen flex flex-col ${isMapPage ? 'h-screen overflow-hidden' : ''}`}>
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        navigate={navigate}
        theme={theme}
        toggleTheme={toggleTheme}
        onMenuClick={() => setIsSidebarOpen(o => !o)}
      />
      <div className={`flex flex-1 ${!isMapPage ? 'pt-16' : ''}`}>
        <Sidebar
          currentUser={currentUser}
          navigate={navigate}
          currentPage={currentPage}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className={`flex-1 transition-all duration-300 ease-in-out ${!isMapPage ? 'lg:ml-64 p-4 sm:p-6 md:p-8' : ''}`}>
          {isMapPage ? renderPage() : <div className="flex justify-center w-full">{renderPage()}</div>}
        </main>
      </div>
    </div>
  );
};

export default App;
