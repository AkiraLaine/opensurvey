var app = angular.module('votingapp',['ngAnimate','ui.bootstrap']);
var counter = 1;

function weeklyView(data) {
	console.log(data.length)
	if (data.length < 7){
		console.log('latest date is '+data[data.length])
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
app.directive('myChart', function(){
	Chart.defaults.global.responsive = true;
	Chart.defaults.global.maintainAspectRatio = false;
	console.log('directive running')
    return {
			  restrict: 'A',
        link: function(scope,elm){
					console.log()
					console.log('test')
				console.log(elm[0])
		var graphDataset = [];
		var today = new Date();
		var tomorrow = new Date();
		if (scope.survey.newanswers !== undefined){
		for (var key in scope.survey.newanswers){
			graphDataset.push(scope.survey.newanswers[key].length)

		}
		var labels = Object.keys(scope.survey.newanswers)
	}
		else labels = [today.toLocaleDateString()];

		;
		weeklyView(labels);
		console.log(tomorrow.toLocaleDateString())
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
};
				var ctx = elm[0].getContext("2d");
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
		response: function(response){
			return response;
		},
		responseError: function(response){
			console.log('ooops')

			$window.location.href = '/login'
			return $q.reject(response)
		}
	}
});

app.config(function($httpProvider){
	$httpProvider.interceptors.push('authInterceptor')
});

app.controller('formCtrl',function($http,$scope,$window,$uibModal,$log,$timeout){
	$scope.demographic = "demographic information";

	$scope.user = {};
	$scope.survey = {};
	$scope.newFormQuestions = [];
	$scope.newQuestion = {};
	$scope.newQuestion.rangeOptions = {};
	$scope.newQuestion.rangeOptions.scaleNegative = "Don't Agree";
	$scope.newQuestion.rangeOptions.scalePositive = "Highly Agree";
	$scope.newQuestion.rangeOptions.scaleMax = 10;
	$scope.newQuestion.options = [{number:'1',value:''},{number:'2',value:''}];
	$scope.animationsEnabled = true;
  	$scope.items = ['item1', 'item2', 'item3'];
	$scope.saveData = function(){
	console.log($scope.form)
	$http.post('/',$scope.form).then($scope.updateQuestions());
}
$scope.getUserProfile = function() {
	$http.get('/api/profile',{headers:{authorization:$window.localStorage.token}}).then(function(data){
		$scope.user.email = data.data.email;
	})
}
$scope.createChart = function(chartName) {
        $timeout(function(){
					console.log('made it' +chartName)

				})
        }


$scope.getDashboard = function() {

	$http.get('api/active').then(function(data){
		$scope.activeSurveys = data.data;
		$http.get('api/results').then(function(data){
			$scope.activeAnswers = data.data;
			$scope.activeSurveys.forEach(function(x){
				x.responses = [];

				$scope.activeAnswers.forEach(function(y){

					if (x.link === y.origin){
						x.responses.push(y);
						x.responsesAmount = x.responses.length;
						console.log(x.responses)
					}
				})
			})
		})
	})
}
$scope.submitSurvey = function(survey) {
	var date = new Date();
	$scope.answers.date = date.toLocaleDateString()
console.log($scope.answers)
$http.post('/api/results',$scope.answers)
}

$scope.saveDraft = function(){
	var date = new Date();
	console.log($scope.survey.published)
	$scope.draft = {
		published: $scope.survey.published,
		project: $scope.survey.project,
		name: $scope.survey.name,
		questions: $scope.newFormQuestions,
		edited:date.toLocaleString()
	}
	if ($scope.survey.published === true){
		$scope.draft.publishedDate = date.toLocaleString();
	}
	if ($scope.currentId !== undefined){
		$scope.draft._id = $scope.currentId;
		console.log('saving draft as '+$scope.currentId)
	}
	else {
		console.log('creating new entry')
	}
	$http.post('/',$scope.draft);
}
$scope.createUser = function(user){

	$http.post('/signup',user)
}
$scope.removeQuestion = function(question) {
	console.log(question)
	$scope.newFormQuestions.splice(	$scope.newFormQuestions.indexOf(question),1);
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

$scope.addField = function(){

	$scope.newQuestion.options.push({number:$scope.newQuestion.options.length+1,value:''})
}
$scope.authorizeLogin = function(login){
	$http.post('/login',$scope.login).then(function(data){
		if (data.data.token !== undefined)
		$window.localStorage.token = data.data.token;
		$http.get('/backend',{headers:{'Authorization':$window.localStorage.token}}).then(function(data){
			console.log(data)
		});
	});
}
$scope.getDrafts = function(){
		$http.get('/drafts').then(function(data){

			$scope.drafts = data.data;
		});
}
$scope.editDraft = function(draft){
	console.log(JSON.stringify(draft))
	$scope.setTab('newSurvey');
	$scope.currentId = draft._id;
	console.log('woring on '+$scope.currentId)
	$scope.updateTab();
	$scope.survey.name = draft.name;
	$scope.survey.published = draft.published;
	$scope.newFormQuestions = draft.questions;
}
$scope.createEmptySurvey = function() {
	$scope.currentId = undefined;
	$scope.survey = {};
	$scope.newFormQuestions = [];
}
 $scope.setTab = function(x){
	$scope.currentTab = x;
 }
 $scope.updateTab = function(){
	 $scope.pageTitle = $scope.currentTab.toUpperCase();
	 return "/public/"+$scope.currentTab+".html"
 }
$scope.logout = function() {
	console.log('logging out')
	$window.localStorage.removeItem('token')
}
 $scope.open = function() {
  $scope.showModal = true;
};
$scope.close = function() {

 $scope.showModal = false;
};

$scope.open = function(size){
	 var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: '/public/myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
				questions: function () {
					return $scope.newFormQuestions;
				}
      }

    });

  };
}
);

angular.module('votingapp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, questions) {
	$scope.newFormQuestions = questions;


  $scope.ok = function (newQuestion) {
		$scope.newQuestion = newQuestion;
		$scope.newFormQuestions.push($scope.newQuestion);
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
