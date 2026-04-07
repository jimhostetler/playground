import type { FourthwallOrder } from '../types';

// Fourthwall Open API base URL — proxied via Vite to avoid CORS in dev.
const BASE = '/fourthwall-api';

interface FWOrderItem {
  name: string;
}

interface FWOrderData {
  id: string;
  created_at: string;
  status: string;        // e.g. "OPEN", "FULFILLED", "CANCELLED"
  claim_status?: string; // e.g. "CLAIMED", "UNCLAIMED" (digital/gift orders)
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

function mapOrder(o: FWOrderData): FourthwallOrder {
  const productName = o.items?.[0]?.name ?? 'Unknown product';
  const recipient = o.supporter?.username ?? o.supporter?.email ?? 'Unknown';

  let claimStatus: FourthwallOrder['claimStatus'] = 'unknown';
  if (o.claim_status) {
    claimStatus = o.claim_status === 'CLAIMED' ? 'claimed' : 'unclaimed';
  } else if (o.status === 'FULFILLED') {
    claimStatus = 'claimed';
  } else if (o.status === 'OPEN') {
    claimStatus = 'unclaimed';
  }

  return {
    id: o.id,
    createdAt: o.created_at,
    productName,
    recipientName: recipient,
    email: o.supporter?.email ?? '',
    claimStatus,
    orderUrl: o.admin_url,
  };
}

export async function fetchUnclaimedGiveaways(
  apiKey: string
): Promise<FourthwallOrder[]> {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const allOrders: FourthwallOrder[] = [];
  let page = 1;

  // Fetch up to 5 pages (250 orders)
  while (page <= 5) {
    const res = await fetch(`${BASE}/v1/orders?page=${page}&per_page=50`, {
      headers,
    });

    if (!res.ok) {
      throw new Error(`Fourthwall API error: ${res.status} ${res.statusText}`);
    }

    const data: FWOrdersResponse = await res.json();
    const mapped = (data.results ?? []).map(mapOrder);
    allOrders.push(...mapped);

    if (!data.has_next_page) break;
    page++;
  }

  return allOrders.filter((o) => o.claimStatus === 'unclaimed');
}
