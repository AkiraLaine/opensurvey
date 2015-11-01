var app = angular.module('votingapp',[]);

app.controller('formCtrl',function($http,$scope){
	$scope.saveData = function(){
	console.log($scope.form)
	$http.post('/',$scope.form).then($scope.updateQuestions());
}
	$scope.updateQuestions = function(){
		$http.get('/questions').then(function(data){
			$scope.recentQuestions = data.data.reverse();
			console.log($scope.recentQuestions)
	});
	}

});
