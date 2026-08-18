import React from 'react';
import { History, Shield, Clock, User, FileText } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogsProps {
  logs: AuditLog[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            Audit Log & Riwayat Aktivitas Sistem (Transparency Tracker)
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Total Log: {logs.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
            <tr>
              <th className="p-3">Waktu</th>
              <th className="p-3">Aktor / Pengguna</th>
              <th className="p-3">Aksi</th>
              <th className="p-3">Target & Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/50 transition">
                <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                  {log.timestamp}
                </td>

                <td className="p-3">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{log.actorName}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-amber-500/30">
                      {log.actorRole === 'ADMIN_PUSAT' ? 'ADMIN' : 'BHABIN'}
                    </span>
                  </div>
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.actionType.includes('APPROVE')
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                        : log.actionType.includes('REJECT')
                        ? 'bg-rose-950 text-rose-300 border border-rose-700/60'
                        : log.actionType.includes('REQUEST')
                        ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {log.actionType}
                  </span>
                </td>

                <td className="p-3">
                  <div className="font-semibold text-slate-200">{log.targetInfo}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{log.details}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
