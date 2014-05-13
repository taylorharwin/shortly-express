var db = require('../config');
var Link = require('./link.js');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var hash = Promise.promisify(bcrypt.hash);

var User = db.Model.extend({
    tableName: 'users',
    hasTimestamps: false,

    link: function(){
      return this.belongsTo(Link, 'link_id');
    },

    checkPassword: function(pw){
      return true;
    },

    initialize: function(username, password){
      // this.on('creating', function(model, attrs, options){
        console.log('username :',username);
        console.log('password :',password);
        var salt = username;  // just to have a unique salt for each user
        var userModel = this;

        bcrypt.hash(password,null,null,function(err, hash){
          if (err){
            throw err;
          } else {
            userModel.set('password',hash);
            console.log(userModel);
          }
        });
      // });
    }

  });

module.exports = User;
