import {UserInterface} from './user-interface';

export interface ClientInterface extends UserInterface {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  dob?: string | Date;
  country?: string;
  city?: string;
  zip?: string | number;
  address?: string;
  occupation?: string;
}

