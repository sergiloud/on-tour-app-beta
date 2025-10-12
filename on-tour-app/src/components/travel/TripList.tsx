import React from 'react';
import { listTrips, onTripsChanged, addSegment, createTrip } from '../../services/trips';
import { t } from '../../lib/i18n';
import QuickTripPicker from './QuickTripPicker';
import type { FlightResult } from '../../features/travel/providers/types';
import { can } from '../../lib/tenants';

type Props = { onSelectTrip?: (id: string)=>void; activeTripId?: string|null };

export const TripList: React.FC<Props> = ({ onSelectTrip, activeTripId }) => {
	const [trips, setTrips] = React.useState(listTrips());
	const [dropping, setDropping] = React.useState<string | 'new' | null>(null);
	const [createOpen, setCreateOpen] = React.useState(false);
	const [pendingPayload, setPendingPayload] = React.useState<FlightResult | null>(null);

	React.useEffect(()=>{
		const unsub = onTripsChanged(()=> setTrips(listTrips()));
		return ()=> { try { unsub(); } catch {} };
	}, []);

	const parseDrag = (e: React.DragEvent): FlightResult | null => {
		try {
			const json = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
			if (!json) return null;
			const data = JSON.parse(json);
			if (data && (data.type==='flight' || (data.payload && data.payload.dep))) return (data.payload || data) as FlightResult;
		} catch {}
		return null;
	};

	const allowDrop = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };
	const onDropOnTrip = (e: React.DragEvent, tripId: string) => {
		e.preventDefault();
			const r = parseDrag(e); setDropping(null);
		if (!r) return;
			if (!can('travel:book')) return; // gated in read-only
		addSegment(tripId, { type: 'flight', from: r.origin, to: r.dest, dep: r.dep, arr: r.arr, carrier: r.carrier, price: r.price, currency: (r.currency as any) });
	};
	const onDropCreate = (e: React.DragEvent) => {
		e.preventDefault();
		const r = parseDrag(e); setDropping(null);
		if (!r) return;
			if (!can('travel:book')) return; // gated in read-only
		setPendingPayload(r);
		setCreateOpen(true);
	};

	const defaultTitleFrom = (r: FlightResult) => {
		try {
			const d = new Date(r.dep);
			const day = d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
			return `${r.origin} → ${r.dest} (${day})`;
		} catch { return `${r.origin} → ${r.dest}`; }
	};

	const confirmCreate = (tripId: string) => {
		const r = pendingPayload; if (!r) { setCreateOpen(false); return; }
		addSegment(tripId, { type: 'flight', from: r.origin, to: r.dest, dep: r.dep, arr: r.arr, carrier: r.carrier, price: r.price, currency: (r.currency as any) });
		setCreateOpen(false); setPendingPayload(null);
		onSelectTrip?.(tripId);
	};

	if (!trips.length) return (
		<div className="text-center text-xs opacity-60 p-4 border border-dashed border-white/10 rounded-md">
			{t('travel.no_trips_yet') || 'No trips planned yet. Use the search to get started!'}
		</div>
	);

	return (
		<div className="space-y-2">
			<ul className="text-sm space-y-1">
				{trips.map(t => (
					<li key={t.id}>
						<button
							className={`w-full text-left px-2 py-1 rounded border ${activeTripId===t.id?'bg-white/10 border-white/20':'hover:bg-white/5 border-transparent'} ${dropping===t.id?'border-accent-500/60 bg-accent-900/10':''}`}
							onClick={()=> onSelectTrip?.(t.id)}
							onDragOver={allowDrop}
							onDragEnter={()=> setDropping(t.id)}
							onDragLeave={()=> setDropping(d=> d===t.id? null : d)}
							onDrop={(e)=> onDropOnTrip(e, t.id)}
							aria-dropeffect="copy"
						>
							{t.title}
						</button>
					</li>
				))}
			</ul>
			{/* Create new trip dropzone */}
			<div
				className={`mt-2 text-xs px-2 py-2 rounded border border-dashed ${dropping==='new'?'border-accent-500/60 bg-accent-900/10':'border-white/10 opacity-80'}`}
				onDragOver={allowDrop}
				onDragEnter={()=> setDropping('new')}
				onDragLeave={()=> setDropping(d=> d==='new'? null : d)}
				onDrop={onDropCreate}
				role="button"
				aria-label={t('travel.trip.create_drop')||'Drop here to create new trip'}
				tabIndex={0}
			>
				{t('travel.trip.create_drop')||'Drop here to create a new trip'}
			</div>

			{createOpen && pendingPayload && (
				<QuickTripPicker
					onCancel={()=> { setCreateOpen(false); setPendingPayload(null); }}
					onConfirm={confirmCreate}
					defaultTitle={defaultTitleFrom(pendingPayload)}
				/>
			)}
		</div>
	);
};

export default TripList;

