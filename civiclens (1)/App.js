
import React, { useState, useEffect, useCallback } from 'react';
import { Page, UserRole } from './types.js';
import * as api from './services/api.js';
import Header from './components/Header.js';
import Sidebar from './components/Sidebar.js';
import HomePage from './pages/HomePage.js';
import LoginPage from './pages/LoginPage.js';
import SignUpPage from './pages/SignUpPage.js';
import AdminLoginPage from './pages/AdminLoginPage.js';
import CitizenDashboard from './pages/CitizenDashboard.js';
import AdminDashboard from './pages/AdminDashboard.js';
import SubmitReportPage from './pages/SubmitReportPage.js';
import ReportDetailPage from './pages/ReportDetailPage.js';
import WorkersPage from './pages/WorkersPage.js';
import UsersPage from './pages/UsersPage.js';
import ContactPage from './pages/ContactPage.js';
import FeedbackPage from './pages/FeedbackPage.js';
import LiveMapPage from './pages/LiveMapPage.js';

const App = () => {
  const [currentPage, setCurrentPage] = useState(Page.Home);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = (page) => {
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

  const handleLogin = (user) => {
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

  const viewReport = (report) => {
    setSelectedReport(report);
    navigate(Page.ViewReport);
  };

  const handleReportSubmitted = () => {
    navigate(Page.Dashboard);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Home:
        return React.createElement(HomePage, { navigate: () => navigate(currentUser ? Page.Dashboard : Page.Login) });
      case Page.Login:
        return React.createElement(LoginPage, { onLogin: handleLogin, navigateToSignUp: () => navigate(Page.SignUp) });
      case Page.SignUp:
        return React.createElement(SignUpPage, { onSignUpSuccess: handleSignUpSuccess, navigateToLogin: () => navigate(Page.Login) });
      case Page.AdminLogin:
        return React.createElement(AdminLoginPage, { onLogin: handleLogin });
      case Page.Dashboard:
        if (!currentUser) {
          navigate(Page.Login);
          return null;
        }
        return currentUser.role === UserRole.Admin ?
          React.createElement(AdminDashboard, { viewReport: viewReport }) :
          React.createElement(CitizenDashboard, { currentUser: currentUser, viewReport: viewReport, navigateToSubmitReport: () => navigate(Page.SubmitReport) });
      case Page.SubmitReport:
        return currentUser ? React.createElement(SubmitReportPage, { currentUser: currentUser, onReportSubmitted: handleReportSubmitted, onBack: () => navigate(Page.Dashboard) }) : React.createElement(LoginPage, { onLogin: handleLogin, navigateToSignUp: () => navigate(Page.SignUp) });
      case Page.ViewReport:
        return selectedReport ? React.createElement(ReportDetailPage, { report: selectedReport, currentUser: currentUser, onBack: () => navigate(Page.Dashboard) }) : React.createElement('div', null, 'Report not found.');
      case Page.Workers:
        return currentUser?.role === UserRole.Admin ? React.createElement(WorkersPage, null) : React.createElement('div', null, 'Access Denied');
      case Page.Users:
        return currentUser?.role === UserRole.Admin ? React.createElement(UsersPage, null) : React.createElement('div', null, 'Access Denied');
      case Page.Contact:
        return React.createElement(ContactPage, { onSubmit: () => navigate(Page.Home) });
      case Page.Feedback:
        return React.createElement(FeedbackPage, { onSubmit: () => navigate(Page.Home), currentUser: currentUser });
      case Page.LiveMap:
        return React.createElement(LiveMapPage, { viewReport: viewReport });
      default:
        return React.createElement(HomePage, { navigate: () => navigate(currentUser ? Page.Dashboard : Page.Login) });
    }
  };

  if (loading) {
    return React.createElement('div', { className: "flex items-center justify-center h-screen" }, "Loading...");
  }

  const isMapPage = currentPage === Page.LiveMap;

  return React.createElement('div', { className: `min-h-screen flex flex-col ${isMapPage ? 'h-screen overflow-hidden' : ''}` },
    React.createElement(Header, {
      currentUser: currentUser,
      onLogout: handleLogout,
      navigate: navigate,
      theme: theme,
      toggleTheme: toggleTheme,
      onMenuClick: () => setIsSidebarOpen(o => !o)
    }),
    React.createElement('div', { className: `flex flex-1 ${!isMapPage ? 'pt-16' : ''}` },
      React.createElement(Sidebar, {
        currentUser: currentUser,
        navigate: navigate,
        currentPage: currentPage,
        onLogout: handleLogout,
        isOpen: isSidebarOpen,
        onClose: () => setIsSidebarOpen(false)
      }),
      React.createElement('main', { className: `flex-1 transition-all duration-300 ease-in-out ${!isMapPage ? 'lg:ml-64 p-4 sm:p-6 md:p-8' : ''}` },
        isMapPage ? renderPage() : React.createElement('div', { className: "flex justify-center w-full" }, renderPage())
      )
    )
  );
};

export default App;
