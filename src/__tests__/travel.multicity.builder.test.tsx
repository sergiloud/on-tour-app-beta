import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders, screen, within, fireEvent, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';

// Lazy import inside tests to mirror existing pattern and avoid circular deps
const load = async () => (await import('../features/travel/components/SmartFlightSearch/SmartFlightSearch')).default;

describe('SmartFlightSearch multicity builder', () => {
  beforeEach(() => {
    // ensure clean DOM state per test
    document.body.innerHTML = '';
  });

  it('adds and removes legs correctly', async () => {
    const SmartFlightSearch = await load();
    renderWithProviders(<SmartFlightSearch />);
    const toggle = screen.getByRole('button', { name: /multicity/i });
    await userEvent.click(toggle);

    // Hint is only shown when 0 segments; depending on persisted state it may or may not exist.
    const hint = screen.queryByText(/add at least two legs/i);
    if (hint) {
      expect(hint).toBeVisible();
    }

    const addButtons = () => screen.getAllByRole('button', { name: /add leg/i });
    // Add first leg (from hint area)
    await userEvent.click(addButtons()[0]!);
    // Add second leg to meet condition
    await userEvent.click(addButtons()[0]!);

    // Now there should be 2 segment rows (airport autocompletes labelled From / To)
    const fromLabels = screen.getAllByText(/from/i);
    const toLabels = screen.getAllByText(/to/i);
    expect(fromLabels.length).toBeGreaterThanOrEqual(2);
    expect(toLabels.length).toBeGreaterThanOrEqual(2);

    // Remove first leg using its remove button
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await userEvent.click(removeButtons[0]!);

    // One less "From" label now
    const fromLabelsAfter = screen.getAllByText(/from/i);
    expect(fromLabelsAfter.length).toBeLessThan(fromLabels.length);
  });

  it('enables open route button only with 2+ complete legs', async () => {
    const SmartFlightSearch = await load();
    // Neutralize any persisted multicity UI state from previous tests
    try {
      window.localStorage.removeItem('travel.multicity.open');
      window.localStorage.removeItem('travel.multicity.segments');
    } catch {}
    renderWithProviders(<SmartFlightSearch />);
    const toggle = screen.getByRole('button', { name: /multicity/i });
    // Only click if currently collapsed to avoid accidentally closing an already-open builder
    if (toggle.getAttribute('aria-expanded') === 'false') {
      await userEvent.click(toggle);
    }

  // Wait for at least one Add leg button (bottom control) to ensure builder rendered
  const addLegButtonsInitial = await screen.findAllByRole('button', { name: /add leg/i });
  expect(addLegButtonsInitial.length).toBeGreaterThan(0);

  const openBtn = () => screen.getByRole('button', { name: /open route in google flights/i });
    expect(openBtn()).toBeDisabled();

    // Scope to builder to avoid picking main form date input
    const builder = screen.getByLabelText(/multi-city builder/i);
    const builderWithin = within(builder);
    const clickLastAdd = async () => {
      const btns = screen.getAllByRole('button', { name: /add leg/i });
      await userEvent.click(btns[btns.length-1]!);
    };
    const getSegmentDateInputs = () => Array.from(builder.querySelectorAll('input[type="date"]')) as HTMLInputElement[];
    while (getSegmentDateInputs().length < 2) await clickLastAdd();
    while (getSegmentDateInputs().length > 2) {
      const removes = within(builder).getAllByRole('button', { name: /remove/i });
      await userEvent.click(removes[removes.length-1]!);
    }
    const fromLabels = builderWithin.getAllByText(/from/i);
    const toLabels = builderWithin.getAllByText(/to\b/i);
    const firstFromInput = fromLabels[0]!.closest('label')!.querySelector('input')! as HTMLInputElement;
    const firstToInput = toLabels[0]!.closest('label')!.querySelector('input')! as HTMLInputElement;
    const secondFromInput = fromLabels[1]!.closest('label')!.querySelector('input')! as HTMLInputElement;
    const secondToInput = toLabels[1]!.closest('label')!.querySelector('input')! as HTMLInputElement;
    await userEvent.type(firstFromInput, 'MAD');
    await userEvent.type(firstToInput, 'JFK');
    await userEvent.type(secondFromInput, 'JFK');
    await userEvent.type(secondToInput, 'LAX');
    // Date inputs inside builder
  const dateInputs = getSegmentDateInputs();
  expect(dateInputs.length).toBe(2);
    fireEvent.change(dateInputs[0]!, { target: { value: '2025-12-01' } });
    fireEvent.change(dateInputs[1]!, { target: { value: '2025-12-05' } });

    await waitFor(()=> expect(openBtn()).toBeEnabled());
  });
});
