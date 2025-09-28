import React, { useState, useEffect } from 'react';
import * as api from '../services/api.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';

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
    React.createElement('div', { className: "w-full max-w-7xl mx-auto space-y-6" },
        React.createElement('div', { className: "flex justify-between items-center" },
            React.createElement('h1', { className: "text-3xl font-bold" }, "Manage Workers"),
            React.createElement(Button, { onClick: () => setShowAddForm(!showAddForm) }, showAddForm ? 'Cancel' : 'Add New Worker')
        ),

        showAddForm && (
            React.createElement(Card, null,
                React.createElement('form', { onSubmit: handleAddWorker },
                    React.createElement(CardHeader, null,
                        React.createElement(CardTitle, null, "Add New Worker")
                    ),
                    React.createElement(CardContent, { className: "space-y-4" },
                        React.createElement(Input, { placeholder: "Name", value: name, onChange: e => setName(e.target.value), required: true }),
                        React.createElement(Input, { placeholder: "Contact Info", value: contact, onChange: e => setContact(e.target.value), required: true }),
                        React.createElement(Input, { placeholder: "Role (e.g., Pothole Repair)", value: role, onChange: e => setRole(e.target.value), required: true })
                    ),
                    React.createElement(CardFooter, { className: "justify-center pt-4" },
                      React.createElement(Button, { type: "submit" }, "Save Worker")
                    )
                )
            )
        ),

      React.createElement(Card, null,
        React.createElement(CardHeader, null,
          React.createElement(CardTitle, null, "Worker List"),
          React.createElement(CardDescription, null, "List of all workers available for assignment.")
        ),
        React.createElement(CardContent, null,
          loading ? React.createElement('p', null, "Loading...") : (
            workers.length === 0 ? (
                React.createElement('div', { className: "text-center py-10" },
                    React.createElement('p', { className: "text-muted-foreground" }, "No workers have been added yet."),
                    React.createElement(Button, { onClick: () => setShowAddForm(true), className: "mt-4" }, "Add Your First Worker")
                )
            ) : (
                React.createElement(React.Fragment, null,
                    React.createElement('div', { className: "md:hidden space-y-4" },
                        workers.map(worker => (
                            React.createElement('div', { key: worker.id },
                            React.createElement(Card, { className: "w-full" },
                                React.createElement(CardContent, { className: "p-4" },
                                    React.createElement('h3', { className: "font-bold" }, worker.name),
                                    React.createElement('p', { className: "text-sm text-muted-foreground" }, worker.role),
                                    React.createElement('p', { className: "text-sm text-muted-foreground" }, worker.contact)
                                )
                            ))
                        ))
                    ),
                    React.createElement('div', { className: "overflow-x-auto hidden md:block" },
                        React.createElement('table', { className: "w-full text-sm text-left" },
                            React.createElement('thead', { className: "text-xs text-muted-foreground uppercase bg-secondary" },
                            React.createElement('tr', null,
                                React.createElement('th', { className: "px-6 py-3" }, "Name"),
                                React.createElement('th', { className: "px-6 py-3" }, "Contact"),
                                React.createElement('th', { className: "px-6 py-3" }, "Role")
                            )),
                            React.createElement('tbody', null,
                            workers.map(worker => (
                                React.createElement('tr', { key: worker.id, className: "border-b dark:border-gray-700 hover:bg-muted/50" },
                                React.createElement('td', { className: "px-6 py-4 font-medium" }, worker.name),
                                React.createElement('td', { className: "px-6 py-4" }, worker.contact),
                                React.createElement('td', { className: "px-6 py-4" }, worker.role)
                                )
                            )))
                        )
                    )
                )
            )
          )
        )
      )
    )
  );
};

export default WorkersPage;