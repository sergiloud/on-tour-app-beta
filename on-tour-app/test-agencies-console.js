// SCRIPT DE PRUEBA - Ejecutar en la consola del navegador después de hacer login como Danny Avila
// Copiar y pegar todo este código en la consola

// Función para forzar la carga de agencias
(function testAgencies() {
    console.log('=== INICIANDO TEST DE AGENCIAS ===\n');

    // 1. Limpiar localStorage para empezar de cero
    console.log('1. Limpiando localStorage...');
    const currentSettings = localStorage.getItem('settings-v1');
    console.log('Settings actuales:', currentSettings);

    // 2. Crear las agencias manualmente
    console.log('\n2. Creando agencias...');
    const bookingAgencies = [
        {
            id: 'booking-uta-americas',
            name: 'UTA',
            type: 'booking',
            commissionPct: 10,
            territoryMode: 'continents',
            continents: ['NA', 'SA'],
            notes: '10% of gross fee on Americas shows. Active Jan 1 - Jul 31, 2025'
        },
        {
            id: 'booking-shushi3000',
            name: 'Shushi 3000',
            type: 'booking',
            commissionPct: 15,
            territoryMode: 'worldwide',
            notes: '10% after UTA on Americas shows, 15% gross fee on all other regions. Active Jan 1 - Jul 31, 2025'
        }
    ];

    const managementAgencies = [
        {
            id: 'management-creative-primates',
            name: 'Creative Primates',
            type: 'management',
            commissionPct: 15,
            territoryMode: 'worldwide',
            notes: '15% of gross fee worldwide, after UTA on Americas. Active Jan 1 - Jul 31, 2025'
        }
    ];

    console.log('Booking agencies:', bookingAgencies);
    console.log('Management agencies:', managementAgencies);

    // 3. Guardar en localStorage
    console.log('\n3. Guardando en localStorage...');
    let settings = {};
    try {
        settings = JSON.parse(localStorage.getItem('settings-v1') || '{}');
    } catch (e) {
        console.error('Error parsing settings:', e);
    }

    settings.bookingAgencies = bookingAgencies;
    settings.managementAgencies = managementAgencies;

    localStorage.setItem('settings-v1', JSON.stringify(settings));
    console.log('Settings guardados:', settings);

    // 4. Verificar
    console.log('\n4. Verificando...');
    const savedSettings = JSON.parse(localStorage.getItem('settings-v1') || '{}');
    console.log('Booking agencies guardadas:', savedSettings.bookingAgencies?.length || 0);
    console.log('Management agencies guardadas:', savedSettings.managementAgencies?.length || 0);

    console.log('\n=== TEST COMPLETADO ===');
    console.log('Ahora ve a Settings → Agency Settings para ver las agencias');
    console.log('O refresca la página para que se carguen en el contexto');

    return {
        booking: bookingAgencies.length,
        management: managementAgencies.length,
        success: true
    };
})();
