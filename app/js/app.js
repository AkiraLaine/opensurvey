var app = angular.module('votingapp',['ngAnimate','ui.bootstrap','ngRoute']);
var counter = 1;
//helper funcitons

function weeklyView(data) {
	if (data.length < 7){
		console.log('latest date is '+data[data.length-1])
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
	console.log('exec array count')
	console.log(labels)
	console.log(array)
	labels.forEach(function(x){
		var filtered = array.filter(function(value){
			return value === x;
		})
		console.log(filtered)
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
	when('/',{templateUrl:'/public/frontpage.html'}).
	when('/surveys',{templateUrl: '/public/backend.html',
	controller:'surveyOverviewCtrl'}).
	when('/results:survey',{templateUrl:'/public/backend.html',
	controller:'surveyAnswersCtrl'}).
	when('/login',{templateUrl:'/public/login.html',
	controller:'userCtrl'})
});

app.directive('answerContainer',function(){
	return{
		restrict:'E',
		scope: {obj: '=',},
		replace:true,
		templateUrl:'/public/textscroll.html',
		link:function(scope,elm){
			scope.counter = 0;
			scope.increase = function() {
				if (scope.counter <= scope.obj.length) scope.counter +=1;
			};
			scope.decrease = function(){
				if (scope.counter > 0) scope.counter -=1;
			};
		}
	}
})

app.directive('barGraph',function(){
	return{
		restrict:'E',
		scope: { obj: '=',
						more: '='},
		template:'<canvas></canvas>',
		replace:true,
		link:function(scope,elm){
			Chart.defaults.global.responsive = true;
			Chart.defaults.global.maintainAspectRatio = false;
			console.log('object test'+JSON.stringify(scope.obj))
			var labels = [];
			for (var key in scope.more.options){
				labels.push(scope.more.options[key].value)
			}
			console.log(scope.obj)
			countArrayStrings(scope.obj,labels);
			var data = {
			labels:labels,
			datasets: [
				{
						label: "My Second dataset",
						fillColor: "rgba(151,187,205,0.6)",
						strokeColor: "rgba(151,187,205,0.8)",
						highlightFill: "rgba(151,187,205,0.75)",
						highlightStroke: "rgba(151,187,205,1)",
						data: countArrayStrings(scope.obj,labels),
				}
			]
		}
			var ctx = elm[0].getContext("2d");
			var myNewChart = new Chart(ctx).Bar(data);
	}
	}
})
app.directive('numericalGraph',function(){
	return{
			restrict:'E',
			template:'<canvas></canvas>',
			replace:true,
			link: function(scope,elm){
				Chart.defaults.global.responsive = true;
				Chart.defaults.global.maintainAspectRatio = false;
				var data = {
    labels: ['1','2','3','4','5','6','7','8','9','10'],
    datasets: [

        {
            label: "My Second dataset",
            fillColor: "rgba(151,187,205,0)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
            data: [1,2,2,4,10,8,7]
        }
    ]
				}

				var ctx = elm[0].getContext("2d");
				var myNewChart = new Chart(ctx).Line(data);
			}
	}

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
		console.log('the data is '+graphDataset)
		var data = {
    labels: labels,
    datasets: [

        {
            label: "My Second dataset",
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
            data: graphDataset
        }
    ]
};				console.log(elm[0].children[1].children[0].getContext("2d"))
				var ctx = elm[0].children[1].children[0].getContext("2d");
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
	$scope.test = 'ABCACDA'
	console.log('userCtrlm initiated')
	$scope.authorizeLogin = function(login){
		$http.post('/login',$scope.login).then(function(data){
			if (data.data.token !== undefined)
			$window.localStorage.token = data.data.token;
			$location.path('/dashboard')
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





$scope.submitSurvey = function(survey) {
	var date = new Date();
	$scope.answers.date = date.toLocaleDateString()
console.log($scope.answers)
$http.post('/api/results',$scope.answers)
}

$scope.createUser = function(user){

	$http.post('/signup',user)
}

$scope.loadLiveSurvey = function(){

	console.log(window.location.pathname)
	var path = {surveyLink:window.location.pathname}
	$http.post('/api/surveydata/',path).then(function(data){
	$scope.answers = {};
		$scope.activeSurvey = data.data;
		$scope.answers = {
			title: $scope.activeSurvey.name,
			origin: $scope.activeSurvey.link
		};
			console.log($scope.activeSurvey)
			$scope.activeSurvey.questions.forEach(function(question){
						$scope.answers[question.name] = '';
		});
		console.log($scope.answers)
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
