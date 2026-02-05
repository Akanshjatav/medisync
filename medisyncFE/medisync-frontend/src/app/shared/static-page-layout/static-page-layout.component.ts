import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-static-page-layout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './static-page-layout.component.html',
  styleUrl: './static-page-layout.component.css'
})
export class StaticPageLayoutComponent {}
