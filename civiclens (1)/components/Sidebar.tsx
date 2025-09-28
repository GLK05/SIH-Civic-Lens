import React from 'react';
import { Page, UserRole } from '../types';
import { Button } from './ui/Button';
import { HomeIcon, LayoutDashboardIcon, UsersIcon, Users2Icon, MailIcon, MessageSquareIcon, LogOutIcon, MapIcon } from './Icons';

const NavItem = ({ icon: Icon, label, page, currentPage, onClick }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => onClick(page)}
      className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="ml-4">{label}</span>
    </button>
  );
};

const Sidebar = ({ currentUser, navigate, currentPage, onLogout, isOpen, onClose }) => {
  
  const commonLinks = [
    { page: Page.Home, label: 'Homepage', icon: HomeIcon },
    { page: Page.LiveMap, label: 'Live Map', icon: MapIcon },
    { page: Page.Contact, label: 'Contact Us', icon: MailIcon },
    { page: Page.Feedback, label: 'Feedback', icon: MessageSquareIcon },
  ];
  
  const citizenLinks = [
    { page: Page.Dashboard, label: 'My Dashboard', icon: LayoutDashboardIcon },
    ...commonLinks.filter(l => l.page !== Page.Home), // Avoid duplicate Home
  ];

  const adminLinks = [
    { page: Page.Dashboard, label: 'Dashboard', icon: LayoutDashboardIcon },
    { page: Page.Workers, label: 'Workers', icon: UsersIcon },
    { page: Page.Users, label: 'Users', icon: Users2Icon },
  ];

  let navItems;
  if (!currentUser) {
    navItems = commonLinks;
  } else if (currentUser.role === UserRole.Admin) {
    navItems = adminLinks;
  } else {
    navItems = citizenLinks;
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform duration-300 ease-in-out bg-card border-r border-border ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-full px-3 py-4 flex flex-col justify-between">
          <ul className="space-y-2 font-medium">
            {navItems.map(item => (
              <li key={item.page}>
                <NavItem 
                  page={item.page}
                  label={item.label}
                  icon={item.icon}
                  currentPage={currentPage}
                  onClick={navigate}
                />
              </li>
            ))}
          </ul>
          <div className="p-2 space-y-2 border-t border-border">
            {!currentUser ? (
              <>
                <Button variant="outline" className="w-full" onClick={() => navigate(Page.Login)}>User Login</Button>
                <Button variant="secondary" className="w-full" onClick={() => navigate(Page.AdminLogin)}>Admin Login</Button>
              </>
            ) : (
              <Button variant="destructive" className="w-full" onClick={onLogout}>
                <LogOutIcon className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;