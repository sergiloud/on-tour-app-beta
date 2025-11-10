/**
 * Utilidades para testing y verificación de cálculos de fechas
 * Este archivo puede ser removido en producción
 */

export const testPeriodFiltering = () => {
  console.group('🧪 Testing Period Filtering');
  
  // Test 1: Comparación de strings de fechas
  const testDates = [
    '2024-01-15',
    '2024-06-20',
    '2024-12-31',
    '2025-01-01',
    '2025-11-08', // Hoy
  ];
  
  const period = {
    start: '2024-06-01',
    end: '2025-11-30'
  };
  
  console.log(`Periodo: ${period.start} a ${period.end}`);
  testDates.forEach(date => {
    const inPeriod = date >= period.start && date <= period.end;
    console.log(`${date}: ${inPeriod ? '✅' : '❌'}`);
  });
  
  // Test 2: Fechas con timestamp
  const timestampDates = [
    '2024-06-15T10:30:00.000Z',
    '2025-11-08T14:45:00.000Z',
    '2026-01-01T00:00:00.000Z'
  ];
  
  console.log('\nFechas con timestamp:');
  timestampDates.forEach(date => {
    const dateOnly = date.split('T')[0];
    const inPeriod = dateOnly >= period.start && dateOnly <= period.end;
    console.log(`${date} → ${dateOnly}: ${inPeriod ? '✅' : '❌'}`);
  });
  
  console.groupEnd();
};

// Ejecutar test automáticamente en desarrollo
if (process.env.NODE_ENV === 'development') {
  // testPeriodFiltering();
}
