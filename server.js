'use strict';

var cors = require('cors');
var parse = require('csv-parse/lib/sync');
var express = require('express');
var request = require('request');
var path = require('path');
var yahooFinance = require('yahoo-finance');
const WebSocket = require('ws');
var firebase = require("firebase-admin");

firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: "angular-in-action-portfolio",
    clientEmail: "firebase-adminsdk-7bq7y@angular-in-action-portfolio.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCoMCeBL4DaDrhE\n5rDCTJqQiYnXNZMerVcaAJLD2P1StzLgwFDxO9zoggLggEaNKmNBDBOoWNXS6EvT\nUoxrDObFWGExh7KbIxdMme7CPZf0ZA066DYJjITwJyTTv02R/RZNjd+Rbnr6tmbt\nJRdAPG5TCzaYsTGmSOJxDyYZPBlfBwMOedtlaFDrgEekmdQqp0yDrvRFruLy03vQ\nw1kUPZ6KcI8jKybakQv0iDZor4222PCWwIE+ydeAf7xN0/ChkX/DVSPQop5GnKXu\nf1KyoLYl1ZUq7a7j86Q9i3vDyZ5lQCDixK5nKIjvzh+w5ooWI++Suo1aVSdX4T+f\n2lcw8hltAgMBAAECggEAHI941eY0MlNXlVO7ZnNNuAezIZmWbxoudVrtkVZyxi4X\n9LSTyjNJMy6IwIjn8ibljfE4EVlsjhEmdy9IaxFYyuBUOO37NX8DAN4O/mspN7YZ\nzQwLyRlUpddv2Ile6dCZjffupCqntZVt6w1mYmEgtvdrgQhuDvfHhD13Ucez4z/t\n8fbXD2UU8wN4YhmDZJZKXw1GwrL4OjdBwmjfvz2tSKa8LtS24H7BvAkIpbv32gQf\nC0YoXqcmXA8YytlyBW6ySZgeiBfqGqM8UMkaIlNUUHFrUWf1nVl8/31m/FG8bJrt\n4RjkgGmXdBRdIw8oxT224xRv0m3/EAyNbWK8loqzQQKBgQDd8O2yK+q4TLXfbvQA\nguYtGsfcQsUMeN4jJSWUKntMwjDovr7uDQRwmyS/ouAyjMhYfCKUKSGHoAeWZEsc\n1aVmrK9c7a0fbgXoCcLnjkJExI6EFEq+Dd3N177tOBF1ei4bEvVgdaO9bS7GLZAT\nlKW4Qcp7ESOVg1nY/qFeSvISsQKBgQDB/4K0zRjtYk5jkqawhwdIXsQ5wd4EFkaA\nW7B9cLUsNfjrbyT9CVHCjQ77OqagnFI4YSmP8y/kJi5J+2zht1dSPoCZ6S646nRO\nslmTnhEjYdX3d5ZtOqzGY1n9ubtRMEc3qJhQSGAzSMBO1HZfN7YcPxR8xQu37Av6\nodzkWbLJfQKBgGmMDY6BIjQZjxi+DF494jcrGEcgndNLm+C85r0q4s5jP51AMU7G\ndAkVTwmv7M09dH3YMx2g3ehA67rS4YHJ/Mnyb8dS5NUgnsB1+/HhDpTjoR8hA1aV\nA5nD83GfC3aB73FCt9zytTb9uJPY0T7un00cRK34PaL5/32ZwqY0ICFRAoGAJh4b\nQ4UtCa+QMXZmNDdD0g90xNh31BvAXIYnhm432uj78N6UyPckznJC6FAc31/3s8Y7\nkWI6Hbz2yWiSe0M38BwBzrwHhyPiGHhoq12ahnY5wXcI4ott2Uk6LGVrDcfLpn8E\n9nlSFaGMz7BlVc4vhRtL3jwlUk0aCXP2YBPT0k0CgYEAqSOxU2nWgqbZctXOPtrA\nW5AWm+QKmm8nKYnmxE0swQFG+sxNFPT9ohRyFrMZDwlbNqIqxNRPhZHV+2B4PwdC\nVX+lm0l1jB+kDkQbLU2H5cy24GcrFqykQdziG0a+KFLc8jZadJ5dDWOLTfr3dlRg\nWSGUd+AAIbA4nHYrShTMQiI=\n-----END PRIVATE KEY-----\n"
  }),
  databaseURL: "https://angular-in-action-portfolio.firebaseio.com"
});

var db = firebase.database();
var ref = db.ref("stocks");

var app = express();
var server = require('http').Server(app);
const wss = new WebSocket.Server({ server });
var stocks = [];

// Enable CORS
app.use(cors());

app.set('port', (process.env.PORT || 5000));

wss.on('connection', function connection(ws) {
  ws.send(JSON.stringify(stocks));
  // setInterval(() => {
  //   ws.send(stocks);
  // }, 15000);
});

function getRandomInt(min, max) {
  return (Math.floor(Math.random() * (max - min + 1)) + min);
}

function loadSymbols() {
  let url = 'http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NYSE&render=download';
  
  request(url, function(error, response, body) {
    stocks = parse(body, {columns: true}).filter(stock => {
      let valid = stock.Symbol.match(/[^a-zA-Z0-9]+/);
      return (valid !== null) ? false : true;
    }).filter(stock => {
      return stock.Sector != 'n/a' && stock.Industry != 'n/a';
    }).filter(stock => {
      return stock.MarketCap > 0; 
    }).map(stock => {
      let current = getRandomInt(5100, 80000) / 100;
      let change = getRandomInt(-1000, 1000) / 100;
      return {
        symbol: stock.Symbol,
        name: stock.Name,
        price: current,
        change: change
      };
    });

    console.log(stocks.length + ' stocks loaded at ' + new Date());
    ref.set(stocks);
  });

  setTimeout(loadSymbols, 1000 * 60 * 60 * 24); // Reload once a day
}

app.get('/user', function(req, res) {
  let index = getRandomInt(0, stocks.length - 11);
  let following = stocks
    .slice(index, index + 10)
    .map(stock => stock.symbol);
  res.status(200).send({
    username: 'make-it-rain',
    cash: 10000,
    following: following
  });
})

app.get('/stocks', function(req, res) {
  if (stocks.length) {
    res.status(200).send(stocks);
  } else {
    res.status(204).send({message: 'Please wait, server is still starting up'});
  }
});

// Endpoint to load snapshot data from yahoo finance
app.get('/stocks/snapshot', function(req, res) {
  if (req.query.symbols) {
    var symbols = req.query.symbols.split(',');
    symbols.map(function(symbol) {
      return symbol.toUpperCase();
    });

    yahooFinance.snapshot({
      symbols: symbols
    }, function(err, snapshot) {
      if (err) {
        res.status(401).send(err);
      }

      res.status(200).send(snapshot);
    });
  } else {
    res.status(400).send({message: 'The request requires at least one symbol. Try adding "?symbols=appl" to the request.'});
  }
});

// Endpoint to load historical data from yahoo finance.
app.get('/stocks/historical/:symbol', function(req, res) {
  var today = new Date();
  var yearAgo = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 365);
  yahooFinance.historical({
    symbol: req.params.symbol,
    from: yearAgo.toString(),
    to: today.toString()
  }, function(err, quotes) {
    if (err) {
      res.status(500).send(err);
    }

    res.status(200).send(quotes);
  });
});

app.get('/', function(req, res) {
  res.status(200).contentType('text/html').send('Welcome to the Angular in Action API. See <a href="https://github.com/angular-in-action/api#readme">https://github.com/angular-in-action/api#readme</a> for details.');
});

server.listen(app.get('port'), function() {
  console.log('App is running on port ', app.get('port'));
});

// Load the initial data
loadSymbols();

// Every 15 seconds, change data values
setInterval(() => {
  let start = Date.now();
  let changes = [0, 0, 0, 1, 1, 1, 1, 1, -1 -1 -1 -1 -1, 2, 2, 2, -2, -2, -2];
  stocks = stocks
    .map(stock => {
      let change = getRandomInt(0, changes.length - 1);
      if (stock.change + change > 4000) {
        change = -1;
      }
      if (stock.change + change < -4000) {
        change = 1;
      }
      stock.change = (parseInt((stock.change * 100) + (change / 100)) / 100);
      // Force it to be 2 decimals, cuz Javascript math can be lolz
      stock.price = (parseInt(stock.price * 100) + change) / 100; 
      return stock;
    });
  console.log('new stocks %s ms', Date.now() - start);
  console.log('stock 1', stocks[0]);
  console.log('stock 2', stocks[1]);
  console.log('stock 3', stocks[2]);
  console.log('stock 4', stocks[3]);
  console.log('stock 5', stocks[4]);
  ref.set(stocks);
}, 5000);
