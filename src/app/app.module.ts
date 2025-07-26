import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule} from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FirstpageComponent } from './components/firstpage/firstpage.component';
import { CreateUserComponent } from './components/firstpage/create-user/create-user.component';
import { UpdateUserComponent } from './components/firstpage/update-user/update-user.component';
import { CreateProductComponent } from './components/firstpage/create-product/create-product.component';
import { UpdateProductComponent } from './components/firstpage/update-product/update-product.component';
import { CreateOrderComponent } from './components/firstpage/create-order/create-order.component';
import { UpdateOrderComponent } from './components/firstpage/update-order/update-order.component';
import { SecondpageComponent } from './components/secondpage/secondpage.component';
import { ThirdpageComponent } from './components/thirdpage/thirdpage.component';
import { ChatComponent } from './components/chat/chat.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MultistepformComponent } from './components/multistepform/multistepform.component';
import { RubiksCubeComponent } from './components/rubiks-cube/rubiks-cube.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    FirstpageComponent,
    NavbarComponent,
    CreateUserComponent,
    UpdateUserComponent,
    ChatComponent,
    ThirdpageComponent,
    CreateProductComponent,
    UpdateProductComponent,
    SecondpageComponent,
    CreateOrderComponent,
    UpdateOrderComponent,
    MultistepformComponent,
    RubiksCubeComponent,
  ],
  imports: [
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatToolbarModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    AsyncPipe,
    MatIconModule,
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
