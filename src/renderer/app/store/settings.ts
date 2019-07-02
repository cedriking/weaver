import { observable } from 'mobx';
import { getPath } from '~/shared/utils/paths';
// @ts-ignore
import * as editJSONFile from 'edit-json-file';

export const settingsFile = editJSONFile(getPath('weaver-settings.json'));

export class SettingsStore {
  @observable
  public currentDisplay: 'search_engine' | 'server_settings' = 'search_engine';

  @observable
  public searchEngineCtx: boolean = false;

  @observable
  public searchEngine: 'google' | 'yahoo' | 'bing' | 'duckduckgo' = 'duckduckgo';

  @observable
  public port = 1984;

  constructor() {
    if (!settingsFile.get('searchEngine')) {
      settingsFile.set('searchEngine', 'duckduckgo');
      settingsFile.save();
    } else {
      this.searchEngine = settingsFile.get('searchEngine');
    }

    if (!settingsFile.get('serverPort')) {
      settingsFile.set('serverPort', this.port);
      settingsFile.save();
    } else {
      this.port = settingsFile.get('serverPort');
    }
  }

  public set changeDisplay(display: any) {
    this.currentDisplay = display;
  }

  public setSearchEngine(se: 'google' | 'yahoo' | 'bing' | 'duckduckgo') {
    this.searchEngine = se;
    settingsFile.set('searchEngine', se);
    settingsFile.save();

    console.info(`[SettingsStore] Set searchEngine to ${ se }`);
  }

  public setPort(port: number) {
    this.port = port;
    settingsFile.set('serverPort', port);
    settingsFile.save();
  }
}
