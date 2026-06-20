import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionService } from '../../../services/session.service';
import { FeedbackService } from '../../../services/feedback.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { NotificationService } from '../../../services/notification.service';
import { TranslationService } from '../../../services/translation.service';
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
  readonly userID = signal<number | undefined>(undefined);
  private _formBuilder = inject(FormBuilder);
  readonly errorMessage = signal('');
  readonly feedbacks = signal<IFeedbackValuesResponse[]>([]);

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
    private _confirmation: ConfirmationService,
    private _notification: NotificationService,
    private _i18n: TranslationService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.stepperOrientation = this.breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  ngOnInit(): void {
    this.userID.set(this._sessionService.userID);
    this.getFeedbacks();
  }

  submitFeedback(): void {
    if (this.messageFormGroup.valid) {
      const payload = {
        uid: this.userID() ?? 0,
        name: this.nameFormGroup.value.firstCtrl || null,
        address: this.addressFormGroup.value.secondCtrl || null,
        phone: this.phoneFormGroup.value.thirdCtrl || null,
        message: this.messageFormGroup.value.fourthCtrl || null,
      };

      this._feedbackService.createFeedback(payload).subscribe({
        next: () => this.getFeedbacks(),
        error: () => this.errorMessage.set(this._i18n.translate('feedback.submitFailed')),
      });
    }
  }

  getFeedbacks(): void {
    this._feedbackService.getFeedbacks().subscribe({
      next: (data: IFeedbackValuesResponse[]) => {
        this.feedbacks.set(data ?? []);
      },
      error: (e) => console.error('Error fetching feedbacks:', e),
    });
  }

  deleteFeedback(id: number): void {
    this._confirmation
      .confirm({
        title: this._i18n.translate('feedback.deleteTitle'),
        message: this._i18n.translate('feedback.deleteMsg'),
        confirmText: this._i18n.translate('common.delete'),
        cancelText: this._i18n.translate('common.cancel'),
      })
      .subscribe(confirmed => {
        if (!confirmed) return;
        this._feedbackService.deleteFeedback(id).subscribe({
          next: () => {
            this._notification.success(this._i18n.translate('feedback.deleted'));
            this.getFeedbacks();
          },
          error: () => this._notification.error(this._i18n.translate('feedback.deleteFailed')),
        });
      });
  }
}
