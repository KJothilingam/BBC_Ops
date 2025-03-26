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
      timeOut: 1000,  // ⏳ Show for 0.5 seconds (500ms)
      extendedTimeOut: 0, // ⏳ No delay on hover
      closeButton: true,  // ✅ Enable close button
      tapToDismiss: true, // ✅ Click anywhere on toast to close
      progressBar: true,
      preventDuplicates: true, // ✅ Prevent duplicate messages
      maxOpened: 1, // ✅ Only one toast at a time
      autoDismiss: true, // ✅ Auto-remove toast when expired
      newestOnTop: true, // ✅ Ensure new toast replaces old ones
    }),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay())
  ]
};
