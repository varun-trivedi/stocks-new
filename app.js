const express = require('express');
const fetch = require('node-fetch');
const app = express();
// const fetch = require('node-fetch');

const port = process.env.PORT || 3000
app.get('/search/:ticker', (req, res, next) => {

  ticker = req.params.ticker;

  // console.log("\napi call\n");
  
  fetch(`https://api.tiingo.com/tiingo/utilities/search?query=${ticker}&token=0b2244eccc1be622f7a4bbdf50a17f4c9aeb5639`)
  .then(res => res.json())
  .then(data => processData(data))
  .then(data => res.send(data));

  
  function processData(data) {

    var result = {
      results: [],
      total: 0
    };

    for (var i = 0; i < data.length; i++){
      // console.log()
      if (data[i].name) {
        result.results.push({
          name: data[i].name,
          ticker: data[i].ticker
        })
      }
    }

    result.total = result.results.length;

    return result;

  }
});



/* Get the details for the company */
app.get('/detail/:ticker', function(req, res, next) {



  details = {};
  ticker = req.params.ticker;
  // console.log("\nrequesting company details\n");

  fetch(`https://api.tiingo.com/tiingo/daily/${ticker}?token=0b2244eccc1be622f7a4bbdf50a17f4c9aeb5639`)
  .then(res => res.json())
  .then(function(data) {

    // console.log(data.detail);
    // console.log(data);

    if (!data || data.detail){
      details.results = [];
      details.success = false;
    }else{
      details.results = [data];
      details.success = true;
    }


    // console.log(details)
    res.send(details)
  });

});

/* Get the company price data  */
app.get('/price/:ticker', function(req, res, next) {

  price = {};
  ticker = req.params.ticker;
  // console.log("\nrequesting company price\n");

  fetch(`https://api.tiingo.com/iex/?tickers=${ticker}&token=0b2244eccc1be622f7a4bbdf50a17f4c9aeb5639`)
  .then(res => res.json())
  .then(function(data) {

    if (!data){
      price.results = [];
      price.success = false;
    }else{
      price.results = data;
      price.success = true;
    }

    // console.log(price)
    res.send(price)
  });
});

/* Get the daily chart data */
app.get('/chart/daily/:ticker/:startDate', function(req, res, next) {

  dailyChart = {};
  ticker = req.params.ticker;
  startDate = req.params.startDate;
  // console.log(`\nrequesting company daily chart for ${ticker} from ${startDate}\n`);

  fetch(`https://api.tiingo.com/iex/${ticker}/prices?startDate=${startDate}&resampleFreq=4min&token=0b2244eccc1be622f7a4bbdf50a17f4c9aeb5639`)
  .then(res => res.json())
  .then(function(data) {

    if (data.details){
      dailyChart.results = [];
      dailyChart.success = false;
    }else{
      dailyChart.results = data;
      dailyChart.success = true;
    }
    

    res.send(dailyChart)
  });
});


/* Get the company news data  */
app.get('/news/:ticker', function(req, res, next) {

  news = {};
  ticker = req.params.ticker;
  // console.log(`\nrequesting news ${ticker}\n`);

  fetch(`https://newsapi.org/v2/everything?apiKey=1896e8d7a07a4b5f8a2a72b7f909438d&q=${ticker}`)
  .then(res => res.json())
  .then(function(data) {

    if (!data){
      news.results = [];
      news.success = false;
    }else{
      news.results = processNews(data.articles);
      news.success = true;
    }

    res.send(news)
  });

  function processNews(data) {

    results = [];

    for (var i = 0; i < data.length; i++){
      if (data[i].url && data[i].title && data[i].description && data[i].source.name 
        && data[i].urlToImage && data[i].publishedAt) {
          results.push({
            url: data[i].url,
            title: data[i].title,
            description: data[i].description,
            source: data[i].source.name,
            urlToImage: data[i].urlToImage,
            publishedAt: data[i].publishedAt
        });

      }
    }

    return results;

  }
});

/* Get the daily chart data */
app.get('/chart/historical/:ticker', function(req, res, next) {

  const dateTwoYears = new Date();
  dateTwoYears.setFullYear(dateTwoYears.getFullYear() - 2);
  const startDate = getDateStr(dateTwoYears);
  console.log(startDate);

  histChart = {};
  ticker = req.params.ticker;
  // startDate = req.params.startDate;
  console.log(`\nrequesting company historical chart for ${ticker} from ${startDate}\n`);

  fetch(`https://api.tiingo.com/tiingo/daily/${ticker}/prices?startDate=${startDate}&resampleFreq=daily&token=0b2244eccc1be622f7a4bbdf50a17f4c9aeb5639`)
  .then(res => res.json())
  .then(function(data) {

    // console.log(data);

    if (!data || data.detail){
      histChart.results = [];
      histChart.success = false;
    }else{
      histChart.results = data;
      histChart.success = true;
    }
    res.send(histChart)
  });


  function getDateStr(date) {
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    let year = date.getFullYear();
  
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
  
    return [year, month, day].join('-');
  
  }

});

app.get('', function(req, res,) {

  res.send({
    message : "hello"
  })
  // console.log("\nrequesting company price\n");
});

app.listen(port,()=>{
    console.log("Server is up on port "+port);
})