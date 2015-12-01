$(document).ready(function()
{
	$('#filters').on('input', $.debounce(1000, function()
	{
		$.post("/update-filters", $("#filters-form").serialize());
	}));
});