var app = angular.module('votingapp',['ngAnimate','ui.bootstrap']);
var counter = 1;

app.controller('formCtrl',function($http,$scope,$uibModal,$log){
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
	$http.post('/',$scope.draft);
}
$scope.removeQuestion = function(question) {
	console.log(question)
	$scope.newFormQuestions.splice(	$scope.newFormQuestions.indexOf(question),1);
}
$scope.addField = function(){

	$scope.newQuestion.options.push({number:$scope.newQuestion.options.length+1,value:''})
}

$scope.getDrafts = function(){
		$http.get('/drafts').then(function(data){
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
