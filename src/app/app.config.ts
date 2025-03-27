import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations'; // ✅ Fix Animation Error
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr, ToastrModule } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    // importProvidersFrom(HttpClientModule),
    importProvidersFrom(BrowserAnimationsModule), // ✅ Ensure animations are provided
    importProvidersFrom(ToastrModule.forRoot({  
      timeOut: 1000,  // ✅ Ensure toast stays visible
      positionClass: 'toast-top-right',  // ✅ Adjust position
      preventDuplicates: true,
      closeButton: true,
      maxOpened: 1, // ✅ Only one toast at a time
      autoDismiss: true, // ✅ Auto-remove toast when expired
      newestOnTop: true, // ✅ Ensure new toast replaces old ones
    })),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay())
  ]
};
