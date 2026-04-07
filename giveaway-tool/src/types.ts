export interface Winner {
  username: string;
  wonAt: number; // timestamp ms
  prize: string;
  eligibleAt: number; // timestamp ms when cooldown expires
}

export interface Settings {
  twitchChannel: string;
  twitchOAuthToken: string;
  fourthwallApiKey: string;
  cooldownDays: number;
  entryKeyword: string;
}

// One row per order item
export interface FourthwallOrderRow {
  orderId: string;
  giveawayDate: string;        // ISO string
  winner: string;              // Twitch username or email
  email: string;
  item: string;                // product/item name
  claimStatus: 'unclaimed' | 'claimed' | 'unknown';
  orderUrl?: string;
}
