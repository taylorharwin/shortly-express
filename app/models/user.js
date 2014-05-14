var db = require('../config');
var Link = require('./link.js');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var compare = Promise.promisify(bcrypt.compare);

var User = db.Model.extend({
    tableName: 'users',
    hasTimestamps: false,

    link: function(){
      return this.belongsTo(Link, 'link_id');
    },

    checkPassword: function(password){
      return compare(password,this.get('password'));

    },

    initialize: function(user){
      // this.on('creating', function(model, attrs, options){
        // var salt = username;  // just to have a unique salt for each user
        var userModel = this;

        bcrypt.hash(user.password,null,null,function(err, hash){
          if (err){
            throw err;
          } else {
            userModel.set('password',hash);
          }
        });
      // });
    }

  });



module.exports = User;
