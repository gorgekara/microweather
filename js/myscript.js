(function ($, window, h) {
  'use strict';

  var weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?units={units}&q={location}',
      iconStr = 'icons/weather/{icon}.png',
      search = '.micro-weather-knbgahoibccgfedbeamjlaipedimpfeh #search',
      settingsBtn = '.micro-weather-knbgahoibccgfedbeamjlaipedimpfeh .settings__link',
      settings = '.micro-weather-knbgahoibccgfedbeamjlaipedimpfeh .settings__area',
      unitsDeg = '.micro-weather-knbgahoibccgfedbeamjlaipedimpfeh .settings__units',
      canvasTemplate = '.micro-weather-knbgahoibccgfedbeamjlaipedimpfeh #canvas-template',
      canvas = '.micro-weather-knbgahoibccgfedbeamjlaipedimpfeh .y-chrome-ext-canvas';

  /**
   * Fetches weather data from source
   * @param string search query
   */
  function fetchWeather(location) {    
    var unitsCheck = localStorage.units || $(unitsDeg).val() || 'metric';

    function errorHandler() {
      $(canvas).html('No city found. Please try again.');
      return;
    }

    function successHandler(data) {
      if (!data || data.cod === '404') {
        errorHandler();
      }

      var temp = Math.ceil(data.main.temp).toString(),
          weatherIcon = h.bind(iconStr, { icon: data.weather[0].icon }),
          newCanvas,
          units = unitsCheck === 'metric' ? '&deg;C' : '&deg;F';

      chrome.browserAction.setBadgeText({ text: temp });
      chrome.browserAction.setIcon({ path: weatherIcon });
      
      newCanvas = h.bind($(canvasTemplate).html(), {
        icon: weatherIcon,
        name: data.name || 'N/A',
        description: data.weather[0].description || 'N/A',
        temp: data.main.temp + units,
        temp_max: data.main.temp_max + units,
        temp_min: data.main.temp_min + units,
        humidity: data.main.humidity || 'N/A',
        presure: data.main.presure || 'N/A'
      });

      $(canvas).html(newCanvas);

      h.imgReplace($(canvas).find('img'));
      localStorage.setItem('location', location);
    }    

    $.ajax({
      url:  h.bind(weatherAPI, {
        units: unitsCheck,
        location: location
      }),
      type: 'POST',
      success: successHandler,
      error: errorHandler
    });
    
  }

  /**
   * Handles key press on search
   * @param object containing weather data
   */
  function searchKeyUp(event) {
    if (event.keyCode !== 13) {
      return;
    }

    fetchWeather($(this).val());
  }

  function settingsClick() {
    $(settings).toggle();
  }

  function unitsChange() {
    var val = $(this).val();

    if (val === '') {
      return;
    }

    localStorage.units = val;
    fetchWeather(localStorage.getItem('location'));
  }

  $(document).ready(function () {
    if (localStorage.getItem('location')) {
      fetchWeather(localStorage.getItem('location'));
    }

    $(search).on('keyup', searchKeyUp);
    $(settingsBtn).on('click', settingsClick);
    $(unitsDeg).on('change', unitsChange);
  });

}(jQuery, window, Helper));
