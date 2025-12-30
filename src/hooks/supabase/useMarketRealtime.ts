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

        return () => {
            supabase.removeChannel(channel);
        };
    }, [marketId, onUpdate]);
};
