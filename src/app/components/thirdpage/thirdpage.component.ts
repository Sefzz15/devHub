import { Component, OnInit } from '@angular/core';
import { IUser, IUserValuesResponse } from '../../../interfaces/IUser';
import { SessionService } from '../../../services/session.service';
import { UserService } from '../../../services/user.service';
import { IUserResponse } from '../../../interfaces/IUser';

@Component({
  standalone: false,
  selector: 'app-thirdpage',
  templateUrl: './thirdpage.component.html',
  styleUrls: ['../admin/admin.component.css'],
})
export class ThirdpageComponent implements OnInit {
  userID?: number;
  users: IUserResponse[] = [];
  clientNames: string[] = [];


  constructor(
    private _sessionService: SessionService,
    private _userService: UserService,
  ) { }

  ngOnInit(): void {
    this.userID = this._sessionService.userID;
    this.getUsers();
  }

  getUsers(): void {
    this._userService.getUsers().subscribe(
      (data: IUserResponse) => {
        this.clientNames = data.$values.map(i => i.uname);
        console.log('Fetched users:', this.clientNames);
      },
      (error: any) => {
        console.error('Error fetching users:', error);
      }
    );
  }
}

