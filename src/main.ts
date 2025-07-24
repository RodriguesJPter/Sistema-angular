import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';
import { PreloadService } from './app/services/preload';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    ...appConfig.providers
  ]
}).then(appRef => {
  

}).catch(err => console.error(err));