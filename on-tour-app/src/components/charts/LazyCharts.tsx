import React, { Suspense, lazy } from 'react';

// Lazy load Recharts components solo cuando se necesitan
const LazyAreaChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.AreaChart }))
);
const LazyArea = lazy(() =>
  import('recharts').then((module) => ({ default: module.Area }))
);
const LazyLineChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.LineChart }))
);
const LazyLine = lazy(() =>
  import('recharts').then((module) => ({ default: module.Line }))
);
const LazyPieChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.PieChart }))
);
const LazyPie = lazy(() =>
  import('recharts').then((module) => ({ default: module.Pie }))
);
const LazyBarChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.BarChart }))
);
const LazyBar = lazy(() =>
  import('recharts').then((module) => ({ default: module.Bar }))
);
const LazyXAxis = lazy(() =>
  import('recharts').then((module) => ({ default: module.XAxis }))
);
const LazyYAxis = lazy(() =>
  import('recharts').then((module) => ({ default: module.YAxis }))
);
const LazyCartesianGrid = lazy(() =>
  import('recharts').then((module) => ({ default: module.CartesianGrid }))
);
const LazyTooltip = lazy(() =>
  import('recharts').then((module) => ({ default: module.Tooltip }))
);
const LazyResponsiveContainer = lazy(() =>
  import('recharts').then((module) => ({ default: module.ResponsiveContainer }))
);
const LazyCell = lazy(() =>
  import('recharts').then((module) => ({ default: module.Cell }))
);

interface ChartFallbackProps {
  height?: number;
}

const ChartFallback: React.FC<ChartFallbackProps> = ({ height = 300 }) => (
  <div
    className="flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse"
    style={{ height }}
  >
    <div className="text-slate-300 dark:text-slate-200 dark:text-white/30">Cargando gráfico...</div>
  </div>
);

// Wrapper components with Suspense
export const AreaChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartFallback height={props.height} />}>
    <LazyAreaChart {...props} />
  </Suspense>
);

export const Area: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyArea {...props} />
  </Suspense>
);

export const LineChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartFallback height={props.height} />}>
    <LazyLineChart {...props} />
  </Suspense>
);

export const Line: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyLine {...props} />
  </Suspense>
);

export const PieChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartFallback height={props.height} />}>
    <LazyPieChart {...props} />
  </Suspense>
);

export const Pie: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyPie {...props} />
  </Suspense>
);

export const BarChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartFallback height={props.height} />}>
    <LazyBarChart {...props} />
  </Suspense>
);

export const Bar: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyBar {...props} />
  </Suspense>
);

export const XAxis: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyXAxis {...props} />
  </Suspense>
);

export const YAxis: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyYAxis {...props} />
  </Suspense>
);

export const CartesianGrid: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyCartesianGrid {...props} />
  </Suspense>
);

export const Tooltip: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyTooltip {...props} />
  </Suspense>
);

export const ResponsiveContainer: React.FC<any> = (props) => (
  <Suspense fallback={<ChartFallback height={props.height} />}>
    <LazyResponsiveContainer {...props} />
  </Suspense>
);

export const Cell: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyCell {...props} />
  </Suspense>
);
