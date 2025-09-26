import { useEffect, useState } from 'react';
import { DemoShow } from '../lib/demoShows';
import { showStore } from '../shared/showStore';

export function useShows() {
  const [shows, setShows] = useState<DemoShow[]>(() => showStore.getAll());
  useEffect(() => showStore.subscribe(setShows), []);
  const add = (s: DemoShow) => showStore.addShow(s);
  const setAll = (list: DemoShow[]) => showStore.setAll(list);
  const update = (id: string, patch: Partial<DemoShow> & Record<string, unknown>) => showStore.updateShow(id, patch);
  const remove = (id: string) => showStore.removeShow(id);
  return { shows, add, setAll, update, remove };
}
