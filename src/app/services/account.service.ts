import { Injectable } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LocalStorageService } from './local-storage.service';
import { AlertService } from './alert.service';

const defaultBalance = 10000;

@Injectable()
export class AccountService {
  private _balance: number = defaultBalance;
  private _value: number = 0;
  private _cost: number = 0;
  private _stocks = [];

  constructor(
    private localStorageService: LocalStorageService,
    private alertService: AlertService,
    private currencyPipe: CurrencyPipe) {}

  get balance() { return this._balance; }
  get stocks() { return this._stocks; }
  get value() { return this._value; }
  get cost() { return this._cost; }

  purchase(stock) {
    stock = Object.assign({}, stock);
    if (stock.price < this.balance) {
      this._balance = this.debit(stock.price, this.balance);
      this._cost = this.credit(stock.price, this.cost);
      stock.cost = stock.price;
      stock.change = 0;
      this.stocks.push(stock);
      this.calculateValue();
      this.cacheValues();
      this.alertService.alert(`You bought ${stock.symbol} for ` + this.currencyPipe.transform(stock.price, 'USD', true, '.2'), 'success');
    } else {
      this.alertService.alert(`You have insufficient funds to buy ${stock.symbol}`, 'danger');
    }
  }

  sell(index) {
    let stock = this.stocks[index];
    if (stock) {
      this._balance = this.credit(stock.price, this.balance);
      this._cost = this.debit(stock.cost, this.cost);
      this._stocks.splice(index, 1);
      this.calculateValue();
      this.cacheValues();
      this.alertService.alert(`You sold ${stock.symbol} for ` + this.currencyPipe.transform(stock.price, 'USD', true, '.2'), 'success');
    } else {
      this.alertService.alert(`You do not own the ${stock.symbol} stock.`, 'danger');
    }
  }

  init() {
    this._stocks = this.localStorageService.get('stocks', []);
    this._balance = this.localStorageService.get('balance', defaultBalance);
    this._cost = this.localStorageService.get('cost', 0);
  }

  reset() {
    this.localStorageService.set('stocks', []);
    this.localStorageService.set('balance', defaultBalance);
    this.localStorageService.set('cost', 0);
    this._stocks = [];
    this._balance = defaultBalance;
    this._value = this._cost = 0;
  }

  calculateValue() {
    this._value = this._stocks
      .map(stock => stock.price)
      .reduce((a, b) => a + b, 0);
  }

  private cacheValues() {
    this.localStorageService.set('stocks', this.stocks);
    this.localStorageService.set('balance', this.balance);
    this.localStorageService.set('cost', this.cost);
  }

  private debit(amount: number, balance: number) {
    return (balance * 100 - amount * 100) / 100;
  }

  private credit(amount: number, balance: number) {
    return (balance * 100 + amount * 100) / 100;
  }
}
