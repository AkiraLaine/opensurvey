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
        var shortId = require('short-mongo-id');
        if (req.body._id !== undefined) {

          var ObjectID = require('mongodb').ObjectID;
          console.log('saving draft with id '+req.body._id);
          console.log(typeof req.body._id)
          var id = new ObjectID(req.body._id);
          delete req.body._id;
          req.body.link = shortId(id);
          drafts.find().toArray(function(err,data){
            if (err) throw err;
            console.log('looking for drafts in general and found '+JSON.stringify(data))
          });
          drafts.find({'_id': id }).toArray(function(err,data){
            if (err) throw err;
            console.log('looking for drafts with id '+req.body._id+ 'and found '+data)
          });
          drafts.update({_id: id},req.body,function(err,data){
             if (err) throw err;

           });
        }
        else {
            console.log('adding new draft')
       drafts.insert(req.body,function(err,data){
          if (err) throw err;

        })};
        drafts.find().toArray(function(err,data){
          if (err) throw err;

        });
        res.end();
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
