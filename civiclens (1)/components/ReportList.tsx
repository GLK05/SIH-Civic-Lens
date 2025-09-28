import React from 'react';
import { Card, CardContent } from './ui/Card';
import { ReportStatus, UserRole } from '../types';

const statusColors = {
  [ReportStatus.Pending]: 'border-yellow-500 bg-yellow-500/5',
  [ReportStatus.Assigned]: 'border-blue-500 bg-blue-500/5',
  [ReportStatus.InProgress]: 'border-purple-500 bg-purple-500/5',
  [ReportStatus.Resolved]: 'border-green-500 bg-green-500/5',
  'Unknown': 'border-gray-500 bg-gray-500/5',
};

const statusTextColors = {
    [ReportStatus.Pending]: 'text-yellow-500',
    [ReportStatus.Assigned]: 'text-blue-500',
    [ReportStatus.InProgress]: 'text-purple-500',
    [ReportStatus.Resolved]: 'text-green-500',
    'Unknown': 'text-gray-500',
};

type ReportListProps = {
    reports: any[];
    userRole: 'admin' | 'citizen';
    viewReport: (report: any) => void;
};

// FIX: Define a separate props type for ReportListItem and use React.FC
// This resolves a TypeScript error where the 'key' prop was incorrectly
// being checked against the component's props type.
type ReportListItemProps = {
    report: any;
    userRole: 'admin' | 'citizen';
    viewReport: (report: any) => void;
};

const ReportListItem: React.FC<ReportListItemProps> = ({ report, userRole, viewReport }) => {
    if (userRole === 'admin') {
        return (
            <div
              className={`border-l-4 p-4 cursor-pointer transition-colors bg-card hover:bg-muted/50 rounded-r-lg ${statusColors[report?.status] || statusColors['Unknown']}`}
              onClick={() => viewReport(report)}
              onKeyDown={(e) => e.key === 'Enter' && viewReport(report)}
              tabIndex={0}
              role="button"
              aria-label={`View details for report: ${report.title}`}
            >
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                 <div className="flex-1">
                  <p className="font-semibold">{report?.title || 'Untitled Report'}</p>
                  <p className="text-sm text-muted-foreground">{report?.location || 'Unknown Location'}</p>
                   <p className="text-xs text-muted-foreground mt-1">
                    By {report?.submitted_by_name || 'Unknown User'} on {report?.created_at ? new Date(report.created_at).toLocaleDateString() : 'Unknown Date'}
                  </p>
                </div>
                 <div className="flex items-center gap-4 self-start sm:self-center">
                   <span className={`text-sm font-bold ${statusTextColors[report?.status] || statusTextColors['Unknown']}`}>
                      {report?.status || 'Unknown Status'}
                    </span>
                </div>
              </div>
            </div>
        );
    }
    
    // Citizen view
    return (
        <Card
          className="hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => viewReport(report)}
          onKeyDown={(e) => e.key === 'Enter' && viewReport(report)}
          tabIndex={0}
          role="button"
          aria-label={`View details for report: ${report.title}`}
        >
          <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold">{report?.title || 'Untitled Report'}</p>
              <p className="text-sm text-muted-foreground">{report?.category || 'Uncategorized'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Reported on {report?.created_at ? new Date(report.created_at).toLocaleDateString() : 'Unknown Date'}
              </p>
            </div>
            <div className="flex items-center gap-4">
               <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[report?.status]?.replace('border-', 'bg-').replace('/5', '/100')} ${statusTextColors[report?.status]?.replace('text-', 'text-')}`}>
                  {report?.status || 'Unknown Status'}
                </span>
            </div>
          </CardContent>
        </Card>
    );
};


const ReportList: React.FC<ReportListProps> = ({ reports, userRole, viewReport }) => {
    return (
        <div className="space-y-4">
            {reports.map((report) => (
                <ReportListItem key={report.id} report={report} userRole={userRole} viewReport={viewReport} />
            ))}
        </div>
    );
};

export default ReportList;