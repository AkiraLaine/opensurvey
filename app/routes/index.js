'use strict';

var ClickHandler = require(process.cwd() + '/app/controllers/clickHandler.server.js');
module.exports = function (app, db) {
   var clickHandler = new ClickHandler(db);
   var questions = db.collection('questions');
   var drafts = db.collection('drafts');
   app.route('/')
      .get(function (req, res) {
         res.sendFile(process.cwd() + '/public/index.html');

      })
      .post(function(req,res){
      console.log('parsing body:'+req.body)
       drafts.insert(req.body,function(err,data){
          if (err) throw err;
          console.log('data for export: '+data)
        });
        drafts.find().toArray(function(err,data){
          if (err) throw err;
          console.log(data)
        });
      })
  app.route('/drafts')
    .get(function(req,res){
          res.setHeader('Content-Type','application/json');
      drafts.find().toArray(function(err,data){
        if (err) throw err;
        res.send(data)
      })
    })
  app.route('/questions')
      .get(function(req,res){
        res.setHeader('Content-Type','application/json');
        questions.find().toArray(function(err,data){
          if (err) throw err;
          res.send(data)
        })
      })
  app.route('/backend')
  .get(function(req,res){
    res.sendFile(process.cwd() + '/public/backend.html')
  });
   app.route('/api/clicks')
      .get(clickHandler.getClicks)
      .post(clickHandler.addClick)
      .delete(clickHandler.resetClicks);
};
