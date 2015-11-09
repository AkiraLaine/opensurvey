var app = angular.module('votingapp',['ngAnimate','ui.bootstrap']);
var counter = 1;

app.factory('authInterceptor',function($q,$location,$window){
	return {
		request: function(request){
			return request;
		},
		response: function(response){
			return response;
		},
		responseError: function(response){
		

			$window.location.href = '/login';
			return $q.reject(response)
		}
	}
});

app.config(function($httpProvider){
	$httpProvider.interceptors.push('authInterceptor')
});

app.controller('formCtrl',function($http,$scope,$window,$uibModal,$log){
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

$scope.saveDraft = function(){
	var date = new Date();

	$scope.draft = {
		project: $scope.survey.project,
		name: $scope.survey.name,
		questions: $scope.newFormQuestions,
		edited:date.toLocaleString()
	}
	if ($scope.currentId !== undefined){
		$scope.draft._id = $scope.currentId;
		console.log('saving draft as '+$scope.currentId)
	}
	else {
		console.log('creating new entry')
	}
	$http.post('/',$scope.draft,{headers: {'Authorization':$window.localStorage.token}});
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
		$scope.activeSurvey = data.data;
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
		$http.get('/drafts',{headers: {'Authorization':$window.localStorage.token}}).then(function(data){


			$scope.drafts = data.data;
			console.log('the drafts: '+JSON.stringify($scope.drafts))
		})
}
$scope.editDraft = function(draft){
	console.log(JSON.stringify(draft))
	$scope.setTab('newSurvey');
	$scope.currentId = draft._id;
	console.log('woring on '+$scope.currentId)
	$scope.updateTab();
	$scope.survey.name = draft.name;
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
