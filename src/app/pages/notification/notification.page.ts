/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, AlertController, ActionSheetController } from '@ionic/angular';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { Notifications } from 'src/app/core/model/notification.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';

// English.
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { forkJoin } from 'rxjs';
import * as moment from 'moment';
import { AuthService } from 'src/app/core/services/auth.service';
import { TimelinePage } from '../timeline/timeline.page';
import { JournalEntrySummary } from 'src/app/core/model/journal-entry.model';
import { HeartRateLog } from 'src/app/core/model/heart-rate-logs.model';
import { HeartRateThumbMonitorPage } from '../heart-rate-thumb-monitor/heart-rate-thumb-monitor.page';
import { AnimationService } from 'src/app/core/services/animation.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class NotificationPage implements OnInit {
  currentUser: LoginResult;
  data: Notifications[] = [];
  isLoading = false;
  error: any;
  refreshEvent: any;
  todaysSummary: JournalEntrySummary;
  lastHeartRateRecord: HeartRateLog;
  currentPage = 1;
  limit = 10;
  totalItems = 0;
  totalUnreadNotification = 0;
  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private pageLoaderService: PageLoaderService,
    private alertController: AlertController,
    private notificationService: NotificationService,
    private authService: AuthService,
    private animationService: AnimationService,
    private storageService: StorageService,
    private actionSheetCtrl: ActionSheetController) {
      this.currentUser = this.storageService.getLoginUser();
      this.initNotification(this.currentUser.userId);
      // TimeAgo.addDefaultLocale(en);
    }

  ngOnInit() {
  }
  
  get isAuthenticated() {
    const currentUser = this.storageService.getLoginUser();
    return currentUser &&
    currentUser.userId &&
    currentUser.accessToken &&
    currentUser.userId !== '' &&
    currentUser.accessToken !== '';
  }

  async initNotification(userId: string){
    this.isLoading = true;
    const result = await forkJoin([
      this.notificationService.getAllByUserIdPage({ userId, page: this.currentPage, limit: this.limit }),
      this.notificationService.getTotalUnreadByUserId({userId}),
    ]).toPromise();
    // do things
    this.data = [ ...this.data, ...result[0].data.items ];
    this.totalItems = result[0].data.meta.totalItems;
    this.totalUnreadNotification = result[1].data.total;
    this.storageService.saveTotalUnreadNotif(this.totalUnreadNotification);
    if(this.refreshEvent) {
      this.refreshEvent.target.complete();
      this.refreshEvent = null;
    }
    this.isLoading = false;
  }

  async getTimeAgo(date: Date) {
    if(!this.isLoading) {
      const timeAgo = new TimeAgo('en-US');
      return timeAgo.format(date);
    } else {
      return null;
    }
  }

  async getTotalUnreadNotif(userId: string){
    try {
      this.isLoading = true;
      this.notificationService.getTotalUnreadByUserId(userId).subscribe((res)=> {
        if(res.success){
          console.log(res.data);
          this.totalUnreadNotification = res.data.total;
          this.storageService.saveTotalUnreadNotif(this.totalUnreadNotification);
          if(this.refreshEvent) {
            this.refreshEvent.target.complete();
            this.refreshEvent = null;
          }
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.error = Array.isArray(res.message)
            ? res.message[0]
            : res.message;
          this.presentAlert(this.error);
        }
      },
      async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message)
          ? err.message[0]
          : err.message;
        this.presentAlert(this.error);
      });
    } catch (e) {
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.presentAlert(this.error);
    }
  }

  async loadMore() {
    this.currentPage = this.currentPage + 1;
    await this.initNotification(this.currentUser.userId);
  }

  async doRefresh(event: any){
    this.data = [];
    this.currentPage = 1;
    this.refreshEvent = event;
    await this.initNotification(this.currentUser.userId);
 }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }

  async markNotifAsRead(notifDetails: { notificationId: string }) {
    try{
      this.notificationService.updateReadStatus({ notificationId: notifDetails.notificationId })
        .subscribe(async res => {
          if (res.success) {
            this.data.filter(x=>x.notificationId === notifDetails.notificationId)[0].isRead = true;
            this.storageService.saveTotalUnreadNotif(res.data.total);
          } else {
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
          }
        }, async (err) => {
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
        });
    } catch (e){
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  async onOpenTimeline(notifDetails: Notifications) {
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
      componentProps: { modal, todaysSummary: this.todaysSummary, currentSelected: notifDetails.date },
    });
    modal.onWillDismiss().then(async () => {
      if(!this.data.filter(x=>x.notificationId === notifDetails.notificationId)[0].isRead) {
        await this.markNotifAsRead(notifDetails);
      }
    });
    modal.present();
  }
  
  async openHeartRate(notifDetails) {
    if(!this.isAuthenticated) {
      this.authService.logout();
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
    modal.onWillDismiss().then(async (res: { data: HeartRateLog; role: string }) => {
      if (res.data && res.role === 'confirm') {
        await this.markNotifAsRead(notifDetails);
      }
    });
    modal.present();
  }

  ionViewWillEnter(){
    console.log('visited');
    if(window.history.state && window.history.state.open && window.history.state.open){
      const details = window.history.state.open as Notifications;
      // this.openDetails(details);
    }
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
