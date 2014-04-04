$(document).ready(function(){

	$.getJSON('http://localhost:8000/manage/setup/get-system-info', function(response){
		console.log(response);
	});

});