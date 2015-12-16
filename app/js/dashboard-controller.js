angular.module('votingapp').controller('dashboardCtrl',function($scope,$http){

	$scope.viewContent = '/public/dashboard.html'
	$scope.getDashboard = function() {
	console.log('getting dashboard.')
		$http.get('api/active').then(function(data){
			console.log('request1 done.')
			$scope.activeSurveys = data.data;
			$http.get('api/results').then(function(data){
				$scope.activeAnswers = data.data;
					console.log('request2 done.');
			})
		})
	}
	$scope.getDashboard();
})
angular.module('votingapp').controller('surveyOverviewCtrl',function($scope,$http){
			$scope.viewContent = '/public/mysurveys.html'

			$http.get('/drafts').then(function(data){
				$scope.drafts = data.data;
			});

	$scope.deleteSurvey = function(survey,index){
		console.log('deleting '+survey);
		console.log('at index '+index);
		$scope.drafts.splice(index,1);
		$http.post('/api/delete',survey);
		
	}
	$scope.deleteOverlay = function(){
		$scope.overlay = true;
	}
})
angular.module('votingapp').controller('surveyCreationCtrl',function($scope,$http,$uibModal,$routeParams){
	$scope.currentStep = 1;
	$scope.items = ['item1', 'item2', 'item3'];
	$scope.viewContent = '/public/newSurvey.html'
	$scope.animationsEnabled = true;
	$scope.survey = {};
	$scope.newFormQuestions = [];
	$scope.survey.filters = {};
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

	var progressView = true;
	$scope.nextStep = function() {
		if ($scope.currentStep < 3)$scope.currentStep += 1;
		console.log($scope.currentStep)
		fieldAction($scope.currentStep)
	}
	$scope.prevStep = function() {
		console.log($scope.currentStep)
		fieldAction($scope.currentStep)
			if ($scope.currentStep > 1) $scope.currentStep -= 1;
	}
var fieldAction = function() {
		console.log(window.getComputedStyle(document.getElementById('copy2')).height);
	if ($scope.currentStep === 2){
	if (progressView) fadeOut('copy1',30)
	else {
	fadeOut('copy2',30);
	fadeOut('container2',30);
	}

		window.setTimeout(function(){
			document.getElementById('container').classList.toggle('move-up')
		window.setTimeout(function(){
			var arr = document.getElementsByClassName('title-form')
			for(var i=0; i<arr.length;i++){
				if(progressView) arr[i].disabled = true;
				else arr[i].disabled = false;
			}
	if (progressView) {
		fadeIn('copy2',50);
		fadeIn('container2',50)
		progressView = false;
	}
	else {
	fadeIn('copy1',50);
	progressView = true;
	}
},100)

		},200)
}
	else if ($scope.currentStep === 3) {
		console.log(progressView)
		if (!progressView) fadeOut('copy2',30);
		else fadeOut('copy3',30);
		window.setTimeout(function(){
			var arr = document.getElementsByClassName('filter-checkbox')
			for(var i=0; i<arr.length;i++){
				if(!progressView) arr[i].disabled = true;
				else arr[i].disabled = false;
			}
		document.getElementById('container2').classList.toggle('move-up')
		window.setTimeout(function(){
		if (!progressView){
		progressView = true;
		fadeIn('copy3',50);
		}
		else {
		fadeIn('copy2',50);
		progressView = false;
		}
		},100)
		},200)

	}
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
			filters: $scope.survey.filters,
			questions: $scope.newFormQuestions,
			edited:date.toLocaleString()
		}
		console.log("saving survey: "+JSON.stringify($scope.draft))
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
		$scope.filter = [];
		$scope.viewContent = '/public/answers.html'
		var temp = [];
		var results = [];
		var counter = 0;
	$http.get('/api/survey',{headers:{survey:$routeParams.survey.match(/[^:].*/g)[0]}}).then(function(data){
		var survey = data.data;
		console.log(data.data)
			$scope.filterGender = function(x,str,arr){
				results = [];
				if (arguments.length > 2){
					console.log('entering the special area')
					console.log(arr)
					for (var key in survey.answers){
						for (var i=0; i<survey.answers[key].length;i++){
							console.log(survey.answers[key][i][str])
							if (survey.answers[key][i][str] >= arr[0] && survey.answers[key][i][str] <= arr[1] ){
							results.push(survey.answers[key][i][survey.questions[x].name]);
							}
						}
					}
					str = str.concat(' '+arr[0]+'-'+arr[1])
				}
				else {
			for (var key in survey.answers){
				for (var i=0; i<survey.answers[key].length;i++){
					if (survey.answers[key][i].gender === str){
					results.push(survey.answers[key][i][survey.questions[x].name]);
					}
				}
			}

}
console.log('the outcome: '+results)
$scope.filter[x] = [results,str];
console.log(results)
		}


		for (var key in survey.answers) {
			counter += survey.answers[key].length;
		}

		$scope.surveyResultsAmount = counter;
		for (var x in survey.questions){
		for (var key in survey.answers){
			for (var i=0; i<survey.answers[key].length;i++){
		temp.push(survey.answers[key][i][survey.questions[x].name]);
		console.log(survey.answers[key][i].gender)

		}

			}

		results.push(temp);
		temp = [];

		}


		$scope.questions = survey.questions;
		$scope.results = results;
		$scope.name = survey.name
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
		console.log('approving demographic stuff:'+newQuestion.gender)
		$scope.newQuestion = newQuestion;
		$scope.newFormQuestions.push($scope.newQuestion);

    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
