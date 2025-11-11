import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useShowModal } from '../../context/ShowModalContext';
import { useShows } from '../../hooks/useShows';
import ShowEditorDrawer from '../../features/shows/editor/ShowEditorDrawer';
import { trackEvent } from '../../lib/telemetry';
import { announce } from '../../lib/announcer';

export const GlobalShowModal: React.FC = () => {
    const { isOpen, mode, draft, close } = useShowModal();
    const { add, update, remove } = useShows();

    useEffect(() => {
        if (isOpen) {
            trackEvent('shows.drawer.open', { mode, global: true });
            announce(mode === 'add' ? 'Add show' : 'Edit show');
        }
    }, [isOpen, mode]);

    const saveDraft = (d: any) => {
        if (mode === 'add') {
            const id = (() => {
                try {
                    return crypto.randomUUID();
                } catch {
                    return 's' + Date.now();
                }
            })();
            add({ ...(d as any), id });
        } else if (mode === 'edit' && d.id) {
            update(d.id, { ...(d as any) } as any);
        }
        announce('Saved');
        trackEvent('shows.drawer.save', { mode, global: true });
        close();
    };

    const deleteDraft = () => {
        if (mode === 'edit' && draft && draft.id) {
            remove(draft.id);
            trackEvent('shows.drawer.delete', { global: true });
            close();
        }
    };

    const handleClose = () => {
        close();
        trackEvent('shows.drawer.close', { global: true });
    };

    return (
        <AnimatePresence>
            {isOpen && draft && (
                <ShowEditorDrawer
                    open={isOpen}
                    mode={mode}
                    initial={draft}
                    onSave={saveDraft}
                    onDelete={deleteDraft}
                    onRequestClose={handleClose}
                />
            )}
        </AnimatePresence>
    );
};
