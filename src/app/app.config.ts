import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { provideToastr, ToastrModule } from 'ngx-toastr';
import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

//  Angular Material Modules
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    importProvidersFrom(BrowserAnimationsModule),

    //  Angular Forms and HTTP
    importProvidersFrom(HttpClientModule, ReactiveFormsModule, FormsModule),

    //  Material UI Modules
    importProvidersFrom(
      MatRadioModule, 
      MatInputModule, 
      MatCardModule, 
      MatFormFieldModule, 
      MatSelectModule, 
      MatOptionModule, 
      MatButtonModule,
      MatTableModule,
      MatPaginatorModule,
      MatToolbarModule,
      MatIconModule,
      MatSnackBarModule
    ),

    //  Toastr Notifications
    importProvidersFrom(ToastrModule.forRoot({
      timeOut: 1000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      maxOpened: 1,
      autoDismiss: true,
      newestOnTop: true,
    })),

    //  Angular Features
      provideHttpClient(withFetch()),
      {
        provide: HTTP_INTERCEPTORS,
        useClass: JwtInterceptor,
        multi: true
      },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
