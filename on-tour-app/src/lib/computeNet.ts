// Utility to compute net show amount (fee - wht - commissions - costs)
// Commission inputs optional (already pre-calculated percentages if needed later)
export interface NetInputs {
  fee?: number;
  whtPct?: number; // percentage 0-100
  mgmtPct?: number; // optional future use
  bookingPct?: number; // optional future use
  costs?: { amount?: number }[];
}

export function computeNet({ fee=0, whtPct=0, mgmtPct=0, bookingPct=0, costs=[] }: NetInputs){
  const wht = fee * (whtPct/100);
  const commissions = fee * ((mgmtPct + bookingPct)/100);
  const totalCosts = costs.reduce((s,c)=> s + (c.amount||0), 0);
  return fee - wht - commissions - totalCosts;
}

export function breakdownNet(inputs: NetInputs){
  const { fee=0, whtPct=0, mgmtPct=0, bookingPct=0, costs=[] } = inputs;
  const wht = fee * (whtPct/100);
  const mgmt = fee * (mgmtPct/100);
  const booking = fee * (bookingPct/100);
  const commissions = mgmt + booking;
  const totalCosts = costs.reduce((s,c)=> s + (c.amount||0), 0);
  const net = fee - wht - commissions - totalCosts;
  return { fee, wht, mgmt, booking, commissions, totalCosts, net };
}