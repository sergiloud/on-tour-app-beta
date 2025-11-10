import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { DemoShow } from '../lib/shows';

export type DraftShow = DemoShow & {
    venue?: string;
    whtPct?: number;
    mgmtAgency?: string;
    bookingAgency?: string;
    notes?: string;
    costs?: any[]
};

interface ShowModalContextType {
    isOpen: boolean;
    mode: 'add' | 'edit';
    draft: DraftShow | null;
    costs: any[];
    openAdd: () => void;
    openEdit: (show: DemoShow) => void;
    close: () => void;
    setDraft: (draft: DraftShow | null) => void;
    setCosts: (costs: any[]) => void;
}

const ShowModalContext = createContext<ShowModalContextType | undefined>(undefined);

export const ShowModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [draft, setDraft] = useState<DraftShow | null>(null);
    const [costs, setCosts] = useState<any[]>([]);

    const openAdd = useCallback(() => {
        setMode('add');
        setDraft({
            city: '',
            country: '',
            date: new Date().toISOString().slice(0, 10),
            fee: 5000,
            lat: 0,
            lng: 0,
            status: 'pending',
            whtPct: 0,
        } as any);
        setCosts([]);
        setIsOpen(true);
    }, []);

    const openEdit = useCallback((show: DemoShow) => {
        setMode('edit');
        setDraft({ ...(show as any) });
        setCosts(((show as any).costs) || []);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const value = useMemo(
        () => ({
            isOpen,
            mode,
            draft,
            costs,
            openAdd,
            openEdit,
            close,
            setDraft,
            setCosts,
        }),
        [isOpen, mode, draft, costs, openAdd, openEdit, close]
    );

    return (
        <ShowModalContext.Provider value={value}>
            {children}
        </ShowModalContext.Provider>
    );
};

export const useShowModal = () => {
    const context = useContext(ShowModalContext);
    if (!context) {
        throw new Error('useShowModal must be used within ShowModalProvider');
    }
    return context;
};
