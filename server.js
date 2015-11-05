'use strict';

var express = require('express');
var mongo = require('mongodb');
var routes = require('./app/routes/index.js');
var bodyParser = require('body-parser');
var app = express();

mongo.connect('mongodb://localhost:27017/clementinejs', function (err, db) {

   if (err) {
      throw new Error('Database failed to connect!');
   } else {
      console.log('Successfully connected to MongoDB on port 27017.');
   }
   app.use(bodyParser.json({extended:false}));
   app.use('/public', express.static(process.cwd() + '/public'));
   app.use('/js', express.static(process.cwd() + '/app/js'));

   routes(app, db);

   app.listen(process.env.PORT, function () {
      console.log('Node.js listening on port 3000...');
   });

});
