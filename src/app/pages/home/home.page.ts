/* eslint-disable no-bitwise */
/* eslint-disable eqeqeq */
/* eslint-disable no-trailing-spaces */
/* eslint-disable one-var */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable prefer-const */
/* eslint-disable no-underscore-dangle */
/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
import { App } from '@capacitor/app';
import { AfterViewInit, Component, EventEmitter, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, ModalController, AlertController, AnimationController, IonModal, Platform } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { Notifications } from 'src/app/core/model/notification.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { SettingsPage } from '../settings/settings.page';
import { JournalEntry, JournalEntrySummary, JournalEntryWeeklySummary } from 'src/app/core/model/journal-entry.model';
import { JournalEntryService } from 'src/app/core/services/journal-entry.service';
import * as moment from 'moment';
import { DateConstant } from 'src/app/core/constant/date.constant';
import { LoginResult } from 'src/app/core/model/loginresult.model';

import type { EChartsOption } from 'echarts';
import { MoodEntityEnum } from 'src/app/core/enums/mood-entity.enum';
import { NotificationPage } from '../notification/notification.page';
import { TimelinePage } from '../timeline/timeline.page';
import { AnimationService } from 'src/app/core/services/animation.service';
import { AnimationEnum } from 'src/app/core/enums/animation.enum';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { NewJournalPage } from '../new-journal/new-journal.page';
import { HeartRateLogService } from 'src/app/core/services/heart-rate-log.service';
import { HeartRateLog } from 'src/app/core/model/heart-rate-logs.model';
import { HeartRateThumbMonitorPage } from '../heart-rate-thumb-monitor/heart-rate-thumb-monitor.page';
import { environment } from 'src/environments/environment';
import { PetCompanionPage } from '../pet-companion/pet-companion.page';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  isLoading = false;
  refreshEvent: any;
  currentUser: LoginResult;
  todaysSummary: JournalEntrySummary;
  yesterdaysSummary: JournalEntrySummary;
  currentWeek: JournalEntryWeeklySummary;
  heartRatePast5Days: HeartRateLog[];
  selected: { name: string; moodPercent: number } = { name: "Okay", moodPercent: 0 };
  selectedHeartRate: { date: Date; value: number } = { } as any;

  options: EChartsOption;
  heartRateChartOptions: EChartsOption;
  recommendation: any[] = [];

  @ViewChild("moodModal") moodModal: IonModal;
  constructor(
    private platform: Platform,
    private router: Router,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private actionSheetController: ActionSheetController,
    private journalEntryService: JournalEntryService,
    private heartRateLogService: HeartRateLogService,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private alertController: AlertController,
    private animationService: AnimationService,
    private appConfigService: AppConfigService,
  ) {
    this.currentUser = this.storageService.getLoginUser();


    if(this.isAuthenticated) {
      this.initDashboard();
    }
  }

  get env() {
    return environment.production ? 'PROD' : 'DEV';
  }
  
  get isAuthenticated() {
    const currentUser = this.storageService.getLoginUser();
    return currentUser &&
    currentUser.userId &&
    currentUser.accessToken &&
    currentUser.userId !== '' &&
    currentUser.accessToken !== '';
  }

  get user() {
    return this.storageService.getLoginUser();
  }

  get totalUnreadNotification() {
    const total = this.storageService.getTotalUnreadNotif();
    return total && !isNaN(Number(total)) ? Number(total) : 0;
  }

  getPetCompanionProfile(petCompanionId) {
    if(petCompanionId === '2') {
      return '../../../assets/img/pet_companion_cat_profile.png';
    } else if(petCompanionId === '3') {
      return '../../../assets/img/pet_companion_bird_profile.png';
    } else {
      return '../../../assets/img/pet_companion_dog_profile.png';
    }
  }

  async initDashboard(){

    this.isLoading = true;
    forkJoin(
      this.journalEntryService.getDateSummary({
        date: moment(new Date()).format("YYYY-MM-DD")
      }),
      this.journalEntryService.getDateSummary({
        date: moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD")
      }),
      this.journalEntryService.getWeeklySummary({
        date: moment(new Date()).format("YYYY-MM-DD")
      }),
      this.heartRateLogService.findByDate({
        dateFrom: moment(new Date(new Date().setDate(new Date().getDate() - 4))).format("YYYY-MM-DD"),
        dateTo: moment(new Date()).format("YYYY-MM-DD")
      }),
      this.notificationService.getTotalUnreadByUserId({userId: this.currentUser.userId})
  ).subscribe(
      async ([todaysSummary, yesterdaysSummary, getWeeklySummary, heartRate, getTotalUnreadByUserId]) => {
        
        this.storageService.saveTotalUnreadNotif(getTotalUnreadByUserId.data.total);

        this.todaysSummary = todaysSummary && todaysSummary.data ? todaysSummary.data : null;
        this.yesterdaysSummary = yesterdaysSummary && yesterdaysSummary.data ? yesterdaysSummary.data : null;
        this.currentWeek = getWeeklySummary && getWeeklySummary.data ? getWeeklySummary.data : null;

        this.currentWeek.result = this.currentWeek.result.every(x=> x.count <= 0) ? this.currentWeek.result.map(x=> {
          if(x.moodEntityId === this.currentWeek.moodEntityId) {
            x.count = 1;
          }
          return x;
        }) : this.currentWeek.result;

        const recommendation: { moodEntityId: number; value: string }[] = this.shuffle(this.appConfigService.config.recommendation);
        this.recommendation = recommendation.filter(x=>x.moodEntityId === Number(this.currentWeek.moodEntityId)).map(x=> {
          const backgroundColor = this.generateRandomColor();
          const brightness = this.getBrightness(this.hexToRgb(backgroundColor));
          const lightText = ((255 * 299) + (255 * 587) + (255 * 114)) / 1000;
          const darkText = ((0 * 299) + (0 * 587) + (0 * 114)) / 1000;
          let color = "rgb(0, 0, 0)";
          if(Math.abs(brightness - lightText) > Math.abs(brightness - darkText)){
            color = "rgb(255, 255, 255)";
          } else {
            color = "rgb(0, 0, 0)";
          }
          return { value: x.value, style: "background-color: " + backgroundColor + ";color: " + color + ";"};
        });
        const showPetCompanionJSON = localStorage.getItem('showPetCompanion');
        const showPetCompanion = showPetCompanionJSON && showPetCompanionJSON !== "" ? JSON.parse(showPetCompanionJSON) : false;
        if(showPetCompanion) {
          await this.onShowPetCompanion();
        } else if(this.totalUnreadNotification > 0) {
          await this.onShowPetCompanion();
        }
        this.options = {
          calculable: false,
          series: [
            {
              name: 'Series 1',
              type: "pie",
              roseType: "radius",
              radius: [
                "50%",
                "90%"
              ],
              avoidLabelOverlap: true,
              stillShowZeroSum: false,
              animationType: "expansion",
              clockwise: true,
              label: {
                show: false,
              },
              data: this.currentWeek.result.map((x, i)=> {
                let backgroundColor = null;
                let name = null;
                if(x.moodEntityId === MoodEntityEnum.AMAZING.toString()) {
                  backgroundColor = "#1DE9B6";
                  name = "Amazing";
                } else if(x.moodEntityId === MoodEntityEnum.FEELING_HAPPY.toString()) {
                  backgroundColor = "#00897B";
                  name = "Happy";
                } else if(x.moodEntityId === MoodEntityEnum.I_AM_GOOD.toString()) {
                  backgroundColor = "#0091EA";
                  name = "Good";
                } else if(x.moodEntityId === MoodEntityEnum.FEELING_SAD.toString()) {
                  backgroundColor = "#F57F17";
                  name = "Sad";
                } else {
                  backgroundColor = "#E57373";
                  name = "Angry";
                } 
                this.currentWeek.result[i].name = name;
                return { 
                  value: x.count, 
                  itemStyle: { 
                    borderColor: "#fff",
                    borderWidth: 10, 
                    borderType: "solid",
                    borderCap: "square",
                    color: backgroundColor
                  }, 
                  label: {
                    show: false,
                    name
                  },
                  selected: this.currentWeek.moodEntityId === x.moodEntityId 
                };
              })
            },
          
          ],
        };
        const heartRateDates = this.getPastDates(
          moment(new Date(new Date().setDate(new Date().getDate() - 4))).format("YYYY-MM-DD"),
          moment(new Date()).format("YYYY-MM-DD"));
          console.log(heartRateDates);
        this.heartRatePast5Days = [];
        heartRateDates.map(x=> moment(x.date).format("YYYY-MM-DD")).forEach(x=> {
          const _hr = heartRate.data.find(h => moment(h.timestamp).format("YYYY-MM-DD") === moment(x).format("YYYY-MM-DD"));
          if(_hr) {
            this.heartRatePast5Days.push({
              value: _hr.value,
              timestamp: moment(_hr.timestamp).format("DD MMM hh:mm a")
            } as any);
          } else {
            this.heartRatePast5Days.push({
              value: "0",
              timestamp: moment(x).format("DD MMM")
            } as any);
          }
        });
        this.heartRateChartOptions =  {
          title: {
            show: false
          },
          tooltip: {
            show: false,
          },
          grid: {
            left: '0%',
            right: '7%',
            bottom: '0%',
            containLabel: true,
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: heartRateDates.map(x=> {
                return moment(x.date).format("ddd");
              }),
            },
          ],
          yAxis: [
            {
              type: 'value',
              splitLine: {
                show: false
              },
            },
          ],
          series: [
            {
              name: 'Heart rate',
              type: 'line',
              stack: 'counts',
              areaStyle: {},
              data: this.heartRatePast5Days.map(x=> {
                return x.value;
              }),
            },
          ],
        };
      },
      (error) => console.error(error),
      () => {
        this.isLoading = false;
      }
  );
  }

  ngOnInit() {
  }
    
  
  async onShowSettings() {

    if(!this.isAuthenticated) {
      this.authService.logout();
    }
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: SettingsPage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: true,
      enterAnimation: this.animationService.pushRightAnimation,
      leaveAnimation: this.animationService.leavePushRightAnimation,
      componentProps: { modal },
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
      componentProps: { modal, todaysSummary: this.todaysSummary, newEntryAdded: new EventEmitter<any>() },
    });
    await modal.present();
    modal.componentProps.newEntryAdded.subscribe(async (res)=> {
      await this.initDashboard();
    });
  }

  async onOpenNewJournal() {
    if(!this.isAuthenticated) {
      this.authService.logout();
    }
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: NewJournalPage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: true,
      mode: "ios",
      componentProps: { 
        modal, 
        newEntryAdded: new EventEmitter<any>(),
        lastHeartRateRecord: { 
          heartRateLogId: this.todaysSummary.lastHeartRateLogId, 
          value: this.todaysSummary.heartRate, 
          timestamp: this.todaysSummary.timestamp 
        } 
      },
    });
    await modal.present();
    modal.componentProps.newEntryAdded.subscribe(async (res)=> {
      await this.initDashboard();
    });
  
  }

  async onChartClick(event) {
    const { name } = event && event.data && event.data.label ? event.data.label : null;
    const checkSelected = this.currentWeek.result.find(x=>x.name.toString().trim().toLowerCase() === name.toString().trim().toLowerCase());
    if(checkSelected) {
      this.selected = { name: checkSelected.name, moodPercent: checkSelected.moodPercent };
      this.moodModal.present();
    }
  }

  async onHeartRateChartClick(event, modal: IonModal) {
    const { value } = event;
    const checkSelected = this.heartRatePast5Days.find(x=>x.value.toString().trim() === value.toString().trim());
    if(checkSelected) {
      this.selectedHeartRate = { date : checkSelected.timestamp, value: Number(value) };
      modal.present();
    }
  }
  
  async openHeartRate() {
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: HeartRateThumbMonitorPage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: true,
      enterAnimation: this.animationService.pushLeftAnimation,
      leaveAnimation: this.animationService.leavePushLeftAnimation,
      componentProps: { modal, lastRecord: { heartRateLogId: this.todaysSummary.lastHeartRateLogId, value: this.todaysSummary.heartRate, timestamp: this.todaysSummary.timestamp } },
    });
    modal.onWillDismiss().then((res: { data: HeartRateLog; role: string }) => {
      if (res.data && res.role === 'confirm') {
      }
    });
    modal.present();
  }
  
  async onShowPetCompanion() {

    if(!this.isAuthenticated) {
      this.authService.logout();
    }
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: PetCompanionPage,
      cssClass: ['transaparent','modal-fullscreen'],
      backdropDismiss: false,
      canDismiss: true,
      enterAnimation: this.animationService.flyUpAnimation,
      leaveAnimation: this.animationService.leaveFlyUpAnimation,
      componentProps: { 
        modal,
        todaysSummary: this.todaysSummary, 
        lastHeartRateRecord: { heartRateLogId: this.todaysSummary.lastHeartRateLogId, value: this.todaysSummary.heartRate, timestamp: this.todaysSummary.timestamp },

       },
    });
    modal.present();
  }

  ionViewWillEnter() {
    console.log('visited');
  }

  async doRefresh(event: any){
    try {
      this.refreshEvent = event;
      await this.initDashboard().finally(()=> {
  
        if(this.refreshEvent) {
          this.refreshEvent.target.complete();
          this.refreshEvent = null;
        }
      });
    }catch(ex) {
      await this.presentAlert({
        header: 'Try again!',
        message: 'Error loading',
        buttons: ['OK']
      });
    }
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

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
  
  hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  generateRandomColor() {
    var color = Math.floor(0x1000000 * Math.random()).toString(16);
    return '#' + ('000000' + color).slice(-6);
  }

  getBrightness({ r, g, b}) {
    return (((r * 299) + (g * 587) + (b * 114)) / 1000);
  }

  shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

  getPastDates(dateFrom,dateTo) {
    let dates: { date: Date }[]= [];
    let currentDate;
    for(dates = [], currentDate=new Date(dateFrom);currentDate<=new Date(dateTo);currentDate.setDate(currentDate.getDate()+1)) { 
      dates.push({date: new Date(currentDate)});
    }
    return dates;
  }
}
