import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-common-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './common-layout.component.html',
  styleUrl: './common-layout.component.css'
})
export class CommonLayoutComponent {}