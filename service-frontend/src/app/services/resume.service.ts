import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {

  constructor() { }
  baseUrl = 'http://localhost:8080/api/salaries/uploads/resumes';

  // Generate the full URL for the resume file
  getResumeUrl(filename: string): string {
    return `${this.baseUrl}/${filename}`;
  }
}
