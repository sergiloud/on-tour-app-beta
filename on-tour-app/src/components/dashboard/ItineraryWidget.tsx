import { ItineraryEvent, ItineraryWidgetData } from '@/types/dashboard';

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

const weekdayFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
});

function formatDate(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  const formattedWeekday = weekdayFormatter.format(date);
  const formattedDate = dateFormatter.format(date);

  return `${capitalize(formattedWeekday)} ${formattedDate}`;
}

function formatTime(isoString: string) {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return isoString;
  }

  return timeFormatter.format(date);
}

function capitalize(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

type ItinerarySectionProps = {
  label: string;
  day: ItineraryWidgetData['today'];
  emptyMessage: string;
};

export function ItineraryWidget({ data }: { data: ItineraryWidgetData }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="space-y-6">
        <ItinerarySection
          label="Hoy"
          day={data.today}
          emptyMessage="No hay eventos programados para hoy. ¡Día libre!"
        />
        <ItinerarySection
          label="Mañana"
          day={data.tomorrow}
          emptyMessage="No hay eventos programados para mañana."
        />
      </div>
    </div>
  );
}

function ItinerarySection({ label, day, emptyMessage }: ItinerarySectionProps) {
  const { city, date, events } = day;
  const hasEvents = events.length > 0;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {label}: {formatDate(date)}, {city}
      </h2>
      {!hasEvents ? (
        <p className="py-4 text-sm italic text-gray-500">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col gap-y-4">
          {events.map((event) => (
            <EventItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventItem({ event }: { event: ItineraryEvent }) {
  return (
    <div className="flex gap-x-4">
      <div className="w-24 flex-none text-sm font-medium text-indigo-600">
        {formatTime(event.time)}
      </div>
      <div className="flex-auto">
        <p className="font-medium text-gray-900">{event.title}</p>
        {event.location && <p className="text-sm text-gray-500">{event.location}</p>}
        {event.description && <p className="text-sm text-gray-400">{event.description}</p>}
      </div>
    </div>
  );
}
