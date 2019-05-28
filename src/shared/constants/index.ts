import * as Arweave from 'arweave/node';
export const arweaveNetwork = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' });

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36';
