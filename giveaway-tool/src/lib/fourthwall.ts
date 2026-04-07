import type { FourthwallOrderRow } from '../types';

// Proxied via Vite to avoid CORS in dev — target: https://api.fourthwall.com
const BASE = '/fourthwall-api/open-api/v1.0';

// Shape of a single gift purchase from GET /gift-purchase/{id}
interface FWGiftPurchase {
  id: string;
  created_at: string;
  status: string;          // e.g. "UNCLAIMED", "CLAIMED", "CANCELLED"
  product?: {
    name?: string;
  };
  variants?: { name?: string }[];
  recipient?: {
    username?: string;
    email?: string;
    name?: string;
  };
  gifter?: {
    username?: string;
    email?: string;
  };
  admin_url?: string;
}

interface FWGiftPurchasesResponse {
  results: FWGiftPurchase[];
  has_next_page?: boolean;
}

function mapGiftPurchase(g: FWGiftPurchase): FourthwallOrderRow {
  const winner =
    g.recipient?.username ??
    g.recipient?.name ??
    g.recipient?.email ??
    'Unknown';

  const itemName =
    g.variants?.[0]?.name ??
    g.product?.name ??
    'Unknown product';

  const status = g.status?.toUpperCase();
  let claimStatus: FourthwallOrderRow['claimStatus'] = 'unknown';
  if (status === 'CLAIMED' || status === 'FULFILLED') claimStatus = 'claimed';
  else if (status === 'UNCLAIMED' || status === 'OPEN') claimStatus = 'unclaimed';

  return {
    orderId: g.id,
    giveawayDate: g.created_at,
    winner,
    email: g.recipient?.email ?? '',
    item: itemName,
    claimStatus,
    orderUrl: g.admin_url,
  };
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
    const res = await fetch(
      `${BASE}/gift-purchases?page=${page}&per_page=50`,
      { headers }
    );

    if (!res.ok) {
      throw new Error(`Fourthwall API error: ${res.status} ${res.statusText}`);
    }

    const data: FWGiftPurchasesResponse = await res.json();
    (data.results ?? []).forEach((g) => allRows.push(mapGiftPurchase(g)));

    if (!data.has_next_page) break;
    page++;
  }

  return allRows;
}
