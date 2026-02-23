import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';
import { PreloadService } from './app/services/preload';
import { LayoutService } from './app/services/layout.service'; 

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    LayoutService,
    ...appConfig.providers
  ]
}).then(appRef => {
  

}).catch(err => console.error(err));