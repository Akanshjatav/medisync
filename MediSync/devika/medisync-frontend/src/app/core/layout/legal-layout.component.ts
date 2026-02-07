import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';

@Component({
  selector: 'app-legal-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="legal-app">
      <app-header [showAccountMenu]="false" [showMiniNav]="false"></app-header>
      
      <main class="legal-main">
        <div class="legal-content">
          <router-outlet></router-outlet>
        </div>
      </main>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .legal-app {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .legal-main {
      flex: 1;
      display: flex;
      justify-content: center;
      padding: 3rem 1.5rem;
      background: #f8f9fa;
    }

    .legal-content {
      width: 100%;
      max-width: 900px;
      background: white;
      padding: 3rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
      .legal-main {
        padding: 2rem 1rem;
      }

      .legal-content {
        padding: 2rem 1.5rem;
      }
    }
  `]
})
export class LegalLayoutComponent {}
