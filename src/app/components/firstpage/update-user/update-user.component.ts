import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';

@Component({
  standalone: false,
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css'],
})
export class UpdateUserComponent implements OnInit {
  user = { uid: 0, uname: '', upass: '' };
  errorMessage: string = '';
  usernameError: string = '';
  passwordError: string = '';

  constructor(private userService: UserService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const uid = this.route.snapshot.paramMap.get('id');
    console.log('Route ID:', uid); // Debugging the raw route parameter

    if (!uid) {
      this.errorMessage = 'Route parameter "id" is missing or invalid.';
      return;
    }

    const userId = Number(uid); // Convert to a number
    if (isNaN(userId) || userId <= 0) {
      this.errorMessage = 'Invalid user ID.';
      return;
    }

    this.userService.getUser(userId).subscribe(
      (data: any) => {
        this.user = data;
      },
      (error: any) => {
        this.errorMessage = 'Unable to fetch user details.';
      }
    );
  }


  updateUser(): void {
    this.usernameError = '';
    this.passwordError = '';

    if (!this.user.uname) {
      this.usernameError = 'Username is required.';
    }

    if (!this.user.upass) {
      this.passwordError = 'Password is required.';
    }

    if (this.usernameError || this.passwordError) {
      return; // Stop if there are validation errors
    }

    this.userService.updateUser(this.user.uid, this.user).subscribe(
      () => {
        this.router.navigate(['/firstpage']);
      },
      (error: any) => {
        this.errorMessage = 'Failed to update the user.';
      }
    );
  }

  clearErrorMessage(): void {
    this.errorMessage = '';
  }
}
