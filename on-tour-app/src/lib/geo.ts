export type Region = 'AMER' | 'EMEA' | 'APAC';

// Minimal region bucketing based on common country codes used in demo data
const AMER = ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'UY', 'EC'];
const EMEA = ['GB', 'FR', 'DE', 'ES', 'PT', 'IE', 'IT', 'NL', 'SE', 'NO', 'FI', 'DK', 'EG', 'KE', 'ZA', 'AE'];

export function regionOfCountry(country?: string): Region {
  const c = (country || '').toUpperCase();
  if (AMER.includes(c)) return 'AMER';
  if (EMEA.includes(c)) return 'EMEA';
  return 'APAC';
}

export function isInRegion(country: string | undefined, region: 'all' | Region): boolean {
  if (region === 'all') return true;
  return regionOfCountry(country) === region;
}
