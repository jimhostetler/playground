import type { FourthwallOrderRow } from '../types';

// Proxied via Vite to avoid CORS in dev
const BASE = '/fourthwall-api';

interface FWOrderItem {
  name: string;
  quantity?: number;
}

interface FWOrderData {
  id: string;
  created_at: string;
  status: string;         // e.g. "OPEN", "FULFILLED", "CANCELLED"
  claim_status?: string;  // e.g. "CLAIMED", "UNCLAIMED"
  supporter?: {
    username?: string;
    email?: string;
  };
  items?: FWOrderItem[];
  admin_url?: string;
}

interface FWOrdersResponse {
  results: FWOrderData[];
  has_next_page?: boolean;
}

function claimStatusFrom(o: FWOrderData): FourthwallOrderRow['claimStatus'] {
  if (o.claim_status) {
    return o.claim_status === 'CLAIMED' ? 'claimed' : 'unclaimed';
  }
  if (o.status === 'FULFILLED') return 'claimed';
  if (o.status === 'OPEN') return 'unclaimed';
  return 'unknown';
}

// Expand each order into one row per item
function expandOrder(o: FWOrderData): FourthwallOrderRow[] {
  const winner = o.supporter?.username ?? o.supporter?.email ?? 'Unknown';
  const email = o.supporter?.email ?? '';
  const claimStatus = claimStatusFrom(o);
  const items = o.items && o.items.length > 0 ? o.items : [{ name: 'Unknown product' }];

  return items.map((item) => ({
    orderId: o.id,
    giveawayDate: o.created_at,
    winner,
    email,
    item: item.name,
    claimStatus,
    orderUrl: o.admin_url,
  }));
}

export async function fetchGiveawayOrders(
  apiKey: string
): Promise<FourthwallOrderRow[]> {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const allRows: FourthwallOrderRow[] = [];
  let page = 1;

  while (page <= 5) {
    const res = await fetch(`${BASE}/v1/orders?page=${page}&per_page=50`, { headers });

    if (!res.ok) {
      throw new Error(`Fourthwall API error: ${res.status} ${res.statusText}`);
    }

    const data: FWOrdersResponse = await res.json();
    (data.results ?? []).forEach((o) => allRows.push(...expandOrder(o)));

    if (!data.has_next_page) break;
    page++;
  }

  return allRows;
}
