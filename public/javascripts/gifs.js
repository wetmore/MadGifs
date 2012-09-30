$(function() {
  var state = 0;
  var currentWords = {};
  var currentGifs = {};

  // compile templates
  var templates = [];
  for (var i = 1; i <= 3; i++) {
    templates.push(_.template($('#story'+i+'template').html()));
  }

  function changeState(n) {
    state = n;
    currentWords = {};
    currentGifs = {};
    //$('input[type=text]').on('keypress', loadImagesD);
    $('input[type=text]').val('');
    $('input[type=text]').focusout(loadImages);
    $('#story-stage').hide('fast', function() {});
    $('form').bind('submit', function(e) {
      var story = templates[state - 1](currentWords);
      $('form').hide('fast');
      $('#story-stage').empty().append(story);
      $('#story-stage').show('slow', function() {});
      return false;
    });
  }

  $('button').on('click', function() {
    newState = $(this).attr('id').match(/[0-9]/)[0];
    changeState(parseInt(newState, 10));
  });

  var loadImagesD = _.debounce(loadImages, 600);

  var loadImages = function(e) {
    var wordLabel = $(this).attr('id');
    console.log($(this));
    currentWords[wordLabel] = $(this).val();

    // add gif loading here
    //
  };
});
