import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  /**
   * Title shown next to brand/logo.
   * Example: "Sign In", "Dashboard", etc.
   */
  @Input() title: string = 'MediSync';

  /**
   * State comes from parent layout, so navbar stays reusable.
   */
  @Input() sidebarOpen: boolean = false;

  /**
   * Emits next value so parent layout can open/close sidebar.
   */
  @Output() sidebarOpenChange = new EventEmitter<boolean>();

  toggleSidebar(): void {
    this.sidebarOpenChange.emit(!this.sidebarOpen);
  }
}