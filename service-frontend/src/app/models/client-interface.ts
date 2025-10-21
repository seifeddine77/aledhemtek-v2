import {UserInterface} from './user-interface';

export interface ClientInterface extends UserInterface {
  firstName: string,
  lastName: '',
  email: '',
  password: '',
  phone: '',
  dob: '',
  country: '',
  city: '',
  zip: '',
  address: '',
  occupation:string,
}
