var app = angular.module('votingapp',['ngAnimate','ui.bootstrap','ngRoute']);
var counter = 1;
//helper funcitons


Object.defineProperty(Array.prototype, "min", {
  value: function(obj) {
		var result = 0;
		this.forEach(function(x){
			if (result - x > 0) result = x;
		});
		return result;
    }
});

Object.defineProperty(Array.prototype, "max", {
  value: function(obj) {
		var result = 0;
		this.forEach(function(x){
			if (result - x < 0) result = x;
		});
		return result;
    }
});


function randomArrayValue(arr) {
  return (arr[Math.floor(Math.random()*arr.length)])
}

function getNiceColor(){
  var colors=['#27ae60','#2980b9','#16a085','#8e44ad','#2c3e50','#e74c3c','#7f8c8d','#e67e22'];
  var nextColor = colors[(Math.floor(Math.random() * colors.length))]
  console.log(nextColor)
  return nextColor;
}

function assignColor(arr){
  if (arr[1] === 'male') return  randomArrayValue(['#27ae60','#2980b9','#16a085','#8e44ad','#2c3e50','#e74c3c','#7f8c8d','#e67e22']);
  if (arr[1] === 'female') return randomArrayValue(['#27ae60','#2980b9','#16a085','#8e44ad','#2c3e50','#e74c3c','#7f8c8d','#e67e22']);
  if (arr[1] === 'income') return randomArrayValue(['#27ae60','#2980b9','#16a085','#8e44ad','#2c3e50','#e74c3c','#7f8c8d','#e67e22']);
  if (arr[1] === 'age') return randomArrayValue(['#27ae60','#2980b9','#16a085','#8e44ad','#2c3e50','#e74c3c','#7f8c8d','#e67e22']);
}

function fadeOut(id,speed){
  var element = document.getElementById(id)
  element.style.opacity = 1;
  var fade = window.setInterval(function(){
    element.style.opacity -= 0.1;
    if (element.style.opacity <= 0){
      element.style.visibility = 'hidden';
      window.clearInterval(fade)
    };
  },speed)
}

function fadeIn(id,speed){
  if (typeof id === 'string')
  
  var element = document.getElementById(id);
  else
  var element = id;
    	console.log('fading stuff1')
  if (element.style.visibility !== 'visible'){
  		console.log('fading stuff2')
  var counter = 0;
  element.style.opacity = 0;
  element.style.visibility = 'visible';
  draw();
  function draw(){
  	console.log('fading stuff3')
  	counter += 0.1;
  element.style.opacity = counter;
  if (element.style.opacity <1){
  requestAnimationFrame(draw)
  }
  }
  
}
}
function weeklyView(data) {
	if (data.length < 7){

		var mon1   = parseInt(data[data.length-1].substring(0,2));
		var dt1  = parseInt(data[data.length-1].substring(3,5));
		var yr1   = parseInt(data[data.length-1].substring(6,10));
		var d = new Date(yr1,mon1-1,dt1);
		for (var i = data.length;i < 7;i++){
		d.setDate(d.getDate()+1)
		data.push(d.toLocaleDateString())
	}
	}
}

function countArrayStrings(array,labels){
	var results = [];
	labels.forEach(function(x){
		var filtered = array.filter(function(value){
			return value === x;
		})
		results.push(filtered.length)
	})
return results;

}

app.config(function($routeProvider,$locationProvider){
	$locationProvider.html5Mode(true);
	$routeProvider.when('/dashboard',{templateUrl: '/public/backend.html',
	controller:'dashboardCtrl'}).
	when('/create',{templateUrl:'/public/backend.html',
	controller:'surveyCreationCtrl'}).
	when('/edit',{templateUrl:'/public/backend.html',
	controller:'surveyCreationCtrl'}).
	when('/edit:survey',{templateUrl:'/public/backend.html',
	controller:'surveyCreationCtrl'}).
	when('/',{templateUrl:'/public/frontpage.html',
  controller:'frontpageCtrl'}).
	when('/surveys',{templateUrl: '/public/backend.html',
	controller:'surveyOverviewCtrl'}).
	when('/results:survey',{templateUrl:'/public/backend.html',
	controller:'surveyAnswersCtrl'}).
	when('/login',{templateUrl:'/public/login.html',
	controller:'userCtrl'}).
  when('/restore',{templateUrl:'/public/login.html',
  controller:'restoreCtrl'})
});
app.directive('sideBar',function($http){
  return {
    restrict:'E',
    replace:true,
    templateUrl:'/public/sidebar.html',
    link:function(scope,elm){
    scope.userName = 'Tobias'
    $http.get('/user').then(function(data){
      scope.user = data.data[0]
    });
    }
  }
})
app.directive('pageNumbers',function(){
	return {
		restrict:'E',
		scope: {content: '=',
						limit: '=',
						counter: '='},
		replace:true,
		templateUrl:'/public/pagination.html',
		link:function(scope,elm){
			scope.higher = [];
			scope.lower = [];
			scope.counter = 0;
			scope.pageNumbers = [];
			for (var i = 1;i<=scope.content.length;i++){
				scope.pageNumbers.push(i);
			}
			while (scope.pageNumbers.length > scope.limit) {
				scope.higher.push(scope.pageNumbers.pop())
			}

			scope.$watch('counter',function(newVal,oldVal){

				if (scope.pageNumbers.indexOf(newVal) === -1){
				var add = scope.limit;
				var addNegative = scope.limit-1;
				}
				else {
				var add = scope.pageNumbers.indexOf(newVal)/2;
				var addNegative = (scope.limit-scope.pageNumbers.indexOf(newVal)-2)/2;
				}

				if (newVal > oldVal){
				for (i=0;i<add;i++){

				if (scope.higher.length>0 && newVal > scope.limit/2-1){
					scope.pageNumbers.push(scope.higher.pop());
					scope.lower.push(scope.pageNumbers.shift());
				}
				}
				}
				else if (newVal < oldVal){
				for (i=0;i<addNegative+1;i++){
				if (scope.lower.length > 0 && newVal < scope.content.length-scope.limit/2-1){
					scope.pageNumbers.unshift(scope.lower.pop());
					scope.higher.push(scope.pageNumbers.pop());
				}
			}}
			})
			scope.last = function(){

				scope.counter = scope.content.length-1;

			}
			scope.first = function(){
				scope.counter = 0;
			}
			scope.setCounter = function(number) {
				scope.counter=number-1;
		}


		}
	}
});

app.directive('heroRegistration',function(){
  return {
  restrict:'E',
  replace:true,
  templateUrl:'/public/hero-registration.html'
}
})

app.directive('overviewElement',function(){
	return {
		restrict:'E',
		replace:true,
		templateUrl: '/public/overview-element.html',
		link:function(scope,elm){
			console.log(scope.element)
				scope.deleteOverlay = function(){
		scope.overlay = true;
		}
		scope.overlayDismiss = function() {
			scope.overlay = false;
		}
		}
	}
})

app.directive('answerContainer',function(){
	return{
		restrict:'E',
		scope: {obj: '=',
						content: '='},
		replace:true,
		templateUrl:'/public/textscroll.html',
		link:function(scope,elm){
						scope.filterGender = function(x){
		scope.gender=true;
		}
			scope.increase = function(){
				if (scope.counter < scope.obj.length-1) scope.counter += 1;

			}

			scope.decrease = function(){
				if (scope.counter > 0) scope.counter -=1;
			}
		}
}
});
app.directive('topMenu',function(){
	return{
	restrict:'E',
	templateUrl:'/public/tile-menu.html',
	replace:true,
  scope:{
    obj: '=',
    filter: '=',
    scale:'=',
    num:'=',
    questions:'='
  },
	link:function(scope,elm){
    console.log(scope.filter+scope.obj)
    scope.activeFilters = [];
    scope.input = {};
    scope.$watch('elm',function(){
      console.log(elm)
    })
    scope.expandTile = function(test){
      if (!scope.scale.active)
      scope.scale.active = true;
      else
      scope.scale.active = false;
  	}
		scope.overlay = function(str){
			scope.overlayActive = true;
      scope.overlayContent = str;
      console.log('the content variable is: '+scope.overlayContent)
		}
    scope.applyFilter = function(str){

      console.log('last try..'+scope.input.min+' with '+str)
      if (scope.input.min !== undefined && scope.input.max !== undefined){

      scope.filter(scope.obj,str,[scope.input.min,scope.input.max])
      }
      else if (scope.input.min !== undefined){
      scope.filter(scope.obj,str,[scope.input.min,0])
      }
      else if (scope.input.max !== undefined){
      scope.filter(scope.obj,str,[0,scope.input.max])
      }
      else {
      scope.filter(scope.obj,str)
      }
      scope.dismiss();
    }
		scope.dismiss = function(){
			scope.overlayActive = false;
      scope.overlayContent = '';
      scope.input.min = undefined;
      scope.input.max = undefined;
		}
    scope.showData = function() {
      scope.displayData = true;
    }
	}
	}
})
app.directive('barGraph',function(){
	return{
		restrict:'E',
		scope: { obj: '=',
						content: '=',
			filter:'=',
      num:'=',
      scale:'='
		},
		templateUrl:'/public/resultgraph.html',
		replace:true,
		link:function(scope,elm){

			console.log(myNewChart)
			var labels = [];
			for (var key in scope.content.options){
				console.log(scope.content.options)
				labels.push(scope.content.options[key].value)
			}

      scope.$watch('scale.active',function(newThing,oldThing){
        if (!counter) var counter = elm[0].clientWidth;
        if (newThing === true){
        console.log(elm)
        console.log('IT WORKS')
        var chartInterval = setInterval(function(){
          console.log('test')
          counter += 20;


          myNewChart.scale.width = counter;
          myNewChart.update();

                myNewChart.resize();
                if (counter > 1140){
                  clearInterval(chartInterval)
                }
        },15)

    }
    else if (newThing === false) {

      console.log(elm)
      console.log('IT WORKS')
      var chartInterval = setInterval(function(){
        counter -= 150;
        myNewChart.scale.width = counter;
        myNewChart.update();
              myNewChart.resize();
              if (counter <= 600) {
                clearInterval(chartInterval);
                }

      },10)
    }
  });
			console.log('scope obj '+JSON.stringify(scope.obj))
			var results = countArrayStrings(scope.obj,labels)
			scope.highestResult = labels[results.indexOf(results.max())];
			scope.highestResultPercent = (results.max()/scope.obj.length*100).toFixed(2);
			scope.lowestResult = labels[results.indexOf(results.min())];
			scope.lowestResultPercent = (results.min()/scope.obj.length*100).toFixed(2);
			scope.$watch('filter[num]',function(newThing,oldThing){
				if (newThing !== undefined){
				var result = countArrayStrings(newThing[0],labels)
				var newDataset = {
					label: "Women",
					fillColor: getNiceColor(),
					highlightFill: "rgba(92,155,204,0.5)",
					data: result,
				}
          myNewChart.options.barValueSpacing += 5;
				  var bars = []
    			newDataset.data.forEach(function (value, i) {
        			bars.push(new myNewChart.BarClass({
            		value: value,
            		label: myNewChart.datasets[0].bars[i].label,
            		x: myNewChart.scale.calculateBarX(myNewChart.datasets.length + 1, myNewChart.datasets.length, i),
            		y: myNewChart.scale.endPoint,
            		width: myNewChart.scale.calculateBarWidth(myNewChart.datasets.length + 1),
            		base: myNewChart.scale.endPoint,
            		strokeColor: newDataset.strokeColor,
            		fillColor: newDataset.fillColor
        }))

    })
				myNewChart.datasets.push({
					bars: bars
				})
				myNewChart.update();
				}
			})

	Chart.defaults.global.scaleFontFamily = "'Roboto'";
		Chart.defaults.global.scaleFontColor = "#333";
			Chart.defaults.global.scaleFontSize = 16;
		Chart.defaults.global.responsive = true;
		Chart.defaults.global.maintainAspectRatio = false;
			var ctx = elm[0].getElementsByTagName('canvas')[0].getContext("2d");
			var gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgba(92,155,204,1)');
gradient.addColorStop(1, 'rgba(81,17,109,0.6)');
var data = {
labels:labels,
datasets: [
	{

			label: "My Second dataset",
			fillColor: gradient,
			highlightFill: "rgba(92,155,204,1)",
			data: results,

	}
]
}
			var myNewChart = new Chart(ctx).Bar(data);


	}
	}
})
app.directive('numericalGraph',function(){
				Chart.defaults.global.scaleFontSize = 16;
	return{
			restrict:'E',
			templateUrl:'/public/resultgraph.html',
			replace:true,
			scope:{
				obj:'=',
				content:'=',
        filter: '=',
        num: '=',
        scale: '='
			},
			link: function(scope,elm){
        scope.legend = {}
        scope.labels = labels;
        scope.legend['total'] = results;
        scope.activeFilters = [];
				Chart.defaults.global.responsive = true;
				Chart.defaults.global.maintainAspectRatio = false;
								var ctx = elm[0].getElementsByTagName('canvas')[0].getContext("2d");
				var gradient = ctx.createLinearGradient(0, 0, 0, 300);
	gradient.addColorStop(0, 'rgba(92,155,204,1)');
	gradient.addColorStop(1, 'rgba(81,17,109,0.6)');
	var results = countArrayStrings(scope.obj,['1','2','3','4','5','6','7','8','9','10']);
	var labels = ['1','2','3','4','5','6','7','8','9','10']
  console.log(elm)
  console.log('scaled? '+scope.scale)

  // watching size changes of tiles, still works with absolute numbers, need to find a way to find the real width of parent
  scope.$watch('scale.active',function(newThing,oldThing){
    if (!counter) var counter = elm[0].clientWidth;
    if (newThing === true){
    console.log(elm)
    console.log('IT WORKS')
    var chartInterval = setInterval(function(){
      console.log('test')
      counter += 12;


      myNewChart.scale.width = counter;
      myNewChart.update();

            myNewChart.resize();
            if (counter > 1140){
              clearInterval(chartInterval)
            }
    },15)

}
else if (newThing === false) {

  console.log(elm)
  console.log('IT WORKS')
  var chartInterval = setInterval(function(){
    counter -= 150;
    myNewChart.scale.width = counter;
    myNewChart.update();
          myNewChart.resize();
          if (counter <=600) {
            clearInterval(chartInterval);
            }

  },10)
}


  })


  console.log('my labels: '+scope.labels)
	var values = []
  scope.removeDataset = function(index){
    myNewChart.datasets.splice(index+1,1);
    scope.activeFilters.splice(index,1);
    myNewChart.update();
  }

  //Add new dataset
  scope.$watch('filter[num]',function(newThing,oldThing){
    var nextColor = assignColor(newThing)
    if (newThing !== undefined){

      var result = countArrayStrings(newThing[0],labels)
      var newDataset = {
        fillColor: nextColor,
        highlightFill: "rgba(92,155,204,0.5)",
        strokeColor: nextColor,
        data: result,
      }
        var points = []
        newDataset.data.forEach(function (value, i) {
            points.push(new myNewChart.PointClass({
              value: value,
              label: myNewChart.datasets[0].points[i].label,
              x: myNewChart.scale.calculateX(myNewChart.datasets.length + 1, myNewChart.datasets.length, i),
              y: myNewChart.scale.endPoint,
              strokeColor: newDataset.strokeColor,
              fillColor: newDataset.fillColor
      }))

  })
      myNewChart.datasets.push({
        label:'ABCDEFG',
        points: points,
        strokeColor: newDataset.strokeColor,
      })
      console.log(myNewChart.datasets)
      newThing.push(nextColor)
      myNewChart.update();
      scope.legend[newThing[1]] = result;
      scope.activeFilters.push(newThing);
      console.log(scope.activeFilters)
      console.log('active Filters are: '+scope.activeFilters)
      }
});
	 			for(i=0;i<10;i++){
					values.push(results[i] * labels[i])
				}


				var sorted = scope.obj.sort();
	scope.lowPercentile = scope.obj[Math.ceil(scope.obj.length*0.75)-1];
	scope.highPercentile = scope.obj[Math.ceil(scope.obj.length*0.25)-1];
	var valuesSum = values.reduce(function(prev,curr){
		return prev + curr;
	})
	var answerAmount = results.reduce(function(prev,curr){
		return prev + curr;
	})
	scope.avg = (valuesSum/answerAmount).toFixed(2)
				var data = {
    labels: labels,
    datasets: [

        {
            label: 'blabla',
            fillColor: "rgba(151,187,205,0)",
            strokeColor: gradient,
						pointColor: gradient,
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
            data: countArrayStrings(scope.obj,['1','2','3','4','5','6','7','8','9','10']),
            multiTooltipTemplate: "<%= datasetLabel %> - <%= value %>"
        }
    ]
				}


				var myNewChart = new Chart(ctx).Line(data,{
           bezierCurveTension : 0.05,
					pointDot:false,
					    datasetStrokeWidth : 8,


				});
			}
	}
  $scope.legend = myNewChart.generateLegend()

});
app.directive('myChart', function(){

	console.log('directive running')
    return {
			  restrict: 'E',
			  templateUrl:'/public/dashboard-graph.html' ,
			  replace:true,
			scope:false,
        link: function(scope,elm){
					Chart.defaults.global.responsive = true;
					Chart.defaults.global.maintainAspectRatio = false;
					Chart.defaults.global.scaleFontFamily = "'Roboto'";
						Chart.defaults.global.scaleFontColor = "#333";
							Chart.defaults.global.scaleFontSize = 16;
	console.log('graph test'+ elm[0].children[1].children[0])
		var graphDataset = [];
		var today = new Date();
		var tomorrow = new Date();
		if (scope.survey.answers !== undefined){
		for (var key in scope.survey.answers){

			graphDataset.push(scope.survey.answers[key].length)

		}

		var labels = Object.keys(scope.survey.answers)
	}
		else labels = [today.toLocaleDateString()];

		weeklyView(labels);
		var ctx = elm[0].children[1].children[0].getContext("2d");
		var gradient = ctx.createLinearGradient(0, 0, 0, 500);
gradient.addColorStop(0, 'rgba(92,155,204,1)');
gradient.addColorStop(1, 'rgba(81,17,109,0.6)');
		var data = {
    labels: labels,
    datasets: [

        {
            label: "My Second dataset",
            fillColor: gradient,
			highlightFill: "rgba(92,155,204,1)",
            data: graphDataset
        }
    ]
};

				var myNewChart = new Chart(ctx).Bar(data);


				}
    }
})

app.factory('authInterceptor',function($q,$location,$window){
	return {
		request: function(request){
			request.headers.authorization = $window.localStorage.token;
			return request;
		},
		requestError: function(request){
			console.log('test12345')
			return request;
		},
		response: function(response){
			console.log('intercepting response')
			return response;
		},
		responseError: function(rejection){
			console.log('rejection')
			$location.path('/login')
			return rejection;
		}
	}
});

app.config(function($httpProvider){
	$httpProvider.interceptors.push('authInterceptor')
});

app.controller('loginCtrl',function($scope,$http,$window){
	console.log('loginCtrl active!')
	if ($window.localStorage.token !== undefined){
		$http.get('/backend').then(function(data){
			console.log('login ok')

		});
	}

})
app.controller('userCtrl',function($scope,$http,$location,$window){
  $scope.viewContent = '/public/login-box.html';
  $scope.login = {};
  $scope.updateView = function(page) {
    console.log('test')
    $scope.viewContent = '/public/'+page+'.html';
    console.log($scope.viewContent)
  }
  $scope.recoverPw = function(){
    $http.post('/restore',$scope.login)
  }
  window.fbAsyncInit = function() {
		FB.init({
			appId      : '165180297173897',
			xfbml      : true,
			version    : 'v2.5'
		});
	};

	(function(d, s, id){
		 var js, fjs = d.getElementsByTagName(s)[0];
		 if (d.getElementById(id)) {return;}
		 js = d.createElement(s); js.id = id;
		 js.src = "//connect.facebook.net/en_US/sdk.js";
		 fjs.parentNode.insertBefore(js, fjs);
	 }(document, 'script', 'facebook-jssdk'));

	 $scope.FBlogin = function(){
		 FB.login(function(response){
			 if (response.status === 'connected'){
				 FB.api('/me', {fields:'email,name'},function(response) {
					 console.log(response)
				 $http.post('/login/facebook',response).then(function(data){
					 console.log(data.data.token)
					 $window.localStorage.token = data.data.token;
					 $location.path('/dashboard')
				 })
		 })
			 }

		 },{scope:'email'});
	;
	 }
	function crossTest() {
		console.log("BIG BAD CROSS TEST")
	}
	//redirect function for github popup window
	window.crossTest = function() {
		$location.path('/dashboard')
		if(!$scope.$$phase) $scope.$apply()
	}

	$scope.githubLogin = function(){
		win =  window.open('https://github.com/login/oauth/authorize?client_id=f0ccba6a396af395540f&scope=user',"test","height=600,width=900",'modal=yes')

	}
	$scope.authorizeLogin = function(login){
		$http.post('/login',$scope.login).then(function(data){
      console.log(data)
			if (data.data.token !== undefined){
			$window.localStorage.token = data.data.token;
			$location.path('/dashboard')
    }
		});
	}
})
app.controller('mainCtrl',function($http,$scope,$window,$uibModal,$log,$timeout,$location,$routeParams){

	console.log('backend activated')
	$scope.demographic = "demographic information";
	$scope.routeTest = $routeParams.page
	console.log($scope.routeTest)
	$scope.user = {};

	$http.get('/api/profile',{headers:{authorization:$window.localStorage.token}}).then(function(data){
		$scope.user.email = data.data.email;
	})







$scope.createUser = function(user){ //not used anymore?
	$http.post('/signup',user).then(function(data,status,headers){
  console.log('posted to server')
  console.log(data);
  console.log(status);
  console.log(headers);
  })
}



$scope.loadAnswers = function(){
	console.log(window.localStorage['surveyResult']);
	$scope.surveyResults = JSON.parse(window.localStorage['surveyResult']);
}

$scope.createEmptySurvey = function() {
	$scope.currentId = undefined;
	$scope.survey = {};
	$scope.newFormQuestions = [];
}

$scope.logout = function() {
	console.log('logging out')
	$window.localStorage.removeItem('token')
}

}
);

app.controller('liveCtrl',function($scope,$window,$http){
		var path = {surveyLink:window.location.pathname}
		console.log(path)
		$http.post('/api/surveydata/',path).then(function(data){
			console.log(data)
		$scope.answers = {};
			$scope.activeSurvey = data.data;
			$scope.answers = {
				title: $scope.activeSurvey.name,
				origin: $scope.activeSurvey.link,
				//gender: '',
				//income: '',
			};
				console.log($scope.activeSurvey)
				$scope.activeSurvey.questions.forEach(function(question){
							$scope.answers[question.name] = '';
			});
		})

	$scope.submitSurvey = function(survey) {
		var date = new Date();
		$scope.answers.date = date.toLocaleDateString()
	console.log($scope.answers)
	$http.post('/api/results',$scope.answers)
	}
})
