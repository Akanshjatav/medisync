import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rfq-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rfq-success.component.html',
  styleUrls: ['./rfq-success.component.css']
})
export class RfqSuccessComponent {
  year = new Date().getFullYear();
}