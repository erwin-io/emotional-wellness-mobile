import { Gender } from './gender.model';

export class User {
  userId: string;
  name: string;
  mobileNumber: string;
  gender: Gender;
  birthDate: string;
  age: string;
  userProfilePic: any;
  pet: any;
}


export class Pet {
  name: string;
  profilePicFile: any;
}