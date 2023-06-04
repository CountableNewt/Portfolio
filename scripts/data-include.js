

$(function() {
    var includes = $('[data-include]');
    $.each(includes, function() {
        var file = '../public/' + $(this).data('include') + '.html';
        $(this).load(file);
    })
});