$(function() {
  var state = 0;
  var currentWords = {};
  var lastStateChange = -1;

  // compile templates
  var templates = [];
  for (var i = 1; i <= 3; i++) {
    templates.push(_.template($('#story'+i+'template').html()));
  }

  function changeState(n) {
    state = n;
    lastStateChange = Date.now();
    currentWords = {};
    currentGifs = {};
    //$('input[type=text]').on('keypress', loadImagesD);
    $('input[type=text]').val('');
    $('input[type=text]').off('focusout', loadImages);
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

  function getGifs(term, numSearches) {
    var gifs = [];
    var timeWhenStarted = Date.now();
    var photos = [];
    var key = 'bDgcIYQa72rDkhLjhe2jhqyH2kky2ov5Wd0PHeNwPZKGS6hQ4H';
    var deferred = $.Deferred();
    function helper(term, timestamp, iterations) {
      var endTime;
      var d = $.getJSON('http://api.tumblr.com/v2/tagged?tag='+term+'&before='+timestamp+'&api_key='+key+'&callback=?');
      $.when(d).then(function(d) {
        _.each(d.response, function(result, i) {
          if (i === d.response.length - 1) {
            endTime = result.timestamp;
          }
          if (result.photos) {
            _.each(result.photos, function(photo) {
              var url = photo.original_size.url;
              if (photo.alt_sizes) {
                var sorted = _.sortBy(photo.alt_sizes, function(p) {return p.height;});
                var filtered = _.filter(sorted, function(p) { return p.height <= 250; });
                var choice = _.last(filtered);
                if (url.indexOf('.gif') > -1) {
                  gifs.push(choice.url);
                } else {
                  photos.push(choice.url);
                }
              }
            });
          }
        });
        if (iterations === numSearches || gifs.length > 10) {
          if (!gifs.length) {
            gifs = photos;
          }
          deferred.resolve(gifs, timeWhenStarted);
          return;
        }
        helper(term, endTime, iterations + 1);
      });
    }
    helper(term, Date.now(), 0);
    return deferred.promise();
  }

  $('button').on('click', function() {
    newState = $(this).attr('id').match(/[0-9]/)[0];
    changeState(parseInt(newState, 10));
  });

  var loadImagesD = _.debounce(loadImages, 600);

  var loadImages = function(e) {
    var numSearches = 10;
    var wordLabel = $(this).attr('id');
    console.log($(this));
    currentWords[wordLabel] = '<b>'+$(this).val()+'</b>';

    // gif loading
    if($(this).val() !== '') {
      var term = encodeURI($(this).val());
      var gifs = getGifs(term, numSearches);
      gifs.done(function(g, t) {
        if (t < lastStateChange) {
          console.log('expired gif search return. data unused');
        } else {
          console.log('retrieved gif');
          var gif = _.first(_.shuffle(g));
          if (gif) {
            currentWords[wordLabel] += '<span class="keyword"><img src="'+gif+'"></span>';
          }
        }
      });
    }
  };
});
