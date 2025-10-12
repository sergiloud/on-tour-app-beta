import React from 'react';
import { t } from '../../lib/i18n';
import GuardedAction from '../../components/common/GuardedAction';

const OrgReports: React.FC = () => {
  const rows = [
    { id: 1, name: 'Monthly Summary', items: 12 },
    { id: 2, name: 'Open Invoices', items: 4 },
  ];
  const onExport = () => {
    const csv = 'name,items\n' + rows.map(r=>`${r.name},${r.items}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'report.csv'; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('org.reports.title')||'Reports'}</h2>
      <div className="glass rounded border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Items</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.items}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  <GuardedAction scope="finance:export" onClick={onExport} className="btn">{t('common.export')||'Export'}</GuardedAction>
    </div>
  );
};

export default OrgReports;
