$(function() {
  let includes = $('[include-page]');
  $.each(includes, function() {
    let file = $(this).attr('include-page')
    $(this).load(file);
  });
});
