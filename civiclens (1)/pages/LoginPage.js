import React, { useState } from 'react';
import * as api from '../services/api.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';

const LoginPage = ({ onLogin, navigateToSignUp }) => {
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
        if (user) {
          onLogin(user);
        } else {
          setError('Invalid email or password.');
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
                React.createElement(CardTitle, { className: "text-2xl" }, "Citizen Login"),
                React.createElement(CardDescription, null, "Enter your email below to login to your account.")
            ),
            React.createElement(CardContent, { className: "space-y-4" },
                React.createElement('div', { className: "space-y-2" },
                    React.createElement('label', { htmlFor: "email" }, "Email"),
                    React.createElement(Input, { id: "email", type: "email", placeholder: "m@example.com", required: true, value: email, onChange: e => setEmail(e.target.value) })
                ),
                React.createElement('div', { className: "space-y-2" },
                    React.createElement('label', { htmlFor: "password" }, "Password"),
                    React.createElement(Input, { id: "password", type: "password", required: true, value: password, onChange: e => setPassword(e.target.value) })
                ),
                error && React.createElement('p', { "aria-live": "assertive", className: "text-sm text-destructive" }, error)
            ),
            React.createElement(CardFooter, { className: "flex flex-col space-y-4" },
                React.createElement(Button, { className: "w-full", type: "submit", disabled: loading }, loading ? "Logging in..." : "Login"),
                React.createElement(Button, { variant: "link", type: "button", onClick: navigateToSignUp }, "Don't have an account? Sign up")
            )
            )
        )
    )
  );
};

export default LoginPage;