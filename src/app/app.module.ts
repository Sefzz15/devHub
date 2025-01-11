import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FirstpageComponent } from './components/firstpage/firstpage.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CreateUserComponent } from './components/firstpage/create-user/create-user.component';
import { UpdateUserComponent } from './components/firstpage/update-user/update-user.component';
import { CreateCustomerComponent } from './components/firstpage/create-customer/create-customer.component';
import { UpdateCustomerComponent } from './components/firstpage/update-customer/update-customer.component';
import { ChatComponent } from './components/chat/chat.component';
import { ThirdpageComponent } from './components/thirdpage/thirdpage.component';
import { CreateProductComponent } from './components/firstpage/create-product/create-product.component';
import { UpdateProductComponent } from './components/firstpage/update-product/update-product.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    FirstpageComponent,
    NavbarComponent,
    CreateUserComponent,
    UpdateUserComponent,
    CreateCustomerComponent,
    UpdateCustomerComponent,
    ChatComponent,
    ThirdpageComponent,
    CreateProductComponent,
    UpdateProductComponent,
  ],
  imports: [
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatToolbarModule,
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
