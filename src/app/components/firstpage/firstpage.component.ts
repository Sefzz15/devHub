import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  standalone: false,
  selector: 'app-firstpage',
  templateUrl: './firstpage.component.html',
  styleUrl: './firstpage.component.css'
})
export class FirstpageComponent implements OnInit {
  users: any[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getUsers();
  }

// Get users from the API
getUsers(): void {
  this.userService.getUsers().subscribe(
    (data: any) => {
      this.users = data;
    },
    (error: any) => {
      console.error('Error fetching users:', error);
    }
  );
}

  // Delete a user
  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.getUsers();  // Refresh the user list
      });
    }
  }
}
