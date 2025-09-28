import React, { useState, useEffect } from 'react';
import { UserRole, ReportStatus } from '../types.js';
import * as api from '../services/api.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card.js';
import { Textarea } from '../components/ui/Textarea.js';
import { Select } from '../components/ui/Select.js';
import { ArrowLeftIcon, ThumbsUpIcon } from '../components/Icons.js';
import MiniMap from '../components/MiniMap.js';

const statusColors = {
  [ReportStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [ReportStatus.Assigned]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [ReportStatus.InProgress]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [ReportStatus.Resolved]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

const parseLocation = (location) => {
    if (!location) return null;
    const latLonMatch = location.match(/Lat: ([-.\d]+), Lon: ([-.\d]+)/);
    if (latLonMatch && latLonMatch[1] && latLonMatch[2]) {
        const lat = parseFloat(latLonMatch[1]);
        const lon = parseFloat(latLonMatch[2]);
        if (!isNaN(lat) && !isNaN(lon)) {
           return { lat, lon };
        }
    }
    return null;
};


const ReportDetailPage = ({ report: initialReport, currentUser, onBack }) => {
  const [report, setReport] = useState(initialReport);
  const [workers, setWorkers] = useState([]);
  const [newStatus, setNewStatus] = useState(report.status);
  const [assignedWorker, setAssignedWorker] = useState(report.assigned_to || undefined);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const isAdmin = currentUser?.role === UserRole.Admin;
  const isCitizen = currentUser?.role === UserRole.Citizen;
  
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoteLoading, setIsVoteLoading] = useState(true);

  const reportLocation = React.useMemo(() => parseLocation(report.location), [report.location]);

  useEffect(() => {
    if (isAdmin) {
      api.getWorkers().then(setWorkers);
    }
    if (isCitizen) {
      api.getMyVotesForReports([report.id], currentUser.id).then(voteMap => {
        setHasVoted(voteMap.has(report.id));
        setIsVoteLoading(false);
      });
    }
  }, [isAdmin, isCitizen, currentUser, report.id]);

  const handleUpdateStatus = async () => {
    if (!isAdmin) return;
    setLoading(true);
    const updatedReport = await api.updateReportStatus(report.id, newStatus, assignedWorker, note || undefined);
    if (updatedReport) {
      setReport(prev => ({ ...prev, ...updatedReport }));
      setNote('');
    }
    setLoading(false);
  };
  
  const handleVote = async () => {
      if (!isCitizen) return;
      setIsVoteLoading(true);
      if (hasVoted) {
          await api.removeVote(report.id, currentUser.id);
          setHasVoted(false);
          setReport(prev => ({ ...prev, vote_count: (prev.vote_count || 1) - 1 }));
      } else {
          await api.addVote(report.id, currentUser.id);
          setHasVoted(true);
          setReport(prev => ({ ...prev, vote_count: (prev.vote_count || 0) + 1 }));
      }
      setIsVoteLoading(false);
  };

  return (
    React.createElement('div', { className: "space-y-6 max-w-4xl mx-auto" },
      React.createElement(Button, { variant: "ghost", onClick: onBack },
        React.createElement(ArrowLeftIcon, { className: "mr-2 h-4 w-4" }),
        "Back to Dashboard"
      ),

      React.createElement(Card, null,
        React.createElement(CardHeader, null,
          React.createElement('div', { className: "flex justify-between items-start" },
            React.createElement('div', null,
              React.createElement(CardTitle, { className: "text-3xl" }, report.title),
              React.createElement(CardDescription, null, "Reported on ", new Date(report.created_at).toLocaleString(), " by ", report.submitted_by_name)
            ),
            React.createElement('span', { className: `px-4 py-1.5 text-sm font-semibold rounded-full ${statusColors[report.status]}` },
              report.status
            )
          )
        ),
        React.createElement(CardContent, { className: "space-y-6" },
          report.image_url && (
            React.createElement('div', { className: "w-full" },
              React.createElement('img', { src: report.image_url, alt: report.title, className: "max-h-96 w-auto rounded-lg mx-auto" })
            )
          ),
          React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm" },
            React.createElement('p', null, React.createElement('strong', { className: "font-semibold text-muted-foreground block mb-1" }, "Category:"), " ", report.category),
            React.createElement('p', null, React.createElement('strong', { className: "font-semibold text-muted-foreground block mb-1" }, "Location:"), " ", report.location)
          ),
          reportLocation && (
              React.createElement('div', null,
                React.createElement('h4', { className: "font-semibold mb-2" }, "Map Location"),
                React.createElement('div', { className: "h-64 w-full rounded-lg overflow-hidden border" },
                   React.createElement(MiniMap, { location: reportLocation })
                )
              )
            ),
          React.createElement('div', null,
            React.createElement('h4', { className: "font-semibold mb-2" }, "Description"),
            React.createElement('p', { className: "text-muted-foreground whitespace-pre-wrap" }, report.description)
          ),
          React.createElement('div', null,
            React.createElement('h4', { className: "font-semibold mb-2" }, "Status History & Notes"),
            React.createElement('div', { className: "space-y-3 border p-4 rounded-lg" },
                React.createElement('div', { className: "flex items-center justify-between pb-3 border-b" },
                    React.createElement('p', { className: "text-sm font-semibold flex items-center text-primary" },
                        React.createElement(ThumbsUpIcon, { className: "w-4 h-4 mr-2" }), " ", report.vote_count || 0, " citizen(s) confirmed this issue."
                    ),
                    isCitizen && (
                        React.createElement(Button, { size: "sm", variant: hasVoted ? 'secondary' : 'outline', onClick: handleVote, disabled: isVoteLoading, className: "whitespace-nowrap" },
                            isVoteLoading ? '...' : (hasVoted ? 'Retract Vote' : 'Confirm Issue')
                        )
                    )
                ),
                React.createElement('div', { className: "max-h-52 overflow-y-auto space-y-3 pr-2" },
                report.status_history && report.status_history.length > 0 ? (
                  [...report.status_history].reverse().map((update, index) => (
                    React.createElement('div', { key: index, className: "text-sm pt-2 first:pt-0" },
                      React.createElement('p', null, React.createElement('strong', null, update.status), " - ", React.createElement('span', { className: "text-xs text-muted-foreground" }, new Date(update.timestamp).toLocaleString())),
                      update.notes && React.createElement('p', { className: "pl-4 italic text-muted-foreground" }, "\"", update.notes, "\"")
                    )
                  ))
                ) : (
                  React.createElement('p', { className: "text-sm text-muted-foreground pt-2" }, "No updates yet.")
                )
                )
            )
          )
        )
      ),
      
      isAdmin && (
        React.createElement(Card, null,
          React.createElement(CardHeader, null,
            React.createElement(CardTitle, null, "Admin Actions"),
            React.createElement(CardDescription, null, "Update the status, assign a worker, or add a note to this report.")
          ),
          React.createElement(CardContent, { className: "space-y-4" },
            React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
              React.createElement('div', null,
                React.createElement('label', { htmlFor: "status-update", className: "text-sm font-medium" }, "Update Status"),
                React.createElement(Select, { id: "status-update", value: newStatus, onChange: e => setNewStatus(e.target.value) },
                  Object.values(ReportStatus).map(s => React.createElement('option', { key: s, value: s }, s))
                )
              ),
              React.createElement('div', null,
                React.createElement('label', { htmlFor: "assign-worker", className: "text-sm font-medium" }, "Assign Worker"),
                React.createElement(Select, { id: "assign-worker", value: assignedWorker || '', onChange: e => setAssignedWorker(e.target.value ? Number(e.target.value) : null), disabled: workers.length === 0 },
                  React.createElement('option', { value: "" }, workers.length > 0 ? 'Select a worker' : 'No workers available'),
                  workers.map(w => React.createElement('option', { key: w.id, value: w.id }, w.name, " - ", w.role))
                )
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { htmlFor: "note", className: "text-sm font-medium" }, "Add a Note (Optional)"),
              React.createElement(Textarea, { id: "note", placeholder: "Provide an update or reason for the status change.", value: note, onChange: e => setNote(e.target.value) })
            )
          ),
          React.createElement(CardFooter, null,
            React.createElement(Button, { onClick: handleUpdateStatus, disabled: loading }, loading ? 'Updating...' : 'Update Report')
          )
        )
      )
    )
  );
};

export default ReportDetailPage;