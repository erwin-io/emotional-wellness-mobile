import { Gender } from './gender.model';

export class User {
  userId: string;
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: string;
  fullName: string;
  gender: Gender;
  birthDate: string;
  age: string;
  userProfilePic: any;
}
