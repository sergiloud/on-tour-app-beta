export type Region = 'Americas' | 'Europa' | 'Asia' | 'Oceania' | 'Africa';

// Region bucketing based on continents
const AMERICAS = ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'UY', 'EC', 'VE', 'BO', 'PY', 'CR', 'PA', 'CU', 'DO', 'GT', 'HN', 'SV', 'NI', 'JM', 'TT', 'BB'];
const EUROPA = ['GB', 'FR', 'DE', 'ES', 'PT', 'IE', 'IT', 'NL', 'SE', 'NO', 'FI', 'DK', 'BE', 'AT', 'CH', 'PL', 'CZ', 'GR', 'RO', 'HU', 'BG', 'HR', 'SK', 'LT', 'LV', 'EE', 'SI', 'LU', 'MT', 'CY', 'IS', 'RS', 'UA', 'BY', 'MD', 'AL', 'MK', 'BA', 'ME', 'XK'];
const ASIA = ['CN', 'JP', 'KR', 'IN', 'TH', 'SG', 'MY', 'ID', 'PH', 'VN', 'TW', 'HK', 'MO', 'KH', 'LA', 'MM', 'BD', 'PK', 'LK', 'NP', 'AF', 'KZ', 'UZ', 'TM', 'TJ', 'KG', 'MN', 'BT', 'MV', 'BN', 'TL', 'TR', 'IL', 'JO', 'LB', 'SY', 'IQ', 'SA', 'AE', 'OM', 'YE', 'KW', 'BH', 'QA', 'AM', 'AZ', 'GE', 'IR', 'PS'];
const OCEANIA = ['AU', 'NZ', 'FJ', 'PG', 'NC', 'SB', 'VU', 'WS', 'KI', 'TO', 'FM', 'PW', 'MH', 'NR', 'TV'];
const AFRICA = ['ZA', 'EG', 'NG', 'KE', 'MA', 'TN', 'ET', 'GH', 'TZ', 'UG', 'DZ', 'SD', 'AO', 'MZ', 'MG', 'CM', 'CI', 'NE', 'BF', 'ML', 'MW', 'ZM', 'SN', 'SO', 'TD', 'ZW', 'GN', 'RW', 'BJ', 'BI', 'TG', 'SL', 'LY', 'LR', 'MR', 'CF', 'ER', 'GM', 'BW', 'GA', 'GW', 'GQ', 'MU', 'SZ', 'DJ', 'KM', 'CV', 'ST', 'SC', 'LS', 'SS'];

export function regionOfCountry(country?: string): Region {
  const c = (country || '').toUpperCase();
  if (AMERICAS.includes(c)) return 'Americas';
  if (EUROPA.includes(c)) return 'Europa';
  if (ASIA.includes(c)) return 'Asia';
  if (OCEANIA.includes(c)) return 'Oceania';
  if (AFRICA.includes(c)) return 'Africa';
  return 'Americas'; // Default
}

export function isInRegion(country: string | undefined, region: 'all' | Region): boolean {
  if (region === 'all') return true;
  return regionOfCountry(country) === region;
}

export const REGIONS: Region[] = ['Americas', 'Europa', 'Asia', 'Oceania', 'Africa'];
