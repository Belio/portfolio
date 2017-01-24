import './polyfills.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/';

import { ConfigService } from './app/services/config.service';

ConfigService.set('api', 'https://angular-in-action-portfolio.firebaseio.com/stocks.json');

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
