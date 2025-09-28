import React, { useState } from 'react';
import * as api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { FrownIcon, MehIcon, SmileIcon, LaughIcon, SmilePlusIcon } from '../components/Icons';

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
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-2xl text-center">
            <Card>
            <CardHeader>
                <CardTitle>Thank You!</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Your feedback is valuable to us and helps us improve our service.</p>
                <Button onClick={onSubmit} className="mt-4">Back to Safety</Button>
            </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Give Us Your Feedback</CardTitle>
            <CardDescription>We'd love to hear what you think about our platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <label>How would you rate your experience?</label>
                <div className="flex justify-center space-x-2 sm:space-x-4 pt-2">
                    {ratingOptions.map(option => (
                        <button 
                            key={option.rating}
                            type="button"
                            onClick={() => setRating(option.rating)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg w-16 h-16 sm:w-20 sm:h-20 transition-all duration-200 ${rating === option.rating ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'}`}
                        >
                            <option.icon className={`h-8 w-8 sm:h-10 sm:w-10 mb-1 ${rating === option.rating ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="text-xs">{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            {!currentUser && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="name">Name</label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email">Email</label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="comments">Additional Comments</label>
              <Textarea id="comments" value={comments} onChange={e => setComments(e.target.value)} required placeholder="Tell us more..."/>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default FeedbackPage;