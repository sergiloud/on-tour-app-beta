/**
 * Event Buttons Service
 * 
 * Manages custom event type buttons in Firestore for calendar drag-drop functionality
 */

import { db } from '../lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { logger } from '../lib/logger';

export interface EventButton {
  id: string;
  label: string;
  description?: string;
  color: 'emerald' | 'amber' | 'sky' | 'rose' | 'purple' | 'cyan';
  type: 'show' | 'travel' | 'soundcheck' | 'rehearsal' | 'interview' | 'personal' | 'meeting' | 'other';
  category?: 'show' | 'travel' | 'soundcheck' | 'rehearsal' | 'interview' | 'personal' | 'meeting' | 'other';
}

const DEFAULT_BUTTONS: EventButton[] = [
  { id: '1', label: 'Show', color: 'emerald', type: 'show' },
  { id: '2', label: 'Travel', color: 'sky', type: 'travel' },
  { id: '3', label: 'Meeting', color: 'amber', type: 'meeting' },
  { id: '4', label: 'Rehearsal', color: 'purple', type: 'rehearsal' },
  { id: '5', label: 'Soundcheck', color: 'cyan', type: 'soundcheck' },
];

/**
 * Get event buttons for a user/organization
 */
export async function getEventButtons(userId: string, organizationId?: string): Promise<EventButton[]> {
  try {
    if (!db) {
      // Fallback to localStorage if Firestore not available
      return getEventButtonsFromLocalStorage();
    }

    const docRef = organizationId
      ? doc(db, 'organizations', organizationId, 'settings', 'eventButtons')
      : doc(db, 'users', userId, 'settings', 'eventButtons');

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.buttons || DEFAULT_BUTTONS;
    }

    // Initialize with defaults if not exists
    await setDoc(docRef, { buttons: DEFAULT_BUTTONS });
    return DEFAULT_BUTTONS;
  } catch (error) {
    logger.error('Failed to get event buttons from Firestore', error as Error);
    return getEventButtonsFromLocalStorage();
  }
}

/**
 * Save event buttons to Firestore
 */
export async function saveEventButtons(
  buttons: EventButton[],
  userId: string,
  organizationId?: string
): Promise<void> {
  try {
    if (!db) {
      // Fallback to localStorage
      saveEventButtonsToLocalStorage(buttons);
      return;
    }

    const docRef = organizationId
      ? doc(db, 'organizations', organizationId, 'settings', 'eventButtons')
      : doc(db, 'users', userId, 'settings', 'eventButtons');

    await setDoc(docRef, { buttons }, { merge: true });

    // Also update localStorage as cache
    saveEventButtonsToLocalStorage(buttons);
  } catch (error) {
    logger.error('Failed to save event buttons to Firestore', error as Error);
    saveEventButtonsToLocalStorage(buttons);
  }
}

/**
 * Add a new event button
 */
export async function addEventButton(
  button: EventButton,
  userId: string,
  organizationId?: string
): Promise<void> {
  try {
    if (!db) {
      const buttons = getEventButtonsFromLocalStorage();
      saveEventButtonsToLocalStorage([...buttons, button]);
      return;
    }

    const docRef = organizationId
      ? doc(db, 'organizations', organizationId, 'settings', 'eventButtons')
      : doc(db, 'users', userId, 'settings', 'eventButtons');

    await updateDoc(docRef, {
      buttons: arrayUnion(button),
    });

    // Update localStorage cache
    const buttons = getEventButtonsFromLocalStorage();
    saveEventButtonsToLocalStorage([...buttons, button]);
  } catch (error) {
    logger.error('Failed to add event button', error as Error);
    throw error;
  }
}

/**
 * Remove an event button
 */
export async function removeEventButton(
  buttonId: string,
  userId: string,
  organizationId?: string
): Promise<void> {
  try {
    const currentButtons = await getEventButtons(userId, organizationId);
    const buttonToRemove = currentButtons.find((b) => b.id === buttonId);

    if (!buttonToRemove) return;

    if (!db) {
      const updatedButtons = currentButtons.filter((b) => b.id !== buttonId);
      saveEventButtonsToLocalStorage(updatedButtons);
      return;
    }

    const docRef = organizationId
      ? doc(db, 'organizations', organizationId, 'settings', 'eventButtons')
      : doc(db, 'users', userId, 'settings', 'eventButtons');

    await updateDoc(docRef, {
      buttons: arrayRemove(buttonToRemove),
    });

    // Update localStorage cache
    const buttons = getEventButtonsFromLocalStorage();
    saveEventButtonsToLocalStorage(buttons.filter((b) => b.id !== buttonId));
  } catch (error) {
    logger.error('Failed to remove event button', error as Error);
    throw error;
  }
}

/**
 * Migrate existing localStorage buttons to Firestore
 */
export async function migrateLocalStorageToFirestore(
  userId: string,
  organizationId?: string
): Promise<void> {
  try {
    const localButtons = getEventButtonsFromLocalStorage();
    
    if (localButtons.length === 0) return;

    // Check if already migrated
    const firestoreButtons = await getEventButtons(userId, organizationId);
    
    // Only migrate if Firestore has defaults and localStorage has custom buttons
    if (
      firestoreButtons.length === DEFAULT_BUTTONS.length &&
      localButtons.length > DEFAULT_BUTTONS.length
    ) {
      await saveEventButtons(localButtons, userId, organizationId);
      logger.info('Migrated event buttons from localStorage to Firestore');
    }
  } catch (error) {
    logger.error('Failed to migrate event buttons', error as Error);
  }
}

// LocalStorage fallback functions
function getEventButtonsFromLocalStorage(): EventButton[] {
  try {
    const saved = localStorage.getItem('calendar:eventButtons');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((btn: any) => ({
        id: btn.id,
        label: btn.label,
        description: btn.description,
        category: btn.category,
        color: btn.color || 'emerald',
        type: btn.type || 'show',
      }));
    }
    return DEFAULT_BUTTONS;
  } catch {
    return DEFAULT_BUTTONS;
  }
}

function saveEventButtonsToLocalStorage(buttons: EventButton[]): void {
  try {
    localStorage.setItem('calendar:eventButtons', JSON.stringify(buttons));
  } catch (error) {
    logger.error('Failed to save event buttons to localStorage', error as Error);
  }
}
