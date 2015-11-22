angular.module('votingapp').controller('dashboardCtrl',function($scope,$http){

	$scope.viewContent = '/public/dashboard.html'
	$scope.getDashboard = function() {
	console.log('getting dashboard.')
		$http.get('api/active').then(function(data){
			console.log('request1 done.')
			$scope.activeSurveys = data.data;
			$http.get('api/results').then(function(data){
				$scope.activeAnswers = data.data;
					console.log('request2 done.')
				$scope.activeSurveys.forEach(function(x){
					x.responses = [];

					$scope.activeAnswers.forEach(function(y){

						if (x.link === y.origin){
							x.responses.push(y);
							x.responsesAmount = x.responses.length;
							console.log('responses:' +x.responses)
						}
					})
				})
			})
		})
	}
	$scope.getDashboard();
})
angular.module('votingapp').controller('surveyOverviewCtrl',function($scope,$http){
			$scope.viewContent = '/public/mysurveys.html'
	$scope.getDrafts = function(){
			$http.get('/drafts').then(function(data){
				console.log('tried to get drafs: '+JSON.stringify(data.data))
				$scope.drafts = data.data;
			});
	}
})
angular.module('votingapp').controller('surveyCreationCtrl',function($scope,$http,$uibModal,$routeParams){
	$scope.items = ['item1', 'item2', 'item3'];
	$scope.viewContent = '/public/newSurvey.html'
	$scope.animationsEnabled = true;
	$scope.survey = {};
	$scope.newFormQuestions = [];
	$scope.newQuestion = {};
	$scope.newQuestion.rangeOptions = {};
	$scope.newQuestion.rangeOptions.scaleNegative = "Don't Agree";
	$scope.newQuestion.rangeOptions.scalePositive = "Highly Agree";
	$scope.newQuestion.rangeOptions.scaleMax = 10;
	$scope.newQuestion.options = [{number:'1',value:''},{number:'2',value:''}];
	if ($routeParams.survey !== undefined && typeof $routeParams.survey === 'string'){
		console.log('got a draft to work on: '+$routeParams.survey.match(/[^:].*/g)[0])
		$http.get('/api/survey',{headers:{survey:$routeParams.survey.match(/[^:].*/g)[0]}}).then(function(data){
			$scope.survey = data.data
			console.log(data.data)
			$scope.survey.published = data.data.published;
			$scope.newFormQuestions = data.data.questions;
			$scope.survey.name = data.data.name;
			$scope.currentId = data.data._id;
		})
	}

	$scope.removeQuestion = function(question) {
		console.log(question)
		$scope.newFormQuestions.splice(	$scope.newFormQuestions.indexOf(question),1);
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
	$scope.addField = function(){

		$scope.newQuestion.options.push({number:$scope.newQuestion.options.length+1,value:''})
	}
	$scope.open = function() {
   $scope.showModal = true;
 };
 $scope.close = function() {
  $scope.showModal = false;
 };

 $scope.saveData = function(){
 console.log($scope.form)
 $http.post('/',$scope.form).then($scope.updateQuestions());
}
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
})

angular.module('votingapp').controller('surveyAnswersCtrl',function($scope,$http,$routeParams){
		$scope.viewContent = '/public/answers.html'
		var temp = [];
		var results = [];
		var counter = 0;
	$http.get('/api/survey',{headers:{survey:$routeParams.survey.match(/[^:].*/g)[0]}}).then(function(data){
		var survey = data.data;
		console.log(data.data)
		for (var key in survey.answers) {
			counter += survey.answers[key].length;
		}
		$scope.surveyResultsAmount = counter;
		console.log($scope.surveyResults)
		for (var x in survey.questions){
		for (var key in survey.answers){
			for (var i=0; i<survey.answers[key].length;i++){
		temp.push(survey.answers[key][i][survey.questions[x].name]);
		console.log(survey.answers[key][i][survey.questions[x].name])

		}

			}
		results.push(temp);
		temp = [];

		}
		console.log(survey.questions)
		$scope.questions = survey.questions;
		$scope.results = results;
		counter = 0;
	});



$scope.createChart = function(chartName) {
	        $timeout(function(){
						console.log('made it' +chartName)

					})
	        }



})

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
