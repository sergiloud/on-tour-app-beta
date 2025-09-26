import { AgencyConfig, ContinentCode } from '../context/SettingsContext';
import { DemoShow } from './demoShows';

// Simple continent mapping by ISO2 country code. Extend as needed.
const COUNTRY_TO_CONTINENT: Record<string, ContinentCode> = {
  US:'NA', CA:'NA', MX:'NA',
  BR:'SA', AR:'SA', CL:'SA', UY:'SA', PE:'SA', CO:'SA',
  ES:'EU', FR:'EU', DE:'EU', IT:'EU', PT:'EU', NL:'EU', BE:'EU', SK:'EU', BG:'EU', GR:'EU', UK:'EU', IE:'EU', SE:'EU', NO:'EU', FI:'EU', CZ:'EU', AT:'EU', PL:'EU',
  QA:'AS', SA:'AS', AE:'AS', TH:'AS', MY:'AS', JP:'AS', TW:'AS', CN:'AS', KR:'AS',
  ZA:'AF', NG:'AF', MA:'AF', EG:'AF',
  AU:'OC', NZ:'OC'
};

export type AgencyMatch = { agency: AgencyConfig; applies: boolean };

export function agenciesForShow(show: DemoShow, booking: AgencyConfig[], management: AgencyConfig[]) {
  return {
    booking: booking.filter(a=> agencyAppliesToCountry(a, show.country)),
    management: management.filter(a=> agencyAppliesToCountry(a, show.country))
  };
}

export function agencyAppliesToCountry(agency: AgencyConfig, country: string): boolean {
  if (agency.territoryMode === 'worldwide') return true;
  if (agency.territoryMode === 'countries') return !!agency.countries?.includes(country);
  if (agency.territoryMode === 'continents') {
    const cont = COUNTRY_TO_CONTINENT[country];
    if (!cont) return false;
    return !!agency.continents?.includes(cont);
  }
  return false;
}

export function computeCommission(show: DemoShow, agencies: AgencyConfig[]): number {
  // Sum (or future: choose highest, etc.). For now sum percentages applied to fee.
  return agencies.reduce((acc, a)=> acc + (show.fee * (a.commissionPct/100)), 0);
}
