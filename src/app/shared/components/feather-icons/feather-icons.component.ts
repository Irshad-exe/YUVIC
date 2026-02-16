import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-feather-icons',
    templateUrl: './feather-icons.component.html',
    styleUrls: ['./feather-icons.component.scss'],
    imports: [MatIconModule]
})
export class FeatherIconsComponent {
  @Input() public icon?: string;
  @Input() public class?: string;

  // Icon mapping from Feather to Material Icons
  get materialIcon(): string {
    const iconMap: { [key: string]: string } = {
      'x': 'close',
      'user': 'person',
      'mail': 'mail',
      'settings': 'settings',
      'log-out': 'logout',
      'edit': 'edit',
      'trash-2': 'delete',
      'file-text': 'description'
    };
    return iconMap[this.icon || ''] || this.icon || '';
  }

  constructor() {
    // constructor
  }
}
