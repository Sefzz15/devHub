import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { FirstpageComponent } from './components/firstpage/firstpage.component';
import { SecondpageComponent } from './components/secondpage/secondpage.component';
import { ThirdpageComponent } from './components/thirdpage/thirdpage.component';
import { FourthpageComponent } from './components/fourthpage/fourthpage.component';
import { FifthpageComponent } from './components/fifthpage/fifthpage.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'firstpage', component: FirstpageComponent },
  { path: 'secondpage', component: SecondpageComponent },
  { path: 'thirdpage', component: ThirdpageComponent },
  { path: 'fourthpage', component: FourthpageComponent },
  { path: 'fifthpage', component: FifthpageComponent },//lathos
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
