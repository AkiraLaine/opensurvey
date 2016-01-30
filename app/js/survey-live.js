var app = angular.module('livesurvey',[]);

app.controller('liveCtrl',function($scope,$window,$http){
		var path = {surveyLink:window.location.pathname}
    console.log(path)
		$http.post('/api/surveydata/',path).then(function(data){
      console.log(data)
		$scope.answers = {};
		$scope.setGender = function(str){
			$scope.answers.gender = str;
		}
			$scope.activeSurvey = data.data;
			$scope.answers = {
				title: $scope.activeSurvey.name,
				origin: $scope.activeSurvey.link,
			};
				$scope.activeSurvey.questions.forEach(function(question){
							$scope.answers[question.name] = '';
			});
		})

	$scope.submitSurvey = function(survey) {
		var date = new Date();

    fadeOut('question-container-live');
    fadeIn('thankyou-message');
		$scope.answers.date = date.toLocaleDateString();
    $http.post('/api/results',$scope.answers)
	}
})

function fadeOut(id,speed){
  var element = document.getElementById(id)
  element.style.opacity = 1;
  draw();
  function draw(){

    if (element.style.opacity <= 0){
      element.style.visibility = 'hidden';
    }
      else {
    element.style.opacity -= 0.1;
    requestAnimationFrame(draw)
      }
}
}

function fadeIn(id,speed){
  if (typeof id === 'string')

  var element = document.getElementById(id);
  else
  var element = id;
  if (element.style.visibility !== 'visible'){
  var counter = 0;
  element.style.opacity = 0;
  element.style.visibility = 'visible';
  draw();
  function draw(){
  	counter += 0.1;
  element.style.opacity = counter;
  if (element.style.opacity <1){
  requestAnimationFrame(draw)
  }
  }

}
}
