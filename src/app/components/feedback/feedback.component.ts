import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionService } from '../../../services/session.service';
import { FeedbackService } from '../../../services/feedback.service';

@Component({
  selector: 'stepper-responsive-example',
  standalone: false,

  templateUrl: './feedback.component.html',
  styleUrls: [
    '../admin/admin.component.css',
    './feedback.component.css',
  ],

})
export class FeedbackComponent implements OnInit {
  userID?: number;
  private _formBuilder = inject(FormBuilder);
  errorMessage: string = '';


  nameFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  addressFormGroup = this._formBuilder.group({
    secondCtrl: [''], // Optional field
  });
  phoneFormGroup = this._formBuilder.group({
    thirdCtrl: [''], // Optional field
  });
  messageFormGroup = this._formBuilder.group({
    fourthCtrl: ['', Validators.required], // 
  });
  stepperOrientation: Observable<StepperOrientation>;

  constructor(
    private _sessionService: SessionService,
    private _feedbackService: FeedbackService,
  ) {

    const breakpointObserver = inject(BreakpointObserver);

    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  ngOnInit(): void {
    this.userID = this._sessionService.userID;
    console.log('UserID in feedback page:', this.userID);
  }

  submitFeedback(): void {
    if (this.messageFormGroup.valid) {
      const payload = {
        uid: this.userID ?? 0,
        uname: this.nameFormGroup.value.firstCtrl || '',
        upass: '', // Provide a default or actual password if needed
        date: new Date().toISOString(),
        name: this.nameFormGroup.value.firstCtrl || null,
        address: this.addressFormGroup.value.secondCtrl || null,
        phone: this.phoneFormGroup.value.thirdCtrl || null,
        message: this.messageFormGroup.value.fourthCtrl || null,
      };

      console.log('Feedback payload to send to backend:', payload);

      this._feedbackService.createFeedback(payload).subscribe({
        next: (res) => {
          console.log('Feedback submitted successfully:', res);
          // Optionally reset form or show success message
        },
        error: (err) => {
          console.error('Failed to submit feedback:', err);
          this.errorMessage = 'Failed to submit feedback. Please try again later.';
        }
      });

    }
  }
}
