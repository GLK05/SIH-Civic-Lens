import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const WorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState('');

  const fetchWorkers = async () => {
    setLoading(true);
    const data = await api.getWorkers();
    setWorkers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleAddWorker = async (e) => {
    e.preventDefault();
    await api.addWorker({ name, contact, role });
    setName('');
    setContact('');
    setRole('');
    setShowAddForm(false);
    fetchWorkers();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Manage Workers</h1>
            <Button onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? 'Cancel' : 'Add New Worker'}</Button>
        </div>

        {showAddForm && (
            <Card>
                <form onSubmit={handleAddWorker}>
                    <CardHeader>
                        <CardTitle>Add New Worker</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
                        <Input placeholder="Contact Info" value={contact} onChange={e => setContact(e.target.value)} required />
                        <Input placeholder="Role (e.g., Pothole Repair)" value={role} onChange={e => setRole(e.target.value)} required />
                    </CardContent>
                    <CardFooter className="justify-center pt-4">
                      <Button type="submit">Save Worker</Button>
                    </CardFooter>
                </form>
            </Card>
        )}

      <Card>
        <CardHeader>
          <CardTitle>Worker List</CardTitle>
          <CardDescription>List of all workers available for assignment.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            workers.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No workers have been added yet.</p>
                    <Button onClick={() => setShowAddForm(true)} className="mt-4">Add Your First Worker</Button>
                </div>
            ) : (
                <>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {workers.map(worker => (
                            <div key={worker.id}>
                            <Card className="w-full">
                                <CardContent className="p-4">
                                    <h3 className="font-bold">{worker.name}</h3>
                                    <p className="text-sm text-muted-foreground">{worker.role}</p>
                                    <p className="text-sm text-muted-foreground">{worker.contact}</p>
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
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Role</th>
                            </tr>
                            </thead>
                            <tbody>
                            {workers.map(worker => (
                                <tr key={worker.id} className="border-b dark:border-gray-700 hover:bg-muted/50">
                                <td className="px-6 py-4 font-medium">{worker.name}</td>
                                <td className="px-6 py-4">{worker.contact}</td>
                                <td className="px-6 py-4">{worker.role}</td>
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

export default WorkersPage;