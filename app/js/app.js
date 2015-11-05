var app = angular.module('votingapp',['ui.bootstrap']);
var counter = 1;

app.controller('formCtrl',function($http,$scope,$uibModal,$log){
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
	console.log($scope.newFormQuestions)
	$http.post('/',$scope.newFormQuestions);
}

$scope.addField = function(){

	$scope.newQuestion.options.push({number:$scope.newQuestion.options.length+1,value:''})
}

$scope.getDrafts = function(){
		$http.get('/drafts').then(function(data){
			$scope.drafts = data.data;
			console.log($scope.drafts)
		})
}

	$scope.updateQuestions = function(){
		$http.get('/questions').then(function(data){
			$scope.recentQuestions = data.data.reverse();
			console.log($scope.recentQuestions)
	});
	}
$scope.testlog = function(){
	console.log('test')
}

 $scope.setTab = function(x){
	$scope.currentTab = x;
 }
 $scope.updateTab = function(){
	 return "/public/"+$scope.currentTab+".html"
 }

 $scope.open = function() {
  $scope.showModal = true;
};
$scope.close = function() {

 $scope.showModal = false;
};
    $scope.addQuestion = function() {

			console.log($scope.newFormQuestions)
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
