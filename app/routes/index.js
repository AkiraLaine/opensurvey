'use strict';

var ClickHandler = require(process.cwd() + '/app/controllers/clickHandler.server.js');
module.exports = function (app, db, bcrypt,jwt) {


   var clickHandler = new ClickHandler(db);
   var questions = db.collection('questions');
   var drafts = db.collection('drafts');
   var users = db.collection('users');
   var answers = db.collection('answers')
   var serveForm;

   app.route('/api/profile')
    .get(function(req,res){
     jwt.verify(req.headers.authorization,'cookiesandcream',function(err,decoded){
       res.send(decoded)
     })
   })
   app.route('/')
      .get(function (req, res) {
         res.sendFile(process.cwd() + '/public/index.html');

      })
      .post(function(req,res){
        console.log(req.headers)
        jwt.verify(req.headers.authorization, 'cookiesandcream', function(err, decoded) {
          if (err) throw err;
            console.log(decoded)
            req.body.email = decoded.email;
        var shortId = require('short-mongo-id');
        if (req.body._id !== undefined) {


          var ObjectID = require('mongodb').ObjectID;
          console.log('saving draft with id '+req.body._id);
          console.log(typeof req.body._id)
          var id = new ObjectID(req.body._id);
          delete req.body._id;

          req.body.link = shortId(id);
          console.log(req.body);
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
         var ObjectID = require('mongodb').ObjectID;
         var id = new ObjectID(req.body._id);
         var link = shortId(id);
          if (err) throw err;
          console.log("DEBUG inserted document: "+JSON.stringify(data));
          drafts.update({_id: data.insertedIds[0]},{ $set: {link:link}},function(err,data){
            if (err) throw err;
          })
        })};
        drafts.find().toArray(function(err,data){
          if (err) throw err;

        });
        res.end();
      })})
  app.route('/drafts')
    .get(function(req,res){

          res.setHeader('Content-Type','application/json');
          console.log(req.headers)
            if (req.headers.authorization === undefined) {res.sendStatus(401); console.log('draft access denied')}
            else jwt.verify(req.headers.authorization, 'cookiesandcream', function(err, decoded) {
            if (err) throw err;
          drafts.find({'email':decoded.email}).toArray(function(err,data){
              if (err) throw err;
              res.send(data)
});


      });
    });
  app.route('/api/surveydata')
  .post(function(req,res){
    console.log('arrived')
    console.log(req.body.surveyLink.match(/[^/survey].*/g)[0].toString())
    var survey = req.body.surveyLink.match(/[^/survey].*/g).toString();
    drafts.find({"link":survey}).limit(1).toArray(function(err,data){
      if (err) throw err;
      res.send(data[0])
  })
})
app.route('/api/active')
.get(function(req,res){
  if (req.headers.authorization === undefined) {res.sendStatus(401); console.log('draft access denied')}
  else jwt.verify(req.headers.authorization, 'cookiesandcream', function(err, decoded) {
  if (err) throw err;
drafts.find({'email':decoded.email, 'published':true}).toArray(function(err,data){
    if (err) throw err;
    res.send(data)
});
})
})
app.route('/api/results')
.post(function(req,res){
  var date = new Date();
  var answer = req.body;
  var currentDate = "newanswers."+date.toLocaleDateString();
  var response = {};
  var query = {};
  query.newanswers = {};
  query.newanswers[date.toLocaleDateString()];
  query.newanswers[date.toLocaleDateString()] = [];
  query.newanswers[date.toLocaleDateString()] = [answer];
  console.log(query.newanswers[date.toLocaleDateString()])
  var update = {}
  update[currentDate] = answer;
  drafts.update(query,{$push: update})
  drafts.update({"link":answer.origin}, {$push: update});

})
.get(function(req,res){
  if (req.headers.authorization === undefined) {res.sendStatus(401); console.log('draft access denied')}
  else jwt.verify(req.headers.authorization, 'cookiesandcream', function(err, decoded) {
  if (err) throw err;
answers.find({'email':decoded.email}).toArray(function(err,data){

    if (err) throw err;
    res.send(data)
});
})
});
  app.route('/survey/*')
  .get(function(req,res){
    res.sendFile(process.cwd()+'/public/survey-live.html');
  })
  app.route('/login')
  .post(function(req,res){
    var email = req.body.email;
    var password = req.body.password;

    users.find({email:email}).limit(1).toArray(function(err,data){
    if (err) throw err;
    if (data[0] === undefined)
    console.log('user not found.')
    else {
    if (bcrypt.compareSync(password,data[0].password))
    {console.log('Successful Login.');
    delete data[0].password;
    var token = jwt.sign(data[0],'cookiesandcream',{expiresIn:14400});
    res.send({
      success:true,
      message:'your token is ready',
      token: token
    });}
    else {console.log('Bad Login')
    res.end();}}
    })


  })
    .get(function(req,res){
      res.sendFile(process.cwd() + '/public/login.html')
    })
  app.route('/questions')
      .get(function(req,res){
        res.setHeader('Content-Type','application/json');
        questions.find().toArray(function(err,data){
          if (err) throw err;
          res.send(data)
        })
      })
  app.route('/signup')
  .post(function(req,res){
    var email = req.body.email;
    var hash = bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10));
    users.insert({email: email, password:hash})

  })
  app.route('/backend')

  .get(function(req,res){

res.sendFile(process.cwd() + '/public/backend.html')})


   app.route('/api/clicks')
      .get(clickHandler.getClicks)
      .post(clickHandler.addClick)
      .delete(clickHandler.resetClicks);

};
