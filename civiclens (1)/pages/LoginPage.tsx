import React, { useState } from 'react';
import * as api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

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
    <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-sm">
            <form onSubmit={handleSubmit}>
            <CardHeader>
                <CardTitle className="text-2xl">Citizen Login</CardTitle>
                <CardDescription>Enter your email below to login to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="email">Email</label>
                    <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label htmlFor="password">Password</label>
                    <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                {error && <p aria-live="assertive" className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <Button className="w-full" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
                <Button variant="link" type="button" onClick={navigateToSignUp}>Don't have an account? Sign up</Button>
            </CardFooter>
            </form>
        </Card>
    </div>
  );
};

export default LoginPage;