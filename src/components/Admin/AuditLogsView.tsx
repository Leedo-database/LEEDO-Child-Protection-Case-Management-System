import React, { useState } from 'react';
import { ScrollText, Shield, User, Clock, Search, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const userName = log.userName || log.user || '';
      const matchesUser = userName.toLowerCase().includes(q);
      const matchesAction = log.action.toLowerCase().includes(q);
      const matchesDetails = log.details.toLowerCase().includes(q);
      const matchesChild = log.childId?.toLowerCase().includes(q);
      if (!matchesUser && !matchesAction && !matchesDetails && !matchesChild) return false;
    }
    if (filterAction !== 'all' && !log.action.toLowerCase().includes(filterAction.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
            Security & Compliance
          </span>
          <span className="text-xs text-slate-400">&bull;</span>
          <span className="text-xs text-slate-500 font-medium">Immutable Case Record Trail</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 font-display mt-1">
          System Audit Logs & Chain of Custody
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive historical tracking of every case registration, status change, medical update, and role action
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by staff name, action, or Child ID..."
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl text-slate-700 bg-white"
        >
          <option value="all">All Actions</option>
          <option value="Register">Registration</option>
          <option value="Health">Health Updates</option>
          <option value="Counseling">Counseling</option>
          <option value="Tracing">Family Tracing</option>
          <option value="Reintegration">Reintegration</option>
          <option value="Left Without Notice">Left Without Notice</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Officer / User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Child ID</th>
                <th className="py-3 px-4">Details / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    কোনো অডিট লগ পাওয়া যায়নি (No Audit Logs Found)
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{log.userName || log.user}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                      {log.userRole || log.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-rose-700">{log.action}</td>
                  <td className="py-3 px-4 font-mono text-slate-900 font-bold">
                    {log.childId || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md">{log.details}</td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
