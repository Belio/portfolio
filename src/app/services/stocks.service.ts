import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ConfigService } from './config.service';
import { AccountService } from './account.service';

@Injectable()
export class StocksService {
  private _stocks: any = [];

  constructor(private http: Http, private accountService: AccountService) { }

  getStocks() {
    return this.http.get(ConfigService.get('api'))
      .toPromise()
      .then((response) => {
        let stocks = response.json();
        let symbols = this.accountService.stocks.map(stock => stock.symbol);
        stocks.forEach(stock => {
          this.accountService.stocks.map(item => {
            if (stock.symbol === item.symbol) {
              item.price = stock.price;
              item.change = ((stock.price * 100) - (item.cost * 100)) / 100;
            }
          });
        });
        this.accountService.calculateValue();

        return stocks;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  get stocks() {
    return this._stocks;
  }
}
