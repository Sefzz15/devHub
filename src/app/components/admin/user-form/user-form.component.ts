import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { IUser } from '../../../../interfaces/IUser';

@Component({
  standalone: false,
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  user: IUser = { uid: 0, uname: '', upass: '' };
  usernameError = '';
  passwordError = '';
  successMessage = '';
  errorMessage = '';
  mode: 'create' | 'edit' = 'create';

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ) { }

  ngOnInit(): void {
    const idParam = this._route.snapshot.paramMap.get('id');
    if (idParam) {
      this.mode = 'edit';
      const id = Number(idParam);
      if (!isNaN(id) && id > 0) {
        this._userService.getUser(id).subscribe({
          next: (data) => this.user = data,
          error: () => this.errorMessage = 'Unable to fetch user data.'
        });
      } else {
        this.errorMessage = 'Invalid user ID.';
      }
    }
  }

  onSubmit(): void {
    this.clearErrorMessages();
    if (!this.validateInputs()) return;

    if (this.mode === 'create') {
      this._userService.createUser(this.user).subscribe({
        next: () => this.handleSuccess('User created successfully.'),
        error: () => this.errorMessage = 'Failed to create user.'
      });
    } else {
      this._userService.updateUser(this.user.uid, this.user).subscribe({
        next: () => this.handleSuccess('User updated successfully.'),
        error: () => this.errorMessage = 'Failed to update user.'
      });
    }
  }

  private handleSuccess(message: string) {
    this.successMessage = message + ' Redirecting...';
    setTimeout(() => this._router.navigate(['/adminpage']), 1500);
  }

  private validateInputs(): boolean {
    let isValid = true;
    if (!this.user.uname) {
      this.usernameError = 'Username is required.';
      isValid = false;
    }
    if (!this.user.upass) {
      this.passwordError = 'Password is required.';
      isValid = false;
    }
    return isValid;
  }

  private clearErrorMessages(): void {
    this.usernameError = '';
    this.passwordError = '';
    this.successMessage = '';
    this.errorMessage = '';
  }
}
