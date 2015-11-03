var app = angular.module('votingapp',['ui.bootstrap']);
var counter = 1;
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
 $scope.setTab = function(x){
	$scope.currentTab = x;
 }
 $scope.updateTab = function(){
	 return "/public/"+$scope.currentTab+".html"
 }
 $scope.addField = function(){
	 console.log('test')
	 angular.element(document.getElementById('moreFormQuestions')).append('Question '+counter+'. <input type="text" class="form-control"></input>')
	 counter+=1;
 }
 $scope.open = function() {
  $scope.showModal = true;
};
$scope.close = function() {
 $scope.showModal = false;
};
});
