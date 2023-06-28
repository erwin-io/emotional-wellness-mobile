import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/core/storage/storage.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.page.html',
  styleUrls: ['./landing-page.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LandingPagePage implements OnInit {

  constructor(
    private router: Router,
    private storageService: StorageService) {
    const user = this.storageService.getLoginUser();

    if (user) {
      // window.location.href = 'home';
      this.router.navigate(['/home'], { replaceUrl: true });
    }
   }

  ngOnInit() {
  }

  onGetStarted() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }

}
