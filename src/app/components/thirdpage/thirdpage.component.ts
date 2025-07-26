import { Component, OnInit } from '@angular/core';
import { IUser } from '../../../interfaces/IUser';
import { SessionService } from '../../../services/session.service';
import { UserService } from '../../../services/user.service';
import { IUserResponse } from '../../../interfaces/IUser';

@Component({
  standalone: false,
  selector: 'app-thirdpage',
  templateUrl: './thirdpage.component.html',
  styleUrls: ['../firstpage/firstpage.component.css'],
})
export class ThirdpageComponent implements OnInit {
  userID?: number;
  // users: IUser[] = [];
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
      (data: any) => {
        this.users = data.$values; // Ensure this updates the array
        console.log('Fetched users:', this.users);
        this.clientNames = this.users.map(user => user.$values.uname); // Extract usernames
        // this.clientNames = this.users.map(user => user.uname); // Extract usernames
        console.log('Fetched users:', this.clientNames);
      },
      (error: any) => {
        console.error('Error fetching users:', error);
      }
    );
  }
}

