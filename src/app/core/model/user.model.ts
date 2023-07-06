import { Gender } from './gender.model';

export class User {
  userId: string;
  name: string;
  mobileNumber: string;
  gender: Gender;
  birthDate: string;
  age: string;
  userProfilePic: any;
  petCompanion: PetCompanion;
}

export class PetCompanion {
  petCompanionId: string;
  name: string;
}
