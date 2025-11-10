/**
 * useContactsQuery - React Query hook para gestión de contactos
 * Sigue el patrón de useShowsQuery para consistencia en el proyecto
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Contact } from '../types/crm';
import { contactStore } from '../shared/contactStore';

// Query keys para invalidación y caching
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters: string) => [...contactKeys.lists(), { filters }] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  stats: () => [...contactKeys.all, 'stats'] as const,
};

/**
 * Hook principal para obtener todos los contactos
 */
export const useContactsQuery = () => {
  const queryClient = useQueryClient();

  // Escuchar evento de recarga de contactos (cuando se cargan datos demo de Prophecy)
  useEffect(() => {
    const handleContactsReloaded = () => {
      console.log('[useContactsQuery] Contacts reloaded event received, invalidating cache');
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
    };

    window.addEventListener('contactsReloaded', handleContactsReloaded);
    return () => window.removeEventListener('contactsReloaded', handleContactsReloaded);
  }, [queryClient]);

  return useQuery({
    queryKey: contactKeys.lists(),
    queryFn: async () => {
      // Simular latencia de red para testing (remover en producción)
      await new Promise(resolve => setTimeout(resolve, 100));
      return contactStore.getAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
  });
};

/**
 * Hook para obtener un contacto específico
 */
export const useContactQuery = (id: string) => {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return contactStore.getById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener estadísticas de contactos
 */
export const useContactStatsQuery = () => {
  return useQuery({
    queryKey: contactKeys.stats(),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return contactStore.getStats();
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

/**
 * Mutation para crear un contacto
 */
export const useCreateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newContact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const contact: Contact = {
        ...newContact,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      contactStore.add(contact);
      return contact;
    },
    onMutate: async (newContact) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: contactKeys.lists() });

      // Snapshot del estado previo
      const previousContacts = queryClient.getQueryData(contactKeys.lists());

      // Optimistic update
      queryClient.setQueryData(contactKeys.lists(), (old: Contact[] = []) => {
        const tempContact: Contact = {
          ...newContact,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [...old, tempContact];
      });

      return { previousContacts };
    },
    onError: (err, newContact, context) => {
      // Revertir en caso de error
      if (context?.previousContacts) {
        queryClient.setQueryData(contactKeys.lists(), context.previousContacts);
      }
    },
    onSettled: () => {
      // Invalidar y refetch
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
    },
  });
};

/**
 * Mutation para actualizar un contacto
 */
export const useUpdateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contact> }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      contactStore.update(id, data);
      return contactStore.getById(id);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: contactKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: contactKeys.lists() });

      const previousContact = queryClient.getQueryData(contactKeys.detail(id));
      const previousContacts = queryClient.getQueryData(contactKeys.lists());

      // Optimistic update
      queryClient.setQueryData(contactKeys.detail(id), (old: Contact | undefined) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date().toISOString() };
      });

      queryClient.setQueryData(contactKeys.lists(), (old: Contact[] = []) => {
        return old.map(contact =>
          contact.id === id
            ? { ...contact, ...data, updatedAt: new Date().toISOString() }
            : contact
        );
      });

      return { previousContact, previousContacts };
    },
    onError: (err, { id }, context) => {
      if (context?.previousContact) {
        queryClient.setQueryData(contactKeys.detail(id), context.previousContact);
      }
      if (context?.previousContacts) {
        queryClient.setQueryData(contactKeys.lists(), context.previousContacts);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
    },
  });
};

/**
 * Mutation para eliminar un contacto
 */
export const useDeleteContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      contactStore.delete(id);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: contactKeys.lists() });

      const previousContacts = queryClient.getQueryData(contactKeys.lists());

      // Optimistic update
      queryClient.setQueryData(contactKeys.lists(), (old: Contact[] = []) => {
        return old.filter(contact => contact.id !== id);
      });

      return { previousContacts };
    },
    onError: (err, id, context) => {
      if (context?.previousContacts) {
        queryClient.setQueryData(contactKeys.lists(), context.previousContacts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
    },
  });
};

/**
 * Mutation para añadir una nota a un contacto
 */
export const useAddContactNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      contactStore.addNote(id, note);
      return contactStore.getById(id);
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
};

/**
 * Mutation para añadir una interacción a un contacto
 */
export const useAddContactInteractionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      type,
      notes,
      outcome,
      date
    }: {
      id: string;
      type: 'email' | 'call' | 'meeting' | 'message' | 'other';
      notes: string;
      outcome?: string;
      date?: string;
    }) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      contactStore.addInteraction(id, {
        type,
        notes: notes || '',
        date: date || new Date().toISOString()
      });
      return contactStore.getById(id);
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
    },
  });
};
