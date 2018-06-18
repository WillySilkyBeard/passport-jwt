const express = require('express');
const nunjucks = require('nunjucks');
const mongoose = require('mongoose')
const passport = require('passport');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { Strategy } = require('passport-jwt');
const keys = require('./keys')

mongoose.connect(keys.mongoURI)
  .then(() => console.log('mongoDB connected'))
  .catch(err => console.error(err))
// debug mongoDB query
mongoose.set('debug', true)

const {jwt} = require('./config')

passport.use(new Strategy(jwt, function (jwt_payload, done) {
  if (jwt_payload != void (0)) return done(false, jwt_payload)
  done()
}))

// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');
// Configure view engine to render nunjucks templates.
nunjucks.configure('client/views', {
  autoescape: true,
  express: app
});

app.use(cookieParser());
// parse application/x-www-from-url-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json())

require('./routes/router')(app)

app.listen(3000, () => {
  console.log('Server started on port 3000');
})
