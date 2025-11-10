import { webSocketService, UserPresence } from './WebSocketService.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Collaborative Editing Service
 * Manages real-time collaborative document editing and presence tracking
 */

export interface Document {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  collaborators: string[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface DocumentEdit {
  id: string;
  documentId: string;
  userId: string;
  action: 'insert' | 'delete' | 'replace';
  path: string;
  value?: any;
  timestamp: Date;
}

export interface CursorPosition {
  userId: string;
  username: string;
  line: number;
  column: number;
  timestamp: Date;
}

export interface DocumentSession {
  documentId: string;
  activeUsers: string[];
  cursors: Map<string, CursorPosition>;
  edits: DocumentEdit[];
  startedAt: Date;
}

class CollaborativeEditingService {
  private documents: Map<string, Document> = new Map();
  private documentSessions: Map<string, DocumentSession> = new Map();
  private documentLocks: Map<string, string> = new Map(); // documentId -> userId (who has lock)
  private undoHistory: Map<string, DocumentEdit[]> = new Map();
  private redoHistory: Map<string, DocumentEdit[]> = new Map();

  /**
   * Create new document
   */
  public createDocument(ownerId: string, title: string, content: string = ''): Document {
    const document: Document = {
      id: uuidv4(),
      title,
      content,
      ownerId,
      collaborators: [ownerId],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0
    };

    this.documents.set(document.id, document);

    // Initialize session
    this.documentSessions.set(document.id, {
      documentId: document.id,
      activeUsers: [ownerId],
      cursors: new Map(),
      edits: [],
      startedAt: new Date()
    });

    logger.info(`Document created: ${document.id} (${title}) by ${ownerId}`);
    return document;
  }

  /**
   * Get document
   */
  public getDocument(documentId: string): Document | null {
    return this.documents.get(documentId) || null;
  }

  /**
   * Add collaborator
   */
  public addCollaborator(documentId: string, userId: string): void {
    const document = this.documents.get(documentId);
    if (!document) return;

    if (!document.collaborators.includes(userId)) {
      document.collaborators.push(userId);
      logger.info(`User ${userId} added as collaborator to document ${documentId}`);
    }

    const session = this.documentSessions.get(documentId);
    if (session && !session.activeUsers.includes(userId)) {
      session.activeUsers.push(userId);
    }
  }

  /**
   * Remove collaborator
   */
  public removeCollaborator(documentId: string, userId: string): void {
    const document = this.documents.get(documentId);
    if (!document) return;

    const index = document.collaborators.indexOf(userId);
    if (index > -1) {
      document.collaborators.splice(index, 1);
    }

    const session = this.documentSessions.get(documentId);
    if (session) {
      const userIndex = session.activeUsers.indexOf(userId);
      if (userIndex > -1) {
        session.activeUsers.splice(userIndex, 1);
      }
      session.cursors.delete(userId);
    }

    logger.info(`User ${userId} removed from document ${documentId}`);
  }

  /**
   * Request lock on document (for preventing conflicts)
   */
  public requestLock(documentId: string, userId: string): boolean {
    const currentLock = this.documentLocks.get(documentId);

    if (currentLock && currentLock !== userId) {
      return false; // Already locked by someone else
    }

    this.documentLocks.set(documentId, userId);
    logger.debug(`Lock acquired on document ${documentId} by ${userId}`);
    return true;
  }

  /**
   * Release lock on document
   */
  public releaseLock(documentId: string, userId: string): void {
    const currentLock = this.documentLocks.get(documentId);

    if (currentLock === userId) {
      this.documentLocks.delete(documentId);
      logger.debug(`Lock released on document ${documentId}`);
    }
  }

  /**
   * Apply edit to document
   */
  public applyEdit(documentId: string, userId: string, action: 'insert' | 'delete' | 'replace', path: string, value?: any): DocumentEdit | null {
    const document = this.documents.get(documentId);
    if (!document) return null;

    const edit: DocumentEdit = {
      id: uuidv4(),
      documentId,
      userId,
      action,
      path,
      value,
      timestamp: new Date()
    };

    // Store edit in session
    const session = this.documentSessions.get(documentId);
    if (session) {
      session.edits.push(edit);
    }

    // Store in undo history
    if (!this.undoHistory.has(documentId)) {
      this.undoHistory.set(documentId, []);
    }
    this.undoHistory.get(documentId)!.push(edit);

    // Clear redo history on new edit
    this.redoHistory.delete(documentId);

    // Update document metadata
    document.updatedAt = new Date();
    document.version++;

    logger.debug(`Edit applied to document ${documentId}: ${action} at ${path}`);
    return edit;
  }

  /**
   * Update cursor position
   */
  public updateCursorPosition(documentId: string, userId: string, username: string, line: number, column: number): void {
    const session = this.documentSessions.get(documentId);
    if (!session) return;

    const cursor: CursorPosition = {
      userId,
      username,
      line,
      column,
      timestamp: new Date()
    };

    session.cursors.set(userId, cursor);
    logger.debug(`Cursor updated for ${username} in document ${documentId}`);
  }

  /**
   * Get cursors in document
   */
  public getCursors(documentId: string): CursorPosition[] {
    const session = this.documentSessions.get(documentId);
    if (!session) return [];
    return Array.from(session.cursors.values());
  }

  /**
   * Undo last edit
   */
  public undo(documentId: string): DocumentEdit | null {
    const edits = this.undoHistory.get(documentId);
    if (!edits || edits.length === 0) return null;

    const edit = edits.pop();
    if (!edit) return null;

    // Move to redo history
    if (!this.redoHistory.has(documentId)) {
      this.redoHistory.set(documentId, []);
    }
    this.redoHistory.get(documentId)!.push(edit);

    const document = this.documents.get(documentId);
    if (document) {
      document.version++;
      document.updatedAt = new Date();
    }

    logger.debug(`Undo performed on document ${documentId}`);
    return edit;
  }

  /**
   * Redo last undone edit
   */
  public redo(documentId: string): DocumentEdit | null {
    const edits = this.redoHistory.get(documentId);
    if (!edits || edits.length === 0) return null;

    const edit = edits.pop();
    if (!edit) return null;

    // Move back to undo history
    if (!this.undoHistory.has(documentId)) {
      this.undoHistory.set(documentId, []);
    }
    this.undoHistory.get(documentId)!.push(edit);

    const document = this.documents.get(documentId);
    if (document) {
      document.version++;
      document.updatedAt = new Date();
    }

    logger.debug(`Redo performed on document ${documentId}`);
    return edit;
  }

  /**
   * Get document edit history
   */
  public getEditHistory(documentId: string): DocumentEdit[] {
    const session = this.documentSessions.get(documentId);
    return session ? session.edits : [];
  }

  /**
   * Get active users in document
   */
  public getActiveUsers(documentId: string): string[] {
    const session = this.documentSessions.get(documentId);
    return session ? session.activeUsers : [];
  }

  /**
   * Get document session
   */
  public getSession(documentId: string): DocumentSession | null {
    return this.documentSessions.get(documentId) || null;
  }

  /**
   * Close document session
   */
  public closeSession(documentId: string): void {
    this.documentSessions.delete(documentId);
    this.documentLocks.delete(documentId);
    this.undoHistory.delete(documentId);
    this.redoHistory.delete(documentId);
    logger.info(`Session closed for document ${documentId}`);
  }

  /**
   * Get all documents by user
   */
  public getUserDocuments(userId: string): Document[] {
    return Array.from(this.documents.values()).filter(
      doc => doc.ownerId === userId || doc.collaborators.includes(userId)
    );
  }

  /**
   * Share document with users
   */
  public shareDocument(documentId: string, userIds: string[]): void {
    const document = this.documents.get(documentId);
    if (!document) return;

    for (const userId of userIds) {
      this.addCollaborator(documentId, userId);
    }

    logger.info(`Document ${documentId} shared with ${userIds.length} users`);
  }

  /**
   * Get statistics
   */
  public getStats(): {
    totalDocuments: number;
    activeSessions: number;
    totalEdits: number;
    avgVersions: number;
  } {
    let totalEdits = 0;
    let totalVersions = 0;

    for (const document of this.documents.values()) {
      totalVersions += document.version;
    }

    for (const session of this.documentSessions.values()) {
      totalEdits += session.edits.length;
    }

    return {
      totalDocuments: this.documents.size,
      activeSessions: this.documentSessions.size,
      totalEdits,
      avgVersions: this.documents.size > 0 ? totalVersions / this.documents.size : 0
    };
  }
}

export const collaborativeEditingService = new CollaborativeEditingService();
