var app = angular.module('votingapp',['ui.bootstrap']);
var counter = 1;

app.controller('formCtrl',function($http,$scope,$uibModal,$log){
	$scope.options = [{number:'1',value:''},{number:'2',value:''}];
	$scope.animationsEnabled = true;
  	$scope.items = ['item1', 'item2', 'item3'];
	$scope.saveData = function(){
	console.log($scope.form)
	$http.post('/',$scope.form).then($scope.updateQuestions());
}
$scope.addField = function(){
	
	$scope.options.push({number:$scope.options.length+1,value:''})
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
$scope.open = function(size){
	 var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: '/public/myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
      
    });
     modalInstance.result.then(function (selectedItem) {
     
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
}
);

angular.module('votingapp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $uibModalInstance.close($scope.selected);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});