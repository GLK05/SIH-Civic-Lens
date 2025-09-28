import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { ReportStatus } from '../types';
import { ListChecksIcon, SparklesIcon, UsersIcon, WrenchIcon, CheckCircle2Icon } from '../components/Icons';
import AIAnalysisModal from '../components/AIAnalysisModal';
import ReportList from '../components/ReportList';

const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: number, icon: React.ElementType, colorClass: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 text-muted-foreground ${colorClass}`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);


const AdminDashboard = ({ viewReport }: { viewReport: (report: any) => void }) => {
  const [reports, setReports] = useState<any[]>([]);
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
    } catch(err: any) {
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
    <div className="w-full max-w-7xl mx-auto space-y-6">
        <AIAnalysisModal
            isOpen={isAnalysisModalOpen}
            onClose={() => setIsAnalysisModalOpen(false)}
            analysis={analysis}
            isLoading={isAnalysisLoading}
            error={analysisError}
        />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of all civic issues reported on the platform.</p>
        </div>
        <Button onClick={handleGetAnalysis} disabled={reports.length === 0}>
          <SparklesIcon className="mr-2 h-5 w-5" />
          Get AI Analysis
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Pending" value={stats.pending} icon={UsersIcon} colorClass="text-yellow-500" />
        <StatCard title="In Progress" value={stats.inProgress} icon={WrenchIcon} colorClass="text-blue-500" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2Icon} colorClass="text-green-500" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
             <ListChecksIcon className="h-5 w-5" />
             <CardTitle>All Reports</CardTitle>
          </div>
          <CardDescription>Click on a report to view details and update its status.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading reports...</p>
          ) : reports.length > 0 ? (
             <ReportList reports={reports} userRole="admin" viewReport={viewReport} />
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No reports have been submitted yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
