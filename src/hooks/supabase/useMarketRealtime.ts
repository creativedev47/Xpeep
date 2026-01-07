import { useEffect } from 'react';
import { supabase } from 'utils/supabase';

export const useMarketRealtime = (marketId: number | undefined, onUpdate: () => void) => {
    useEffect(() => {
        if (!marketId) return;

        const channel = supabase
            .channel(`market_${marketId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'markets_metadata',
                    filter: `id=eq.${marketId}`
                },
                (payload) => {
                    console.log('Realtime update received:', payload);
                    onUpdate();
                }
            )
            .subscribe();

        const initialTimer = setTimeout(() => {
            onUpdate();
        }, 500);

        // Supernova Turbo Mode: Poll every 1s to simulate sub-second finality and ensure data consistency
        const turboInterval = setInterval(() => {
            onUpdate();
        }, 1000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(turboInterval);
            supabase.removeChannel(channel);
        };
    }, [marketId, onUpdate]);
};
