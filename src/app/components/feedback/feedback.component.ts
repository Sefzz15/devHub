import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionService } from '../../../services/session.service';
import { FeedbackService } from '../../../services/feedback.service';
import { IFeedbackValuesResponse } from '../../../interfaces/IFeedback';

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
  feedbacks: IFeedbackValuesResponse[] = [];

  nameFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  addressFormGroup = this._formBuilder.group({
    secondCtrl: [''],
  });
  phoneFormGroup = this._formBuilder.group({
    thirdCtrl: [''],
  });
  messageFormGroup = this._formBuilder.group({
    fourthCtrl: ['', Validators.required],
  });
  stepperOrientation!: Observable<StepperOrientation>;

  constructor(
    private _sessionService: SessionService,
    private _feedbackService: FeedbackService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.stepperOrientation = this.breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  ngOnInit(): void {
    this.userID = this._sessionService.userID;
    this.getFeedbacks();
  }

  submitFeedback(): void {
    if (this.messageFormGroup.valid) {
      const payload = {
        uid: this.userID ?? 0,
        name: this.nameFormGroup.value.firstCtrl || null,
        address: this.addressFormGroup.value.secondCtrl || null,
        phone: this.phoneFormGroup.value.thirdCtrl || null,
        message: this.messageFormGroup.value.fourthCtrl || null,
      };

      this._feedbackService.createFeedback(payload).subscribe({
        next: () => this.getFeedbacks(),
        error: () => (this.errorMessage = 'Failed to submit feedback. Please try again later.'),
      });
    }
  }

  getFeedbacks(): void {
    this._feedbackService.getFeedbacks().subscribe({
      next: (data: IFeedbackValuesResponse[]) => {
        this.feedbacks = data ?? [];
      },
      error: (e) => console.error('Error fetching feedbacks:', e),
    });
  }

  deleteFeedback(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this._feedbackService.deleteFeedback(id).subscribe(() => this.getFeedbacks());
    }
  }
}
