/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AlertController, IonModal, ModalController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { DateConstant } from 'src/app/core/constant/date.constant';
import { JournalEntry, JournalEntrySummary } from 'src/app/core/model/journal-entry.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { JournalEntryService } from 'src/app/core/services/journal-entry.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { NewJournalPage } from '../new-journal/new-journal.page';
import { JournalDetailsPage } from '../journal-details/journal-details.page';
import { AnimationService } from 'src/app/core/services/animation.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.page.html',
  styleUrls: ['./timeline.page.scss'],
})
export class TimelinePage implements OnInit {
  isLoading = false;
  currentSelected = new Date();
  maxDatePicker = new Date(new Date().setDate(new Date().getDate() + 1));
  weeks: {date: Date; moodEntityId: any; isCurrent(date: Date): boolean; enabled(date: Date): boolean;}[] = [];
  selectDateCtrl = new FormControl(null);
  data: JournalEntry[] = [];
  selectedDetails: JournalEntry;
  todaysSummary: JournalEntrySummary;
  animation: {
    enterAnimation,
    leaveAnimation
  } = {} as any;
  @ViewChild("journalDetailsModal") journalDetailsModal: IonModal;
  @ViewChild("journalDetails") journalDetails: ElementRef<JournalDetailsPage>;
  refreshEvent: any;
  @Output() newEntryAdded = new EventEmitter<any>();
  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private journalEntryService: JournalEntryService,
    private authService: AuthService,
    private animationService: AnimationService,
    private alertController: AlertController,
    private storageService: StorageService) {
      this.generateWeeks(this.currentSelected);
      console.log(this.weeks);
      this.animation.enterAnimation = this.animationService.flyUpAnimation;
      this.animation.leaveAnimation = this.animationService.leaveFlyUpAnimation;
     }
     
  

  get isAuthenticated() {
    const currentUser = this.storageService.getLoginUser();
    return currentUser &&
    currentUser.userId &&
    currentUser.accessToken &&
    currentUser.userId !== '' &&
    currentUser.accessToken !== '';
  }

  async ngOnInit() {
    await this.loadData();
    this.selectDateCtrl.valueChanges.subscribe(async res=> {
      await this.selectDate(this.currentSelected);
    })
  }

  async prevDate(){
    const currentDate = this.currentSelected;
    const newDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
    this.currentSelected = newDate;
    this.generateWeeks(newDate);
    await this.loadData();
  }

  async nextDate(){
    const currentDate = this.currentSelected;
    const newDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    this.currentSelected = newDate;
    this.generateWeeks(newDate);
    await this.loadData();
  }

  async selectDate(date: Date) {
    this.currentSelected = date;
    this.generateWeeks(date);
    await this.loadData();
  }

  get isNextEnable() {
    const today = new Date(moment(new Date()).format("YYYY-MM-DD"));
    const current = new Date(moment(this.currentSelected).format("YYYY-MM-DD"));
    const enabled = today > current;
    return enabled;
  }


  generateWeeks(date: Date) {
    this.weeks = Array(7).fill(moment(date).format("YYYY-MM-DD")).map((el, idx) => {
      const date = moment(new Date(new Date(el).setDate(new Date(el).getDate() - new Date(el).getDay() + idx))).format("YYYY-MM-DD");
      return {
        date: new Date(date),
        moodEntityId: null,
        isCurrent: (d: Date)=> {
          return moment(d).format("YYYY-MM-DD") === moment(this.currentSelected).format("YYYY-MM-DD");
        },
        enabled: (d: Date) => {
          const today = new Date(moment(new Date()).format("YYYY-MM-DD"));
          const current = new Date(moment(d).format("YYYY-MM-DD"));
          const enabled = today >= current && moment(d).format("YYYY-MM-DD") !== moment(this.currentSelected).format("YYYY-MM-DD");
          return enabled;
        }
      }
    })
  }

  async loadData() {
    this.isLoading = true;
    const result: any = await forkJoin(
      this.journalEntryService.getWeekly({
        date: moment(this.currentSelected).format("YYYY-MM-DD")
      }),
      this.journalEntryService.findByDate({
        dateFrom: moment(this.currentSelected).format("YYYY-MM-DD"),
        dateTo: moment(this.currentSelected).format("YYYY-MM-DD"),
      })
    ).toPromise();
    if(result[0].data) {
      for (let i = 0; i < result[0].data.length; i++) {
        const moodEntityId = result[0].data[i].moodEntityId;
        const date = moment(result[0].data[i].timestamp).format("YYYY-MM-DD");
        const getIndex = this.weeks.findIndex(x=> moment(x.date).format("YYYY-MM-DD") === date);
        if(getIndex >= 0) {

          this.weeks[getIndex].moodEntityId = moodEntityId;
        }
      }
    }
    if(result[1].data) {
      this.data = result[1].data;
    }
    this.isLoading = false;
  }

  async doRefresh(event: any){
    try {
      this.refreshEvent = event;
      
      await this.loadData().finally(()=> {
  
        if(this.refreshEvent) {
          this.refreshEvent.target.complete();
          this.refreshEvent = null;
        }
      })
    }catch(ex) {
      await this.presentAlert({
        header: 'Try again!',
        message: 'Error loading timeline',
        buttons: ['OK']
      });
    }
  }

  async newJournal() {
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
    modal.onWillDismiss().then(async (res: { data: JournalEntry; role: string }) => {
      if (res.data && res.role === 'confirm') {
        await this.selectDate(new Date());
      }
    });
    await modal.present();
    modal.componentProps.newEntryAdded.subscribe((res)=> {
      this.newEntryAdded.emit(res);
    });
  }

  async openDetails(details) {
    console.log(details)
    
    if(!this.isAuthenticated) {
      this.authService.logout();
    }
    this.selectedDetails = details;
    this.journalDetailsModal.present();
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
