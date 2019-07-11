import Arweave from 'arweave/web';
import { settingsFile } from '~/renderer/app/store/settings';

// const port = settingsFile.get('serverPort') || 1984;
// export const arweaveNetwork = Arweave.init({ host: '127.0.0.1', port });

export const arweaveNetwork = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' });

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36';
