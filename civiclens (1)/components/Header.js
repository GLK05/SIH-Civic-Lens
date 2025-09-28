import React from 'react';
import { Page } from '../types.js';
import { Button } from './ui/Button.js';
import { CameraIcon, SunIcon, MoonIcon, MenuIcon } from './Icons.js';

const Header = ({ currentUser, onLogout, navigate, theme, toggleTheme, onMenuClick }) => {
  return (
    React.createElement('header', { className: "fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" },
      React.createElement('div', { className: "container flex h-16 items-center" },
        React.createElement(Button, { variant: "ghost", size: "icon", className: "mr-2 lg:hidden", onClick: onMenuClick, "aria-label": "Open menu" },
          React.createElement(MenuIcon, { className: "h-6 w-6" }),
          React.createElement('span', { className: "sr-only" }, "Open Menu")
        ),
        React.createElement('div', { className: "flex items-center cursor-pointer", onClick: () => navigate(Page.Home) },
          React.createElement(CameraIcon, { className: "h-6 w-6 text-primary" }),
          React.createElement('span', { className: "ml-2 text-lg font-bold" }, "CivicLens")
        ),
        React.createElement('div', { className: "flex-1" }),
        React.createElement('div', { className: "flex items-center justify-end space-x-2 sm:space-x-4" },
          React.createElement(Button, { variant: "ghost", size: "icon", onClick: toggleTheme, "aria-label": theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode' },
            theme === 'light' ? React.createElement(SunIcon, { className: "h-5 w-5" }) : React.createElement(MoonIcon, { className: "h-5 w-5" })
          ),
          currentUser ? (
            React.createElement(React.Fragment, null,
              React.createElement('span', { className: "hidden sm:inline text-sm" }, "Welcome, ", currentUser.name),
              React.createElement(Button, { variant: "outline", onClick: onLogout }, "Logout")
            )
          ) : (
            React.createElement(React.Fragment, null,
              React.createElement(Button, { variant: "ghost", onClick: () => navigate(Page.Login) }, "User Login"),
              React.createElement(Button, { variant: "secondary", onClick: () => navigate(Page.AdminLogin) }, "Admin Login")
            )
          )
        )
      )
    )
  );
};

export default Header;