

$(function() {
  let includes = $('[include-page]');
  $.each(includes, function() {
    // grab the file name from the include-page attribute
    let file = $(this).attr('include-page')
    let title;

    // if the include-title attribute is set, use that as the title
    $(this).attr('include-title') !== undefined ? title = $(this).attr('include-title') : title;

    // load the file into the element
    $(this).load(file, function(response, status, xhr) {
      if (status === "error") {
        console.error(`Error loading file ${file}: ${xhr.status} ${xhr.statusText}`);
      } else if (title !== undefined){
        $(this).html(response.replace('{{title}}', title));
      }
    });
  });
});

