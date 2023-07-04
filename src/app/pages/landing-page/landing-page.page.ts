import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/core/storage/storage.service';
import { SignupPage } from '../auth/signup/signup.page';
import { AnimationService } from 'src/app/core/services/animation.service';
import { ModalController } from '@ionic/angular';
import { HeartRateLog } from 'src/app/core/model/heart-rate-logs.model';
import { LoginPage } from '../auth/login/login.page';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.page.html',
  styleUrls: ['./landing-page.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LandingPagePage implements OnInit {
  isLoading = true;
  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private animationService: AnimationService,
    private storageService: StorageService) {
    const user = this.storageService.getLoginUser();

    if (user) {
      // window.location.href = 'home';
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      const hasPrevUser = localStorage.getItem('hasPrevUser');
      if(hasPrevUser === 'true') {
        this.onOpenLogin();
      }
    }
   }

  async ngOnInit() {
    if(window.history.state && window.history.state.data && window.history.state.data.register){
      window.history.state.data = null;
      await this.onOpenLogin();
    } else if(window.history.state.data && window.history.state.data.login) {
      window.history.state.data = null;
      await this.onOpenLogin();
    }
    setTimeout(()=> {
      this.isLoading = false;
    }, 1000)
  }

  onGetStarted() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  async onOpenLogin() {
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: LoginPage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: true,
      enterAnimation: this.animationService.flyUpAnimation,
      leaveAnimation: this.animationService.leaveFlyUpAnimation,
    });
    modal.onWillDismiss().then(async (res) => {
      if(res.data.register) {
        await this.onOpenSignUp();
      }
    });
    modal.present();
  }

  async onOpenSignUp() {
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: SignupPage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: true,
      enterAnimation: this.animationService.flyUpAnimation,
      leaveAnimation: this.animationService.leaveFlyUpAnimation,
    });
    modal.onWillDismiss().then(async (res: { data: HeartRateLog; role: string }) => {
      if (res.data && res.role === 'confirm') {
        await this.onOpenLogin();
      }
    });
    modal.present();
  }

}
