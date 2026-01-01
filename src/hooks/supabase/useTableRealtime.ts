import { useEffect } from 'react';
import { supabase } from 'utils/supabase';

export const useTableRealtime = (tableName: string, onEvent: () => void) => {
    useEffect(() => {
        const channel = supabase
            .channel(`table_realtime_${tableName}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: tableName
                },
                (payload) => {
                    console.log(`Realtime event for ${tableName}:`, payload);
                    onEvent();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tableName, onEvent]);
};
