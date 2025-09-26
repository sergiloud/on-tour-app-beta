declare module '../components/finance-charts-professional.js' {
  import * as React from 'react';
  export interface WaterfallDatum { label:string; value:number; type?:string }
  export interface WaterfallChartProps { data?: WaterfallDatum[]; live?: boolean; currency?: string; height?: number; highlightAnomalies?: boolean }
  export const WaterfallChart: React.FC<WaterfallChartProps>;
  export const ProfitabilityHeatmap: React.FC<any>;
  export interface CashFlowTrendChartProps { height?: number; currency?: string; live?: boolean; monthsBack?: number; }
  export const CashFlowTrendChart: React.FC<CashFlowTrendChartProps>;
  export interface RevenueBreakdownChartProps { height?: number; currency?: string; live?: boolean; }
  export const RevenueBreakdownChart: React.FC<RevenueBreakdownChartProps>;
  export interface CategoryDonutChartProps { data?: Array<{ name: string; amount: number; percentage?: number }>; live?: boolean; currency?: string; height?: number; }
  export const CategoryDonutChart: React.FC<CategoryDonutChartProps>;
  export const FinanceDataProvider: React.FC<any>;
  export function useFinanceData(opts?: any): any;
  export const chartTheme: any;
}

declare module '*finance-charts-professional.js' {
  import * as React from 'react';
  export interface WaterfallDatum { label:string; value:number; type?:string }
  export interface WaterfallChartProps { data?: WaterfallDatum[]; live?: boolean; currency?: string; height?: number; highlightAnomalies?: boolean }
  export const WaterfallChart: React.FC<WaterfallChartProps>;
  export const ProfitabilityHeatmap: React.FC<any>;
  export interface CashFlowTrendChartProps { height?: number; currency?: string; live?: boolean; monthsBack?: number; }
  export const CashFlowTrendChart: React.FC<CashFlowTrendChartProps>;
  export interface RevenueBreakdownChartProps { height?: number; currency?: string; live?: boolean; }
  export const RevenueBreakdownChart: React.FC<RevenueBreakdownChartProps>;
  export interface CategoryDonutChartProps { data?: Array<{ name: string; amount: number; percentage?: number }>; live?: boolean; currency?: string; height?: number; }
  export const CategoryDonutChart: React.FC<CategoryDonutChartProps>;
  export const FinanceDataProvider: React.FC<any>;
  export function useFinanceData(opts?: any): any;
  export const chartTheme: any;
}
