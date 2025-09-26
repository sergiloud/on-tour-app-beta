export type Airport = {
	iata: string;
	name: string;
	city: string;
	country: string; // ISO 2
};

// Minimal demo dataset. For production, load a larger JSON or remote API.
export const AIRPORTS: Airport[] = [
	{ iata: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'ES' },
	{ iata: 'BCN', name: 'Josep Tarradellas Barcelona–El Prat', city: 'Barcelona', country: 'ES' },
	{ iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'US' },
	{ iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'US' },
	{ iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'FR' },
	{ iata: 'LHR', name: 'Heathrow', city: 'London', country: 'GB' },
	{ iata: 'HND', name: 'Haneda', city: 'Tokyo', country: 'JP' },
];

const airportMap = new Map(AIRPORTS.map(a => [a.iata.toUpperCase(), a] as const));

// Basic normalization (remove diacritics, lowercase)
function norm(s: string){
	return (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();
}

// Lightweight synonyms for common Spanish/English names
const SYN: Record<string,string> = {
	'nueva york': 'new york',
	'paris': 'paris',
	'parís': 'paris',
	'londres': 'london',
	'milan': 'milan',
	'milán': 'milan',
};

export function findAirport(query: string): Airport[] {
	let q = norm(query);
	if (!q) return [];
	if (SYN[q]) q = SYN[q];

	// Fast path for IATA code
	if (q.length === 3 && airportMap.has(q.toUpperCase())){
		return [airportMap.get(q.toUpperCase())!];
	}

	const results = AIRPORTS.map(a => {
		const iata = a.iata.toLowerCase();
		const city = norm(a.city);
		const name = norm(a.name);
		let score = 0;
		if (iata === q) score += 1000;
		else if (iata.startsWith(q)) score += 600;
		else if (iata.includes(q)) score += 350;

		if (city === q) score += 500;
		else if (city.startsWith(q)) score += 400;
		else if (city.includes(q)) score += 220;

		if (name.startsWith(q)) score += 250;
		else if (name.includes(q)) score += 120;

		return { a, score };
	})
	.filter(x => x.score > 0)
	.sort((x,y)=> y.score - x.score)
	.slice(0, 10)
	.map(x => x.a);

	return results;
}

