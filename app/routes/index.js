'use strict';

var ClickHandler = require(process.cwd() + '/app/controllers/clickHandler.server.js');
   var keys = require(process.cwd()+'/keys.js');
module.exports = function (app, db, bcrypt,jwt,request) {

   var questions = db.collection('questions');
   var drafts = db.collection('drafts');
   var users = db.collection('users');
   var answers = db.collection('answers');
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
            if (err) res.sendStatus(401);
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
//new api
app.route('/api/survey')
.get(function(req,res){
  console.log(req.headers)
  var id = req.headers.survey;
  jwt.verify(req.headers.authorization,'cookiesandcream',function(err,decoded){
    var email = decoded.email;
    drafts.find({"link":id,"email":email}).limit(1).toArray(function(err,data){
      if (err) throw err;
      res.send(data[0])
    })
  })
})

app.route('/api/active')
.get(function(req,res){
  if (req.headers.authorization === undefined) {res.sendStatus(401); console.log('draft access denied')}
  else jwt.verify(req.headers.authorization, 'cookiesandcream', function(err, decoded) {
  if (err) res.redirect('/login');
  else {drafts.find({'email':decoded.email, 'published':true}).toArray(function(err,data){
    if (err) throw err;
    res.send(data)
})};
})
})
app.route('/api/results')
.post(function(req,res){
  var date = new Date();
  var answer = req.body;
  var currentDate = "answers."+date.toLocaleDateString();
  var response = {};
  var query = {};
  query.answers = {};
  query.answers[date.toLocaleDateString()];
  query.answers[date.toLocaleDateString()] = [];
  query.answers[date.toLocaleDateString()] = [answer];
  console.log(query.answers[date.toLocaleDateString()])
  var update = {}
  update[currentDate] = answer;
  drafts.update(query,{$push: update})

  drafts.update({"link":answer.origin}, {$push: update});
    console.log('saving an answer')
  res.end();
})
.get(function(req,res){
  if (req.headers.authorization === undefined) {res.sendStatus(401); console.log('draft access denied')}
  else jwt.verify(req.headers.authorization, 'cookiesandcream', function(err, decoded) {
  if (err) res.sendStatus(401);
  else {answers.find({'email':decoded.email}).toArray(function(err,data){
    if (err) throw err;
    res.send(data)
});}
})
});
  app.route('/survey/*')
  .get(function(req,res){
    res.sendFile(process.cwd()+'/public/survey-live.html');
  })
  app.route('/login/github/test')
  .get(function(req,res){
    res.sendFile(process.cwd()+'/public/githublogin.html')
  })
  app.route('/login/github')
  .get(function(req,res){
  console.log('received a github login')
  request.post('https://github.com/login/oauth/access_token?client_id=f0ccba6a396af395540f&client_secret='+githubSecret+'&code='+req.query.code) ///use main function with body instead.
  .on('data', function(data) {
    console.log(data)
    console.log('decoded chunk: ' + data)
    console.log(data.toString('utf8'))
    var regexp = /(?:=)(.*)(?:&scope)/g;
        var token = regexp.exec(data.toString('utf8'))
        var options = {
  url: 'https://api.github.com/user?access_token='+token[1],
  headers: {
    'User-Agent': 'tbgse'
  }
};
    console.log(token)
      request.get(options,function(err,response,body){
        console.log('entering main function')
        var obj = JSON.parse(body);
        var email = obj.email;
        var githubId = obj.id;
        var name = obj.name;
        console.log(email)
        console.log(name)
        users.find({email:email}).limit(1).toArray(function(err,data){
        if (data[0] === undefined){
        console.log('no existing user found, creating new user');
        users.insert({githubId:githubId, name:name, email:email})
        }
        else {
        console.log('user found!')
        if (data[0].password) delete data[0].password;
        var token = jwt.sign(data[0],'cookiesandcream',{expiresIn:14400});
        console.log('here is your token:')
        console.log(token)
        res.send({
          success:true,
          message:'your token is ready',
          token: token
        });
        }
        })
      })
  })
  .on('error', function(response) {

    console.log(response.statusCode) // 200
    console.log(response.headers['content-type']) // 'image/png'
})
});
  app.route('/login/facebook')
  .post(function(req,res){
    console.log('a facebook login is happening')
    console.log(req.body)
    var email = req.body.email;
    var fbid = req.body.id;
    var name = req.body.name
    users.find({email:email}).limit(1).toArray(function(err,data){
    if (data[0] === undefined){
    console.log('no existing user found, creating new user');
    users.insert({fbid:fbid, name:name, email:email})
    }
    else {
    console.log('user found!')
    if (data[0].password) delete data[0].password;
    var token = jwt.sign(data[0],'cookiesandcream',{expiresIn:14400});
    console.log('here is your token:')
    console.log(token)
    res.send({
      success:true,
      message:'your token is ready',
      token: token
    });
    }
    })
  })
  app.route('/login')
  .post(function(req,res){
    console.log('trying login...')
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
  app.route('/user')
  .get(function(req,res){
    if (req.headers.authorization === undefined) {res.sendStatus(401); console.log('user access denied')}
    else jwt.verify(req.headers.authorization, 'cookiesandcream', function(err, decoded) {
    if (err) res.sendStatus(401);
    else {users.find({'email':decoded.email}).toArray(function(err,data){
      if (err) throw err;
      res.send(data)
  });}
  })
  });
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
    var name = req.body.name;
    var hash = bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10));
    users.insert({email: email, name:name, password:hash})

  })
  app.route('/api/delete')
  .post(function(req,res){
    console.log('deleting '+req.body.link)
    drafts.remove({link: req.body.link});
    res.end();
  })
  app.route('/backend')

  .get(function(req,res){

    if (req.headers.authorization === undefined) {
      res.redirect('/login')
    }
    else jwt.verify(req.headers.authorization, 'cookiesandcream', function(err, decoded) {
      if (err) res.sendStatus(401);
      else users.find({email: decoded.email}).toArray(function(data){
        if (err) res.sendStatus(401);
        else res.sendFile(process.cwd() + '/public/backend.html')
        })
      })
    })

};
