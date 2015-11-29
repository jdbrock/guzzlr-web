$(document).ready(function()
{
	$('#filters').on('input', $.debounce(1000, function()
	{
		$.post("/update-filters", $("#filters-form").serialize());
		// 
		// $("#filter-success-message").fadeIn(500, function()
		// {
		// 	$("#filter-success-message").fadeOut(500);
		// });
	}));


	
	// $("#filter-success-message").alert();
	// window.setTimeout(function() { $("#filter-success-message").alert('close'); }, 1000);
});