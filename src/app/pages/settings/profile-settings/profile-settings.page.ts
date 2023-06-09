import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { UserService } from 'src/app/core/services/user.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.page.html',
  styleUrls: ['./profile-settings.page.scss'],
})
export class ProfileSettingsPage implements OnInit {
  modal;
  user: LoginResult;
  editProfileForm: FormGroup;
  activeAditionalBackdrop = false;
  isSubmitting = false;
  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private pageLoaderService: PageLoaderService,
    private storageService: StorageService) {
    this.user = this.storageService.getLoginUser();
  }

  get formData() {
    return {
      ...this.editProfileForm.value,
      userId: this.user.userId
    };
  }

  get isFormDirty() {
    return (
      this.user.name !== this.formData.name ||
      this.user.mobileNumber !== this.formData.mobileNumber ||
      moment(this.user.birthDate).format('YYYY-MM-DD') !== moment(this.formData.birthDate).format('YYYY-MM-DD') ||
      this.user.gender.genderId !== this.formData.genderId
    );
  }

  get errorControls() {
    return this.editProfileForm.controls;
  }

  ngOnInit() {
    this.editProfileForm = this.formBuilder.group({
      name : [this.user.name, Validators.required],
      mobileNumber : [this.user.mobileNumber, Validators.required],
      birthDate : [new Date(this.user.birthDate).toISOString(), Validators.required],
      genderId : [this.user.gender.genderId, Validators.required]
    });
  }

  async onSubmit() {
    const params = this.formData;
    if (!this.editProfileForm.valid) {
      return;
    }
    try {
      await this.presentAlert({
        header: 'Continue?',
        buttons: [
          {
            text: 'CANCEL',
            role: 'cancel',
          },
          {
            text: 'YES',
            role: 'confirm',
            handler: () => {
              this.save(params);
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

  async save(params) {
    try {
      await this.pageLoaderService.open('Saving...');
      this.isSubmitting = true;
      this.userService.udpdateUser(params).subscribe(
        async (res) => {
          if (res.success) {
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Saved!',
              buttons: ['OK'],
            });
            this.isSubmitting = false;
            this.user.name = res.data.name;
            this.user.mobileNumber = res.data.mobileNumber;
            this.user.birthDate = res.data.birthDate;
            this.user.gender = res.data.gender;
            this.storageService.saveLoginUser(this.user);
            this.modal.dismiss(res.data, 'confirm');
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

  close() {
    this.modal.dismiss(null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }
}
