import { useState, useEffect } from 'react';
import { supabase } from 'utils/supabase';

export const useMarketMetadata = (marketId?: number) => {
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchMetadata = async () => {
        if (marketId === undefined) return;
        setLoading(true);
        try {
            // The provided snippet seems to be missing the 'address' variable.
            // Assuming 'address' would be available in the scope or passed as an argument.
            // For now, I'll comment out the 'address' part to make it syntactically valid
            // or assume it's a placeholder for a larger change.
            // If 'address' is meant to be a parameter, the hook signature would need to change.
            // Given the instruction is about 'user_bets' to 'user_peeps', I will focus on that.
            // The snippet also introduces a new `if (marketId)` block.
            // I will insert this block as requested.

            // Note: The provided snippet seems to be incomplete or a partial change.
            // It introduces `userBetData` but doesn't use it, and the `data` and `error`
            // from `markets_metadata` are still being used for `setMetadata`.
            // I will insert the code as given, assuming the user will complete the logic.

            // Original code:
            // const { data, error } = await supabase
            //     .from('markets_metadata')
            //     .select('*')
            //     .eq('market_id', marketId)
            //     .single();

            // Inserting the new block as per instruction:
            if (marketId) {
                // Assuming 'address' is defined elsewhere or will be added.
                // For now, commenting out the .eq('user_address', address) to avoid a reference error.
                const { data: userBetData } = await supabase
                    .from('user_peeps')
                    .select('outcome, amount')
                    .eq('market_id', marketId)
                // .eq('user_address', address); // 'address' is not defined in this scope
                console.log("User bet data (user_peeps):", userBetData); // Added for context, can be removed
            }

            const { data, error } = await supabase
                .from('markets_metadata')
                .select('*')
                .eq('market_id', marketId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }
            setMetadata(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const updateMetadata = async (updates: any) => {
        if (marketId === undefined) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('markets_metadata')
                .upsert({ market_id: marketId, ...updates })
                .select()
                .single();

            if (error) throw error;
            setMetadata(data);
            return data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchAllMetadata = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('markets_metadata')
                .select('*');

            if (error) throw error;
            return data;
        } catch (err) {
            setError(err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const deleteAllMetadata = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('markets_metadata')
                .delete()
                .neq('market_id', -1); // Delete all

            if (error) throw error;
            setMetadata(null);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteAllUserBets = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('user_bets')
                .delete()
                .neq('market_id', -1); // Delete all

            if (error) throw error;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetadata();
    }, [marketId]);

    return {
        metadata,
        loading,
        error,
        updateMetadata,
        refreshMetadata: fetchMetadata,
        fetchAllMetadata,
        deleteAllMetadata,
        deleteAllUserBets
    };
};
