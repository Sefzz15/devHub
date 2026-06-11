import {Component, OnInit, signal} from '@angular/core';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,

  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  readonly userID = signal(0);
  readonly username = signal('');

  constructor(
    private _sessionService: SessionService,
  ) { }

  ngOnInit(): void {
    this.username.set(this._sessionService.username);
    this.userID.set(this._sessionService.userID);

    console.log('Username in Dashboard:', this.username());
    console.log('UserID in Dashboard:', this.userID());
  }
}
