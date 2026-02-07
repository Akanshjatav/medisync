import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticPageLayoutComponent } from '../../../shared/static-page-layout/static-page-layout.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, StaticPageLayoutComponent],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css'
})
export class PrivacyComponent {}
