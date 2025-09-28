import React, { useState, useEffect } from 'react';
import * as api from '../services/api.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card.js';
import { FilePlusIcon, ListChecksIcon } from '../components/Icons.js';
import ReportList from '../components/ReportList.js';

const CitizenDashboard = ({ currentUser, viewReport, navigateToSubmitReport }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      if (currentUser?.id) {
        try {
          const userReports = await api.getReports(currentUser.id);
          setReports(userReports);
        } catch (error) {
          console.error("Failed to fetch reports:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchReports();
  }, [currentUser]);

  return (
    React.createElement('div', { className: "w-full max-w-7xl mx-auto space-y-6" },
      React.createElement('div', { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" },
        React.createElement('div', null,
          React.createElement('h1', { className: "text-3xl font-bold" }, "Welcome, ", currentUser?.name || 'Citizen', "!"),
          React.createElement('p', { className: "text-muted-foreground" }, "Here are the issues you've reported. Thank you for your contribution.")
        ),
        React.createElement(Button, { onClick: navigateToSubmitReport, size: "lg" },
          React.createElement(FilePlusIcon, { className: "mr-2 h-5 w-5" }),
          "Submit New Report"
        )
      ),

      React.createElement(Card, null,
        React.createElement(CardHeader, null,
          React.createElement('div', { className: "flex items-center space-x-2" },
            React.createElement(ListChecksIcon, { className: "h-5 w-5" }),
            React.createElement(CardTitle, null, "My Submitted Reports")
          ),
          React.createElement(CardDescription, null, "Click on a report to view its details and current status.")
        ),
        React.createElement(CardContent, null,
          loading ? (
            React.createElement('p', null, "Loading your reports...")
          ) : reports.length > 0 ? (
            React.createElement(ReportList, { reports: reports, userRole: "citizen", viewReport: viewReport })
          ) : (
            React.createElement('div', { className: "text-center py-10" },
              React.createElement('p', { className: "text-muted-foreground" }, "You haven't submitted any reports yet."),
              React.createElement(Button, { onClick: navigateToSubmitReport, className: "mt-4" }, "Report Your First Issue")
            )
          )
        )
      )
    )
  );
};

export default CitizenDashboard;
