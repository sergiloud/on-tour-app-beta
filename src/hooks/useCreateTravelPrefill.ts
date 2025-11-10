import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { showStore } from '../shared/showStore';

export function useCreateTravelPrefill(){
  const { search } = useLocation();
  return useMemo(()=>{
    const p = new URLSearchParams(search);
    if (p.get('create')==='1' && p.get('showId')){
      const show = showStore.getAll().find(s=> s.id === p.get('showId'));
      if (show){
        // Very simple prefill: flight day before, ground same day
        const date = new Date(show.date);
        const flight = new Date(date); flight.setDate(date.getDate()-1); flight.setHours(9,0,0,0);
        const ground = new Date(date); ground.setHours(15,0,0,0);
        return {
          targetShow: show,
          suggested: [
            { type:'flight', title: `Flight to ${show.city}`, date: flight.toISOString() },
            { type:'ground', title: `Ground transfer · ${show.city}`, date: ground.toISOString() }
          ]
        } as const;
      }
    }
    return null;
  }, [search]);
}
