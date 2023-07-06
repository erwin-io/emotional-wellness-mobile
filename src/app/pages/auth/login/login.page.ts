
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { StorageService } from '../../../core/storage/storage.service';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { LoaderService } from 'src/app/core/ui-service/loader.service';
import { UserService } from 'src/app/core/services/user.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { FcmService } from 'src/app/core/services/fcm.service';
import { MatStepper } from '@angular/material/stepper';
import { HeartRateLog } from 'src/app/core/model/heart-rate-logs.model';
import { SignupPage } from '../signup/signup.page';
import { AnimationService } from 'src/app/core/services/animation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  @ViewChild('signUpStepper') signUpStepper: MatStepper;
  isSubmitting = false;
  loginForm: FormGroup;
  // sessionTimeout;
  enableBackToHome = false;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private alertController: AlertController,
    private storageService: StorageService,
    private loaderService: LoaderService,
    private appconfig: AppConfigService,
    private fcmService: FcmService,
    private modalCtrl: ModalController,
    private animationService: AnimationService,
    private pageLoaderService: PageLoaderService,
    ) {
      // this.sessionTimeout = Number(
      //   this.appconfig.config.sessionConfig.sessionTimeout
      // );
    }
  get formData() {
    return this.loginForm.value;
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      mobileNumber: [null, [Validators.required]],
      password : [null, Validators.required]
    });
  }

  async onFormSubmit() {
    if(!this.loginForm.valid){
      return;
    }
    try{
      const params = this.formData;
      this.isSubmitting = true;
      await this.pageLoaderService.open('Signing in please wait...');
      this.authService.login(params)
        .subscribe(async res => {
          if (res.success) {

            this.storageService.saveRefreshToken(res.data.accessToken);
            this.storageService.saveAccessToken(res.data.refreshToken);
            this.storageService.saveTotalUnreadNotif(res.data.totalUnreadNotif);
            const userData: LoginResult = res.data;
            this.storageService.saveLoginUser(userData);

            let lastLoginData = this.getLastLogin();
            if(lastLoginData && lastLoginData.userId === res.data.userId && lastLoginData.date) {
              const lasLoginDate: any = new Date(lastLoginData.date);
              const today: any = new Date();
              const hoursDiff = Math.abs(lasLoginDate - today) / 36e5;
              console.log('hoursDiff', hoursDiff);
              if(hoursDiff > 23) {
                lastLoginData = {
                  userId: res.data.userId,
                  date: new Date().toString()
                };
                localStorage.setItem('lastLogin', JSON.stringify(lastLoginData));
                localStorage.setItem('showPetCompanion', 'true');
              } else {
                localStorage.setItem('showPetCompanion', 'false');
              }
            } else {
              lastLoginData = {
                userId: res.data.userId,
                date: new Date().toString()
              };
              localStorage.setItem('lastLogin', JSON.stringify(lastLoginData));
              localStorage.setItem('showPetCompanion', 'true');
            }

            if(res.data.totalUnreadNotif > 0) {
              localStorage.setItem('showPetCompanion', 'true');
            }

            this.fcmService.init();
            setTimeout(()=> {
              window.location.href = '/home';
            }, 2000);
          } else {
            await this.pageLoaderService.close();
            this.isSubmitting = false;
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
          }
        }, async (err) => {
          console.log(err);
          this.isSubmitting = false;
          await this.pageLoaderService.close();
          await this.presentAlert({
            header: 'Try again!',
            subHeader: '',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
        });
    } catch (e){
      console.log(e);
      await this.pageLoaderService.close();
      this.isSubmitting = false;
      await this.presentAlert({
        header: 'Try again!',
        subHeader: '',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  async onCreateAccount() {
    const top = await this.modalCtrl.getTop();
    if(top) {
      top.dismiss({register: true});
    }
    else {
      const navigationExtras: NavigationExtras = {
        state: {
          data: {
            register: true
          }
        }
      };
      this.router.navigate(['landing-page'], navigationExtras);
    }
  }

  getLastLogin() {
    const lastLoginJSON = localStorage.getItem('lastLogin');
    const lastLoginData = lastLoginJSON && lastLoginJSON !== '' ? JSON.parse(lastLoginJSON) : null;
    return lastLoginData;
  }


  async close() {
    const top = await this.modalCtrl.getTop();
    if(top) {
      top.dismiss(null);
    }
    else {
      this.router.navigate(['landing-page'], { replaceUrl: true });
    }
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
