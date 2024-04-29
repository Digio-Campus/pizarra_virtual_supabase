import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private sessionSource = new BehaviorSubject(null);
  currentSession = this.sessionSource.asObservable();

  constructor() { }

  changeSession(session: any) {
    this.sessionSource.next(session);
  }
}