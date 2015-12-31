angular.module('votingapp').controller('dashboardCtrl',function($scope,$http){

	$scope.viewContent = '/public/dashboard.html'
	$http.get('api/active').then(function(data){
			$scope.activeSurveys = data.data;
		})
	$scope.getAnswerAmount = function(object){
		var counter = 0;
		for (keys in object){
			counter += object[keys].length;
		}
		return counter;
	}
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
});
angular.module('votingapp').controller('surveyCreationCtrl',function($scope,$http,$uibModal,$routeParams){
	$scope.currentStep = 1;

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
			$scope.viewContent = '/public/editSurvey.html'
	}
	else {
			$scope.viewContent = '/public/newSurvey.html'
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
		$scope.scale = {};
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
					for (var key in survey.answers){
						for (var i=0; i<survey.answers[key].length;i++){
							console.log(survey.answers[key][i][str])
							if (survey.answers[key][i][str] >= arr[0] && survey.answers[key][i][str] <= arr[1] ){
							results.push(survey.answers[key][i][survey.questions[x].name]);
							}
						}
					}
					var range = str.concat(' '+arr[0]+'-'+arr[1])
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
	if (range !== undefined){
		$scope.filter[x] = [results,str,range];
	}
	else {
			$scope.filter[x] = [results,str];
	}

console.log($scope.filter)
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
		$scope.survey = survey;
		console.log($scope.survey)
		counter = 0;
	});



$scope.createChart = function(chartName) {
	        $timeout(function(){
						console.log('made it' +chartName)
					})
	        }
})
angular.module('votingapp').controller('frontpageCtrl',function($scope,$http,$window,$location){
	window.fbAsyncInit = function() {
		FB.init({
			appId      : '165180297173897',
			xfbml      : true,
			version    : 'v2.5'
		});
	};

	(function(d, s, id){
		 var js, fjs = d.getElementsByTagName(s)[0];
		 if (d.getElementById(id)) {return;}
		 js = d.createElement(s); js.id = id;
		 js.src = "//connect.facebook.net/en_US/sdk.js";
		 fjs.parentNode.insertBefore(js, fjs);
	 }(document, 'script', 'facebook-jssdk'));

	 $scope.FBlogin = function(){
		 FB.login(function(response){
			 if (response.status === 'connected'){
				 FB.api('/me', {fields:'email,name'},function(response) {
					 console.log(response)
				 $http.post('/login/facebook',response).then(function(data){
					 console.log(data.data.token)
					 $window.localStorage.token = data.data.token;
					 $location.path('/dashboard')
				 })
		 })
			 }

		 },{scope:'email'});
	;
	 }
	function crossTest() {
		console.log("BIG BAD CROSS TEST")
	}
	//redirect function for github popup window
	window.crossTest = function() {
		$location.path('/dashboard')
		if(!$scope.$$phase) $scope.$apply()
	}

	$scope.githubLogin = function(){
		win =  window.open('https://github.com/login/oauth/authorize?client_id=f0ccba6a396af395540f&scope=user',"test","height=600,width=900",'modal=yes')

	}
	var myLineChart;
	var ctx;
	var chartAnim;
	var heroAnimation;
	var w = 1600;
	var c = 0;
	var animated = false;
	var section2 = false;
	var section3 = false;
	$scope.scrollPage = function(id){
		var elm = document.getElementById(id);
		var init = document.body.scrollTop;
		var counter = init;
		if (elm.offsetTop > document.body.scrollTop) {
			var scrollAmount = elm.offsetTop - document.body.scrollTop;
			var scrollInterval = setInterval(function(){
				window.scroll(0,counter)
				counter += Math.max(20,scrollAmount/50);
				if (counter >= init+scrollAmount) clearInterval(scrollInterval);
				},15)
			}
		else if (elm.offsetTop < document.body.scrollTop) {
			console.log('its smaller')
			var scrollAmount = document.body.scrollTop-elm.offsetTop;
			console.log(scrollAmount)
			var scrollInterval = setInterval(function(){
				window.scroll(0,counter)
				counter -=Math.max(20,scrollAmount/50);
				if (counter <= init-scrollAmount) clearInterval(scrollInterval);
			},15)
		}
	}
	function activateHeroAnimation() {
		if (!animated){
			animated = true;
			console.log('doing stuff')
			heroAnimation = setInterval(function(){
			document.getElementById('hero-linechart1').style.left = c +'px';
			document.getElementById('hero-linechart1').style.width = w+'px';
			w+=1;
			c -=1;
			if (w >= 3840){
				w=1600;
				c = 0;
			}
		},60)
		}
	}
	function deactivateHeroAnimation() {
		if (animated){
			animated = false;
			clearInterval(heroAnimation)
		}
	}
	window.onscroll = function() {
		if (document.body.scrollTop > 0) {
						document.getElementById('navbar').classList.remove('top-navbar');
			document.getElementById('navbar').classList.add('stick');
		}
		if (document.body.scrollTop < 5) {

						document.getElementById('navbar').classList.add('top-navbar');
			document.getElementById('navbar').classList.remove('stick');
	activateHeroAnimation();
		}
		if (document.body.scrollTop > 300){
			deactivateHeroAnimation();
		}
		if (document.body.scrollTop >= document.getElementById('lineCharts').offsetTop-300 && !section3){
			document.getElementById('chartBlue').classList.add('chart-expanded');
			window.setTimeout(function(){
					document.getElementById('chartOrange').classList.add('chart-expanded');
			},1000)
			section3 = true;
		}
		if (document.body.scrollTop >= document.getElementById('questionChoice').offsetTop-400 && !section2) {

					fadeIn(document.getElementById('question-image-wrapper').children[0],40);
					window.setTimeout(function(){
						fadeIn(document.getElementById('question-image-wrapper').children[1],40);
						window.setTimeout(function(){
							fadeIn(document.getElementById('question-image-wrapper').children[2],40);
						},400);
					},400);
					section2 = true;
	}
	if (document.body.scrollTop >= document.getElementById('dashboardInfo').offsetTop-420){
		fadeIn('dashboard-window',30)
		document.getElementById('dashboard-window').classList.add('dashboard-window-expanded');
	}
}

			 	activateHeroAnimation();



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
