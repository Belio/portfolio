import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from './services/account.service';
import { Stock } from './services/stocks.model';
import { StocksService } from './services/stocks.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    AccountService,
    StocksService
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  refresh: boolean = true;
  stocks: Stock[] = [];
  interval: any;

  constructor(
    private accountService: AccountService, 
    private stocksService: StocksService) {}

  ngOnInit() {
    this.load();
    
    this.interval = setInterval(() => {
      if (this.refresh) {
        this.load();
      }
    }, 15000);
  }

  toggleRefresh(): void {
    this.refresh = !this.refresh;
    let onOff = (this.refresh) ? 'on' : 'off';
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  reset(): void {
    this.accountService.reset();
  }
  
  private load() {
    this.stocksService.getStocks().then(stocks => {
      this.stocks = stocks;
    });
  }
}
