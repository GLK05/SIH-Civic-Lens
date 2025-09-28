import React from 'react';
import { Page, UserRole } from '../types.js';
import { Button } from './ui/Button.js';
import { HomeIcon, LayoutDashboardIcon, UsersIcon, Users2Icon, MailIcon, MessageSquareIcon, LogOutIcon, MapIcon } from './Icons.js';

const NavItem = ({ icon: Icon, label, page, currentPage, onClick }) => {
  const isActive = currentPage === page;
  return (
    React.createElement('button', {
      onClick: () => onClick(page),
      className: `flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`
    },
      React.createElement(Icon, { className: "w-5 h-5" }),
      React.createElement('span', { className: "ml-4" }, label)
    )
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
    React.createElement(React.Fragment, null,
      React.createElement('div', {
        className: `fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`,
        onClick: onClose,
        'aria-hidden': "true"
      }),
      React.createElement('aside', { className: `fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform duration-300 ease-in-out bg-card border-r border-border ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0` },
        React.createElement('div', { className: "h-full px-3 py-4 flex flex-col justify-between" },
          React.createElement('ul', { className: "space-y-2 font-medium" },
            navItems.map(item => (
              React.createElement('li', { key: item.page },
                React.createElement(NavItem, {
                  page: item.page,
                  label: item.label,
                  icon: item.icon,
                  currentPage: currentPage,
                  onClick: navigate
                })
              )
            ))
          ),
          React.createElement('div', { className: "p-2 space-y-2 border-t border-border" },
            !currentUser ? (
              React.createElement(React.Fragment, null,
                React.createElement(Button, { variant: "outline", className: "w-full", onClick: () => navigate(Page.Login) }, "User Login"),
                React.createElement(Button, { variant: "secondary", className: "w-full", onClick: () => navigate(Page.AdminLogin) }, "Admin Login")
              )
            ) : (
              React.createElement(Button, { variant: "destructive", className: "w-full", onClick: onLogout },
                React.createElement(LogOutIcon, { className: "w-4 h-4 mr-2" }),
                "Logout"
              )
            )
          )
        )
      )
    )
  );
};

export default Sidebar;