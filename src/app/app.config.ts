import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { DolarService } from './services/dolar.service'; // Importa DolarService

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    DolarService, 
  ],
};