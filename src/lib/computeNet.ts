// Utility to compute net show amount (fee - wht - commissions - costs)
// VAT is added ON TOP of the fee (client pays Fee + VAT), it doesn't reduce net
// WHT is withholding tax deducted from the fee
export interface NetInputs {
  fee?: number;
  whtPct?: number; // percentage 0-100 (withholding tax, reduces net)
  vatPct?: number; // percentage 0-100 (sales tax, added to invoice total, doesn't affect net)
  mgmtPct?: number; // optional future use
  bookingPct?: number; // optional future use
  costs?: { amount?: number }[];
}

export function computeNet({ fee=0, whtPct=0, vatPct=0, mgmtPct=0, bookingPct=0, costs=[] }: NetInputs){
  const wht = fee * (whtPct/100);
  // VAT is NOT deducted from net - it's added to the invoice total
  const commissions = fee * ((mgmtPct + bookingPct)/100);
  const totalCosts = costs.reduce((s,c)=> s + (c.amount||0), 0);
  return fee - wht - commissions - totalCosts;
}

export function breakdownNet(inputs: NetInputs){
  const { fee=0, whtPct=0, vatPct=0, mgmtPct=0, bookingPct=0, costs=[] } = inputs;
  const wht = fee * (whtPct/100);
  const vat = fee * (vatPct/100); // VAT amount for invoice total display
  const mgmt = fee * (mgmtPct/100);
  const booking = fee * (bookingPct/100);
  const commissions = mgmt + booking;
  const totalCosts = costs.reduce((s,c)=> s + (c.amount||0), 0);
  const net = fee - wht - commissions - totalCosts; // VAT doesn't reduce net
  const invoiceTotal = fee + vat; // Total amount client pays
  return { fee, wht, vat, mgmt, booking, commissions, totalCosts, net, invoiceTotal };
}