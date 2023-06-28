import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-heart-rate-learn-more',
  templateUrl: './heart-rate-learn-more.component.html',
  styleUrls: ['./heart-rate-learn-more.component.scss'],
})
export class HeartRateLearnMoreComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
