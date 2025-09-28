import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Manage Users</h1>
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>List of all registered users with their personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            users.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No users have registered yet.</p>
                </div>
            ) : (
                 <>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {users.map(user => (
                            <div key={user.id}>
                            <Card className="w-full">
                                <CardContent className="p-4">
                                    <h3 className="font-bold">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <p className="text-sm text-muted-foreground capitalize">Role: {user.role}</p>
                                </CardContent>
                            </Card>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-muted/50">
                                <td className="px-6 py-4 font-medium">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4 capitalize">{user.role}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;