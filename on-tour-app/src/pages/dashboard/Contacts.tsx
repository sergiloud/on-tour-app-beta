/**
 * Contacts - CRM avanzado con filtros geográficos y análisis completo
 * - Categorías por pestañas (Labels, Promoters, etc.)
 * - Filtros geográficos: País, Región, Ciudad
 * - Vista de mapa para promoters
 * - Exportación por categoría
 * - Tags y búsqueda avanzada
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus, Search, Download, Upload, X, Building2, Users,
  Mail, Phone, MapPin, Tag as TagIcon, Loader2, SlidersHorizontal,
  Eye, Edit2, Trash2, Music, Calendar, Globe, Star, TrendingUp,
  Filter, Map as MapIcon, FileText, Share2, BarChart3, Copy, ExternalLink,
  Clock, MessageSquare, Link as LinkIcon, Send, CheckCircle2, Circle
} from 'lucide-react';
import {
  useContactsQuery, useContactStatsQuery, useDeleteContactMutation,
  useCreateContactMutation, useUpdateContactMutation
} from '../../hooks/useContactsQuery';
import { useContactFilters } from '../../hooks/useContactFilters';
import { useShows } from '../../hooks/useShows';
import type { Contact } from '../../types/crm';
import { CONTACT_TYPE_LABELS } from '../../types/crm';
import { ContactEditorModal } from '../../components/crm/ContactEditorModal';
import { contactStore } from '../../shared/contactStore';

type CategoryTab = 'all' | 'label_rep' | 'promoter' | 'agent' | 'manager' | 'venue_manager' | 'media' | 'other';

const CATEGORY_TABS: { id: CategoryTab; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Todos', icon: <Users className="w-4 h-4" /> },
  { id: 'label_rep', label: 'Labels & A&R', icon: <Music className="w-4 h-4" /> },
  { id: 'promoter', label: 'Promoters', icon: <Calendar className="w-4 h-4" /> },
  { id: 'agent', label: 'Agentes', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'manager', label: 'Managers', icon: <Star className="w-4 h-4" /> },
  { id: 'venue_manager', label: 'Venues', icon: <Building2 className="w-4 h-4" /> },
  { id: 'media', label: 'Media', icon: <Globe className="w-4 h-4" /> },
  { id: 'other', label: 'Otros', icon: <TagIcon className="w-4 h-4" /> },
];

export const Contacts: React.FC = () => {
  const { data: contacts = [], isLoading, isError, error } = useContactsQuery();
  const { data: stats } = useContactStatsQuery();
  const { shows } = useShows();
  const deleteContactMutation = useDeleteContactMutation();
  const createContactMutation = useCreateContactMutation();
  const updateContactMutation = useUpdateContactMutation();

  const [showEditor, setShowEditor] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [showMapView, setShowMapView] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'history'>('info');
  const [newNote, setNewNote] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    filters, setFilters, sortBy, setSortBy, sortedContacts, resetFilters
  } = useContactFilters(contacts);

  // ✨ Sincronización automática inteligente: venues y promoters de shows → contactos CRM
  useEffect(() => {
    if (!shows || shows.length === 0 || !createContactMutation) return;

    const syncShowDataToContacts = async () => {
      // Map de contactos existentes para evitar duplicados
      const existingVenues = new Set(
        contacts
          .filter(c => c.type === 'venue_manager')
          .map(c => `${c.company?.toLowerCase()}_${c.city?.toLowerCase()}_${c.country}`)
      );

      const existingPromoters = new Set(
        contacts
          .filter(c => c.type === 'promoter')
          .map(c => `${c.firstName?.toLowerCase()}_${c.lastName?.toLowerCase()}_${c.company?.toLowerCase()}`)
      );

      const uniqueVenues = new Map<string, { venue: string; city: string; country: string; lat: number; lng: number }>();
      const uniquePromoters = new Map<string, { name: string; company?: string; city: string; country: string }>();

      // Procesar shows y extraer venues y promoters
      shows.forEach((show: any) => {
        // Sincronizar Venues
        if (show.venue && show.venue !== 'TBA' && show.city && show.country) {
          const venueKey = `${show.venue.toLowerCase()}_${show.city.toLowerCase()}_${show.country}`;
          if (!existingVenues.has(venueKey) && !uniqueVenues.has(venueKey)) {
            uniqueVenues.set(venueKey, {
              venue: show.venue,
              city: show.city,
              country: show.country,
              lat: show.lat || 0,
              lng: show.lng || 0
            });
          }
        }

        // Sincronizar Promoters
        if (show.promoter && show.promoter.trim() && show.city && show.country) {
          const nameParts = show.promoter.trim().split(' ');
          const firstName = nameParts[0] || show.promoter;
          const lastName = nameParts.slice(1).join(' ') || '';
          const promoterKey = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${show.promoter.toLowerCase()}`;

          if (!existingPromoters.has(promoterKey) && !uniquePromoters.has(promoterKey)) {
            uniquePromoters.set(promoterKey, {
              name: show.promoter,
              company: show.name || undefined,
              city: show.city,
              country: show.country
            });
          }
        }
      });

      let syncedCount = 0;

      // Crear contactos para nuevos venues
      for (const [_, venueData] of uniqueVenues) {
        try {
          const newContact: Partial<Contact> = {
            firstName: venueData.venue,
            lastName: '',
            company: venueData.venue,
            type: 'venue_manager',
            city: venueData.city,
            country: venueData.country,
            priority: 'medium',
            status: 'pending',
            tags: ['auto-sync', 'venue', 'shows-integration'],
            notes: [{
              id: `note_${Date.now()}_${Math.random()}`,
              content: `🎪 Venue auto-sincronizado desde shows el ${new Date().toLocaleDateString('es-ES')}`,
              createdAt: new Date().toISOString()
            }],
            interactions: []
          };

          await createContactMutation.mutateAsync(newContact as Contact);
          syncedCount++;
          console.log(`✅ Venue: ${venueData.venue} (${venueData.city})`);
        } catch (err) {
          console.error(`❌ Error venue ${venueData.venue}:`, err);
        }
      }

      // Crear contactos para nuevos promoters
      for (const [_, promoterData] of uniquePromoters) {
        try {
          const nameParts = promoterData.name.trim().split(' ');
          const newContact: Partial<Contact> = {
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
            company: promoterData.company,
            type: 'promoter',
            city: promoterData.city,
            country: promoterData.country,
            priority: 'high',
            status: 'active',
            tags: ['auto-sync', 'promoter', 'shows-integration'],
            notes: [{
              id: `note_${Date.now()}_${Math.random()}`,
              content: `🎤 Promoter auto-sincronizado desde shows el ${new Date().toLocaleDateString('es-ES')}`,
              createdAt: new Date().toISOString()
            }],
            interactions: []
          };

          await createContactMutation.mutateAsync(newContact as Contact);
          syncedCount++;
          console.log(`✅ Promoter: ${promoterData.name}`);
        } catch (err) {
          console.error(`❌ Error promoter ${promoterData.name}:`, err);
        }
      }

      if (syncedCount > 0) {
        console.log(`🔄 Sincronización completa: ${uniqueVenues.size} venues + ${uniquePromoters.size} promoters = ${syncedCount} nuevos contactos`);
      }
    };

    // Ejecutar sincronización con delay para evitar saturar la API
    const timeoutId = setTimeout(syncShowDataToContacts, 2000);
    return () => clearTimeout(timeoutId);
  }, [shows, contacts, createContactMutation]);

  // Filtrar por categoría + ubicación
  const categoryFilteredContacts = useMemo(() => {
    let filtered = sortedContacts;

    // Filtro por categoría
    if (activeCategory !== 'all') {
      filtered = filtered.filter(c => c.type === activeCategory);
    }

    // Filtro por país
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(c => c.country === selectedCountry);
    }

    // Filtro por ciudad
    if (selectedCity !== 'all') {
      filtered = filtered.filter(c => c.city === selectedCity);
    }

    return filtered;
  }, [sortedContacts, activeCategory, selectedCountry, selectedCity]);

  // Contadores por categoría
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: contacts.length };
    contacts.forEach(c => { counts[c.type] = (counts[c.type] || 0) + 1; });
    return counts;
  }, [contacts]);

  // Obtener países únicos con contadores
  const countriesWithCounts = useMemo(() => {
    const countryMap = new Map<string, number>();
    categoryFilteredContacts.forEach(c => {
      if (c.country) {
        countryMap.set(c.country, (countryMap.get(c.country) || 0) + 1);
      }
    });
    return Array.from(countryMap.entries())
      .sort((a, b) => b[1] - a[1]) // Ordenar por cantidad
      .map(([country, count]) => ({ country, count }));
  }, [categoryFilteredContacts]);

  // Obtener ciudades únicas del país seleccionado
  const citiesWithCounts = useMemo(() => {
    const cityMap = new Map<string, number>();
    let baseContacts = sortedContacts;

    if (activeCategory !== 'all') {
      baseContacts = baseContacts.filter(c => c.type === activeCategory);
    }
    if (selectedCountry !== 'all') {
      baseContacts = baseContacts.filter(c => c.country === selectedCountry);
    }

    baseContacts.forEach(c => {
      if (c.city) {
        cityMap.set(c.city, (cityMap.get(c.city) || 0) + 1);
      }
    });

    return Array.from(cityMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([city, count]) => ({ city, count }));
  }, [sortedContacts, activeCategory, selectedCountry]);

  // Obtener empresas únicas
  const companiesWithCounts = useMemo(() => {
    const companyMap = new Map<string, number>();
    categoryFilteredContacts.forEach(c => {
      if (c.company) {
        companyMap.set(c.company, (companyMap.get(c.company) || 0) + 1);
      }
    });
    return Array.from(companyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([company, count]) => ({ company, count }));
  }, [categoryFilteredContacts]);

  // Stats geográficas
  const geoStats = useMemo(() => {
    const stats = {
      totalCountries: new Set(categoryFilteredContacts.filter(c => c.country).map(c => c.country)).size,
      totalCities: new Set(categoryFilteredContacts.filter(c => c.city).map(c => c.city)).size,
      withLocation: categoryFilteredContacts.filter(c => c.city || c.country).length,
      withoutLocation: categoryFilteredContacts.filter(c => !c.city && !c.country).length,
    };
    return stats;
  }, [categoryFilteredContacts]);

  const handleCreateContact = () => { setEditingContact(undefined); setShowEditor(true); };
  const handleEditContact = (contact: Contact) => { setEditingContact(contact); setShowEditor(true); setSelectedContact(null); };
  const handleViewContact = (contact: Contact) => {
    setSelectedContact(selectedContact?.id === contact.id ? null : contact);
    setActiveTab('info'); // Reset to info tab when opening
    setNewNote(''); // Clear note input
  };

  const handleSaveContact = async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingContact) await updateContactMutation.mutateAsync({ id: editingContact.id, data: contactData });
      else await createContactMutation.mutateAsync(contactData);
      setShowEditor(false); setEditingContact(undefined);
    } catch (error) { console.error(error); alert('Error al guardar contacto'); }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('¿Eliminar contacto?')) {
      try {
        await deleteContactMutation.mutateAsync(id);
        if (selectedContact?.id === id) setSelectedContact(null);
      } catch (error) { console.error(error); alert('Error al eliminar'); }
    }
  };

  // Exportar contactos filtrados (solo los visibles)
  const handleExport = () => {
    const dataToExport = categoryFilteredContacts;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `contacts-${activeCategory !== 'all' ? activeCategory : 'all'}-${selectedCountry !== 'all' ? selectedCountry : 'all'}-${new Date().toISOString().split('T')[0]}.json`;
    a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // Exportar como CSV
  const handleExportCSV = () => {
    const headers = ['Nombre', 'Apellido', 'Empresa', 'Cargo', 'Email', 'Teléfono', 'País', 'Ciudad', 'Tipo', 'Prioridad', 'Estado'];
    const rows = categoryFilteredContacts.map(c => [
      c.firstName, c.lastName, c.company || '', c.position || '',
      c.email || '', c.phone || '', c.country || '', c.city || '',
      CONTACT_TYPE_LABELS[c.type], c.priority, c.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${activeCategory}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        contactStore.import(JSON.parse(text));
        alert('Importado correctamente');
      } catch (error) { console.error(error); alert('Error al importar'); }
    };
    input.click();
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="glass rounded-xl p-8 border border-theme">
        <Loader2 className="w-8 h-8 text-accent-400 animate-spin mx-auto mb-4" />
        <p className="text-theme-secondary">Cargando contactos...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="h-full flex items-center justify-center">
      <div className="glass rounded-xl p-8 border border-red-500/20">
        <div className="text-2xl mb-4">⚠️</div>
        <p className="text-slate-900 dark:text-white font-medium">Error al cargar contactos</p>
        <p className="text-sm text-theme-secondary">{error?.message || 'Error desconocido'}</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header mejorado */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-theme">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-theme-primary">Contactos CRM</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300 dark:text-white/50">{categoryFilteredContacts.length} de {contacts.length}</span>
            {(selectedCountry !== 'all' || selectedCity !== 'all') && (
              <span className="text-xs px-2.5 py-1 bg-accent-500/10 border border-accent-500/30 rounded-md text-accent-400 font-medium">
                Filtrado
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-3 py-2 border rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
              showStats ? 'bg-accent-500 text-black border-accent-500 shadow-lg shadow-accent-500/25' : 'bg-interactive border-slate-200 dark:border-white/10 text-theme-secondary hover:text-white hover:bg-interactive-hover hover:border-theme-strong'
            }`}>
            <BarChart3 className="w-4 h-4" /> Stats
          </button>
          <button onClick={handleExportCSV} className="px-3 py-2 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-theme-secondary hover:text-white hover:bg-interactive-hover hover:border-theme-strong transition-all duration-200 flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" /> CSV
          </button>
          <button onClick={handleExport} className="px-3 py-2 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-theme-secondary hover:text-white hover:bg-interactive-hover hover:border-theme-strong transition-all duration-200 flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> JSON
          </button>
          <button onClick={handleImport} className="px-3 py-2 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-theme-secondary hover:text-white hover:bg-interactive-hover hover:border-theme-strong transition-all duration-200 flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={handleCreateContact} className="px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg text-white hover:from-accent-600 hover:to-accent-700 font-medium flex items-center gap-2 shadow-lg shadow-accent-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-accent-500/30 hover:scale-[1.02]">
            <Plus className="w-4 h-4" /> Nuevo Contacto
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="px-6 py-5 bg-gradient-to-r from-accent-500/10 to-purple-500/10 border-b border-slate-200 dark:border-white/10 animate-fadeIn">
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-interactive rounded-lg p-4 border border-slate-200 dark:border-white/10 hover:bg-interactive-hover hover:border-theme-strong transition-all duration-200">
              <div className="text-xs text-slate-300 dark:text-white/50 mb-2 font-medium uppercase tracking-wide">Total Contactos</div>
              <div className="text-2xl font-bold text-theme-primary">{categoryFilteredContacts.length}</div>
            </div>
            <div className="bg-interactive rounded-lg p-4 border border-slate-200 dark:border-white/10 hover:bg-interactive-hover hover:border-theme-strong transition-all duration-200">
              <div className="text-xs text-slate-300 dark:text-white/50 mb-2 font-medium uppercase tracking-wide">Países</div>
              <div className="text-2xl font-bold text-accent-400">{geoStats.totalCountries}</div>
            </div>
            <div className="bg-interactive rounded-lg p-4 border border-slate-200 dark:border-white/10 hover:bg-interactive-hover hover:border-theme-strong transition-all duration-200">
              <div className="text-xs text-slate-300 dark:text-white/50 mb-2 font-medium uppercase tracking-wide">Ciudades</div>
              <div className="text-2xl font-bold text-purple-400">{geoStats.totalCities}</div>
            </div>
            <div className="bg-interactive rounded-lg p-4 border border-slate-200 dark:border-white/10 hover:bg-interactive-hover hover:border-theme-strong transition-all duration-200">
              <div className="text-xs text-slate-300 dark:text-white/50 mb-2 font-medium uppercase tracking-wide">Con Ubicación</div>
              <div className="text-2xl font-bold text-green-400">{geoStats.withLocation}</div>
            </div>
            <div className="bg-interactive rounded-lg p-4 border border-slate-200 dark:border-white/10 hover:bg-interactive-hover hover:border-theme-strong transition-all duration-200">
              <div className="text-xs text-slate-300 dark:text-white/50 mb-2 font-medium uppercase tracking-wide">Sin Ubicación</div>
              <div className="text-2xl font-bold text-red-400">{geoStats.withoutLocation}</div>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200 dark:border-white/10 overflow-x-auto">
        {CATEGORY_TABS.map((tab) => {
          const count = categoryCounts[tab.id] || 0;
          const isActive = activeCategory === tab.id;
          return (
            <button key={tab.id} onClick={() => { setActiveCategory(tab.id); setSelectedCountry('all'); setSelectedCity('all'); }}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                isActive ? 'bg-accent-500 text-black shadow-lg shadow-accent-500/25 scale-[1.02]' : 'text-theme-secondary hover:text-white hover:bg-interactive-hover hover:scale-[1.02]'
              }`}>
              {tab.icon} <span>{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isActive ? 'bg-black/20 text-black' : 'bg-white/10'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar con filtros geográficos */}
      <div className="px-6 py-4 bg-interactive border-b border-slate-200 dark:border-white/10 space-y-3">
        {/* Primera fila: Búsqueda y filtros básicos */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-white/40" />
            <input ref={searchInputRef} type="text" placeholder="Buscar por nombre, empresa, email... (⌘K)" value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-white placeholder:text-theme-muted focus:outline-none focus:border-accent-500/50 focus:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-sm transition-all duration-200" />
          </div>

          <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
            className="px-3 py-2.5 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500/50 focus:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-interactive-hover transition-all duration-200 cursor-pointer">
            <option value="all">Prioridad</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            className="px-3 py-2.5 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500/50 focus:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-interactive-hover transition-all duration-200 cursor-pointer">
            <option value="all">Estado</option>
            <option value="active">Activo</option>
            <option value="pending">Pendiente</option>
            <option value="inactive">Inactivo</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2.5 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500/50 focus:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-interactive-hover transition-all duration-200 cursor-pointer">
            <option value="name">Ordenar: Nombre</option>
            <option value="company">Ordenar: Empresa</option>
            <option value="recent">Ordenar: Más reciente</option>
            <option value="priority">Ordenar: Prioridad</option>
          </select>
        </div>

        {/* Segunda fila: Filtros geográficos */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-theme-secondary">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Ubicación:</span>
          </div>

          {/* Filtro por País */}
          <select
            value={selectedCountry}
            onChange={(e) => { setSelectedCountry(e.target.value); setSelectedCity('all'); }}
            className="px-3 py-2.5 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500/50 focus:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-interactive-hover min-w-[160px] transition-all duration-200 cursor-pointer">
            <option value="all">Todos los países</option>
            {countriesWithCounts.map(({ country, count }) => (
              <option key={country} value={country}>
                {country} ({count})
              </option>
            ))}
          </select>

          {/* Filtro por Ciudad (solo si hay país seleccionado) */}
          {selectedCountry !== 'all' && citiesWithCounts.length > 0 && (
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2.5 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500/50 focus:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-interactive-hover min-w-[160px] transition-all duration-200 cursor-pointer animate-fadeIn">
              <option value="all">Todas las ciudades</option>
              {citiesWithCounts.map(({ city, count }) => (
                <option key={city} value={city}>
                  {city} ({count})
                </option>
              ))}
            </select>
          )}

          {/* Filtro por Empresa (top companies) */}
          {companiesWithCounts.length > 0 && (
            <select
              className="px-3 py-2.5 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500/50 focus:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-interactive-hover min-w-[200px] transition-all duration-200 cursor-pointer">
              <option value="all">Todas las empresas</option>
              {companiesWithCounts.map(({ company, count }) => (
                <option key={company} value={company}>
                  {company} ({count})
                </option>
              ))}
            </select>
          )}

          <div className="flex-1"></div>

          {/* Botón limpiar filtros */}
          {(filters.search || filters.priority !== 'all' || filters.status !== 'all' || selectedCountry !== 'all' || selectedCity !== 'all') && (
            <button onClick={() => {
              resetFilters();
              setSelectedCountry('all');
              setSelectedCity('all');
            }} className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 flex items-center gap-2 text-sm">
              <X className="w-4 h-4" /> Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden flex relative">
        <div className={`flex-1 overflow-auto transition-all duration-300 ${selectedContact ? 'mr-96' : 'pr-6'}`}>
          {categoryFilteredContacts.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{contacts.length === 0 ? 'No hay contactos' : 'Sin resultados'}</h3>
                <p className="text-theme-secondary mb-6">{contacts.length === 0 ? 'Crea tu primer contacto' : 'Ajusta los filtros'}</p>
                {contacts.length === 0 && (
                  <button onClick={handleCreateContact} className="px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl text-white hover:from-accent-600 hover:to-accent-700 font-medium inline-flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Crear Contacto
                  </button>
                )}
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-surface-card/95 backdrop-blur-sm border-b border-slate-200 dark:border-white/10 z-10">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 dark:text-white/50 uppercase tracking-wider">Contacto</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 dark:text-white/50 uppercase tracking-wider">Empresa / Cargo</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 dark:text-white/50 uppercase tracking-wider">Info</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 dark:text-white/50 uppercase tracking-wider">Ubicación</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 dark:text-white/50 uppercase tracking-wider">Prioridad</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-300 dark:text-white/50 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {categoryFilteredContacts.map((contact) => (
                  <tr key={contact.id} onClick={() => handleViewContact(contact)}
                    className={`hover:bg-interactive-hover cursor-pointer transition-all duration-150 ${selectedContact?.id === contact.id ? 'bg-accent-500/10 border-l-2 border-accent-500' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-accent-500/20">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{contact.firstName} {contact.lastName}</p>
                            {contact.priority === 'high' && <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-lg shadow-red-400/50" />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 dark:text-white text-sm font-medium">{contact.company || '—'}</p>
                      <p className="text-slate-300 dark:text-white/50 text-xs mt-0.5">{contact.position || 'Sin cargo'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-theme-secondary">
                      {contact.email && <div className="flex items-center gap-2 mb-1"><Mail className="w-3.5 h-3.5 text-slate-300 dark:text-white/40" /><span className="text-theme-secondary">{contact.email}</span></div>}
                      {contact.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-300 dark:text-white/40" /><span className="text-theme-secondary">{contact.phone}</span></div>}
                    </td>
                    <td className="px-6 py-4">
                      {contact.city || contact.country ? (
                        <div className="flex items-center gap-2 text-sm text-theme-secondary">
                          <MapPin className="w-3.5 h-3.5 text-slate-300 dark:text-white/40" />
                          <span>{contact.city ? `${contact.city}, ` : ''}{contact.country}</span>
                        </div>
                      ) : <span className="text-slate-400 dark:text-white/40 text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        contact.priority === 'high' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                        contact.priority === 'medium' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' :
                        'bg-green-500/15 text-green-400 border border-green-500/30'
                      }`}>{contact.priority === 'high' ? 'Alta' : contact.priority === 'medium' ? 'Media' : 'Baja'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleViewContact(contact); }}
                          className="p-2 rounded-lg hover:bg-accent-500/20 text-theme-secondary hover:text-accent-400 transition-all duration-150" title="Ver">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEditContact(contact); }}
                          className="p-2 rounded-lg hover:bg-blue-500/20 text-theme-secondary hover:text-blue-400 transition-all duration-150" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-theme-secondary hover:text-red-400 transition-all duration-150" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Side Panel - Contact Preview Completo - FIXED POSITION */}
        {selectedContact && (
          <div className="fixed right-0 top-0 bottom-0 w-96 border-l border-slate-200 dark:border-white/10 bg-dark-800/95 backdrop-blur-md overflow-auto flex-shrink-0 animate-slideInRight shadow-2xl z-40">
            <div className="flex flex-col h-full">
              {/* Header con Avatar Grande */}
              <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-gradient-to-br from-accent-500/10 to-accent-600/5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-accent-500/30 flex-shrink-0">
                      {selectedContact.firstName[0]}{selectedContact.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {selectedContact.firstName} {selectedContact.lastName}
                      </h2>
                      <p className="text-sm text-theme-secondary mb-3">{selectedContact.position || 'Sin cargo'}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          selectedContact.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                          selectedContact.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                          'bg-green-500/20 text-green-400 border border-green-500/40'
                        }`}>
                          {selectedContact.priority === 'high' ? 'Alta' : selectedContact.priority === 'medium' ? 'Media' : 'Baja'}
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-accent-500/20 text-accent-400 border border-accent-500/40">
                          {CONTACT_TYPE_LABELS[selectedContact.type]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="p-2 rounded-lg hover:bg-interactive-hover text-theme-secondary hover:text-white transition-all duration-150"
                    title="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-2">
                  {selectedContact.email && (
                    <a
                      href={`mailto:${selectedContact.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-interactive hover:bg-interactive-hover border border-slate-200 dark:border-white/10 hover:border-accent-500/40 transition-all duration-150 group"
                      title="Enviar email"
                    >
                      <Mail className="w-4 h-4 text-theme-secondary group-hover:text-accent-400 transition-colors" />
                      <span className="text-[10px] text-slate-300 dark:text-white/50 group-hover:text-white font-medium">Email</span>
                    </a>
                  )}
                  {selectedContact.phone && (
                    <a
                      href={`tel:${selectedContact.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-interactive hover:bg-interactive-hover border border-slate-200 dark:border-white/10 hover:border-green-500/40 transition-all duration-150 group"
                      title="Llamar"
                    >
                      <Phone className="w-4 h-4 text-theme-secondary group-hover:text-green-400 transition-colors" />
                      <span className="text-[10px] text-slate-300 dark:text-white/50 group-hover:text-white font-medium">Llamar</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${selectedContact.firstName} ${selectedContact.lastName}\n${selectedContact.email || ''}\n${selectedContact.phone || ''}`);
                      alert('Contacto copiado al portapapeles');
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-interactive hover:bg-interactive-hover border border-slate-200 dark:border-white/10 hover:border-blue-500/40 transition-all duration-150 group"
                    title="Copiar info"
                  >
                    <Copy className="w-4 h-4 text-theme-secondary group-hover:text-blue-400 transition-colors" />
                    <span className="text-[10px] text-slate-300 dark:text-white/50 group-hover:text-white font-medium">Copiar</span>
                  </button>
                  <button
                    onClick={() => {
                      const shareData = {
                        title: `${selectedContact.firstName} ${selectedContact.lastName}`,
                        text: `${selectedContact.company || ''} - ${selectedContact.position || ''}`,
                      };
                      if (navigator.share) navigator.share(shareData);
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-interactive hover:bg-interactive-hover border border-slate-200 dark:border-white/10 hover:border-purple-500/40 transition-all duration-150 group"
                    title="Compartir"
                  >
                    <Share2 className="w-4 h-4 text-theme-secondary group-hover:text-purple-400 transition-colors" />
                    <span className="text-[10px] text-slate-300 dark:text-white/50 group-hover:text-white font-medium">Compartir</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-white/10 bg-interactive">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
                    activeTab === 'info'
                      ? 'border-accent-500 text-black bg-accent-500/90'
                      : 'border-transparent text-theme-secondary hover:text-white hover:bg-interactive-hover'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Info</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
                    activeTab === 'notes'
                      ? 'border-accent-500 text-black bg-accent-500/90'
                      : 'border-transparent text-theme-secondary hover:text-white hover:bg-interactive-hover'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Notas</span>
                    {selectedContact.notes && selectedContact.notes.length > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        activeTab === 'notes' ? 'bg-black/20 text-black' : 'bg-accent-500/30 text-accent-400'
                      }`}>
                        {selectedContact.notes.length}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
                    activeTab === 'history'
                      ? 'border-accent-500 text-black bg-accent-500/90'
                      : 'border-transparent text-theme-secondary hover:text-white hover:bg-interactive-hover'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Historial</span>
                    {selectedContact.interactions && selectedContact.interactions.length > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        activeTab === 'history' ? 'bg-black/20 text-black' : 'bg-accent-500/30 text-accent-400'
                      }`}>
                        {selectedContact.interactions.length}
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-auto p-6">
                {/* Tab: Información */}
                {activeTab === 'info' && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Contact Info */}
                    <div className="space-y-4">
                      <h3 className="text-xs uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold mb-4">Información de Contacto</h3>

                      {selectedContact.company && (
                        <div className="flex items-start gap-3 group">
                          <div className="w-9 h-9 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-500/20 transition-all duration-150">
                            <Building2 className="w-4 h-4 text-accent-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-300 dark:text-white/50 mb-1 font-medium">Empresa</div>
                            <div className="text-sm text-white font-medium">{selectedContact.company}</div>
                          </div>
                        </div>
                      )}

                      {selectedContact.email && (
                        <div className="flex items-start gap-3 group">
                          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-all duration-150">
                            <Mail className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-300 dark:text-white/50 mb-1 font-medium">Email</div>
                            <a
                              href={`mailto:${selectedContact.email}`}
                              className="text-sm text-accent-400 hover:text-accent-300 transition-all duration-150 break-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {selectedContact.email}
                            </a>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(selectedContact.email!);
                              alert('Email copiado');
                            }}
                            className="p-2 rounded-lg hover:bg-interactive-hover text-slate-400 dark:text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-150"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {selectedContact.phone && (
                        <div className="flex items-start gap-3 group">
                          <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-all duration-150">
                            <Phone className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-300 dark:text-white/50 mb-1 font-medium">Teléfono</div>
                            <a
                              href={`tel:${selectedContact.phone}`}
                              className="text-sm text-white hover:text-accent-400 transition-all duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {selectedContact.phone}
                            </a>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(selectedContact.phone!);
                              alert('Teléfono copiado');
                            }}
                            className="p-2 rounded-lg hover:bg-interactive-hover text-slate-400 dark:text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-150"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {(selectedContact.city || selectedContact.country) && (
                        <div className="flex items-start gap-3 group">
                          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-all duration-150">
                            <MapPin className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-300 dark:text-white/50 mb-1 font-medium">Ubicación</div>
                            <div className="text-sm text-theme-primary">
                              {selectedContact.city && <span className="font-medium">{selectedContact.city}</span>}
                              {selectedContact.city && selectedContact.country && <span className="text-slate-400 dark:text-white/40 mx-1">•</span>}
                              {selectedContact.country && <span>{selectedContact.country}</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {selectedContact.tags && selectedContact.tags.length > 0 && (
                      <div>
                        <h3 className="text-xs uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold mb-4">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedContact.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-3 py-1.5 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-600 dark:text-white/80 hover:bg-interactive-hover hover:border-accent-500/30 transition-all duration-150 cursor-default"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold mb-4">Estado</h3>
                      <div className="flex items-center gap-2">
                        {selectedContact.status === 'active' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-white/40" />
                        )}
                        <span className={`text-sm font-semibold ${
                          selectedContact.status === 'active' ? 'text-green-400' : 'text-theme-secondary'
                        }`}>
                          {selectedContact.status === 'active' ? 'Activo' :
                           selectedContact.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 border-t border-theme">
                      <div className="text-xs text-slate-300 dark:text-white/50 space-y-2 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 dark:text-slate-300 dark:text-white/40">Creado:</span>
                          <span>{selectedContact.createdAt ? new Date(selectedContact.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          }) : 'N/A'}</span>
                        </div>
                        {selectedContact.updatedAt && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 dark:text-slate-300 dark:text-white/40">Actualizado:</span>
                            <span>{new Date(selectedContact.updatedAt).toLocaleDateString('es-ES', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Notas */}
                {activeTab === 'notes' && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-xs uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Notas</h3>

                    {/* Add Note */}
                    <div className="space-y-3">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Escribe una nueva nota..."
                        className="w-full px-4 py-3 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-white placeholder-slate-400 dark:placeholder-white/30 text-sm focus:outline-none focus:border-accent-500/50 focus:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 resize-none transition-all duration-200"
                        rows={4}
                      />
                      <button
                        onClick={() => {
                          if (newNote.trim()) {
                            // Aquí agregarías la lógica para guardar la nota
                            alert('Nota guardada (funcionalidad por implementar)');
                            setNewNote('');
                          }
                        }}
                        disabled={!newNote.trim()}
                        className="w-full px-4 py-2.5 bg-accent-500 hover:bg-accent-600 disabled:bg-interactive disabled:text-slate-400 dark:text-white/40 disabled:cursor-not-allowed rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/30"
                      >
                        <Send className="w-4 h-4" />
                        Añadir Nota
                      </button>
                    </div>

                    {/* Notes List */}
                    <div className="space-y-3">
                      {selectedContact.notes && selectedContact.notes.length > 0 ? (
                        selectedContact.notes.map((note: any, index: number) => (
                          <div key={index} className="p-4 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg hover:bg-interactive-hover hover:border-theme-strong transition-all duration-150">
                            <div className="text-sm text-slate-700 dark:text-slate-700 dark:text-white/90 mb-2 leading-relaxed">{note.content || note}</div>
                            <div className="text-xs text-slate-300 dark:text-white/50 font-medium">
                              {note.createdAt ? new Date(note.createdAt).toLocaleString('es-ES') : 'Sin fecha'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-slate-400 dark:text-white/40 text-sm">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p className="font-medium">No hay notas aún</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Historial */}
                {activeTab === 'history' && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-xs uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Historial de Interacciones</h3>

                    {selectedContact.interactions && selectedContact.interactions.length > 0 ? (
                      <div className="space-y-3">
                        {selectedContact.interactions.map((interaction: any, index: number) => (
                          <div key={index} className="flex gap-3 p-4 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg hover:bg-interactive-hover hover:border-theme-strong transition-all duration-150 group">
                            <div className="w-9 h-9 rounded-lg bg-accent-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-500/30 transition-all duration-150">
                              <Clock className="w-4 h-4 text-accent-400" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-white font-semibold mb-1">
                                {interaction.type || 'Interacción'}
                              </div>
                              {interaction.notes && (
                                <div className="text-sm text-theme-secondary mb-2 leading-relaxed">{interaction.notes}</div>
                              )}
                              <div className="text-xs text-slate-300 dark:text-white/50 font-medium">
                                {interaction.date ? new Date(interaction.date).toLocaleString('es-ES') : 'Sin fecha'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400 dark:text-white/40 text-sm">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">Sin interacciones registradas</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-5 border-t border-slate-200 dark:border-white/10 bg-interactive space-y-2">
                <button
                  onClick={() => handleEditContact(selectedContact)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/30"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar Contacto
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedContact.company || selectedContact.firstName + ' ' + selectedContact.lastName)}`, '_blank')}
                    className="px-3 py-2.5 bg-interactive hover:bg-interactive-hover border border-slate-200 dark:border-white/10 hover:border-theme-strong rounded-lg text-theme-secondary hover:text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 text-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buscar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar este contacto?')) {
                        handleDeleteContact(selectedContact.id);
                        setSelectedContact(null);
                      }
                    }}
                    className="px-3 py-2.5 bg-interactive hover:bg-red-500/10 border border-slate-200 dark:border-white/10 hover:border-red-500/30 rounded-lg text-theme-secondary hover:text-red-400 font-medium flex items-center justify-center gap-2 transition-all duration-200 text-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEditor && (
        <ContactEditorModal contact={editingContact} onSave={handleSaveContact}
          onClose={() => { setShowEditor(false); setEditingContact(undefined); }} />
      )}
    </div>
  );
};

export default Contacts;
