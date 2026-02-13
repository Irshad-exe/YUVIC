
import { Component } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd, RouterModule } from '@angular/router';
import { PageLoaderComponent } from './layout/page-loader/page-loader.component';
import {CapitalizePipe} from '../app/pipe/capitalize.pipe';
import { PermissionService } from './core/service/permission.service';
import { InternetMonitorService } from './core/service/internet-monitor.service';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-root',
    imports: [
        RouterModule,
        PageLoaderComponent,
        CapitalizePipe,
        CommonModule
    ],
    providers: [],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isOnline = true;
  currentUrl!: string;
  constructor(private InternetMonitorService: InternetMonitorService,public _router: Router,private PermissionService: PermissionService) {
    this._router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.currentUrl = routerEvent.url.substring(
          routerEvent.url.lastIndexOf('/') + 1
        );
      }
      if (routerEvent instanceof NavigationEnd) {
        /* empty */
      }
      window.scrollTo(0, 0);
    });
    this.InternetMonitorService.isOnline$.subscribe((status: boolean) => {
      this.isOnline = status;
    });
  }
  ngOnInit(): void {
    this.PermissionService.load();
  }
}
