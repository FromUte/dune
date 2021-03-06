Dune.Map = (mapCanvasSelector) ->
  window.mapCanvasSelector = mapCanvasSelector

  $.getScript('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=Dune.MapInitialize')

  Dune.MapInitialize = ->
    mapCanvasSelector = '.map-canvas' if typeof mapCanvasSelector is 'undefined'
    mapCanvas = $(mapCanvasSelector)[0]
    mapOptions =
      zoom: 14
      center: new google.maps.LatLng($('.location-coordinates').data('latitude'), $('.location-coordinates').data('longitude'))
      disableDefaultUI: true
      mapTypeId: 'terrain'
    map = new google.maps.Map(mapCanvas, mapOptions)
