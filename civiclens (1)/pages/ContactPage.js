import React, { useState } from 'react';
import * as api from '../services/api.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Textarea } from '../components/ui/Textarea.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card.js';

const ContactPage = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await api.addContactMessage({ name, email, message });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      React.createElement('div', { className: "flex-grow flex items-center justify-center" },
        React.createElement('div', { className: "w-full max-w-2xl text-center" },
            React.createElement(Card, null,
            React.createElement(CardHeader, null,
                React.createElement(CardTitle, null, "Thank You!")
            ),
            React.createElement(CardContent, null,
                React.createElement('p', null, "Your message has been sent. We will get back to you as soon as possible."),
                React.createElement(Button, { onClick: onSubmit, className: "mt-4" }, "Back to Home")
            )
            )
        )
      )
    );
  }

  return (
    React.createElement('div', { className: "flex-grow flex items-center justify-center" },
      React.createElement('form', { onSubmit: handleSubmit, className: "w-full max-w-2xl" },
        React.createElement(Card, null,
          React.createElement(CardHeader, null,
            React.createElement(CardTitle, null, "Contact Us"),
            React.createElement(CardDescription, null, "Have a question or suggestion? Drop us a line.")
          ),
          React.createElement(CardContent, { className: "space-y-4" },
            React.createElement('div', { className: "space-y-2" },
              React.createElement('label', { htmlFor: "name" }, "Name"),
              React.createElement(Input, { id: "name", value: name, onChange: e => setName(e.target.value), required: true })
            ),
            React.createElement('div', { className: "space-y-2" },
              React.createElement('label', { htmlFor: "email" }, "Email"),
              React.createElement(Input, { id: "email", type: "email", value: email, onChange: e => setEmail(e.target.value), required: true })
            ),
            React.createElement('div', { className: "space-y-2" },
              React.createElement('label', { htmlFor: "message" }, "Message"),
              React.createElement(Textarea, { id: "message", value: message, onChange: e => setMessage(e.target.value), required: true })
            )
          ),
          React.createElement(CardFooter, { className: "justify-center" },
            React.createElement(Button, { type: "submit", disabled: submitting },
              submitting ? 'Sending...' : 'Send Message'
            )
          )
        )
      )
    )
  );
};

export default ContactPage;