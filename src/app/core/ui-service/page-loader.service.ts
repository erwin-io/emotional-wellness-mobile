import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PageLoaderComponent } from 'src/app/component/page-loader/page-loader.component';

@Injectable({
  providedIn: 'root'
})
export class PageLoaderService {
  modal: HTMLIonModalElement;
  constructor(private modalCtrl: ModalController) {}

  async open(message) {
    if(this.modal){
      this.modal.componentProps = { message };
      return;
    }
    this.modal = await this.modalCtrl.create({
      component: PageLoaderComponent,
      id: 'page-loader',
      cssClass: 'modal-fullscreen',
      canDismiss: true,
      componentProps: {
        message
      },
    }, );
    await this.modal.present();
  }
  async close() {
    if(this.modal){
      await this.modal.dismiss();
    }
  }
}
