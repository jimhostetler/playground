import tmi from 'tmi.js';

type MessageHandler = (username: string, message: string) => void;

let client: tmi.Client | null = null;
let connectedChannel = '';

export function connectTwitch(
  channel: string,
  oauthToken: string,
  onMessage: MessageHandler,
  onStatusChange: (status: 'connected' | 'disconnected' | 'error', detail?: string) => void
): void {
  if (client) {
    client.disconnect().catch(() => {});
    client = null;
  }

  connectedChannel = channel;

  const opts: tmi.Options = {
    channels: [channel],
    ...(oauthToken
      ? {
          identity: {
            username: channel,
            password: oauthToken.startsWith('oauth:') ? oauthToken : `oauth:${oauthToken}`,
          },
        }
      : {}),
  };

  client = new tmi.Client(opts);

  client.on('message', (_channel, tags, message, _self) => {
    const username = tags['display-name'] || tags.username || 'unknown';
    onMessage(username, message.trim());
  });

  client.on('connected', () => onStatusChange('connected'));
  client.on('disconnected', (reason) => onStatusChange('disconnected', reason));

  client.connect().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    onStatusChange('error', msg);
  });
}

export function disconnectTwitch(): void {
  if (client) {
    client.disconnect().catch(() => {});
    client = null;
  }
  connectedChannel = '';
}

export async function sendChatMessage(message: string): Promise<void> {
  if (!client || !connectedChannel) {
    throw new Error('Not connected to Twitch');
  }
  await client.say(connectedChannel, message);
}
