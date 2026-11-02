import React, { useState, useEffect } from 'react';
import { 
  Activity, Shield, AlertTriangle, AlertCircle, 
  Info, Clock, Filter, RefreshCw, Terminal 
} from 'lucide-react';
import { Card, Title, Badge, Btn, LoadingState, EmptyState, ErrorState } from '../../components/ui.jsx';
import { AdminService } from '../../services/adminService.js';

export const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('');

  const loadAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (severityFilter) params.severity = severityFilter;
      const data = await AdminService.getAuditLogs(params);
      setLogs(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [severityFilter]);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical': return <Badge variant="critical">CRITICAL</Badge>;
      case 'warning': return <Badge variant="warning">WARNING</Badge>;
      default: return <Badge variant="active">INFO</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink">Administrative Security & Audit Ledger</h2>
          <p className="text-xs text-mute mt-0.5">
            Immutable records of platform configurations, access escalations, user status modifications, and security probes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo"
          >
            <option value="">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>

          <Btn size="sm" v="primary" onClick={loadAuditLogs}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Btn>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <LoadingState message="Fetching immutable security audit logs..." />
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={loadAuditLogs} />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No audit entries found" description="No administrative events match the selected severity filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-mute">
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-5">Details</th>
                  <th className="py-3 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-normal">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-5 text-xs text-mute whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-ink bg-slate-100 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-semibold text-ink">{log.actor?.name || 'System'}</div>
                      <div className="text-[11px] text-mute capitalize">{log.actor?.role}</div>
                    </td>
                    <td className="py-3 px-5 text-xs text-slate-700 max-w-md">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-mute">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
