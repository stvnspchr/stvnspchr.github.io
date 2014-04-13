/*global jQuery */
/*!
* jquery.articles.js 1.1
*
* Copyright 2013, Steven Speicher
*
* Date: October 9th 2013
*/

$(document).ready(function() {

	$('a.main-nav').click(function() {
		var currentId = $(this).attr('id');
    	
    	$('a.current').not(this).removeClass('current');
    	$(this).addClass('current');

        // if(currentId = 'work'){
        //     $('.tab').addClass('.work-active');
        //     alert("on" + currentId);
        // }else if (currentId != 'work'){
        //     $('.tab').removeClass('.work-active');
        //     alert("off" + currentId);
        // }
    	
    	$('section').each(function() {
     		if( $(this).attr('id').match(currentId) ) {
         		$('section.current').not(this).removeClass('current');
    			$(this).addClass('current');
     		}
  		});
	 });
});