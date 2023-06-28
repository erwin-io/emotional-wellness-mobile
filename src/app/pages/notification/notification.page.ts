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
  currentPage = 1;
  limit = 10;
  totalUnreadNotification = 0;
  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private pageLoaderService: PageLoaderService,
    private alertController: AlertController,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private actionSheetCtrl: ActionSheetController) {
      this.currentUser = this.storageService.getLoginUser();
      this.initNotification(this.currentUser.userId);
      // TimeAgo.addDefaultLocale(en);
    }

  ngOnInit() {
  }

  async initNotification(customerId: string){
    this.isLoading = true;
    const result = await forkJoin([]).toPromise();
    // do things
    this.data = [];
    this.totalUnreadNotification = 0;
    this.storageService.saveTotalUnreadNotif(this.totalUnreadNotification);
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

  async getTotalUnreadNotif(customerId: string){
    try {
      this.isLoading = true;
      this.notificationService.getTotalUnreadByCustomerId(customerId).subscribe((res)=> {
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
    if(this.refreshEvent) {
      this.refreshEvent.target.complete();
      this.refreshEvent = null;
    }
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
