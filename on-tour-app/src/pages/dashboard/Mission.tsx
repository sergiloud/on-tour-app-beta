import React from 'react';
import { MapPreview } from '../../components/map/MapPreview';
import { MissionHud } from '../../components/mission/MissionHud';
import { ActionHub } from '../../components/dashboard/ActionHub';
import { t } from '../../lib/i18n';

const Mission: React.FC = () => {
	return (
		<div className="grid gap-6 lg:grid-cols-3 auto-rows-min">
			<div className="lg:col-span-2 flex flex-col gap-4">
				<div className="glass p-4 flex flex-col gap-3">
					<h2 className="text-lg font-semibold tracking-tight">{t('hud.missionControl')}</h2>
					<MapPreview
						className="h-72 w-full"
						center={{ lat: 10, lng: 10 }}
						markers={[
							{ id: 'n1', label: 'BER', lat: 52.52, lng: 13.405, accent: true },
							{ id: 'n2', label: 'PAR', lat: 48.8566, lng: 2.3522 },
							{ id: 'n3', label: 'MAD', lat: 40.4168, lng: -3.7038 }
						]}
						decorative
					/>
				</div>
				<ActionHub />
			</div>
			<div className="flex flex-col gap-6">
				<MissionHud />
			</div>
		</div>
	);
};

export default Mission;