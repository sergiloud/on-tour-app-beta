import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MissionControlProvider } from '../context/MissionControlContext';
import { SettingsProvider } from '../context/SettingsContext';
import { ActionHub } from '../components/dashboard/ActionHub';

function Wrapper({ children }: { children: React.ReactNode }){
  return (
    <MemoryRouter initialEntries={["/dashboard"]}>
      <SettingsProvider>
        <MissionControlProvider>
          {children}
        </MissionControlProvider>
      </SettingsProvider>
    </MemoryRouter>
  );
}

describe('CTAs and language selector', () => {
  it('renders localized filter chip', () => {
    render(
      <Wrapper>
        <ActionHub />
      </Wrapper>
    );
    // default EN should render "Pending" tab
    expect(screen.getByRole('tab', { name: /Pending/i })).toBeInTheDocument();
  });
});
