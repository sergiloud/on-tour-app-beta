
import { render, screen } from '../test-utils';
import React from 'react';
import { ShowEditorDrawer } from '../features/shows/editor/ShowEditorDrawer';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

const baseDraft = { id:'hdr-es', city:'Madrid', country:'ES', date:'2025-04-20', fee:0, status:'pending' } as any;

const EsWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return <SettingsProvider><LangSetter>{children}</LangSetter></SettingsProvider>;
};

const LangSetter: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { setLang } = useSettings();
  React.useEffect(()=> { setLang('es'); }, [setLang]);
  return <>{children}</>;
};

describe.skip('ShowEditorDrawer quick entry ES copy', () => {
  test('uses updated Spanish quick entry copy', () => {
    render(<ShowEditorDrawer open mode="edit" initial={baseDraft} onSave={()=>{}} onRequestClose={()=>{}} />, { wrapper: EsWrapper });
    expect(screen.getByText(/Añadir costes rápido/i)).toBeInTheDocument();
    expect(screen.getByText(/Vuelos 340 eur/i)).toBeInTheDocument();
  });
});
