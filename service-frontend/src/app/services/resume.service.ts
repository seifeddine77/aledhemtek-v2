import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {

  constructor() { }
  baseUrl = `${environment.apiUrl}/consultants/uploads/resumes`;

  // Generate the full URL for the resume file
  getResumeUrl(filename: string): string {
    return `${this.baseUrl}/${filename}`;
  }
}
