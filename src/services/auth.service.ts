import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authenticate(username: string, password: string) {
    throw new Error('Method not implemented.');
  }

  constructor() { }
}
