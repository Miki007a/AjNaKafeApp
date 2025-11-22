$(function(){
  $("#wizard").steps({
    headerTag: "h4",
    bodyTag: "section",
    transitionEffect: "fade",
    enableAllSteps: true,
    transitionEffectSpeed: 500,
    labels: {
      next: "Next",
      previous: "Back"
    },
    onStepChanged: function (event, currentIndex, priorIndex) {
      if (currentIndex === 1) {
        // Initialize the map after the transition to the second step
        initMap();
      }
    },
    onStepChanging: function (event, currentIndex, newIndex) {
      if (newIndex === 1) {
        $('.steps ul').addClass('step-2');
        $('.actions ul li:nth-child(2)').addClass('step-2');
        $('.actions ul li:nth-child(2) a').html('Book Now');
      } else {
        $('.steps ul').removeClass('step-2');
        $('.actions ul li:nth-child(2)').removeClass('step-2');
        $('.actions ul li:nth-child(2) a').html('Next');
      }
      if (newIndex === 2) {
        $('.steps ul').addClass('step-3');
        $('.actions ul').addClass('step-last');
        $('.actions ul li').hide();
      } else {
        $('.steps ul').removeClass('step-3');
      }
      return true;
    }
  });

  function initMap() {
    const mapContainer = document.getElementById("map");
    if (mapContainer) {
      const map = L.map(mapContainer).setView([41.6171214, 21.7168387], 8);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const marker = L.marker([41.6171214, 21.7168387]).addTo(map);

      const geocoder = L.Control.geocoder({
        defaultMarkGeocode: false
      })
        .on("markgeocode", function (e) {
          const lat = e.geocode.center.lat;
          const lng = e.geocode.center.lng;
          marker.setLatLng([lat, lng]);
          map.setView([lat, lng], 13);
          locationRef.current.value = `${lat}, ${lng}`;
        })
        .addTo(map);

      map.on("click", function (e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        marker.setLatLng([lat, lng]);
        locationRef.current.value = `${lat}, ${lng}`;
      });
      mapContainer.style.width = '100%';
      mapContainer.style.height = '250px';

      setTimeout(() => {
        map.invalidateSize();
      }, 0);
      return () => {
        map.remove();
      };
    }
  }

  // Custome Jquery Step Button
  $('.forward').click(function(){
    $("#wizard").steps('next');
  })
  $('.backward').click(function(){
    $("#wizard").steps('previous');
  })

  // Date Picker
  var dp = $('#dp').datepicker().data('datepicker');
  dp.selectDate(new Date());

  // Select Dropdown
  $('html').click(function() {
    $('.select .dropdown').hide();
  });
  $('.select').click(function(event){
    event.stopPropagation();
  });
  $('.select .select-control').click(function(){
    $('.select .dropdown').toggle();
  })
  var textInit = $('.select .dropdown li:first-child').attr('rel');
  $('.select-control').text(textInit);
  $('.select .dropdown li').click(function(){
    $('.select .dropdown').toggle();
    var text = $(this).attr('rel');
    $(this).parent().prev().find('div').text(text);
  })
});
