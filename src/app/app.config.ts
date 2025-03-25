import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'; // ✅ Fix Animation Error
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-center-custom',
      timeOut: 10000,
      extendedTimeOut: 5000,
      closeButton: true,
      progressBar: true,
      preventDuplicates: true,
      tapToDismiss: false
    })
    ,
  provideHttpClient(),provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay())]
};
