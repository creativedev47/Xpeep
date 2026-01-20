import { supabase } from 'utils/supabase';
import { useGetAccount } from 'hooks/sdkDappHooks';

export enum ActivityTypeEnum {
    PEEP_PLACED = 'PEEP_PLACED',
    WINNINGS_CLAIMED = 'WINNINGS_CLAIMED',
    SWAP = 'SWAP',
    STAKE = 'STAKE',
    BRIDGE = 'BRIDGE'
}

export const useActivityLogger = () => {
    const { address } = useGetAccount();

    const ensureProfileExists = async () => {
        if (!address) return;

        const { error } = await supabase
            .from('profiles')
            .upsert({
                address: address,
                last_seen_at: new Date().toISOString()
            }, { onConflict: 'address' });

        // .select() removed to avoid 406 Not Acceptable if headers are mismatched
        // We just want to ensure it exists.

        if (error && error.code !== '23505') { // Ignore duplicate key errors if logic fails
            console.error('Error ensuring profile exists:', error);
        }
    };

    const logActivity = async (actionType: ActivityTypeEnum, details: any) => {
        if (!address) return;

        try {
            // 1. Ensure profile exists (lazy create)
            await ensureProfileExists();

            // 2. Log Activity
            const { error } = await supabase
                .from('activity_logs')
                .insert({
                    user_address: address,
                    action_type: actionType,
                    details: details,
                    created_at: new Date().toISOString()
                });

            if (error) throw error;

        } catch (err) {
            console.error('Failed to log activity:', err);
        }
    };

    const logPeep = (marketId: number | string, amount: string, outcome: string, title: string) => {
        logActivity(ActivityTypeEnum.PEEP_PLACED, {
            marketId,
            amount,
            outcome,
            marketTitle: title
        });
    };

    const logClaim = (marketId: number | string, amount: string, title: string) => {
        logActivity(ActivityTypeEnum.WINNINGS_CLAIMED, {
            marketId,
            amount,
            marketTitle: title
        });
    };

    return {
        logActivity,
        logPeep,
        logClaim,
        ensureProfileExists
    };
};
