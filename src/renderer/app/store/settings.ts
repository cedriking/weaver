import { observable } from 'mobx';
import { getPath } from '~/shared/utils/paths';
// @ts-ignore
import * as editJSONFile from 'edit-json-file';

export class SettingsStore {

  public options: any;

  @observable
  public currentDisplay: 'search_engine' | 'server_settings' = 'search_engine';

  @observable
  public searchEngineCtx: boolean = false;

  @observable
  public searchEngine: 'google' | 'yahoo' | 'bing' | 'duckduckgo' = 'duckduckgo';

  @observable
  public port = 1984;

  constructor() {
    this.options = editJSONFile(getPath('weaver-settings.json'));

    if (!this.options.get('searchEngine')) {
      this.options.set('searchEngine', 'duckduckgo');
      this.options.save();
    } else {
      this.searchEngine = this.options.get('searchEngine');
    }

    if (!this.options.get('serverPort')) {
      this.options.set('serverPort', this.port);
      this.options.save();
    } else {
      this.port = this.options.get('serverPort');
    }
  }

  public set changeDisplay(display: any) {
    this.currentDisplay = display;
  }

  public setSearchEngine(se: 'google' | 'yahoo' | 'bing' | 'duckduckgo') {
    this.searchEngine = se;
    this.options.set('searchEngine', se);
    this.options.save();

    console.info(`[SettingsStore] Set searchEngine to ${ se }`);
  }
}
