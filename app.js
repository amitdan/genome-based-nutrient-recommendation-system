const express = require('express');
const session = require('express-session');
const genomeLink = require('genomelink-node');
const fetchAction =  require('node-fetch');

const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(session({
  secret: 'YOURSECRET',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000
  }
}));

const url = "https://data.fireplace99.hasura-app.io/v1/query";

const requestOptions = {
    "method": "POST",
    "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer dfccbfbf27a8c2ae9d1dfaf08b6d44b3b2334ce4c4722ee9"
    }
};

var body ={
    "type": "select",
    "args": {
        "table": "vitamin",
        "columns": [
            "type",
            "item",
            "weather",
            "a",
            "b1",
            "b2",
            "b6",
            "c"
        ],
        "where": {
            "a": {
                "$eq": "true"
            }
            
        }
    }
};


requestOptions.body = JSON.stringify(body);
var apiResponse = '';

fetchAction(url, requestOptions)
.then(function(response) {
	return response.json();
})
.then(function(result) {
	apiResponse = result;
	console.log(JSON.stringify(result));
})
.catch(function(error) {
	console.log('Request Failed:' + error);
});

var body1 = {
    "type": "select",
    "args": {
        "table": "vitamin",
        "columns": [
            "type",
            "item",
            "weather"
        ],
        "where": {
            "a": {
                "$eq": "true"
            },
            "b1": {
                "$eq": "false"
            }
        }
    }
};

requestOptions.body1 = JSON.stringify(body1);
var apiResponse1 = '';

fetchAction(url, requestOptions)
.then(function(response) {
	return response.json();
})
.then(function(result) {
	console.log(JSON.stringify(result));
})
.catch(function(error) {
	console.log('Request Failed:' + error);
});

var body2 = {
    "type": "select",
    "args": {
        "table": "vitamin",
        "columns": [
            "type",
            "item",
            "weather"
        ],
        "where": {
            "a": {
                "$eq": "true"
            },
            "b1": {
                "$eq": "false"
            },
            "Folate": {
                "$gte": "20"
            }
        }
    }
};

requestOptions.body2 = JSON.stringify(body2);

fetchAction(url, requestOptions)
.then(function(response) {
	return response.json();
})
.then(function(result) {
	console.log(JSON.stringify(result));
})
.catch(function(error) {
	console.log('Request Failed:' + error);
});



app.get('/', async (req, res) => {
  const scope = 'report:calcium report:carbohydrate-intake report:folate report:iron report:magnesium report:phosphorus report:protein-intake report:vitamin-a report:vitamin-b12 report:vitamin-d report:vitamin-e';
  const authorizeUrl = genomeLink.OAuth.authorizeUrl({ scope: scope });
  // Fetching a protected resource using an OAuth2 token if exists.
  let reports = [];
  if (req.session.oauthToken) {
    const scopes = scope.split(' ');
    reports = await Promise.all(scopes.map( async (name) => {
      return await genomeLink.Report.fetch({
        name: name.replace(/report:/g, ''),
        population: 'european',
        token: req.session.oauthToken
      });
    }));
  }

  res.render('index', {
    authorize_url: authorizeUrl,
    reports: reports,
	apiResponse: apiResponse,
	apiResponse1: apiResponse1,
    //apiResponse2: apiResponse2,
  });
});


app.get('/callback', async (req, res) => {
  // The user has been redirected back from the provider to your registered
  // callback URL. With this redirection comes an authorization code included
  // in the request URL. We will use that to obtain an access token.
  req.session.oauthToken = await genomeLink.OAuth.token({ requestUrl: req.url });

  // At this point you can fetch protected resources but lets save
  // the token and show how this is done from a persisted token in index page.
  res.redirect('/');
});

// Run local server on port 3000.
const port = process.env.PORT || 3000;
const server = app.listen(port, function () {
  console.log('Server running at http://127.0.0.1:' + port + '/');
});
