import React, { useState } from 'react';
import * as api from '../services/api.js';
import { UserRole } from '../types.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';

const AdminLoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
        const user = await api.loginUser(email, password);
        if (user && user.role === UserRole.Admin) {
          onLogin(user);
        } else {
          setError('Invalid admin credentials.');
        }
    } catch (err) {
        setError(err.message || 'An unexpected error occurred during login.');
    } finally {
        setLoading(false);
    }
  };

  return (
    React.createElement('div', { className: "flex-grow flex items-center justify-center" },
        React.createElement(Card, { className: "w-full max-w-sm" },
            React.createElement('form', { onSubmit: handleSubmit },
            React.createElement(CardHeader, null,
                React.createElement(CardTitle, { className: "text-2xl" }, "Admin Login"),
                React.createElement(CardDescription, null, "Enter your admin credentials to access the dashboard.")
            ),
            React.createElement(CardContent, { className: "space-y-4" },
                React.createElement('div', { className: "space-y-2" },
                    React.createElement('label', { htmlFor: "email-admin" }, "Email"),
                    React.createElement(Input, { id: "email-admin", type: "email", required: true, value: email, onChange: e => setEmail(e.target.value) })
                ),
                React.createElement('div', { className: "space-y-2" },
                    React.createElement('label', { htmlFor: "password-admin" }, "Password"),
                    React.createElement(Input, { id: "password-admin", type: "password", required: true, value: password, onChange: e => setPassword(e.target.value) })
                ),
                error && React.createElement('p', { "aria-live": "assertive", className: "text-sm text-destructive" }, error)
            ),
            React.createElement(CardFooter, null,
                React.createElement(Button, { className: "w-full", type: "submit", disabled: loading }, loading ? "Logging in..." : "Login")
            )
            )
        )
    )
  );
};

export default AdminLoginPage;