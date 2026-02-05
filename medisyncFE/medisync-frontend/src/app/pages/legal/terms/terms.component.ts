import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticPageLayoutComponent } from '../../../shared/static-page-layout/static-page-layout.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, StaticPageLayoutComponent],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.css'
})
export class TermsComponent {}
