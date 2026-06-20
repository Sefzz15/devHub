import {NgModule} from '@angular/core';
import {BrowserModule, provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {authInterceptor} from '../services/auth.interceptor';
import {AppRoutingModule} from './app-routing.module';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {AsyncPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialogModule} from '@angular/material/dialog';
import {AppComponent} from './app.component';
import {LoginComponent} from './components/login/login.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {AdminComponent} from './components/admin/admin.component';
import {ShopComponent} from './components/shop/shop.component';
import {OrderHistoryComponent} from './components/order-history/order-history';
import {ChatComponent} from './components/chat/chat.component';
import {FeedbackComponent} from './components/feedback/feedback.component';
import {RubiksCubeComponent} from './components/rubiks-cube/rubiks-cube.component';
import {SpotifyComponent} from './components/spotify/spotify.component';
import {FooterComponent} from './components/footer/footer.component';
import {EntityFormComponent} from './components/entity-form/entity-form.component';
import {CinemaComponent} from './components/cinema/cinema.component';
import {LanguageToggleComponent} from './components/language-toggle/language-toggle.component';
import {TranslatePipe} from '../pipes/translate.pipe';
import {NgApexchartsModule} from "ng-apexcharts";


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    AdminComponent,
    NavbarComponent,
    ChatComponent,
    OrderHistoryComponent,
    ShopComponent,
    FeedbackComponent,
    RubiksCubeComponent,
    SpotifyComponent,
    FooterComponent,
    EntityFormComponent,
    CinemaComponent,
    LanguageToggleComponent,
    TranslatePipe,
  ],
  imports: [
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatToolbarModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    AsyncPipe,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule,
    NgApexchartsModule,
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor]))
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
