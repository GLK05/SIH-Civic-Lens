import React, { useState } from 'react';
import * as api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

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
        <div className="flex-grow flex items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Registration Successful!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Your account has been created. Please check your email to confirm your account before logging in.</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={onSignUpSuccess}>Go to Login</Button>
                </CardFooter>
            </Card>
        </div>
      )
  }

  return (
    <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
            <CardHeader>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
                Sign up to start reporting and tracking civic issues.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="name">Full Name</label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <label htmlFor="email-signup">Email</label>
                <Input id="email-signup" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <label htmlFor="password-signup">Password</label>
                <Input id="password-signup" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <label htmlFor="confirm-password">Confirm Password</label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            {error && <p aria-live="assertive" className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Button type="button" variant="link" onClick={navigateToLogin}>
                Already have an account? Login
            </Button>
            </CardFooter>
        </form>
        </Card>
    </div>
  );
};

export default SignUpPage;