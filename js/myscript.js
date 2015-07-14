(function ($, window) {
  'use strict';

  var weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?units=metric&q=',
      iconStr = 'icons/weather/{icon}.png',
      search = '#search',
      canvasTemplate = '#canvas-template',
      canvas = '.y-chrome-ext-canvas';

  function imgReplace(imgEl) {
    if (!imgEl) {
      return;
    }
    
    imgEl.attr('src', imgEl.data('src'));
  }

  function fetchWeather(location) {

    function error() {
      $(canvas).html('No city found. Please try again.');
      return;
    }

    function success(data) {
      if (!data || data.cod === '404') {
        error();
      }

      var temp = Math.ceil(data.main.temp).toString(),
          weatherIcon = Helper.bind(iconStr, { icon: data.weather[0].icon }),
          newCanvas;

      chrome.browserAction.setBadgeText({ text: temp });
      chrome.browserAction.setIcon({ path: weatherIcon });
      
      newCanvas = Helper.bind($(canvasTemplate).html(), {
        icon: weatherIcon,
        name: data.name || 'N/A',
        description: data.weather[0].description || 'N/A',
        temp: data.main.temp || 'N/A',
        temp_max: data.main.temp_max || 'N/A',
        temp_min: data.main.temp_min || 'N/A',
        humidity: data.main.humidity || 'N/A',
        presure: data.main.presure || 'N/A'
      });

      $(canvas).html(newCanvas);
      imgReplace($(canvas).find('img'));

      localStorage.setItem('location', location);
    }

    $.ajax({
      url:  [weatherAPI, location].join(''),
      type: 'POST',
      success: success,
      error: error
    });
    
  }

  function searchKeyUp(event) {
    if (event.keyCode !== 13) {
      return;
    }

    var location = $(this).val();

    fetchWeather(location);
  }

  $(document).ready(function () {
    if (localStorage.getItem('location')) {
      fetchWeather(localStorage.getItem('location'));
    }

    $(search).on('keyup', searchKeyUp);
  });

}(jQuery, window));
