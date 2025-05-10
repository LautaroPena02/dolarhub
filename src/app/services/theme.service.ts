import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(true);
  isDarkMode$ = this.isDarkMode.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.isDarkMode.next(savedTheme === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkMode.next(prefersDark);
      }
      this.updateTheme();
    }
  }

  toggleTheme() {
    const newValue = !this.isDarkMode.value;
    this.isDarkMode.next(newValue);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
      this.updateTheme();
    }
  }

  private updateTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const theme = this.isDarkMode.value ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
} 