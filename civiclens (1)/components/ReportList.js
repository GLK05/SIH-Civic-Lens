import React from 'react';
import { Card, CardContent } from './ui/Card.js';
import { ReportStatus } from '../types.js';

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

const ReportListItem = ({ report, userRole, viewReport }) => {
    if (userRole === 'admin') {
        return (
            React.createElement('div', {
              className: `border-l-4 p-4 cursor-pointer transition-colors bg-card hover:bg-muted/50 rounded-r-lg ${statusColors[report?.status] || statusColors['Unknown']}`,
              onClick: () => viewReport(report),
              onKeyDown: (e) => e.key === 'Enter' && viewReport(report),
              tabIndex: 0,
              role: "button",
              "aria-label": `View details for report: ${report.title}`
            },
               React.createElement('div', { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2" },
                 React.createElement('div', { className: "flex-1" },
                  React.createElement('p', { className: "font-semibold" }, report?.title || 'Untitled Report'),
                  React.createElement('p', { className: "text-sm text-muted-foreground" }, report?.location || 'Unknown Location'),
                   React.createElement('p', { className: "text-xs text-muted-foreground mt-1" },
                    "By ", report?.submitted_by_name || 'Unknown User', " on ", report?.created_at ? new Date(report.created_at).toLocaleDateString() : 'Unknown Date'
                  )
                ),
                 React.createElement('div', { className: "flex items-center gap-4 self-start sm:self-center" },
                   React.createElement('span', { className: `text-sm font-bold ${statusTextColors[report?.status] || statusTextColors['Unknown']}` },
                      report?.status || 'Unknown Status'
                    )
                )
              )
            )
        );
    }
    
    // Citizen view
    return (
        React.createElement(Card, {
          className: "hover:bg-muted/50 cursor-pointer transition-colors",
          onClick: () => viewReport(report),
          onKeyDown: (e) => e.key === 'Enter' && viewReport(report),
          tabIndex: 0,
          role: "button",
          "aria-label": `View details for report: ${report.title}`
        },
          React.createElement(CardContent, { className: "p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" },
            React.createElement('div', { className: "flex-1" },
              React.createElement('p', { className: "font-semibold" }, report?.title || 'Untitled Report'),
              React.createElement('p', { className: "text-sm text-muted-foreground" }, report?.category || 'Uncategorized'),
              React.createElement('p', { className: "text-xs text-muted-foreground mt-1" },
                "Reported on ", report?.created_at ? new Date(report.created_at).toLocaleDateString() : 'Unknown Date'
              )
            ),
            React.createElement('div', { className: "flex items-center gap-4" },
               React.createElement('span', { className: `px-3 py-1 text-xs font-semibold rounded-full ${statusColors[report?.status]?.replace('border-', 'bg-').replace('/5', '/100')} ${statusTextColors[report?.status]?.replace('text-', 'text-')}`},
                  report?.status || 'Unknown Status'
                )
            )
          )
        )
    );
};


const ReportList = ({ reports, userRole, viewReport }) => {
    return (
        React.createElement('div', { className: "space-y-4" },
            reports.map((report) => (
                React.createElement(ReportListItem, { key: report.id, report: report, userRole: userRole, viewReport: viewReport })
            ))
        )
    );
};

export default ReportList;
