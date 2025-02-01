import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-multistepform',
  standalone: false,

  templateUrl: './multistepform.component.html',
  styleUrls: [
    '../firstpage/firstpage.component.css',
    './multistepform.component.css'
  ],

})
export class MultistepformComponent {
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;
}
