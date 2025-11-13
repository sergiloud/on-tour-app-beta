/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamCreationModal } from '../components/org/TeamCreationModal';

describe('TeamCreationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it('should not render when open is false', () => {
    render(
      <TeamCreationModal
        open={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.queryByText('Crear Equipo')).not.toBeInTheDocument();
  });

  it('should render when open is true', () => {
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Crear Equipo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ej: Producción/i)).toBeInTheDocument();
  });

  it('should show validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const submitButton = screen.getByText('Crear Equipo');
    await user.click(submitButton);

    expect(await screen.findByText(/El nombre del equipo es obligatorio/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should show validation error for name less than 3 characters', async () => {
    const user = userEvent.setup();
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const nameInput = screen.getByPlaceholderText(/Ej: Producción/i);
    await user.type(nameInput, 'AB');

    const submitButton = screen.getByText('Crear Equipo');
    await user.click(submitButton);

    expect(await screen.findByText(/El nombre debe tener al menos 3 caracteres/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should call onSave with form data when valid', async () => {
    const user = userEvent.setup();
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const nameInput = screen.getByPlaceholderText(/Ej: Producción/i);
    const descriptionInput = screen.getByPlaceholderText(/Describe el propósito/i);

    await user.type(nameInput, 'Production Team');
    await user.type(descriptionInput, 'Handles all production tasks');

    const submitButton = screen.getByText('Crear Equipo');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Production Team',
        description: 'Handles all production tasks',
      });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onSave without description if empty', async () => {
    const user = userEvent.setup();
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const nameInput = screen.getByPlaceholderText(/Ej: Producción/i);
    await user.type(nameInput, 'Marketing Team');

    const submitButton = screen.getByText('Crear Equipo');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Marketing Team',
        description: undefined,
      });
    });
  });

  it('should close modal when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should close modal when X button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const closeButton = screen.getByLabelText('Cerrar modal');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when clicking backdrop', async () => {
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const backdrop = screen.getByText('Crear Equipo').closest('[class*="fixed"]');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should enforce max length for team name (50 chars)', async () => {
    const user = userEvent.setup();
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const nameInput = screen.getByPlaceholderText(/Ej: Producción/i) as HTMLInputElement;
    const longName = 'A'.repeat(60);
    
    await user.type(nameInput, longName);

    // Should be capped at 50
    expect(nameInput.value.length).toBeLessThanOrEqual(50);
  });

  it('should enforce max length for description (200 chars)', async () => {
    const user = userEvent.setup();
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const descriptionInput = screen.getByPlaceholderText(/Describe el propósito/i) as HTMLTextAreaElement;
    const longDescription = 'A'.repeat(250);
    
    await user.type(descriptionInput, longDescription);

    // Should be capped at 200
    expect(descriptionInput.value.length).toBeLessThanOrEqual(200);
  });

  it('should display character count for name field', () => {
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('0/50 caracteres')).toBeInTheDocument();
  });

  it('should display character count for description field', () => {
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('0/200 caracteres')).toBeInTheDocument();
  });

  it('should reset form when modal is closed and reopened', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const nameInput = screen.getByPlaceholderText(/Ej: Producción/i);
    await user.type(nameInput, 'Test Team');

    // Close modal
    rerender(
      <TeamCreationModal
        open={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Reopen modal
    rerender(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const nameInputAfterReopen = screen.getByPlaceholderText(/Ej: Producción/i) as HTMLInputElement;
    expect(nameInputAfterReopen.value).toBe('');
  });

  it('should disable submit button when name is empty', () => {
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const submitButton = screen.getByText('Crear Equipo');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when name has content', async () => {
    const user = userEvent.setup();
    render(
      <TeamCreationModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const nameInput = screen.getByPlaceholderText(/Ej: Producción/i);
    await user.type(nameInput, 'Team');

    const submitButton = screen.getByText('Crear Equipo');
    expect(submitButton).not.toBeDisabled();
  });
});
