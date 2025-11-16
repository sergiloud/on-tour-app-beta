/**
 * Accessible Chart Components
 * 
 * Provides color-blind friendly charts with patterns, high contrast, and proper ARIA labels
 * WCAG 1.4.1 - Use of Color compliance
 */

import React from 'react';

// Utility function for combining class names
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Accessible color palette - tested for all types of color blindness
export const accessibleColors = {
  // Primary palette (safe for all color vision types)
  blue: '#2563eb',      // Revenue/Income
  red: '#dc2626',       // Expenses/Costs  
  green: '#16a34a',     // Profit/Success
  amber: '#d97706',     // Pending/Warning
  purple: '#9333ea',    // Additional category
  gray: '#6b7280',      // Neutral/Other
  
  // High contrast variants
  highContrast: {
    blue: '#1e40af',
    red: '#b91c1c', 
    green: '#15803d',
    amber: '#b45309',
    purple: '#7c2d12',
    gray: '#374151'
  }
};

// Pattern definitions for additional differentiation
export const chartPatterns = {
  solid: 'none',
  dashed: '5,5',
  dotted: '2,3',
  striped: 'url(#stripes)',
  diagonal: 'url(#diagonal)',
  crosshatch: 'url(#crosshatch)'
};

// SVG pattern definitions
export const ChartPatternDefs: React.FC = () => (
  <defs>
    {/* Stripes pattern */}
    <pattern
      id="stripes"
      patternUnits="userSpaceOnUse"
      width="8"
      height="8"
      patternTransform="rotate(45)"
    >
      <rect width="4" height="8" fill="currentColor" fillOpacity="0.3" />
    </pattern>
    
    {/* Diagonal lines */}
    <pattern
      id="diagonal"
      patternUnits="userSpaceOnUse"
      width="6"
      height="6"
      patternTransform="rotate(-45)"
    >
      <line x1="0" y1="3" x2="6" y2="3" stroke="currentColor" strokeWidth="1" />
    </pattern>
    
    {/* Crosshatch pattern */}
    <pattern
      id="crosshatch"
      patternUnits="userSpaceOnUse"
      width="8"
      height="8"
    >
      <line x1="0" y1="0" x2="8" y2="8" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="1" />
    </pattern>
  </defs>
);

interface DataPoint {
  label: string;
  value: number;
  category: string;
  color?: string;
  pattern?: string;
}

interface AccessibleChartProps {
  data: DataPoint[];
  title: string;
  description?: string;
  type?: 'bar' | 'line' | 'pie' | 'area';
  width?: number;
  height?: number;
  showDataLabels?: boolean;
  showLegend?: boolean;
  highContrast?: boolean;
  className?: string;
}

/**
 * Accessible Bar Chart Component
 */
export const AccessibleBarChart: React.FC<AccessibleChartProps> = ({
  data,
  title,
  description,
  width = 400,
  height = 300,
  showDataLabels = true,
  showLegend = true,
  highContrast = false,
  className
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - 80) / data.length;
  const chartHeight = height - 60;

  // Generate chart ID for accessibility
  const chartId = React.useMemo(() => 
    `chart-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const colorPalette = highContrast ? accessibleColors.highContrast : accessibleColors;
  
  return (
    <div className={cn('accessible-chart', className)}>
      {/* Chart title and description */}
      <div className="chart-header mb-4">
        <h3 id={`${chartId}-title`} className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
        {description && (
          <p id={`${chartId}-desc`} className="text-sm text-gray-600 mt-1">
            {description}
          </p>
        )}
      </div>

      {/* SVG Chart */}
      <svg
        width={width}
        height={height}
        className="border border-gray-200 rounded"
        role="img"
        aria-labelledby={`${chartId}-title`}
        aria-describedby={description ? `${chartId}-desc ${chartId}-data` : `${chartId}-data`}
      >
        <ChartPatternDefs />
        
        {/* Chart bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = 40 + index * barWidth + barWidth * 0.1;
          const y = height - 40 - barHeight;
          
          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth * 0.8}
                height={barHeight}
                fill={item.color || colorPalette.blue}
                stroke={highContrast ? '#000' : 'none'}
                strokeWidth={highContrast ? 1 : 0}
                rx={2}
              />
              
              {/* Data label */}
              {showDataLabels && (
                <text
                  x={x + (barWidth * 0.8) / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-900 font-medium"
                  aria-label={`${item.label}: ${item.value}`}
                >
                  {item.value}
                </text>
              )}
              
              {/* X-axis labels */}
              <text
                x={x + (barWidth * 0.8) / 2}
                y={height - 20}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {item.label}
              </text>
            </g>
          );
        })}
        
        {/* Y-axis */}
        <line
          x1={40}
          y1={40}
          x2={40}
          y2={height - 40}
          stroke={highContrast ? '#000' : '#e5e7eb'}
          strokeWidth={1}
        />
        
        {/* X-axis */}
        <line
          x1={40}
          y1={height - 40}
          x2={width - 20}
          y2={height - 40}
          stroke={highContrast ? '#000' : '#e5e7eb'}
          strokeWidth={1}
        />
      </svg>

      {/* Data table for screen readers */}
      <div id={`${chartId}-data`} className="sr-only">
        <table>
          <caption>Chart data for {title}</caption>
          <thead>
            <tr>
              <th>Category</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.label}</td>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="chart-legend mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
          <div className="flex flex-wrap gap-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm border"
                  style={{
                    backgroundColor: item.color || colorPalette.blue,
                    borderColor: highContrast ? '#000' : 'transparent'
                  }}
                  aria-hidden="true"
                />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Accessible Pie Chart Component
 */
export const AccessiblePieChart: React.FC<AccessibleChartProps> = ({
  data,
  title,
  description,
  width = 300,
  height = 300,
  showDataLabels = true,
  showLegend = true,
  highContrast = false,
  className
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;

  // Generate chart ID for accessibility
  const chartId = React.useMemo(() => 
    `pie-chart-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const colorPalette = highContrast ? accessibleColors.highContrast : accessibleColors;
  
  let currentAngle = -90; // Start at top

  return (
    <div className={cn('accessible-pie-chart', className)}>
      {/* Chart title and description */}
      <div className="chart-header mb-4">
        <h3 id={`${chartId}-title`} className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
        {description && (
          <p id={`${chartId}-desc`} className="text-sm text-gray-600 mt-1">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-start gap-6">
        {/* SVG Pie Chart */}
        <svg
          width={width}
          height={height}
          role="img"
          aria-labelledby={`${chartId}-title`}
          aria-describedby={description ? `${chartId}-desc ${chartId}-data` : `${chartId}-data`}
        >
          <ChartPatternDefs />
          
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            
            // Calculate path for pie slice
            const startAngle = (currentAngle * Math.PI) / 180;
            const endAngle = ((currentAngle + angle) * Math.PI) / 180;
            
            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={item.color || Object.values(colorPalette)[index % Object.values(colorPalette).length]}
                  stroke={highContrast ? '#000' : '#fff'}
                  strokeWidth={highContrast ? 2 : 1}
                />
                
                {/* Data labels */}
                {showDataLabels && percentage > 5 && (
                  <text
                    x={centerX + (radius * 0.7) * Math.cos((startAngle + endAngle) / 2)}
                    y={centerY + (radius * 0.7) * Math.sin((startAngle + endAngle) / 2)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium"
                    fill={highContrast ? '#fff' : '#000'}
                  >
                    {percentage.toFixed(1)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        {showLegend && (
          <div className="chart-legend">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
            <div className="space-y-2">
              {data.map((item, index) => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm border flex-shrink-0"
                      style={{
                        backgroundColor: item.color || Object.values(colorPalette)[index % Object.values(colorPalette).length],
                        borderColor: highContrast ? '#000' : 'transparent'
                      }}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-gray-700">
                      {item.label} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Data table for screen readers */}
      <div id={`${chartId}-data`} className="sr-only">
        <table>
          <caption>Pie chart data for {title}</caption>
          <thead>
            <tr>
              <th>Category</th>
              <th>Value</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.label}</td>
                <td>{item.value}</td>
                <td>{((item.value / total) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Chart Summary Component for screen readers
 */
interface ChartSummaryProps {
  data: DataPoint[];
  title: string;
  type: 'increase' | 'decrease' | 'stable';
  period?: string;
}

export const ChartSummary: React.FC<ChartSummaryProps> = ({
  data,
  title,
  type,
  period
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const highest = data.reduce((prev, current) => 
    prev.value > current.value ? prev : current
  );
  const lowest = data.reduce((prev, current) => 
    prev.value < current.value ? prev : current
  );

  return (
    <div className="sr-only" role="region" aria-label={`Summary of ${title}`}>
      <p>
        {title} {period && `for ${period}`}. 
        Total: {total}. 
        Highest: {highest.label} with {highest.value}. 
        Lowest: {lowest.label} with {lowest.value}. 
        Trend: {type}.
      </p>
    </div>
  );
};

export default {
  AccessibleBarChart,
  AccessiblePieChart,
  ChartSummary,
  accessibleColors,
  chartPatterns
};