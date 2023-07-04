import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonModal, ModalController } from '@ionic/angular';
import { AnimationService } from 'src/app/core/services/animation.service';
import { HeartRateMonitorService } from 'src/app/core/services/heart-rate-monitor.service';
import { Observable, interval } from 'rxjs';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import { HeartRateLogService } from 'src/app/core/services/heart-rate-log.service';
import { HeartRateLog } from 'src/app/core/model/heart-rate-logs.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';



@Component({
  selector: 'app-heart-rate-thumb-monitor',
  templateUrl: './heart-rate-thumb-monitor.page.html',
  styleUrls: ['./heart-rate-thumb-monitor.page.scss'],
})
export class HeartRateThumbMonitorPage implements OnInit, AfterViewInit {
  mode = 'start';
  @ViewChild('progressModal') progressModal: IonModal;
  @ViewChild('iframe') iframe: ElementRef<HTMLIFrameElement>;
  capturePercentage = 0;
  captureTimeout;
  currentBPM;
  bpmLog = [];
  startMonitor = false;
  measureCompleted = false;
  captureHeartRateSub;

  isSubmitting = false;
  lastRecord: HeartRateLog;

  captureHeartInterval = 500;

  constructor(private modalCtrl: ModalController,
    private alertController: AlertController,
    private pageLoaderService: PageLoaderService,
    private heartRateLogService: HeartRateLogService,
    private animationService: AnimationService,
    private appconfig: AppConfigService) {
      this.captureHeartInterval = Number(this.appconfig.config.heartRate.captureInterval);
     }
  ngAfterViewInit(): void {
    window.document.addEventListener('heartRateChanged', (e:any)=> {
      if(e && e.detail && e.detail.bpm && !isNaN(e.detail.bpm) && Number(e.detail.bpm) > 0) {
        this.currentBPM = Number(e.detail.bpm);
      }
    }, false);
    this.progressModal.enterAnimation = this.animationService.pushLeftAnimation;
    this.progressModal.leaveAnimation = this.animationService.leavePushLeftAnimation;

  }

  ngOnInit() {
    console.log(this.lastRecord);
    if(!this.lastRecord || !this.lastRecord.value || this.lastRecord.value === '') {
      this.mode  = 'start';
    } else {
      this.mode  = 'result';
    }
  }

  showHeartRateMeasure() {
    this.lastRecord = null;
    this.progressModal.present();
  }

  startMeasure() {
    this.iframe.nativeElement.contentWindow.document.dispatchEvent(new CustomEvent('heartRateStart'));
    this.startMonitor = true;
    this.capturePercentage = 0;
    this.measureCompleted = false;
    setTimeout(()=> {
      this.captureHeartRateSub = interval(this.captureHeartInterval)
      .subscribe(() => this.startMonitor ? this.captureHeartRate() : false, null, null);
    }, 1000)
  }

  async progressWillDismiss(event) {
    if(this.captureHeartRateSub) {
      this.captureHeartRateSub.unsubscribe();
      this.captureHeartRateSub = null;
    }
  }

  confirm() {
    if(this.lastRecord) {
      this.modalCtrl.dismiss(this.lastRecord, 'confirm');
      if(this.captureHeartRateSub) {
        this.captureHeartRateSub.unsubscribe();
        this.captureHeartRateSub = null;
      }
    } else {
      return;
    }
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
    if(this.captureHeartRateSub) {
      this.captureHeartRateSub.unsubscribe();
      this.captureHeartRateSub = null;
    }
    this.startMonitor = false;
  }

  async captureHeartRate() {
    if(this.currentBPM < 200 && this.currentBPM > 20) {
      this.bpmLog.push(this.currentBPM)
    } else if(this.currentBPM > 0) {
      this.bpmLog.push(this.currentBPM / 2)
    }

    if(this.capturePercentage >= 100) {
      this.startMonitor = false;
      this.measureCompleted = true;
      this.captureHeartRateSub.unsubscribe();
      this.captureHeartRateSub = null;
      this.iframe.nativeElement.contentWindow.document.dispatchEvent(new CustomEvent('heartRateStop'));
      await this.computeBPM();
      if(this.currentBPM > 0) {
        await this.save(this.currentBPM);
      } else {
        this.mode = 'start';
        this.progressModal.dismiss();
      }
    } else if(this.capturePercentage < 100) {
      this.capturePercentage = this.capturePercentage + 10;
    }
  }

  async computeBPM() {
    const sum = this.bpmLog.reduce((a, b) => a + b, 0);
    const avg = (sum / this.bpmLog.length) || 0;
    const heartRate = Math.round((avg / 100 + Number.EPSILON) * 100);
    var event = new CustomEvent('heartRateStop')
    window.parent.document.dispatchEvent(event)
    this.currentBPM = heartRate;
  }


  async save(bpm){
    const params = { 
      timestamp: {
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        date: new Date()
      },
      value: bpm.toString() 
    };
    try{
      await this.pageLoaderService.open('Processing please wait...');
      this.isSubmitting = true;
      this.heartRateLogService.add(params)
        .subscribe(async res => {
          if (res.success) {
            this.lastRecord = res.data;
            this.isSubmitting = false;
            await this.pageLoaderService.close();
            this.mode = 'result';
            this.progressModal.dismiss();
          } else {
            await this.pageLoaderService.close();
            this.isSubmitting = false;
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
            this.mode = 'start';
            this.progressModal.dismiss();
          }
        }, async (err) => {
          await this.pageLoaderService.close();
          this.isSubmitting = false;
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
          this.mode = 'start';
          this.progressModal.dismiss();
        });
    } catch (e){
      await this.pageLoaderService.close();
      this.isSubmitting = false;
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
      this.mode = 'start';
      this.progressModal.dismiss();
    }
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }

}
