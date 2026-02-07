import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticPageLayoutComponent } from '../../../shared/static-page-layout/static-page-layout.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, StaticPageLayoutComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {}
