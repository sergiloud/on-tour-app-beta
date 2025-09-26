// Route sampling worker: computes great-circle sampled points between consecutive markers
// Message contract: { type:'compute', markers:[{lat,lng,label,id}], samplesPerSegment?: number }
// Response: { type:'result', points: Array<{x:number;y:number}> }

export type Marker = { id: string; label: string; lat: number; lng: number };

function project(lat: number, lng: number) {
  const x = (lng + 180) / 360;
  const y = 1 - (lat + 90) / 180;
  return { x, y };
}

function arcPathPoints(a: { lat:number; lng:number }, b:{ lat:number; lng:number }, samples = 28) {
  const toRad = (d:number)=> d*Math.PI/180;
  const toDeg = (r:number)=> r*180/Math.PI;
  const φ1 = toRad(a.lat), λ1 = toRad(a.lng);
  const φ2 = toRad(b.lat), λ2 = toRad(b.lng);
  const Δ = 2 * Math.asin(Math.sqrt(Math.sin((φ2-φ1)/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin((λ2-λ1)/2)**2));
  if (!isFinite(Δ) || Δ === 0) return [] as Array<{x:number;y:number}>;
  const sinΔ = Math.sin(Δ);
  const coords: Array<{x:number;y:number}> = [];
  for (let i=0;i<=samples;i++){
    const t = i/samples;
    const A = Math.sin((1-t)*Δ)/sinΔ;
    const B = Math.sin(t*Δ)/sinΔ;
    const x = A*Math.cos(φ1)*Math.cos(λ1) + B*Math.cos(φ2)*Math.cos(λ2);
    const y = A*Math.cos(φ1)*Math.sin(λ1) + B*Math.cos(φ2)*Math.sin(λ2);
    const z = A*Math.sin(φ1) + B*Math.sin(φ2);
    const φ = Math.atan2(z, Math.sqrt(x*x + y*y));
    const λ = Math.atan2(y, x);
    const p = project(toDeg(φ), toDeg(λ));
    coords.push({ x: p.x*100, y: p.y*56 });
  }
  return coords;
}

self.onmessage = (ev: MessageEvent) => {
  const data = ev.data as { type: 'compute'; markers: Marker[]; samplesPerSegment?: number };
  if (!data || data.type !== 'compute') return;
  try {
    const { markers, samplesPerSegment = 28 } = data;
    if (!markers || markers.length < 2) {
      (self as any).postMessage({ type:'result', points: [] });
      return;
    }
    const pts: Array<{x:number;y:number}> = [];
    for (let i=0;i<markers.length-1;i++){
      const a = markers[i], b = markers[i+1];
      const seg = arcPathPoints({ lat:a.lat, lng:a.lng }, { lat:b.lat, lng:b.lng }, samplesPerSegment);
      for (const p of seg) pts.push(p);
    }
    (self as any).postMessage({ type:'result', points: pts });
  } catch (e) {
    (self as any).postMessage({ type:'result', points: [] });
  }
};
