/* eslint-disable @typescript-eslint/quotes */
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { JournalEntry } from 'src/app/core/model/journal-entry.model';
import { JournalEntryService } from 'src/app/core/services/journal-entry.service';

@Component({
  selector: 'app-journal-details',
  templateUrl: './journal-details.page.html',
  styleUrls: ['./journal-details.page.scss'],
})
export class JournalDetailsPage implements OnInit {
  @Input() details: JournalEntry;
  constructor(private modalCtrl: ModalController,
    private journalEntryService: JournalEntryService,
    private alertController: AlertController,) { }

  ngOnInit() {
    console.log(this.details);
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }
}
