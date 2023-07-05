/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/quotes */
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AlertController, IonModal, ModalController } from '@ionic/angular';
import { EmojiFaceSliderComponent } from 'src/app/component/emoji-face-slider/emoji-face-slider.component';
import { JournalEntryService } from 'src/app/core/services/journal-entry.service';
import { MoodSentimentService } from 'src/app/core/services/mood-sentiment.service';
import { HeartRateThumbMonitorPage } from '../heart-rate-thumb-monitor/heart-rate-thumb-monitor.page';
import { AnimationService } from 'src/app/core/services/animation.service';
import { HeartRateLog } from 'src/app/core/model/heart-rate-logs.model';
import * as moment from 'moment';
import { DateConstant } from 'src/app/core/constant/date.constant';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';

@Component({
  selector: 'app-new-journal',
  templateUrl: './new-journal.page.html',
  styleUrls: ['./new-journal.page.scss'],
})
export class NewJournalPage implements OnInit {
  isProcessing = false;
  noteModalScrollEnable = false;
  @Output() newEntryAdded = new EventEmitter<any>();
  constructor(private modalCtrl: ModalController,
    private journalEntryService: JournalEntryService,
    private moodSentimentService: MoodSentimentService,
    private animationService: AnimationService,
    private alertController: AlertController,
    private pageLoaderService: PageLoaderService,) { }
  notesCtrl = new FormControl(null, [Validators.required]);
  notes = "";
  moodEntityId = "";
  lastHeartRateRecord: HeartRateLog;

  isSubmitting = false;

  get isValid() {
    return this.notesCtrl.valid && 
    this.moodEntityId && 
    this.moodEntityId !== '' && 
    this.lastHeartRateRecord && 
    this.lastHeartRateRecord.heartRateLogId !=='' &&
    Number(this.lastHeartRateRecord.heartRateLogId) > 0;
  }

  @ViewChild(EmojiFaceSliderComponent) emojiFaceSlider: EmojiFaceSliderComponent;
  ngOnInit() {
  }

  openNotes(notesModal: IonModal) {
    notesModal.present();
    this.notesCtrl.setValue(this.notes);
  }

  async confirmNotes() {
    try {
      this.isProcessing = true;
      await this.pageLoaderService.open('Checking your mood, please wait...');
      this.notes = this.notesCtrl.value;
      const result = await this.moodSentimentService.getSentimentAnalysis({ text: this.notes}).toPromise();
      if(result.data && result.data.moodEntityId) {
        this.moodEntityId = result.data.moodEntityId;
        this.emojiFaceSlider.setSelected(this.moodEntityId);
      }
      this.isProcessing = false;
      await this.pageLoaderService.close();
      await this.modalCtrl.dismiss(null, 'cancel');
    }
    catch (ex) {
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(ex.message) ? ex.message[0] : ex.message,
        buttons: ['OK']
      });
    }
  }


  async saveJournal(){
    const params = {
      notes: this.notes,
      moodEntityId: this.moodEntityId,
      timestamp: {
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        date: new Date()
      },
      heartRateLogId: this.lastHeartRateRecord.heartRateLogId
    };
    console.log(params);
    try{
      await this.pageLoaderService.open('Saving please wait...');
      this.isSubmitting = true;
      this.journalEntryService.add(params)
        .subscribe(async res => {
          if (res.success) {
            this.newEntryAdded.emit(res.data);
            this.isSubmitting = false;
            await this.pageLoaderService.close();
            await this.modalCtrl.dismiss(res.data, 'confirm');
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
  
  async openHeartRate() {
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
    modal.onWillDismiss().then((res: { data: HeartRateLog; role: string }) => {
      if (res.data && res.role === 'confirm') {
        this.lastHeartRateRecord = res.data;
      }
    });
    modal.present();
  }

  activeIndexChange(event: { moodEntityId: string }) {
    this.moodEntityId = event.moodEntityId;
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }
}
