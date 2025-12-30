import { useState, useEffect } from 'react';
import { supabase } from 'utils/supabase';

export const useResolvedHistory = (userAddress?: string) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            // If userAddress is provided, fetch only markets they participated in which are resolved
            if (userAddress) {
                // First get the market IDs the user participated in
                const { data: userBets, error: betsError } = await supabase
                    .from('user_bets')
                    .select('market_id')
                    .eq('user_address', userAddress);

                if (betsError) throw betsError;

                const marketIds = [...new Set(userBets?.map(b => b.market_id))];

                if (marketIds.length === 0) {
                    setHistory([]);
                    return;
                }

                // Fetch metadata for these markets if they are resolved
                const { data: markets, error: marketsError } = await supabase
                    .from('markets_metadata')
                    .select('*')
                    .in('market_id', marketIds)
                    .eq('status', 'Resolved')
                    .order('resolved_at', { ascending: false });

                if (marketsError) throw marketsError;
                setHistory(markets || []);
            } else {
                // Admin view: fetch all resolved markets
                const { data: markets, error: marketsError } = await supabase
                    .from('markets_metadata')
                    .select('*')
                    .eq('status', 'Resolved')
                    .order('resolved_at', { ascending: false });

                if (marketsError) throw marketsError;
                setHistory(markets || []);
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [userAddress]);

    return { history, loading, error, refreshHistory: fetchHistory };
};
