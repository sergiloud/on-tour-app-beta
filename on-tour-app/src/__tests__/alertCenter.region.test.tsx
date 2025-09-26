import React from 'react';
import { renderWithProviders, screen } from '../test-utils';
import AlertCenter from '../components/dashboard/AlertCenter';

describe('AlertCenter region derivation', () => {
  it('derives region from country when region not provided', async () => {
    renderWithProviders(<AlertCenter open={true} onClose={()=>{}} items={[{ id:'a1', title:'Test • Madrid', kind:'risk', country: 'ES' } as any]} />);
    const dialog = await screen.findByRole('dialog', { name: /Alert Center/i });
    expect(dialog).toBeInTheDocument();
    // Region field is rendered inside item meta string; check that EMEA appears in the content area, not in the filter select
    const meta = await screen.findByText((content, node) => {
      if (!node) return false;
      // ensure it's within the list area and not an option element
      const el = node as HTMLElement;
      if (el.tagName.toLowerCase() === 'option') return false;
      return /EMEA/i.test(content);
    });
    expect(meta).toBeInTheDocument();
  });
});
