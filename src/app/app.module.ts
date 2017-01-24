import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ClarityModule } from 'clarity-angular';
import { CurrencyPipe } from '@angular/common';

import { AppComponent } from './app.component';
import { InvestmentsComponent } from './investments/investments.component';
import { TickerComponent } from './ticker/ticker.component';
import { StocksComponent } from './stocks/stocks.component';
import { AlertComponent } from './alert/alert.component';

import { LocalStorageService } from './services/local-storage.service';

@NgModule({
  declarations: [
    AppComponent,
    InvestmentsComponent,
    TickerComponent,
    StocksComponent,
    AlertComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ClarityModule.forChild()
  ],
  providers: [
    LocalStorageService,
    CurrencyPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
