import {UserInterface} from './user-interface';

export interface ConsultantInterface extends UserInterface {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profession?: string;
  exp?: number;
  companyName?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  resumePath?: string;
}
