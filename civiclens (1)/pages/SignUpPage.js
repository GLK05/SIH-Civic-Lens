import React, { useState } from 'react';
import * as api from '../services/api.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';

const SignUpPage = ({ onSignUpSuccess, navigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const newUser = await api.registerUser({ name, email, password });
      if (newUser) {
        setSuccess(true);
      } else {
        setError('An account with this email already exists.');
      }
    } catch (err) {
      setError('An unexpected error occurred during sign-up.');
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
      return (
        React.createElement('div', { className: "flex-grow flex items-center justify-center" },
            React.createElement(Card, { className: "w-full max-w-md text-center" },
                React.createElement(CardHeader, null,
                    React.createElement(CardTitle, { className: "text-2xl" }, "Registration Successful!")
                ),
                React.createElement(CardContent, null,
                    React.createElement('p', { className: "text-muted-foreground" }, "Your account has been created. Please check your email to confirm your account before logging in.")
                ),
                React.createElement(CardFooter, null,
                    React.createElement(Button, { className: "w-full", onClick: onSignUpSuccess }, "Go to Login")
                )
            )
        )
      )
  }

  return (
    React.createElement('div', { className: "flex-grow flex items-center justify-center" },
        React.createElement(Card, { className: "w-full max-w-md" },
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement(CardHeader, null,
            React.createElement(CardTitle, { className: "text-2xl" }, "Create an Account"),
            React.createElement(CardDescription, null,
                "Sign up to start reporting and tracking civic issues."
            )
            ),
            React.createElement(CardContent, { className: "space-y-4" },
            React.createElement('div', { className: "space-y-2" },
                React.createElement('label', { htmlFor: "name" }, "Full Name"),
                React.createElement(Input, { id: "name", value: name, onChange: e => setName(e.target.value), required: true })
            ),
            React.createElement('div', { className: "space-y-2" },
                React.createElement('label', { htmlFor: "email-signup" }, "Email"),
                React.createElement(Input, { id: "email-signup", type: "email", value: email, onChange: e => setEmail(e.target.value), required: true })
            ),
            React.createElement('div', { className: "space-y-2" },
                React.createElement('label', { htmlFor: "password-signup" }, "Password"),
                React.createElement(Input, { id: "password-signup", type: "password", value: password, onChange: e => setPassword(e.target.value), required: true })
            ),
            React.createElement('div', { className: "space-y-2" },
                React.createElement('label', { htmlFor: "confirm-password" }, "Confirm Password"),
                React.createElement(Input, { id: "confirm-password", type: "password", value: confirmPassword, onChange: e => setConfirmPassword(e.target.value), required: true })
            ),
            error && React.createElement('p', { "aria-live": "assertive", className: "text-sm text-destructive" }, error)
            ),
            React.createElement(CardFooter, { className: "flex flex-col space-y-4" },
            React.createElement(Button, { type: "submit", className: "w-full", disabled: loading },
                loading ? 'Creating Account...' : 'Sign Up'
            ),
            React.createElement(Button, { type: "button", variant: "link", onClick: navigateToLogin },
                "Already have an account? Login"
            )
            )
        )
        )
    )
  );
};

export default SignUpPage;