var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(express.bodyParser())
  app.use(express.cookieParser('hello'))
  app.use(express.session())
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {

  res.render('login');
});
app.get('/signup', function(req, res) {
  res.render('signup');
});
app.get('/index', function(req, res) {
  res.render('index');
});
app.get('/create', function(req, res) {
  res.render('index');
});

app.get('/links', function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  })
});

app.post('/links', function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

app.post('/signup', function(req, res) {
  var user = new User({username: req.body.username,password : req.body.password});
  user.save().then(function(newUser){
    Users.add(newUser);
    //TODO :- redirect to index page for the user.
  });

});


app.post('/login', function(req, res) {
  var user = new User({username: req.body.username});
  user.fetch().then(function(user){
      console.log("user after fetch :",user);
      user.checkPassword(req.body.password)
      .then(function(match){
        console.log('match',match);
        if(match){
          req.session.regenerate(function(){
            req.session.user =  user.username;
            res.redirect('/index');
          });
        }else{
          console.log("Invalid Password");
          res.redirect('/login');
        }
        // Render index of the set users
      })
      .catch(function(err){
        console.log('err',err);
        //Show invalid password and render login page
      });
    });
});

    //Get username and password from req.body
    // var username = req.body.username;


    // new User({name: username,}).fetch().then(function(found){
    //   if(found){

    //   }else{
    //     var user = new User(username, req.body.password);
    //   }
    // })

    //Hash password
    //Create a new user in user table with {username}
    //Fetch user from table based on username
    //if username found
      //Check if hashed pw matches user-provided hashed_pw
        // render Index
      // else
        // re render login (with message invalid password)
    // else
      // render sign up




    // if (!util.isValidUrl(uri)) {
    //   console.log('Not a valid url: ', uri);
    //   return res.send(404);
    // }

    // new Link({ url: uri }).fetch().then(function(found) {
    //   if (found) {
    //     res.send(200, found.attributes);




/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
