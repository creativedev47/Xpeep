import { useState, useEffect } from 'react';
import { supabase } from 'utils/supabase';

export const useProfile = (address?: string) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchProfile = async () => {
        if (!address) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('address', address)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }
            setProfile(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: any) => {
        if (!address) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .upsert({ address, ...updates })
                .select()
                .single();

            if (error) throw error;
            setProfile(data);
            return data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [address]);

    return { profile, loading, error, updateProfile, refreshProfile: fetchProfile };
};
