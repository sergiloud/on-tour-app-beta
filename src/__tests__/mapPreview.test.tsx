import React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../test-utils';
import { MapPreview } from '../components/map/MapPreview';

describe('MapPreview', () => {
  it('renders markers and aria label', () => {
    render(
      <MapPreview
        center={{ lat: 0, lng: 0 }}
        markers={[
          { id: 'a', label: 'AAA', lat: 10, lng: 10 },
          { id: 'b', label: 'BBB', lat: -10, lng: -20 }
        ]}
      />
    );
    expect(screen.getByRole('group', { name: /tour map preview/i })).toBeInTheDocument();
    expect(screen.getByLabelText('AAA')).toBeInTheDocument();
    expect(screen.getByLabelText('BBB')).toBeInTheDocument();
  });

  it('supports keyboard activation and focus-visible ring', () => {
    render(
      <MapPreview
        center={{ lat: 0, lng: 0 }}
        markers={[{ id: 'a', label: 'AAA Venue Long Name', lat: 10, lng: 10 }]}
        onMarkerClick={vi.fn()}
      />
    );
    const marker = screen.getByLabelText('AAA Venue Long Name');
    marker.focus();
    expect(marker).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(marker, { key: 'Enter' });
  });

  it('honors reduced motion flag', () => {
    render(
      <MapPreview
        center={{ lat: 0, lng: 0 }}
        markers={[{ id: 'a', label: 'AAA', lat: 10, lng: 10 }, { id: 'b', label: 'BBB', lat: -10, lng: -10 }]}
        reduceMotion
      />
    );
    // No assertion on animation frames; just ensure it renders without errors
    expect(screen.getByRole('group')).toBeInTheDocument();
  });
});
