/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActionSheetController, AlertController, IonModal, ModalController, Platform } from '@ionic/angular';
import { AnimationService } from 'src/app/core/services/animation.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { NotificationPage } from '../notification/notification.page';
import { TimelinePage } from '../timeline/timeline.page';
import { JournalEntrySummary } from 'src/app/core/model/journal-entry.model';
import { HeartRateLog } from 'src/app/core/model/heart-rate-logs.model';
import { HeartRateThumbMonitorPage } from '../heart-rate-thumb-monitor/heart-rate-thumb-monitor.page';
import { HeartRateLogService } from 'src/app/core/services/heart-rate-log.service';
import * as moment from 'moment';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { UserService } from 'src/app/core/services/user.service';
import { PetCompanionEnum } from 'src/app/core/enums/pet-companion.enum';
import { SwiperContainer } from 'swiper/element';

@Component({
  selector: 'app-pet-companion',
  templateUrl: './pet-companion.page.html',
  styleUrls: ['./pet-companion.page.scss']
})
export class PetCompanionPage implements OnInit, AfterViewInit {
  @ViewChild('swiperContainer') swiperContainer: ElementRef<SwiperContainer>;
  @ViewChild('editPetModal') editPetModal: IonModal;
  isSubmitting = false;
  isLoading = false;
  todaysSummary: JournalEntrySummary;
  lastHeartRateRecord: HeartRateLog;
  petProfilePicFile: any;
  isTouchingSlide = false;
  petCompanionForm: FormGroup;

  constructor(private modalCtrl: ModalController,
    private storageService: StorageService,
    private authService: AuthService,
    private pageLoaderService: PageLoaderService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private actionSheetController: ActionSheetController,
    private platform: Platform,
    private alertController: AlertController,
    private heartRateLogService: HeartRateLogService,
    private animationService: AnimationService) {
      this.isLoading = true;
      this.petCompanionForm = this.formBuilder.group({
        petCompanionId: ['1', [Validators.required]],
      });
     }

  get user() {
    return this.storageService.getLoginUser();
  }

  get totalUnreadNotification() {
    const total = this.storageService.getTotalUnreadNotif();
    return total? total : 0;
  }
  
  get isAuthenticated() {
    const currentUser = this.storageService.getLoginUser();
    return currentUser &&
    currentUser.userId &&
    currentUser.accessToken &&
    currentUser.userId !== '' &&
    currentUser.accessToken !== '';
  }

  ngOnInit() {
    this.isLoading = false;
  }

  ngAfterViewInit(): void {
  }
  

  getPetCompanionProfile(petCompanionId) {
    if(petCompanionId === '2') {
      return '../../../assets/img/pet_companion_cat_animated.gif';
    } else if(petCompanionId === '3') {
      return '../../../assets/img/pet_companion_bird_animated.png';
    } else {
      return '../../../assets/img/pet_companion_dog_animated.gif';
    }
  }

  setSelected(petCompanionId) {
    let index = 0;
    if(petCompanionId === PetCompanionEnum.CAT.toString()) {
      index = 1;
    } else if(petCompanionId === PetCompanionEnum.BIRD.toString()) {
      index = 2;
    } else {
      index = 0;
    }
    this.swiperContainer.nativeElement.swiper.slideTo(index);
    this.isLoading = false;
  }

  activeIndexChange(event) {
    const activeIndex = event.detail[0].activeIndex;
    if(activeIndex === 1) {
      this.petCompanionForm.controls.petCompanionId.setValue(PetCompanionEnum.CAT.toString());
    } else if(activeIndex === 2) {
      this.petCompanionForm.controls.petCompanionId.setValue(PetCompanionEnum.BIRD.toString());
    } else {
      this.petCompanionForm.controls.petCompanionId.setValue(PetCompanionEnum.DOG.toString());
    }
    console.log('activeIndex', activeIndex);
  }

  async onSubmitUpdatePetCompanion() {
    const params = {
      ...this.petCompanionForm.value,
      userId: this.user.userId
    };
    await this.updatePetCompanion(params);
    // try {
    //   await this.presentAlert({
    //     header: 'Update Pet Companion?',
    //     buttons: [
    //       {
    //         text: 'CANCEL',
    //         role: 'cancel',
    //       },
    //       {
    //         text: 'YES',
    //         role: 'confirm',
    //         handler: () => {
    //           this.updatePetCompanion(params);
    //         },
    //       },
    //     ],
    //   });
    // }
    // catch(ex) {
    //   this.isSubmitting = false;
    //   await this.pageLoaderService.close();
    //   await this.presentAlert({
    //     header: 'Try again!',
    //     message: Array.isArray(ex.message) ? ex.message[0] : ex.message,
    //     buttons: ['OK'],
    //   });
    // }
  }

  async updatePetCompanion(params) {
    try {
      await this.pageLoaderService.open('Saving...');
      this.isSubmitting = true;
      this.userService.updatePetCompanion(params).subscribe(
        async (res) => {
          if (res.success) {
            await this.pageLoaderService.close();
            this.isSubmitting = false;
            const user = this.user;
            user.petCompanion = res.data.petCompanion;
            this.storageService.saveLoginUser(user);
            this.modalCtrl.dismiss(res.data, 'confirm');
          } else {
            this.isSubmitting = false;
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message)
                ? res.message[0]
                : res.message,
              buttons: ['OK'],
            });
          }
        },
        async (err) => {
          this.isSubmitting = false;
          await this.pageLoaderService.close();
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK'],
          });
        }
      );
    } catch (e) {
      this.isSubmitting = false;
      await this.pageLoaderService.close();
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK'],
      });
    }
  }


  async onShowNotif() {

    if(!this.isAuthenticated) {
      this.authService.logout();
    }
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: NotificationPage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: true,
      enterAnimation: this.animationService.pushLeftAnimation,
      leaveAnimation: this.animationService.leavePushLeftAnimation,
      componentProps: { modal, todaysSummary: this.todaysSummary, lastHeartRateRecord: { heartRateLogId: this.todaysSummary.lastHeartRateLogId, value: this.todaysSummary.heartRate, timestamp: this.todaysSummary.timestamp } },
    });
    modal.present();
  }

  async onOpenTimeline() {
    if(!this.isAuthenticated) {
      this.authService.logout();
    }
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: TimelinePage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: true,
      mode: "ios",
      componentProps: { modal, todaysSummary: this.todaysSummary },
    });
    modal.present();
  }
  
  async openHeartRate() {
    if(!this.lastHeartRateRecord || !this.lastHeartRateRecord.value) {
      await this.pageLoaderService.open('Checking please wait...');
      const res = await this.heartRateLogService.findByDate({
        dateFrom: moment(new Date(new Date().setDate(new Date().getDate() - 4))).format("YYYY-MM-DD"),
        dateTo: moment(new Date()).format("YYYY-MM-DD")
       }).toPromise();
       await this.pageLoaderService.close();
      this.lastHeartRateRecord = res.data[0];
    }
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: HeartRateThumbMonitorPage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: true,
      enterAnimation: this.animationService.pushLeftAnimation,
      leaveAnimation: this.animationService.leavePushLeftAnimation,
      componentProps: { modal, lastRecord: this.lastHeartRateRecord },
    });
    modal.onWillDismiss().then((res: any) => {
      if (res.data && res.role === 'confirm') {
        this.lastHeartRateRecord = res.data;
      }
    });
    modal.present();
  }

  profilePicErrorHandler(event, type?) {
    if(!type || type === undefined) {
      event.target.src = '../../../assets/img/profile-not-found.png';
    } else if(type === "pet") {
      event.target.src = '../../../assets/img/pet-default.png';
    } else {
      event.target.src = '../../../assets/img/profile-not-found.png';
    }
  }

  close() {
    localStorage.setItem('showPetCompanion', 'false');
    this.modalCtrl.dismiss({lastHeartRateRecord: this.lastHeartRateRecord}, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }
}
