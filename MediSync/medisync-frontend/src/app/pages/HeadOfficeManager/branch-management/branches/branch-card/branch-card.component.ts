// src/app/pages/HeadOfficeManager/BranchManagement/branches/branch-card/branch-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '../../../../../core/models/store.model';

@Component({
  selector: 'app-branch-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './branch-card.component.html',
  styleUrls: ['./branch-card.component.css']
})
export class BranchCardComponent {
  @Input({ required: true }) branch!: Store;

  constructor(private router: Router) {}

  manageBranches(storeId: string | number) {
    this.router.navigate(['/branches', storeId, 'manage']);
  }
}