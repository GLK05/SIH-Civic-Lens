import React, { useState, useEffect } from 'react';
import * as api from '../services/api.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card.js';
import { ReportStatus } from '../types.js';
import { ListChecksIcon, SparklesIcon, UsersIcon, WrenchIcon, CheckCircle2Icon } from '../components/Icons.js';
import AIAnalysisModal from '../components/AIAnalysisModal.js';
import ReportList from '../components/ReportList.js';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    React.createElement(Card, null,
        React.createElement(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
            React.createElement(CardTitle, { className: "text-sm font-medium" }, title),
            React.createElement(Icon, { className: `h-4 w-4 text-muted-foreground ${colorClass}` })
        ),
        React.createElement(CardContent, null,
            React.createElement('div', { className: "text-2xl font-bold" }, value)
        )
    )
);


const AdminDashboard = ({ viewReport }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const allReports = await api.getReports();
        setReports(allReports);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);
  
  const handleGetAnalysis = async () => {
    setIsAnalysisModalOpen(true);
    setIsAnalysisLoading(true);
    setAnalysisError('');
    setAnalysis('');
    try {
        const result = await api.getAIReportAnalysis(reports.filter(r => r.status !== ReportStatus.Resolved));
        setAnalysis(result);
    } catch(err) {
        setAnalysisError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsAnalysisLoading(false);
    }
  };

  const stats = {
      pending: reports.filter(r => r.status === ReportStatus.Pending).length,
      inProgress: reports.filter(r => r.status === ReportStatus.InProgress || r.status === ReportStatus.Assigned).length,
      resolved: reports.filter(r => r.status === ReportStatus.Resolved).length,
      total: reports.length,
  };

  return (
    React.createElement('div', { className: "w-full max-w-7xl mx-auto space-y-6" },
        React.createElement(AIAnalysisModal, {
            isOpen: isAnalysisModalOpen,
            onClose: () => setIsAnalysisModalOpen(false),
            analysis: analysis,
            isLoading: isAnalysisLoading,
            error: analysisError
        }),
      React.createElement('div', { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" },
        React.createElement('div', null,
            React.createElement('h1', { className: "text-3xl font-bold" }, "Admin Dashboard"),
            React.createElement('p', { className: "text-muted-foreground" }, "Overview of all civic issues reported on the platform.")
        ),
        React.createElement(Button, { onClick: handleGetAnalysis, disabled: reports.length === 0 },
          React.createElement(SparklesIcon, { className: "mr-2 h-5 w-5" }),
          "Get AI Analysis"
        )
      ),

      React.createElement('div', { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" },
        React.createElement(StatCard, { title: "Pending", value: stats.pending, icon: UsersIcon, colorClass: "text-yellow-500" }),
        React.createElement(StatCard, { title: "In Progress", value: stats.inProgress, icon: WrenchIcon, colorClass: "text-blue-500" }),
        React.createElement(StatCard, { title: "Resolved", value: stats.resolved, icon: CheckCircle2Icon, colorClass: "text-green-500" })
      ),

      React.createElement(Card, null,
        React.createElement(CardHeader, null,
          React.createElement('div', { className: "flex items-center space-x-2" },
             React.createElement(ListChecksIcon, { className: "h-5 w-5" }),
             React.createElement(CardTitle, null, "All Reports")
          ),
          React.createElement(CardDescription, null, "Click on a report to view details and update its status.")
        ),
        React.createElement(CardContent, null,
          loading ? (
            React.createElement('p', null, "Loading reports...")
          ) : reports.length > 0 ? (
             React.createElement(ReportList, { reports: reports, userRole: "admin", viewReport: viewReport })
          ) : (
            React.createElement('div', { className: "text-center py-10" },
              React.createElement('p', { className: "text-muted-foreground" }, "No reports have been submitted yet.")
            )
          )
        )
      )
    )
  );
};

export default AdminDashboard;
