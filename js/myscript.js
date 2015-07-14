(function ($, window) {
  'use strict';

  var weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?units=metric&q=',
      iconStr = 'icons/weather/{icon}.png',
      search = '#search',
      canvasTemplate = '#canvas-template',
      canvas = '.y-chrome-ext-canvas';

  /**
   * Fetches weather data from source
   * @param string search query
   */
  function fetchWeather(location) {    

    /**
     * Handles errors
     */
    function errorHandler() {
      $(canvas).html('No city found. Please try again.');
      return;
    }

    /**
     * Handles weather data on success
     * @param object containing weather data
     */
    function successHandler(data) {
      if (!data || data.cod === '404') {
        errorHandler();
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

      Helper.imgReplace($(canvas).find('img'));
      localStorage.setItem('location', location);
  }    

    $.ajax({
      url:  [weatherAPI, location].join(''),
      type: 'POST',
      success: successHandler,
      error: errorHandler
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
