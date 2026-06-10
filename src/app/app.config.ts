import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { SupabaseAuthService } from './core/services/supabase-auth.service';

function initAuth(auth: SupabaseAuthService): () => Promise<void> {
  return () =>
    new Promise((resolve) => {
      auth.init();
      const wait = setInterval(() => {
        if (!auth.loading()) {
          clearInterval(wait);
          resolve();
        }
      }, 50);
    });
}

const SubTrackerPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eef3ff',
      100: '#d9e4ff',
      200: '#bccfff',
      300: '#8eb0ff',
      400: '#6b94ff',
      500: '#4d7cff',
      600: '#3b5fbf',
      700: '#2f4a99',
      800: '#243a78',
      900: '#1a2b57',
      950: '#0f1a35',
    },
    colorScheme: {
      dark: {
        surface: {
          0: '#e2e8f0',
          50: '#243352',
          100: '#1a2744',
          200: '#131d33',
          300: '#0f1729',
          400: '#0a1020',
          500: '#060b14',
          600: '#64748b',
          700: '#94a3b8',
          800: '#cbd5e1',
          900: '#0f1729',
          950: '#131d33',
        },
        primary: {
          color: '#6b94ff',
          contrastColor: '#060b14',
          hoverColor: '#8eb0ff',
          activeColor: '#4d7cff',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: SubTrackerPreset,
        options: {
          darkModeSelector: '.dark-mode',
          cssLayer: false,
        },
      },
    }),
    MessageService,
    ConfirmationService,
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [SupabaseAuthService],
      multi: true,
    },
  ],
};
