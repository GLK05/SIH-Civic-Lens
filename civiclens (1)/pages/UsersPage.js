import React, { useState, useEffect } from 'react';
import * as api from '../services/api.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card.js';

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
    React.createElement('div', { className: "w-full max-w-7xl mx-auto space-y-6" },
      React.createElement('h1', { className: "text-3xl font-bold" }, "Manage Users"),
      React.createElement(Card, null,
        React.createElement(CardHeader, null,
          React.createElement(CardTitle, null, "Registered Users"),
          React.createElement(CardDescription, null, "List of all registered users with their personal details.")
        ),
        React.createElement(CardContent, null,
          loading ? React.createElement('p', null, "Loading...") : (
            users.length === 0 ? (
                React.createElement('div', { className: "text-center py-10" },
                    React.createElement('p', { className: "text-muted-foreground" }, "No users have registered yet.")
                )
            ) : (
                 React.createElement(React.Fragment, null,
                    React.createElement('div', { className: "md:hidden space-y-4" },
                        users.map(user => (
                            React.createElement('div', { key: user.id },
                            React.createElement(Card, { className: "w-full" },
                                React.createElement(CardContent, { className: "p-4" },
                                    React.createElement('h3', { className: "font-bold" }, user.name),
                                    React.createElement('p', { className: "text-sm text-muted-foreground" }, user.email),
                                    React.createElement('p', { className: "text-sm text-muted-foreground capitalize" }, "Role: ", user.role)
                                )
                            ))
                        ))
                    ),
                    React.createElement('div', { className: "overflow-x-auto hidden md:block" },
                        React.createElement('table', { className: "w-full text-sm text-left" },
                            React.createElement('thead', { className: "text-xs text-muted-foreground uppercase bg-secondary" },
                            React.createElement('tr', null,
                                React.createElement('th', { className: "px-6 py-3" }, "Name"),
                                React.createElement('th', { className: "px-6 py-3" }, "Email"),
                                React.createElement('th', { className: "px-6 py-3" }, "Role")
                            )),
                            React.createElement('tbody', null,
                            users.map(user => (
                                React.createElement('tr', { key: user.id, className: "border-b dark:border-gray-700 hover:bg-muted/50" },
                                React.createElement('td', { className: "px-6 py-4 font-medium" }, user.name),
                                React.createElement('td', { className: "px-6 py-4" }, user.email),
                                React.createElement('td', { className: "px-6 py-4 capitalize" }, user.role)
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

export default UsersPage;