import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule, DOCUMENT, NgClass } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,

} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfigService } from '@config';
import {
  AuthService,
  InConfiguration,
  LanguageService,
  RightSidebarService,
} from '@core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { NgScrollbar } from 'ngx-scrollbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common'; // Alternative to CommonModule for standalone
import { CurrencyService } from '../../core/service/currency.service';
import { environment } from 'environments/environment';
import { CapitalizePipe } from 'app/pipe/capitalize.pipe';
import { FormsModule } from '@angular/forms';
import { SearchableDropdownComponent } from "@shared/components/searchable-dropdown/searchable-dropdown.component";

interface Notifications {
  id: number
  notification_title: string;
  notification_tax: string;
  icon: 'mail',
  color: 'nfc-green',
  status: 'msg-unread',
  created_at: string
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    RouterLink,
    NgClass,
    MatButtonModule,
    MatMenuModule,
    NgScrollbar,
    FeatherIconsComponent,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    NgFor,
    CapitalizePipe,
    FormsModule,
    SearchableDropdownComponent,
    CommonModule
    //CurrencySelectorComponent
    ,
    //SearchableDropdownComponent
  ]


})
export class HeaderComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  private currencyService = Inject(CurrencyService);
  public config!: InConfiguration;
  userImg?: string;
  homePage?: string;
  profilePage?: string;
  loading = false;
  isNavbarCollapsed = true;
  flagvalue: string | string[] | undefined;
  countryName: string | string[] = [];
  langStoreValue?: string;
  defaultFlag?: string;
  isOpenSidebar?: boolean;
  docElement?: HTMLElement;
  isFullScreen = false;
  token: any;
  selectedGroupid: any;
  selectedHospitalid: any;
  getAllHospitalGroups: any[] = [];
  getAllHospital: any[] = [];
  getAllDispensoryHospital: any[] = [];
  selectedGroup: number | null = null; // Add this property
  selectedHospital: number | null = null; // Add this property


  hospitalSearch: string = '';
  filteredDispensoryHospitals: any[] = [];
  userRole: any;
  hospital_type: any;
  error: any;
  hospitalLogo: any;
  hospitalImage: any;
  getAllFinancialYear: any;
  dateFormat: any;
  selectedFinancialYear: any = null;
  selectedYearId: number | undefined;
  placeHolder: any;
  onFinancialYearChange(fy: any) {
    this.selectedFinancialYear = fy;
    // any other logic (emit/store)
  }
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private rightSidebarService: RightSidebarService,
    private configService: ConfigService,
    private authService: AuthService,
    private router: Router,
    public languageService: LanguageService,
  ) {
    super();
  }

  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.svg', lang: 'en' },
    { text: 'Hindi', flag: 'assets/images/flags/in.svg', lang: 'hi' },
    { text: 'Gujarati', flag: 'assets/images/flags/in.svg', lang: 'gu' },
    // { text: 'Marathi', flag: 'assets/images/flags/in.svg', lang: 'mr' },
    // { text: 'Telugu', flag: 'assets/images/flags/in.svg', lang: 'te' },
    { text: 'Spanish', flag: 'assets/images/flags/spain.svg', lang: 'es' },
    { text: 'German', flag: 'assets/images/flags/germany.svg', lang: 'de' },
    // { text: 'Arabic', flag: 'assets/images/flags/ae.svg', lang: 'ar' },
    { text: 'Japanese', flag: 'assets/images/flags/jp.svg', lang: 'ja' },
  ];
  notifications: Notifications[] = [];

  ngOnInit() {

    this.config = this.configService.configData;
    this.token = this.authService.getDecodeToken();
    this.userRole = this.token.role;
    this.placeHolder = 'Select Hospital'
    console.log("this.token", this.token);
    const userRole = this.token.role;
    this.hospital_type = this.token.hospital_type;

    this.config = this.configService.configData;
    this.token = this.authService.getDecodeToken();
    this.userRole = this.token.role;

    this.langStoreValue = localStorage.getItem('lang') || 'en';
    this.countryName = localStorage.getItem('langText') || 'English';
    this.flagvalue = localStorage.getItem('langFlag') || 'assets/images/flags/us.svg';

    // service ko set karo (translate apply hoga)
    this.languageService.setLanguage(this.langStoreValue);
    //  this.currencyService.initialize();
    if (this.token?.img) {
      this.userImg = `${environment.apiGatewayBaseUrl}/uploads/user_profile/${this.token.img}`;
    } else {
      this.userImg = 'assets/images/default-patient.png'; // fallback image
    }
    if (userRole === 'Doctor' && this.token.hospital_type === 'Dispencery') {
      console.log("anil");
    } else {
      console.log("this.token", this.token);
      const userRole = this.token.role;
      //  this.currencyService.initialize();
      if (this.token?.img) {
        this.userImg = `${environment.apiGatewayBaseUrl}/uploads/user_profile/${this.token.img}`;
      } else {
        this.userImg = 'assets/images/default-patient.png'; // fallback image
      }

    }



    this.docElement = document.documentElement;
    console.log("userRole", userRole);
    if (userRole === 'Admin') {
      this.profilePage = 'admin/profile';
      this.homePage = 'admin/dashboard/main';

    } else if (userRole === 'Patient') {
      this.profilePage = 'patient/profile';
      this.homePage = 'patient/dashboard';
    } else if (userRole === 'Doctor') {
      this.profilePage = 'doctor/profile';
      this.homePage = 'doctor/dashboard';
    } else if (userRole === 'Superuser') {
      this.profilePage = 'siteadmin/profile';
      this.homePage = 'siteadmin/dashboard';
    } else {
      this.profilePage = 'admin/profile';
      this.homePage = 'admin/dashboard/main';
    }

    this.langStoreValue = localStorage.getItem('lang') as string;
    const val = this.listLang.filter((x) => x.lang === this.langStoreValue);
    this.countryName = val.map((element) => element.text);
    if (val.length === 0) {
      if (this.flagvalue === undefined) {
        this.defaultFlag = 'assets/images/flags/us.svg';
      }
    } else {
      this.flagvalue = val.map((element) => element.flag);
    }
  }

 
  

  onDropdownOpenChange(opened: boolean) {
    if (!opened) {
      // When dropdown closes (either by selecting or clicking outside)
      this.clearSearch();
    }
  }
  clearSearch() {
    this.hospitalSearch = '';
    this.filteredDispensoryHospitals = [...this.getAllDispensoryHospital];
  }
  callFullscreen() {
    if (!this.isFullScreen) {
      if (this.docElement?.requestFullscreen != null) {
        this.docElement?.requestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
    this.isFullScreen = !this.isFullScreen;
  }
  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.langStoreValue = lang;
    localStorage.setItem('lang', lang);
    localStorage.setItem('langText', text);
    localStorage.setItem('langFlag', flag);

    this.languageService.setLanguage(lang);
  }
  mobileMenuSidebarOpen(event: Event, className: string) {
    const hasClass = (event.target as HTMLInputElement).classList.contains(
      className
    );
    if (hasClass) {
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.renderer.addClass(this.document.body, className);
    }
  }
  callSidemenuCollapse() {
    const hasClass = this.document.body.classList.contains('side-closed');
    if (hasClass) {
      this.renderer.removeClass(this.document.body, 'side-closed');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'false');
    } else {
      this.renderer.addClass(this.document.body, 'side-closed');
      this.renderer.addClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'true');
    }
  }
  profile() {
    console.log("profile");
  }
 
 
  logout() {
    this.subs.sink = this.authService.logout().subscribe((res) => {
      if (!res.success) {
        this.router.navigate(['/authentication/signin']);
      }
    });
  }
}
