'use strict';


var mailgun = require('mailgun-js')({apiKey: process.env.mailgunKey, domain: process.env.mailgunDomain});
var mailcomposer = require('mailcomposer');
module.exports = function (app, db, bcrypt,jwt,request,identicon,fmt) {

   var questions = db.collection('questions');
   var drafts = db.collection('drafts');
   var users = db.collection('users');
   var answers = db.collection('answers');
   var serveForm;

   app.route('/api/profile')
    .get(function(req,res){
     jwt.verify(req.headers.authorization,process.env.tokenKey,function(err,decoded){
       res.send(decoded)
     })
   })
function toCSV(object){
    var counter = 1;
    var results = {};
    var output = '"Question';
    var questionAnswers = [];
    for (var key in object){
        object[key].forEach(function(x){
          output += '","';
            output += 'participant';
                     delete x['title']
            delete x['origin']
            x.participant = counter;
            for (var elm in x){
                if(results[elm])
                results[elm] += '","'+x[elm]
                else
                results[elm] = x[elm]

            }

            counter +=1;
        })

    }
   for (var key in results) {
           output += '"\r\n';
           output +='"';
    output += key+'","';
    output += results[key];

           }
           output += '"';
        return output
}
   app.route('/download')
   .get(function(req,res){
     var ObjectId = require('mongodb').ObjectID;
     console.log('the id of the requested survey is '+req.query.id)
     drafts.find({"_id": ObjectId(req.query.id)}).toArray(function(err,data){
     var output = toCSV(data[0].answers)
          res.setHeader('Content-disposition', 'attachment; filename=theDocument.csv');
res.setHeader('Content-type', 'text/plain');
res.charset = 'UTF-8';
console.log(output)
res.write(output);
res.end();
     })
     console.log('serving file')

   })
   app.route('/legal')
    .get(function(req,res){
      res.sendFile(process.cwd() +'/public/disclaimer.html')
    })
    app.route('/mailrequest')
    .post(function(req,res){
      console.log(req.body)
      var data = {
        from: req.body.email,
        to: 'tobe.guse@gmail.com',
        subject: req.body.title,
        text: req.body.message
      };

      mailgun.messages().send(data, function (error, body) {
        console.log(error)
        console.log(body)
      });
    })
   app.route('/')
      .get(function (req, res) {
         res.sendFile(process.cwd() + '/public/index.html');

      })
      .post(function(req,res){
        console.log('server has received a draft:')
        console.log(req.body)
        jwt.verify(req.headers.authorization, process.env.tokenKey, function(err, decoded) {
          if (err) throw err;
            req.body.email = decoded.email;

        var shortId = require('short-mongo-id');
        if (req.body.link !== undefined) {
          console.log(req.body);
          delete req.body._id;
          drafts.find({'link': req.body.link }).toArray(function(err,data){
            if (err) throw err;
          });
          console.log("updating draft");
          drafts.update({'link': req.body.link},req.body,function(err,data){
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
          drafts.update({_id: data.insertedIds[0]},{ $set: {link:link}},function(err,moredata){
            if (err) throw err;
            res.send(link)
          })
        })};

      })})
  app.route('/drafts')
    .get(function(req,res){

          res.setHeader('Content-Type','application/json');
          console.log(req.headers)
            if (req.headers.authorization === undefined) {res.sendStatus(401); console.log('draft access denied')}
            else jwt.verify(req.headers.authorization, process.env.tokenKey, function(err, decoded) {
            if (err) res.sendStatus(401);
          drafts.find({'email':decoded.email}).toArray(function(err,data){
              if (err) throw err;
              res.send(data)
});


      });
    });
  app.route('/api/surveydata')
  .post(function(req,res){
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
  jwt.verify(req.headers.authorization,process.env.tokenKey,function(err,decoded){
    console.log(err)
    console.log(decoded)
    if (err) {res.redirect('/login'); res.end()}
    else {
    var email = decoded.email;
    drafts.find({"link":id,"email":email}).limit(1).toArray(function(err,data){
      if (err) throw err;
      res.send(data[0])

    })
      }
  })
})

app.route('/api/active')
.get(function(req,res){
  if (req.headers.authorization === undefined) {res.sendStatus(401); console.log('draft access denied')}
  else jwt.verify(req.headers.authorization, process.env.tokenKey, function(err, decoded) {
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
  else jwt.verify(req.headers.authorization, process.env.tokenKey, function(err, decoded) {
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
  request.post('https://github.com/login/oauth/access_token?client_id=f0ccba6a396af395540f&client_secret='+process.env.githubSecret+'&code='+req.query.code) ///use main function with body instead.
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
        console.log(body)
        var email = obj.email;
        var githubId = obj.id;
        var name = obj.name;
        var image = obj.avatar_url;
        console.log(email)
        console.log(name)
        users.find({email:email}).limit(1).toArray(function(err,data){
        if (data[0] === undefined){
        console.log('no existing user found, creating new user');
        users.insert({githubId:githubId, name:name, email:email, imageMd:image})
        }
        else {
        console.log('user found!')
        if (image && !data[0].imageMd){
          users.update({email:email},{$set:{imageMd:image}})
          console.log('added image');
        }
        if (data[0].password) delete data[0].password;
        var token = jwt.sign(data[0],process.env.tokenKey,{expiresIn:14400});
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
  var email = req.body.email.toLowerCase();
  var fbid = req.body.id;
  var name = req.body.name;
  var image = req.body.image;
  users.find({email:email}).limit(1).toArray(function(err,data){
  if (data[0] === undefined){
  console.log('no existing user found, creating new user');
  users.insert({fbid:fbid, name:name, email:email, imageMd:image},function(err,data){
  console.log('user creation successful')
  var token = jwt.sign(fbid,process.env.tokenKey,{expiresIn:14400});
  console.log('here is your token:')
  console.log(token)
  res.send({
    success:true,
    message:'your token is ready',
    token: token
  });
  })
  }
  else {
  console.log('user found!')
  console.log(data[0])
  if (image && !data[0].imageMd){
    users.update({email:email},{$set:{imageMd:image}})
    console.log('added image');
  }
  if (data[0].password) delete data[0].password;
  var token = jwt.sign(data[0],process.env.tokenKey,{expiresIn:14400});
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
    var email = req.body.email.toLowerCase();
    var password = req.body.password;
    users.find({email:email}).limit(1).toArray(function(err,data){
    if (err) throw err;
    if (data[0] === undefined){
    console.log('user not found.')
      res.status(401).end('user not found');
    }
    else if (!data[0].activated) {
      console.log('user not activated')
      res.status(401).end('user not activated');
    }
    else if (bcrypt.compareSync(password,data[0].password)){
    console.log('Successful Login.');
    delete data[0].password;
    var token = jwt.sign(data[0],process.env.tokenKey,{expiresIn:14400});
    res.send({
      success:true,
      message:'your token is ready',
      token: token
    });
    }
    else {
    console.log('Bad Login')
    res.status(401).end('wrong password');
  }});
    })
  app.route('/user')
  .get(function(req,res){
    if (req.headers.authorization === undefined) {res.sendStatus(401); console.log('user access denied')}
    else jwt.verify(req.headers.authorization, process.env.tokenKey, function(err, decoded) {
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

  app.route('/validate')
    .get(function(req,res){
    console.log(req.query.code)
    users.find({confirmationLink:req.query.code}).toArray(function(err,data){
    if (data.length > 0){
      res.sendFile(process.cwd()+'/public/activated.html');
      users.update({confirmationLink:req.query.code}, {$set: {activated:true}});
      users.update({confirmationLink:req.query.code},{$unset: {confirmationLink:""}});
    }
    else res.sendFile(process.cwd()+'/public/activated-fail.html');
    })
  });

  app.route('/restore/success')
  .post(function(req,res){
    console.log(req)
    var hash = bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10));
    users.find({restoreLink:req.body.code}).toArray(function(err,data){
            console.log(data)
    if (data.length > 0){

    users.update({restoreLink:req.body.code}, {$set: {password:hash}});
    users.update({restoreLink:req.body.code},{$unset: {restoreLink:""}});
  }
  else res.end('error');
  })
});
app.route('/avatar')
.get(function(req,res){
  var avatar = fmt("<img alt='kibo' src='%s' />", identicon('tobe.guse@gmail.com', { pixelSize: 10, bgColor:'#ccc' }).toDataURL());
  var regexp = /src='(\S*)'/g;
  var filtered = regexp.exec(avatar);
res.send(filtered[1])
})
app.route('/api/recover')
.post(function(req,res){
  console.log(req.body.code);
  users.find({restoreLink:req.body.code}).toArray(function(err,data){
    console.log(data)
  if (data.length < 1) {
  res.sendStatus(404);
  }
  else {
  res.sendStatus(200);
  }
  })
})
app.route('/restore')
.post (function(req,res){
  console.log(req.body.email)

  if (email === undefined) res.end('user not found')
    var email = req.body.email.toLowerCase();
  users.find({email:email}).toArray(function(err,data){
  if (data.length === 0) res.end('user not found');
  else {
    console.log(req.body)
  var restoreLink = bcrypt.hashSync(req.body.email,bcrypt.genSaltSync(10));
  users.update({email:email},{$set:{restoreLink:restoreLink}});
  console.log('sent restore link')
  var mail = mailcomposer({
from: 'opensurvey <noresonse@opensurveys.org>',
to: 'tobe.guse@gmail.com',
subject: 'Reset your opensurvey password',
body: '',
html: {path: process.cwd() +'/public/email/recover.html'}
});

mail.build(function(mailBuildError, message) {

var dataToSend = {
    to: 'tobe.guse@gmail.com',
    message: message.toString('ascii')
};
dataToSend.message = dataToSend.message.replace(/###confirmation.link###/g,process.env.address +'/restore?code&#61;'+restoreLink)
console.log(dataToSend.message)
mailgun.messages().sendMime(dataToSend, function (sendError, body) {
    if (sendError) {
        console.log(sendError);
        return;
    }
});
});

  res.end()
  }
});
})

  app.route('/signup')
  .post(function(req,res){
    var email = req.body.email.toLowerCase();
    var name = req.body.name;
    var avatar = fmt("<img alt='avatar' src='%s' />", identicon(email, { pixelSize: 12,tiles:8, bgColor:'#ccc' }).toDataURL());
    var regexp = /src='(\S*)'/g;
    var filtered = regexp.exec(avatar);
    avatar = filtered[1];
    users.find({email:email}).toArray(function(err,data){
      if(data.length === 0) {
      console.log('creating new user')
      var hash = bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10));
      var confirmationLink = bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10));
      confirmationLink.replace(/\B\./g,'K');
      users.insert({email: email, name:name, password:hash,confirmationLink:confirmationLink, avatar:avatar, activated:false});
      var mail = mailcomposer({
  from: 'opensurvey <noresonse@opensurveys.org>',
  to: 'tobe.guse@gmail.com',
  subject: 'Welcome to opensurvey',
  body: 'Test email text',
  html: {path: process.cwd() +'/public/email/welcome.html'}
});

mail.build(function(mailBuildError, message) {

    var dataToSend = {
        to: 'tobe.guse@gmail.com',
        message: message.toString('ascii')
    };
 dataToSend.message = dataToSend.message.replace(/###confirmation.link###/g,process.env.address +'/validate?code&#61;'+confirmationLink).replace(/###user.name###/g,name)
 console.log(dataToSend.message)
    mailgun.messages().sendMime(dataToSend, function (sendError, body) {
        if (sendError) {
            console.log(sendError);
            return;
        }
    });
});
             res.end('user created')
      }
      else {
      console.log('cannot create new user, user already exists.')
      res.end('user exists already')
      }
    })

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
    else jwt.verify(req.headers.authorization, process.env.tokenKey, function(err, decoded) {
      if (err) res.sendStatus(401);
      else users.find({email: decoded.email}).toArray(function(data){
        if (err) res.sendStatus(401);
        else res.sendFile(process.cwd() + '/public/backend.html')
        })
      })
    })

};
