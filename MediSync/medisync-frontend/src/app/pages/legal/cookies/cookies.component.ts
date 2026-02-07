import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticPageLayoutComponent } from '../../../shared/static-page-layout/static-page-layout.component';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [CommonModule, StaticPageLayoutComponent],
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.css'
})
export class CookiesComponent {}
