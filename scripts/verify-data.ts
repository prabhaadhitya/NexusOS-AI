import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verify() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: businesses, error: bErr } = await supabase.from('businesses').select('id, name');
  if (bErr) {
    console.error("Error fetching businesses:", bErr);
    return;
  }
  
  console.log("Businesses:", businesses);

  if (businesses && businesses.length > 0) {
    const bId = businesses[0].id;
    
    const { count: salesCount, error: sErr } = await supabase.from('sales').select('*', { count: 'exact', head: true }).eq('business_id', bId);
    console.log(`Sales count for ${bId}:`, salesCount);
    
    const { count: invoicesCount, error: iErr } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('business_id', bId);
    console.log(`Invoices count for ${bId}:`, invoicesCount);
    
    const { count: inventoryCount, error: invErr } = await supabase.from('inventory').select('*', { count: 'exact', head: true }).eq('business_id', bId);
    console.log(`Inventory count for ${bId}:`, inventoryCount);
  }
}

verify();
