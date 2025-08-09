import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';


import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminpageComponent } from './components/admin/admin.component';
import { UserFormComponent } from './components/admin/user-form/user-form.component';
import { ProductFormComponent } from './components/admin/product-form/product-form.component';

import { ShoppageComponent } from './components/shop/shop.component';
import { OrderHistoryComponent } from './components/order-history/order-history';
import { ChatComponent } from './components/chat/chat.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { RubiksCubeComponent } from './components/rubiks-cube/rubiks-cube.component';
import { SpotifyComponent } from './components/spotify/spotify.component';
import { FooterComponent } from './components/footer/footer.component';
import { OrderFormComponent } from './components/admin/order-form/order-form.component';
import { EntityFormComponent } from './components/entity-form/entity-form.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    AdminpageComponent,
    NavbarComponent,
    ChatComponent,
    OrderHistoryComponent,
    ShoppageComponent,
    FeedbackComponent,
    RubiksCubeComponent,
    SpotifyComponent,
    FooterComponent,
    UserFormComponent,
    ProductFormComponent,
    OrderFormComponent,
    EntityFormComponent,
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
    MatPaginatorModule,
    MatTableModule,
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
