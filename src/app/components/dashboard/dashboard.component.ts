import {Component, OnInit} from '@angular/core';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,

  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  userID: number = 0;
  username: string = '';

  constructor(
    private _sessionService: SessionService,
  ) { }

  ngOnInit(): void {
    this.username = this._sessionService.username;
    this.userID = this._sessionService.userID;

    console.log('Username in Dashboard:', this.username);
    console.log('UserID in Dashboard:', this.userID);
  }
}
