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

export interface FourthwallOrder {
  id: string;
  createdAt: string;
  productName: string;
  recipientName: string;
  email: string;
  claimStatus: 'unclaimed' | 'claimed' | 'unknown';
  orderUrl?: string;
}
