import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import AgencySettings from '../../components/settings/AgencySettings';

const Settings: React.FC = () => {
	const { currency, unit, setCurrency, setUnit } = useSettings();
	return (
		<div className="max-w-3xl mx-auto glass p-6 space-y-8">
			<h2 className="text-lg font-semibold tracking-tight">Settings</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<section className="p-4 rounded border border-white/10 bg-white/5">
					<h3 className="text-sm font-semibold mb-2">Currency</h3>
					<div className="flex gap-2 text-sm">
						{(['EUR','USD','GBP'] as const).map(c => (
							<button key={c} onClick={()=>setCurrency(c)} aria-pressed={currency===c} className={`px-3 py-1.5 rounded border ${currency===c?'bg-accent-500 text-black border-transparent':'border-white/15 bg-white/5 hover:bg-white/10'}`}>{c}</button>
						))}
					</div>
				</section>
				<section className="p-4 rounded border border-white/10 bg-white/5">
					<h3 className="text-sm font-semibold mb-2">Distance units</h3>
					<div className="flex gap-2 text-sm">
						{(['km','mi'] as const).map(u => (
							<button key={u} onClick={()=>setUnit(u)} aria-pressed={unit===u} className={`px-3 py-1.5 rounded border ${unit===u?'bg-accent-500 text-black border-transparent':'border-white/15 bg-white/5 hover:bg-white/10'}`}>{u.toUpperCase()}</button>
						))}
					</div>
				</section>
			</div>
			<section>
				<h3 className="text-sm font-semibold mb-3">Agencies</h3>
				<AgencySettings />
			</section>
			<p className="text-xs opacity-70">Preferences are saved locally on this device.</p>
		</div>
	);
};

export default Settings;