export const COIN_MINT = 'A9AHYeqb7nQk7LZUraw7rBCzYRjy2DRvE6NqWfFHKRdH';
export const IMAGE_MINT = 'DVD4qXDVgjwUTyfPaAdmvZJYb5CWuse2cmisYoTH9g5r';
export const COIN_TX =
  'ymfySMbrWdhf1oCgU5QTHauKGw9seaq1FJQvk1ET8eZ58wjFLh2uZckEH2uQw7rkqPTaZJs9ASNvPNUvjPCBFPL';
export const IMAGE_TX =
  '5nqX9TthkjHNBR5grSVD8a4uPZLKUxqNKzLuh9fzDhho2uZAQZM6rdnvgBUjiRn4Gd7xQe1TucTkshpYd21YftD7';
export const IMAGE_SEED = 'img:A9AHYeqb7nQk7LZUraw7rBCzYRjy';
export const AUTHORITY = '9AgnpU9ZspPtUccPHx2BtAsPWjNFo6Vd1wKbzqhiHRm9';
export const TOKEN_2022 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

export const EXPLORER_IMAGE_MINT = `https://explorer.solana.com/address/${IMAGE_MINT}`;
export const EXPLORER_IMAGE_TX = `https://explorer.solana.com/tx/${IMAGE_TX}`;
export const EXPLORER_COIN_TX = `https://explorer.solana.com/tx/${COIN_TX}`;
export const SOLSCAN_COIN = `https://solscan.io/token/${COIN_MINT}`;

const RPCS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-rpc.publicnode.com',
  'https://rpc.ankr.com/solana',
];

export type HuhcatProof = {
  uri: string | null;
  name: string | null;
  updateAuthority: string | null;
  mintAuthority: string | null;
  supply: string | null;
  space: number | null;
  uriLen: number;
  txVersion: number | string | null;
  slot: number | null;
  sealed: boolean;
  source: 'account' | 'transaction' | 'snapshot' | 'failed';
  rpc: string | null;
  fetchedAt: string;
};

type RpcOk = { rpc: string; json: unknown };

async function rpcCall(method: string, params: unknown[]): Promise<RpcOk> {
  let lastErr: unknown = null;
  for (const rpc of RPCS) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        lastErr = new Error(`${rpc} HTTP ${res.status}`);
        continue;
      }
      const json = await res.json();
      if (json?.error) {
        lastErr = new Error(json.error.message || 'rpc error');
        continue;
      }
      return { rpc, json };
    } catch (err) {
      lastErr = err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('all RPCs failed');
}

function metadataFromAccount(json: any): {
  uri: string | null;
  name: string | null;
  updateAuthority: string | null;
  mintAuthority: string | null;
  supply: string | null;
  space: number | null;
} | null {
  const value = json?.result?.value;
  if (!value) return null;
  const info = value.data?.parsed?.info;
  const ext = (info?.extensions || []).find((e: any) => e.extension === 'tokenMetadata');
  const uri = ext?.state?.uri;
  if (typeof uri !== 'string' || !uri.startsWith('data:image/')) return null;
  return {
    uri,
    name: ext?.state?.name ?? null,
    updateAuthority: ext?.state?.updateAuthority ?? null,
    mintAuthority: info?.mintAuthority ?? null,
    supply: info?.supply ?? null,
    space: typeof value.space === 'number' ? value.space : null,
  };
}

function uriFromTransaction(json: any): { uri: string | null; version: number | string | null; slot: number | null } {
  const tx = json?.result;
  const version = tx?.version ?? null;
  const slot = typeof tx?.slot === 'number' ? tx.slot : null;
  const walk = (ixs: any[]): string | null => {
    for (const ix of ixs || []) {
      const parsed = ix?.parsed;
      const uri = parsed?.info?.uri;
      if (typeof uri === 'string' && uri.startsWith('data:image/')) return uri;
      const inner = ix?.parsed?.info;
      if (inner && typeof inner.uri === 'string' && inner.uri.startsWith('data:image/')) return inner.uri;
    }
    return null;
  };
  const outer = walk(tx?.transaction?.message?.instructions || []);
  if (outer) return { uri: outer, version, slot };
  for (const group of tx?.meta?.innerInstructions || []) {
    const found = walk(group.instructions || []);
    if (found) return { uri: found, version, slot };
  }
  return { uri: null, version, slot };
}

async function loadBundledSnapshot(): Promise<HuhcatProof | null> {
  const base = import.meta.env.BASE_URL || './';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  try {
    const res = await fetch(`${prefix}onchain-sprite.json`);
    if (!res.ok) return null;
    const snap = await res.json();
    if (typeof snap?.uri !== 'string' || !snap.uri.startsWith('data:image/')) return null;
    return {
      uri: snap.uri,
      name: 'HUHCAT',
      updateAuthority: snap.updateAuthority ?? AUTHORITY,
      mintAuthority: snap.updateAuthority ?? AUTHORITY,
      supply: '0',
      space: 2944,
      uriLen: snap.uri.length,
      txVersion: 1,
      slot: 447120728,
      sealed: !snap.updateAuthority,
      source: 'snapshot',
      rpc: snap.source || 'bundled mainnet snapshot',
      fetchedAt: snap.fetchedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function fetchHuhcatProof(): Promise<HuhcatProof> {
  const snap = await loadBundledSnapshot();
  const fetchedAt = new Date().toISOString();
  const failed: HuhcatProof = {
    uri: null,
    name: null,
    updateAuthority: null,
    mintAuthority: null,
    supply: null,
    space: null,
    uriLen: 0,
    txVersion: null,
    slot: null,
    sealed: false,
    source: 'failed',
    rpc: null,
    fetchedAt,
  };

  if (snap?.uri) return snap;

  try {
    const account = await rpcCall('getAccountInfo', [IMAGE_MINT, { encoding: 'jsonParsed' }]);
    const parsed = metadataFromAccount(account.json);
    if (parsed?.uri) {
      let txVersion: number | string | null = null;
      let slot: number | null = null;
      try {
        const tx = await rpcCall('getTransaction', [
          IMAGE_TX,
          { encoding: 'jsonParsed', maxSupportedTransactionVersion: 1 },
        ]);
        const extracted = uriFromTransaction(tx.json);
        txVersion = extracted.version;
        slot = extracted.slot;
      } catch {
        /* account uri is enough to paint the sprite */
      }
      return {
        uri: parsed.uri,
        name: parsed.name,
        updateAuthority: parsed.updateAuthority,
        mintAuthority: parsed.mintAuthority,
        supply: parsed.supply,
        space: parsed.space,
        uriLen: parsed.uri.length,
        txVersion,
        slot,
        sealed: !parsed.updateAuthority,
        source: 'account',
        rpc: account.rpc,
        fetchedAt,
      };
    }
  } catch {
    /* fall through to the create tx */
  }

  try {
    const tx = await rpcCall('getTransaction', [
      IMAGE_TX,
      { encoding: 'jsonParsed', maxSupportedTransactionVersion: 1 },
    ]);
    const extracted = uriFromTransaction(tx.json);
    if (extracted.uri) {
      return {
        ...failed,
        uri: extracted.uri,
        uriLen: extracted.uri.length,
        txVersion: extracted.version,
        slot: extracted.slot,
        source: 'transaction',
        rpc: tx.rpc,
        fetchedAt,
      };
    }
  } catch {
    /* keep failed */
  }

  return snap ?? failed;
}
