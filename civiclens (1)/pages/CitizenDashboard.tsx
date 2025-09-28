import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { FilePlusIcon, ListChecksIcon } from '../components/Icons';
import ReportList from '../components/ReportList';

type CitizenDashboardProps = {
  currentUser: any;
  viewReport: (report: any) => void;
  navigateToSubmitReport: () => void;
};

const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ currentUser, viewReport, navigateToSubmitReport }) => {
  const [reports, setReports] = useState<any[]>([]);
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
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {currentUser?.name || 'Citizen'}!</h1>
          <p className="text-muted-foreground">Here are the issues you've reported. Thank you for your contribution.</p>
        </div>
        <Button onClick={navigateToSubmitReport} size="lg">
          <FilePlusIcon className="mr-2 h-5 w-5" />
          Submit New Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ListChecksIcon className="h-5 w-5" />
            <CardTitle>My Submitted Reports</CardTitle>
          </div>
          <CardDescription>Click on a report to view its details and current status.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading your reports...</p>
          ) : reports.length > 0 ? (
            <ReportList reports={reports} userRole="citizen" viewReport={viewReport} />
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">You haven't submitted any reports yet.</p>
              <Button onClick={navigateToSubmitReport} className="mt-4">Report Your First Issue</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenDashboard;
