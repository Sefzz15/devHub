import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionService } from '../../../services/session.service';

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
      userId: this.userID,
      date: new Date().toISOString(),
      name: this.nameFormGroup.value.firstCtrl || null,
      address: this.addressFormGroup.value.secondCtrl || null,
      phone: this.phoneFormGroup.value.thirdCtrl || null,
      message: this.messageFormGroup.value.fourthCtrl || null,
    };

    console.log('Feedback payload to send to backend:', payload);

    // TODO: Submit this to your backend
    // this.feedbackService.submitFeedback(payload).subscribe(...)
  } else {
    console.warn('Message is required to submit feedback.');
  }
}

  }
