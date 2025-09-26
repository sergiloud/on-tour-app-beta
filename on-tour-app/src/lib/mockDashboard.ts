export interface ActionItem { id:string; title:string; priority:'high'|'medium'|'low'; done:boolean }
export interface ShowItem { id:string; city:string; date:string; fee:number; status:'confirmed'|'pending'|'offer'|'canceled'|'archived' }
export interface TravelItem { id:string; title:string; date:string; kind:'flight'|'hotel'|'transfer' }

// All mock generators disabled for clean account state.
export function genActions(_n=6): ActionItem[] { return []; }
export function genShows(_n=5): ShowItem[] { return []; }
export function genTravel(_n=4): TravelItem[] { return []; }
