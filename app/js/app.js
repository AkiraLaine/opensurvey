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
		scope: {obj: '=',
						content: '='},
		replace:true,
		templateUrl:'/public/textscroll.html',
		link:function(scope,elm){
			scope.higher = [];
			scope.lower = [];
			scope.counter = 0;
			scope.pageNumbers = [];
			for (var i = 1;i<=scope.obj.length;i++){
				scope.pageNumbers.push(i);
			}
			while (scope.pageNumbers.length > 10) {
				scope.higher.push(scope.pageNumbers.pop())
			}
			console.log('higher numbers '+scope.higher)
			scope.increase = function() {
				if (scope.counter < scope.obj.length-1){
				scope.counter +=1;
				if (scope.higher.length > 0 && scope.counter > 4){
				scope.pageNumbers.push(scope.higher.pop());
				scope.lower.push(scope.pageNumbers.shift())
			}
			}
			};
			scope.setCounter = function(number) {
				var change = number-scope.counter;
				scope.counter=number-1;
				console.log(change)
				for(i=0;i<=change-3;i++){
				if (scope.higher.length > 0 && scope.counter > 4){
				scope.pageNumbers.push(scope.higher.pop());
				scope.lower.push(scope.pageNumbers.shift())
			}
		}
			}
			scope.decrease = function(){
				if (scope.counter > 0) scope.counter -=1;
				if(scope.lower.length > 0 && scope.counter < scope.obj.length-5){
				scope.pageNumbers.unshift(scope.lower.pop());
				scope.higher.push(scope.pageNumbers.pop());
			}
			};
		}
	}
})

app.directive('barGraph',function(){
	return{
		restrict:'E',
		scope: { obj: '=',
						content: '='},
		templateUrl:'/public/resultgraph.html',
		replace:true,
		link:function(scope,elm){

			var labels = [];
			for (var key in scope.content.options){
				labels.push(scope.content.options[key].value)
			}
			countArrayStrings(scope.obj,labels);
Chart.defaults.global.scaleFontSize = 'Roboto';
			Chart.defaults.global.scaleFontSize = 14;
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
			data: countArrayStrings(scope.obj,labels),
	}
]
}
			var myNewChart = new Chart(ctx).Bar(data);


	}
	}
})
app.directive('numericalGraph',function(){
	return{
			restrict:'E',
			templateUrl:'/public/resultgraph.html',
			replace:true,
			scope:{
				obj:'=',
				content:'='
			},
			link: function(scope,elm){
				console.log('numerical graph checking in '+JSON.stringify(scope.obj))
				Chart.defaults.global.responsive = true;
				Chart.defaults.global.maintainAspectRatio = false;
				console.log('test '+countArrayStrings(scope.obj,['1','2','3','4','5','6','7','8','9','10']));
				var data = {
    labels: ['1','2','3','4','5','6','7','8','9','10'],
    datasets: [

        {
            label: "My Second dataset",
            fillColor: "rgba(151,187,205,0)",
            strokeColor: "rgba(81,17,109,0.6)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
            data: countArrayStrings(scope.obj,['1','2','3','4','5','6','7','8','9','10'])
        }
    ]
				}

				var ctx = elm[0].getElementsByTagName('canvas')[0].getContext("2d");
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
