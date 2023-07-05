/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { MyErrorStateMatcher } from 'src/app/core/form-validation/error-state.matcher';
import { HeartRateLog } from 'src/app/core/model/heart-rate-logs.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import { LoginPage } from '../login/login.page';
import { AnimationService } from 'src/app/core/services/animation.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  @ViewChild('signUpStepper') signUpStepper: MatStepper;
  isSubmitting = false;
  mobileNumberForm: FormGroup;
  otpForm: FormGroup;
  authForm: FormGroup;
  personalDetailsForm: FormGroup;
  petForm: FormGroup;
  defaultDate = new Date();
  matcher = new MyErrorStateMatcher();
  isProcessed = false;

  otpSent = false;
  constructor(private modalCtrl: ModalController,
    private appconfig: AppConfigService,
    private authService: AuthService,
    private animationService: AnimationService,
    private router: Router,
    private pageLoaderService: PageLoaderService,
    private formBuilder: FormBuilder,
    private alertController: AlertController) {
      this.mobileNumberForm = this.formBuilder.group({
        mobileNumber: [null, [Validators.required,Validators.minLength(11),Validators.maxLength(11)]],
      });
      this.otpForm = this.formBuilder.group({
        otp: [null, [Validators.required,Validators.minLength(6),Validators.maxLength(6)]],
      });
      this.authForm = this.formBuilder.group({
        password: [null, [Validators.required,Validators.minLength(3),Validators.maxLength(16)]],
        confirmPassword : '',
      }, 
      { validators: this.checkPasswords });
      this.personalDetailsForm = this.formBuilder.group({
        name : [null, [Validators.required, Validators.minLength(2)]],
        birthDate : [this.defaultDate.toISOString(), Validators.required],
        genderId : [null, Validators.required],
      });
      this.petForm = this.formBuilder.group({
        petName: [null, [Validators.required,Validators.minLength(1)]],
      });
     }

  ngOnInit() {
  }

  checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  };

  async registerNumber() {
    if(!this.mobileNumberForm.valid) {
      return;
    }
    if(this.appconfig.config.auth.requireOTP === true) {
      this.signUpStepper.next();
    } else {
      this.signUpStepper.selectedIndex = 2;
    }
    this.otpSent = true;
  }

  async verifyNumber() {
    if(!this.otpForm.valid) {
      return;
    }
    this.signUpStepper.next();
  }

  async resendOTP() {
    this.otpForm.reset();
    this.otpSent = false;
  }

  async savePassword() {
    if(!this.authForm.valid && this.authForm.value.password !== this.authForm.value.confirmPass) {
      return;
    }
    this.signUpStepper.next();
  }

  async savePersonalDetails() {
    if(!this.personalDetailsForm.valid) {
      return;
    }
    this.signUpStepper.next();
  }

  async savePet() {
    if(!this.petForm.valid) {
      return;
    }
    this.signUpStepper.next();
  }

  async submit() {
    const param  = {
      ...this.mobileNumberForm.value,
      ...this.authForm.value,
      ...this.personalDetailsForm.value,
      pet: {
        ...this.petForm.value
      },
    }
    await this.onFormSubmit(param);
  }

  async onFormSubmit(param) {
    try{
      this.isSubmitting = true;
      await this.pageLoaderService.open('Processing please wait...');
      this.authService.register(param)
        .subscribe(async res => {
          if (res.success) {
            console.log(res.data);
            this.signUpStepper.next();
            await this.pageLoaderService.close();
            this.isSubmitting = false;
            this.isProcessed = true;
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
          await this.pageLoaderService.close();
          this.isSubmitting = false;
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
        });
    } catch (e){
      await this.pageLoaderService.close();
      this.isSubmitting = false;
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }

  close() {
    if(this.signUpStepper.selectedIndex > 0) {
      if(this.signUpStepper.selectedIndex === 2) {
        this.signUpStepper.selectedIndex = 0;
      } else {
        this.signUpStepper.previous();
      }
    } else {
      this.modalCtrl.dismiss(null, 'cancel');
    }
  }

  async login() {
    this.modalCtrl.dismiss();
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: LoginPage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: true,
      enterAnimation: this.animationService.flyUpAnimation,
      leaveAnimation: this.animationService.leaveFlyUpAnimation,
    });
    modal.onWillDismiss().then((res: { data: HeartRateLog; role: string }) => {
      this.modalCtrl.dismiss();
    });
    modal.present();
  }

}
