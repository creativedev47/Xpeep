import { createClient } from '@supabase/supabase-js';

// process.env will be populated by --env-file=.env flag
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const main = async () => {
    // Arguments: Description, Category, EndTime (Unix or ISO)
    const args = process.argv.slice(2);

    if (args.length < 3) {
        console.log('Usage: npx tsx scripts/proposeMarket.ts <description> <category> <endTime>');
        console.log('Example: npx tsx scripts/proposeMarket.ts "Will Sol hit $200?" "Crypto" 1735689600');
        process.exit(1);
    }

    const description = args[0];
    const category = args[1];
    let endTime = args[2];

    // If endTime looks like a date string, convert to timestamp
    if (endTime.includes('-') || endTime.includes(':')) {
        endTime = (new Date(endTime).getTime() / 1000).toString();
    }

    console.log(`🤖 Bot Proposing Market:`);
    console.log(`   Description: ${description}`);
    console.log(`   Category:    ${category}`);
    console.log(`   End Time:    ${endTime}`);

    const { data, error } = await supabase
        .from('market_proposals')
        .insert({
            description,
            category,
            end_time: parseInt(endTime),
            status: 'pending',
            source: 'bot-script-v1'
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Failed to create proposal:', error.message);
    } else {
        console.log('✅ Proposal Created! content can be seen in Admin Dashboard.');
        console.log(`   ID: ${data.id}`);
    }
};

main();
