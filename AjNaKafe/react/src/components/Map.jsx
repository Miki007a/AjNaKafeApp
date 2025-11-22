import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import "leaflet-control-geocoder";
import "leaflet/dist/leaflet.css";
const MapComponent = ({ setLocation }) => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const mapContainer = mapContainerRef.current;

    if (mapContainer) {
      const map = L.map(mapContainer).setView([41.6171214, 21.7168387], 8);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const marker = L.marker([41.6171214, 21.7168387]).addTo(map);

      const geocoder = L.Control.geocoder({
        defaultMarkGeocode: false,
      })
        .on("markgeocode", function (e) {
          const lat = e.geocode.center.lat;
          const lng = e.geocode.center.lng;
          marker.setLatLng([lat, lng]);
          map.setView([lat, lng], 13);
          const locationValue = `${lat}, ${lng}`;
          setLocation(locationValue);
        })
        .addTo(map);

      map.on("click", function (e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        marker.setLatLng([lat, lng]);
        const locationValue = `${lat}, ${lng}`;
        setLocation(locationValue);
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
  }, [setLocation]);

  return <div ref={mapContainerRef}></div>;
};

export default MapComponent;
