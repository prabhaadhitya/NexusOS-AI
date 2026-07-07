import { SupabaseClient } from '@supabase/supabase-js';

// Helper to get 60 days ago
function get60DaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 60);
  return d.toISOString();
}

// Helper to get 14 days ago
function get14DaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 14);
  return d.toISOString();
}

// Helper to get 28 days ago
function get28DaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 28);
  return d.toISOString();
}

export async function getSalesContext(supabase: SupabaseClient, businessId: string): Promise<string> {
  const { data, error } = await supabase
    .from('sales')
    .select('*, customers(name, segment), products(name)')
    .eq('business_id', businessId)
    .gte('sale_date', get60DaysAgo());

  if (error || !data || data.length === 0) return "No data available for this period.";

  let totalRevenue = 0;
  let revenueRecent = 0; // last 14 days
  let revenuePrior = 0; // prior 14 days (days 15-28)
  const productRev: Record<string, number> = {};
  const segmentRev: Record<string, number> = {};

  const fourteenDaysAgo = new Date(get14DaysAgo());
  const twentyEightDaysAgo = new Date(get28DaysAgo());

  for (const row of data) {
    const amt = Number(row.total_amount || 0);
    totalRevenue += amt;
    
    const saleDate = new Date(row.sale_date);
    if (saleDate >= fourteenDaysAgo) {
      revenueRecent += amt;
    } else if (saleDate >= twentyEightDaysAgo && saleDate < fourteenDaysAgo) {
      revenuePrior += amt;
    }

    const pName = row.products?.name || 'Unknown';
    productRev[pName] = (productRev[pName] || 0) + amt;

    const seg = row.customers?.segment || 'Unknown';
    segmentRev[seg] = (segmentRev[seg] || 0) + amt;
  }

  let pctChange = 0;
  let pctChangeStr = "N/A";
  if (revenuePrior > 0) {
    pctChange = ((revenueRecent - revenuePrior) / revenuePrior) * 100;
    pctChangeStr = `${pctChange > 0 ? '+' : ''}${pctChange.toFixed(1)}%`;
  }

  const topProducts = Object.entries(productRev)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(e => `${e[0]} ($${e[1].toFixed(2)})`);

  const topSegment = Object.entries(segmentRev)
    .sort((a, b) => b[1] - a[1])[0];

  return `Total Revenue (60d): $${totalRevenue.toFixed(2)}
Transactions: ${data.length}
Revenue Last 14 Days: $${revenueRecent.toFixed(2)}
Revenue Prior 14 Days: $${revenuePrior.toFixed(2)} (${pctChangeStr} change)
Top 3 Products: ${topProducts.join(', ')}
Top Customer Segment: ${topSegment ? `${topSegment[0]} ($${topSegment[1].toFixed(2)})` : 'N/A'}`;
}

export async function getFinanceContext(supabase: SupabaseClient, businessId: string): Promise<string> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, customers(name)')
    .eq('business_id', businessId);

  if (error || !data || data.length === 0) return "No data available for this period.";

  let totalPaid = 0;
  let totalPending = 0;
  let totalOverdue = 0;
  let countOverdue = 0;
  const overdueOlderThan14: string[] = [];

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  for (const row of data) {
    const amt = Number(row.amount || 0);
    if (row.status === 'paid') totalPaid += amt;
    else if (row.status === 'pending') totalPending += amt;
    else if (row.status === 'overdue') {
      totalOverdue += amt;
      countOverdue++;
      const issued = new Date(row.issued_date);
      if (issued < fourteenDaysAgo) {
        overdueOlderThan14.push(`${row.customers?.name || 'Unknown'} ($${amt.toFixed(2)})`);
      }
    }
  }

  return `Total Paid: $${totalPaid.toFixed(2)}
Total Pending: $${totalPending.toFixed(2)}
Total Overdue: $${totalOverdue.toFixed(2)}
Count of Overdue Invoices: ${countOverdue}
Overdue Invoices >14 days old: ${overdueOlderThan14.length > 0 ? overdueOlderThan14.join(', ') : 'None'}`;
}

export async function getInventoryContext(supabase: SupabaseClient, businessId: string): Promise<string> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(name)')
    .eq('business_id', businessId);

  if (error || !data || data.length === 0) return "No data available for this period.";

  const needsRestock = [];
  const totalProductCount = data.length;

  for (const row of data) {
    if (row.quantity <= row.reorder_level) {
      needsRestock.push(`${row.products?.name || 'Unknown'} (Supplier: ${row.supplier_name}, Last Restocked: ${new Date(row.last_restocked_at).toLocaleDateString()})`);
    }
  }

  return `Total Product Count: ${totalProductCount}
Items Needing Restock (Qty <= Reorder Level):
${needsRestock.length > 0 ? needsRestock.join('\n') : 'None'}`;
}

export async function getMarketingContext(supabase: SupabaseClient, businessId: string): Promise<string> {
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('business_id', businessId);

  if (error || !data || data.length === 0) return "No data available for this period.";

  const summaries = data.map(row => {
    const reach = row.reach || 0;
    const conversions = row.conversions || 0;
    const rate = reach > 0 ? ((conversions / reach) * 100).toFixed(2) + '%' : '0%';
    return `- ${row.name} (Channel: ${row.channel}): Reach ${reach}, Conversions ${conversions} (${rate} conversion rate)`;
  });

  return summaries.join('\n');
}

export async function getSupportContext(supabase: SupabaseClient, businessId: string): Promise<string> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*, customers(name)')
    .eq('business_id', businessId)
    .gte('created_at', get60DaysAgo());

  if (error || !data || data.length === 0) return "No data available for this period.";

  let open = 0, in_progress = 0, resolved = 0;
  let pos = 0, neu = 0, neg = 0;
  const negativeSubjects = [];

  for (const row of data) {
    if (row.status === 'open') open++;
    else if (row.status === 'in_progress') in_progress++;
    else if (row.status === 'resolved') resolved++;

    if (row.sentiment === 'positive') pos++;
    else if (row.sentiment === 'neutral') neu++;
    else if (row.sentiment === 'negative') {
      neg++;
      negativeSubjects.push(row.subject);
    }
  }

  return `Status Count: Open (${open}), In Progress (${in_progress}), Resolved (${resolved})
Sentiment Count: Positive (${pos}), Neutral (${neu}), Negative (${neg})
Negative Ticket Subjects: ${negativeSubjects.length > 0 ? negativeSubjects.join(', ') : 'None'}`;
}

export async function getAnalysisContext(supabase: SupabaseClient, businessId: string): Promise<string> {
  const sales = await getSalesContext(supabase, businessId);
  const finance = await getFinanceContext(supabase, businessId);
  const support = await getSupportContext(supabase, businessId);

  return `--- SALES SUMMARY ---
${sales}

--- FINANCE SUMMARY ---
${finance}

--- SUPPORT SUMMARY ---
${support}`;
}
