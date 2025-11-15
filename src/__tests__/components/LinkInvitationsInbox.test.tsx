/**
 * Unit tests for LinkInvitationsInbox component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LinkInvitationsInbox } from '../../../src/components/organization/LinkInvitationsInbox';
import { FirestoreLinkInvitationService } from '../../../src/services/firestoreLinkInvitationService';

// Mock the service
vi.mock('../../../src/services/firestoreLinkInvitationService');

// Mock useAuth
vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({ userId: 'test-user-123' }),
}));

describe('LinkInvitationsInbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders empty state when no invitations', async () => {
      // Mock empty invitations
      vi.mocked(FirestoreLinkInvitationService.subscribeToReceivedInvitations)
        .mockImplementation((userId, callback) => {
          callback([]);
          return () => {};
        });

      render(<LinkInvitationsInbox />);

      await waitFor(() => {
        expect(screen.getByText(/no invitations/i)).toBeInTheDocument();
      });
    });

    it('renders invitations list', async () => {
      const mockInvitations = [
        {
          id: 'inv-1',
          agencyOrgId: 'agency-1',
          artistOrgId: 'artist-1',
          agencyName: 'Test Agency',
          artistName: 'Test Artist',
          message: 'Collaboration request',
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ];

      vi.mocked(FirestoreLinkInvitationService.subscribeToReceivedInvitations)
        .mockImplementation((userId, callback) => {
          callback(mockInvitations);
          return () => {};
        });

      render(<LinkInvitationsInbox />);

      await waitFor(() => {
        expect(screen.getByText('Test Agency')).toBeInTheDocument();
        expect(screen.getByText('Collaboration request')).toBeInTheDocument();
      });
    });

    it('renders in compact mode with limit', async () => {
      const mockInvitations = Array.from({ length: 10 }, (_, i) => ({
        id: `inv-${i}`,
        agencyOrgId: 'agency-1',
        artistOrgId: 'artist-1',
        agencyName: `Agency ${i}`,
        artistName: 'Test Artist',
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }));

      vi.mocked(FirestoreLinkInvitationService.subscribeToReceivedInvitations)
        .mockImplementation((userId, callback) => {
          callback(mockInvitations);
          return () => {};
        });

      render(<LinkInvitationsInbox compact limit={3} />);

      await waitFor(() => {
        expect(screen.getByText('Agency 0')).toBeInTheDocument();
        expect(screen.getByText('Agency 1')).toBeInTheDocument();
        expect(screen.getByText('Agency 2')).toBeInTheDocument();
        expect(screen.queryByText('Agency 3')).not.toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    it('calls accept invitation when Accept button clicked', async () => {
      const mockInvitation = {
        id: 'inv-1',
        agencyOrgId: 'agency-1',
        artistOrgId: 'artist-1',
        agencyName: 'Test Agency',
        artistName: 'Test Artist',
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      vi.mocked(FirestoreLinkInvitationService.subscribeToReceivedInvitations)
        .mockImplementation((userId, callback) => {
          callback([mockInvitation]);
          return () => {};
        });

      const acceptMock = vi.mocked(FirestoreLinkInvitationService.acceptInvitation)
        .mockResolvedValue(undefined);

      render(<LinkInvitationsInbox />);

      await waitFor(() => {
        const acceptButton = screen.getByText(/accept/i);
        fireEvent.click(acceptButton);
      });

      await waitFor(() => {
        expect(acceptMock).toHaveBeenCalledWith(
          'test-user-123',
          'inv-1',
          'agency-1',
          'artist-1'
        );
      });
    });

    it('calls reject invitation when Reject button clicked', async () => {
      const mockInvitation = {
        id: 'inv-1',
        agencyOrgId: 'agency-1',
        artistOrgId: 'artist-1',
        agencyName: 'Test Agency',
        artistName: 'Test Artist',
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      vi.mocked(FirestoreLinkInvitationService.subscribeToReceivedInvitations)
        .mockImplementation((userId, callback) => {
          callback([mockInvitation]);
          return () => {};
        });

      const rejectMock = vi.mocked(FirestoreLinkInvitationService.rejectInvitation)
        .mockResolvedValue(undefined);

      render(<LinkInvitationsInbox />);

      await waitFor(() => {
        const rejectButton = screen.getByText(/reject/i);
        fireEvent.click(rejectButton);
      });

      await waitFor(() => {
        expect(rejectMock).toHaveBeenCalledWith('test-user-123', 'inv-1');
      });
    });

    it('disables buttons during processing', async () => {
      const mockInvitation = {
        id: 'inv-1',
        agencyOrgId: 'agency-1',
        artistOrgId: 'artist-1',
        agencyName: 'Test Agency',
        artistName: 'Test Artist',
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      vi.mocked(FirestoreLinkInvitationService.subscribeToReceivedInvitations)
        .mockImplementation((userId, callback) => {
          callback([mockInvitation]);
          return () => {};
        });

      // Mock slow accept
      vi.mocked(FirestoreLinkInvitationService.acceptInvitation)
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<LinkInvitationsInbox />);

      await waitFor(() => {
        const acceptButton = screen.getByText(/accept/i);
        fireEvent.click(acceptButton);
      });

      // Buttons should be disabled during processing
      const acceptButton = screen.getByText(/accept/i).closest('button');
      const rejectButton = screen.getByText(/reject/i).closest('button');
      
      expect(acceptButton).toBeDisabled();
      expect(rejectButton).toBeDisabled();
    });
  });

  describe('Expiration', () => {
    it('shows expired badge for expired invitations', async () => {
      const expiredInvitation = {
        id: 'inv-1',
        agencyOrgId: 'agency-1',
        artistOrgId: 'artist-1',
        agencyName: 'Test Agency',
        artistName: 'Test Artist',
        status: 'pending',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Expired 1 day ago
      };

      vi.mocked(FirestoreLinkInvitationService.subscribeToReceivedInvitations)
        .mockImplementation((userId, callback) => {
          callback([expiredInvitation]);
          return () => {};
        });

      render(<LinkInvitationsInbox />);

      await waitFor(() => {
        expect(screen.getByText(/expired/i)).toBeInTheDocument();
      });
    });

    it('hides action buttons for expired invitations', async () => {
      const expiredInvitation = {
        id: 'inv-1',
        agencyOrgId: 'agency-1',
        artistOrgId: 'artist-1',
        agencyName: 'Test Agency',
        artistName: 'Test Artist',
        status: 'pending',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      };

      vi.mocked(FirestoreLinkInvitationService.subscribeToReceivedInvitations)
        .mockImplementation((userId, callback) => {
          callback([expiredInvitation]);
          return () => {};
        });

      render(<LinkInvitationsInbox />);

      await waitFor(() => {
        expect(screen.queryByText(/accept/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/reject/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Real-time updates', () => {
    it('subscribes to invitations on mount', () => {
      const subscribeMock = vi.mocked(
        FirestoreLinkInvitationService.subscribeToReceivedInvitations
      ).mockReturnValue(() => {});

      render(<LinkInvitationsInbox />);

      expect(subscribeMock).toHaveBeenCalledWith(
        'test-user-123',
        expect.any(Function)
      );
    });

    it('unsubscribes on unmount', () => {
      const unsubscribeMock = vi.fn();
      
      vi.mocked(FirestoreLinkInvitationService.subscribeToReceivedInvitations)
        .mockReturnValue(unsubscribeMock);

      const { unmount } = render(<LinkInvitationsInbox />);

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('updates list when new invitations arrive', async () => {
      let callback: any;
      
      vi.mocked(FirestoreLinkInvitationService.subscribeToReceivedInvitations)
        .mockImplementation((userId, cb) => {
          callback = cb;
          callback([]);
          return () => {};
        });

      render(<LinkInvitationsInbox />);

      // Initially empty
      await waitFor(() => {
        expect(screen.getByText(/no invitations/i)).toBeInTheDocument();
      });

      // Simulate new invitation
      callback([
        {
          id: 'inv-new',
          agencyOrgId: 'agency-1',
          artistOrgId: 'artist-1',
          agencyName: 'New Agency',
          artistName: 'Test Artist',
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ]);

      await waitFor(() => {
        expect(screen.getByText('New Agency')).toBeInTheDocument();
        expect(screen.queryByText(/no invitations/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Callback', () => {
    it('calls onUpdate after successful accept', async () => {
      const onUpdateMock = vi.fn();
      const mockInvitation = {
        id: 'inv-1',
        agencyOrgId: 'agency-1',
        artistOrgId: 'artist-1',
        agencyName: 'Test Agency',
        artistName: 'Test Artist',
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      vi.mocked(FirestoreLinkInvitationService.subscribeToReceivedInvitations)
        .mockImplementation((userId, callback) => {
          callback([mockInvitation]);
          return () => {};
        });

      vi.mocked(FirestoreLinkInvitationService.acceptInvitation)
        .mockResolvedValue(undefined);

      render(<LinkInvitationsInbox onUpdate={onUpdateMock} />);

      await waitFor(() => {
        const acceptButton = screen.getByText(/accept/i);
        fireEvent.click(acceptButton);
      });

      await waitFor(() => {
        expect(onUpdateMock).toHaveBeenCalled();
      });
    });
  });
});
