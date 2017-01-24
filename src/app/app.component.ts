import { Component, OnInit } from '@angular/core';
import { StocksService } from './services/stocks.service';
import { AlertService } from './services/alert.service';
import { AccountService } from './services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    StocksService, 
    AlertService,
    AccountService
  ]
})
export class AppComponent implements OnInit {
  interval: any;
  stocks: any = [];
  refresh: boolean = true;

  constructor(
    private service: StocksService, 
    private alertService: AlertService,
    private accountService: AccountService) {}

  ngOnInit() {
    this.accountService.init();
    this.load();
    
    this.interval = setInterval(() => {
      if (this.refresh) {
        this.load();
      }
    }, 15000);
  }

  private load() {
    this.service.getStocks().then(stocks => {
      this.stocks = stocks;
    });
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  toggleRefresh() {
    this.refresh = !this.refresh;
    let onOff = (this.refresh) ? 'on' : 'off';
    this.alertService.alert(`You have turned automatic refresh ${onOff}`, 'info', 0);
  }

  reset() {
    this.accountService.reset();
    this.alertService.alert(`You have reset your portfolio!`);
  }
}
