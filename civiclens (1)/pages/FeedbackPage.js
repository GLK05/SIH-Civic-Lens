import React, { useState } from 'react';
import * as api from '../services/api.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Textarea } from '../components/ui/Textarea.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card.js';
import { FrownIcon, MehIcon, SmileIcon, LaughIcon, SmilePlusIcon } from '../components/Icons.js';

const ratingOptions = [
    { rating: 1, icon: FrownIcon, label: 'Very Bad' },
    { rating: 2, icon: MehIcon, label: 'Bad' },
    { rating: 3, icon: SmileIcon, label: 'Okay' },
    { rating: 4, icon: SmilePlusIcon, label: 'Good' },
    { rating: 5, icon: LaughIcon, label: 'Excellent' },
];

const FeedbackPage = ({ onSubmit, currentUser }) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
        alert('Please select a rating.');
        return;
    }
    setSubmitting(true);
    await api.addFeedback({
      name,
      email,
      rating,
      comments,
      user_id: currentUser?.id,
    });
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
                React.createElement('p', null, "Your feedback is valuable to us and helps us improve our service."),
                React.createElement(Button, { onClick: onSubmit, className: "mt-4" }, "Back to Safety")
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
            React.createElement(CardTitle, null, "Give Us Your Feedback"),
            React.createElement(CardDescription, null, "We'd love to hear what you think about our platform.")
          ),
          React.createElement(CardContent, { className: "space-y-6" },
            React.createElement('div', { className: "space-y-2" },
                React.createElement('label', null, "How would you rate your experience?"),
                React.createElement('div', { className: "flex justify-center space-x-2 sm:space-x-4 pt-2" },
                    ratingOptions.map(option => (
                        React.createElement('button', {
                            key: option.rating,
                            type: "button",
                            onClick: () => setRating(option.rating),
                            className: `flex flex-col items-center justify-center p-2 rounded-lg w-16 h-16 sm:w-20 sm:h-20 transition-all duration-200 ${rating === option.rating ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'}`
                        },
                            React.createElement(option.icon, { className: `h-8 w-8 sm:h-10 sm:w-10 mb-1 ${rating === option.rating ? 'text-primary' : 'text-muted-foreground'}` }),
                            React.createElement('span', { className: "text-xs" }, option.label)
                        )
                    ))
                )
            ),
            
            !currentUser && (
                React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                    React.createElement('div', { className: "space-y-2" },
                        React.createElement('label', { htmlFor: "name" }, "Name"),
                        React.createElement(Input, { id: "name", value: name, onChange: e => setName(e.target.value), required: true })
                    ),
                    React.createElement('div', { className: "space-y-2" },
                        React.createElement('label', { htmlFor: "email" }, "Email"),
                        React.createElement(Input, { id: "email", type: "email", value: email, onChange: e => setEmail(e.target.value), required: true })
                    )
                )
            ),
            
            React.createElement('div', { className: "space-y-2" },
              React.createElement('label', { htmlFor: "comments" }, "Additional Comments"),
              React.createElement(Textarea, { id: "comments", value: comments, onChange: e => setComments(e.target.value), required: true, placeholder: "Tell us more..."})
            )
          ),
          React.createElement(CardFooter, { className: "justify-center" },
            React.createElement(Button, { type: "submit", disabled: submitting },
              submitting ? 'Submitting...' : 'Submit Feedback'
            )
          )
        )
      )
    )
  );
};

export default FeedbackPage;