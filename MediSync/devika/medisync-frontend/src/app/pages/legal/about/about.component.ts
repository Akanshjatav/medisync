import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticPageLayoutComponent } from '../../../shared/static-page-layout/static-page-layout.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, StaticPageLayoutComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {}
