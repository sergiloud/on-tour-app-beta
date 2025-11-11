import { useEffect, useState } from 'react';
import { Show } from '../lib/shows';
import { geocodeLocation } from '../services/geocodingService';

export interface ShowWithCoordinates extends Show {
  lng: number;
  lat: number;
  geocoded?: boolean; // Flag to indicate coordinates were geocoded
}

/**
 * Hook that geocodes shows missing coordinates
 * Uses city + country to fetch exact coordinates
 */
export function useGeocodedShows(shows: Show[]): {
  shows: ShowWithCoordinates[];
  loading: boolean;
  processed: number;
  total: number;
} {
  const [geocodedShows, setGeocodedShows] = useState<ShowWithCoordinates[]>([]);
  const [loading, setLoading] = useState(false);
  const [processed, setProcessed] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function geocodeShows() {
      // Filter shows that need geocoding
      const showsNeedingGeocode = shows.filter((show) => {
        // Skip if already has valid coordinates
        if (show.lng && show.lat && !isNaN(show.lng) && !isNaN(show.lat)) {
          return false;
        }
        // Skip if missing city or country
        if (!show.city || !show.country) {
          return false;
        }
        return true;
      });

      if (showsNeedingGeocode.length === 0) {
        // All shows already have coordinates
        setGeocodedShows(shows as ShowWithCoordinates[]);
        setLoading(false);
        setProcessed(shows.length);
        return;
      }

      setLoading(true);
      const results: ShowWithCoordinates[] = [];

      // Process all shows at once since geocoding is now instant (no API calls)
      await Promise.all(
        showsNeedingGeocode.map(async (show) => {
          const coords = await geocodeLocation(show.city, show.country);

          if (coords) {
            results.push({
              ...show,
              lng: coords.lng,
              lat: coords.lat,
              geocoded: true,
            });
          } else {
            console.warn(
              `[useGeocodedShows] Could not geocode: ${show.city}, ${show.country}`
            );
          }

          setProcessed((prev) => prev + 1);
        })
      );

      if (!cancelled) {
        // Combine shows that already had coordinates with geocoded shows
        const showsWithCoordinates = shows.map((show) => {
          // Check if this show was geocoded
          const geocoded = results.find((r) => r.id === show.id);
          if (geocoded) {
            return geocoded;
          }

          // Check if show already has coordinates
          if (show.lng && show.lat && !isNaN(show.lng) && !isNaN(show.lat)) {
            return show as ShowWithCoordinates;
          }

          // Show has no coordinates and couldn't be geocoded
          return null;
        }).filter(Boolean) as ShowWithCoordinates[];

        setGeocodedShows(showsWithCoordinates);
        setLoading(false);
      }
    }

    geocodeShows();

    return () => {
      cancelled = true;
    };
  }, [shows]);

  return {
    shows: geocodedShows,
    loading,
    processed,
    total: shows.length,
  };
}
