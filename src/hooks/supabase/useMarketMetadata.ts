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

    useEffect(() => {
        fetchMetadata();
    }, [marketId]);

    return { metadata, loading, error, updateMetadata, refreshMetadata: fetchMetadata, fetchAllMetadata };
};
