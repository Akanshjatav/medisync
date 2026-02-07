import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AuthLayoutComponent {}