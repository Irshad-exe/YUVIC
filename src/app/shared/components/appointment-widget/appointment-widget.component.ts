
import { Component, Input } from '@angular/core';

interface Appointment {
  name: string;
  degree: string;
  date: string;
  time: string;
  imageUrl: string;
}

@Component({
    selector: 'app-appointment-widget',
    imports: [],
    templateUrl: './appointment-widget.component.html',
    styleUrl: './appointment-widget.component.scss'
})
export class AppointmentWidgetComponent {
  @Input() appointments: Appointment[] = [];
}
