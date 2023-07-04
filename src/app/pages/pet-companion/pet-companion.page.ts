/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { PetService } from 'src/app/core/services/pet.service';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';

@Component({
  selector: 'app-pet-companion',
  templateUrl: './pet-companion.page.html',
  styleUrls: ['./pet-companion.page.scss']
})
export class PetCompanionPage implements OnInit, AfterViewInit {
  isSubmitting = false;
  editPetForm: FormGroup;
  todaysSummary: JournalEntrySummary;
  lastHeartRateRecord: HeartRateLog;
  petProfilePicFile: any;

  constructor(private modalCtrl: ModalController,
    private storageService: StorageService,
    private authService: AuthService,
    private pageLoaderService: PageLoaderService,
    private petService: PetService,
    private formBuilder: FormBuilder,
    private actionSheetController: ActionSheetController,
    private platform: Platform,
    private alertController: AlertController,
    private heartRateLogService: HeartRateLogService,
    private animationService: AnimationService) { }

  get isFormDirty() {
    return this.editPetForm.dirty;
  }

  get errorControls() {
    return this.editPetForm.controls;
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
    this.editPetForm = this.formBuilder.group({
      petName : [this.user.pet.name, Validators.required],
    });
  }

  ngAfterViewInit(): void {
    this.petProfilePicFile = {
      url: this.user.pet.profilePicFile
    }
  }
  

  async onChangeProfilePic() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'sched-card-action-sheet',
      buttons: [
        {
          text: 'Camera',
          handler: async () => {
            const image = await Camera.getPhoto({
              quality: 90,
              allowEditing: false,
              resultType: CameraResultType.Uri,
              source: CameraSource.Camera, // Camera, Photos or Prompt!
            });
            if (image) {
              const dataURL = await this.readAsBase64(image);
              this.petProfilePicFile = {
                fileName: `pet-profile.${image.format}`,
                data: dataURL.split(',')[1],
                url: dataURL,
              };
            }
            actionSheet.dismiss();
          },
        },
        {
          text: 'Gallery',
          handler: async () => {
            const image = await Camera.getPhoto({
              quality: 90,
              allowEditing: false,
              resultType: CameraResultType.Uri,
              source: CameraSource.Photos, // Camera, Photos or Prompt!
            });
            if (image) {
              const dataURL = await this.readAsBase64(image);
              this.petProfilePicFile = {
                fileName: `pet-profile.${image.format}`,
                data: dataURL.split(',')[1],
                url: dataURL,
              };
            }
            actionSheet.dismiss();
          },
        },
        {
          text: 'Cancel',
          handler: async () => {
            actionSheet.dismiss();
          },
        },
      ],
    });
    await actionSheet.present();

  }
  
  async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path,
      });

      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      const base64 = (await this.convertBlobToBase64(blob)) as string;
      return base64;
    }
  }
  // eslint-disable-next-line @typescript-eslint/member-ordering
  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  async onSubmitEditPet() {
    const params = {
      petProfilePic: this.petProfilePicFile.data ? this.petProfilePicFile : null,
      ...this.editPetForm.value
    };
    if (!this.editPetForm.valid) {
      return;
    }
    try {
      await this.presentAlert({
        header: 'Update pet?',
        buttons: [
          {
            text: 'CANCEL',
            role: 'cancel',
          },
          {
            text: 'YES',
            role: 'confirm',
            handler: () => {
              this.savePet(params);
            },
          },
        ],
      });
    }
    catch(ex) {
      this.isSubmitting = false;
      await this.pageLoaderService.close();
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(ex.message) ? ex.message[0] : ex.message,
        buttons: ['OK'],
      });
    }
  }

  async savePet(params) {
    try {
      await this.pageLoaderService.open('Saving...');
      this.isSubmitting = true;
      this.petService.update(params).subscribe(
        async (res) => {
          if (res.success) {
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Saved!',
              buttons: ['OK'],
            });
            this.isSubmitting = false;
            const user = this.user;
            user.pet = {
              name: res.data.name,
              profilePicFile: this.petProfilePicFile.url
            };
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
    this.modalCtrl.dismiss({lastHeartRateRecord: this.lastHeartRateRecord}, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }
}
