/* jshint plusplus: false */
/* globals L */
(function(name, context, factory) {
  // Supports UMD. AMD, CommonJS/Node.js and browser context
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory(
      require('leaflet')
    );
  } else if (typeof define === "function" && define.amd) {
    define(['leaflet'], factory);
  } else {
    if (typeof window.L === 'undefined') {
      throw new Error('simpleMarkers must be loaded before the leaflet heatmap plugin');
    }
  }
})("SimpleMarkers", this, function(L) {
  L.Control.SimpleMarkers = L.Control.extend({
    options: {
      position: 'topleft',
      add_control: true,
      delete_control: true,
      allow_popup: true,
      marker_icon: undefined,
      marker_draggable: false,
      add_marker_callback: undefined,
      before_add_marker_callback: undefined,
      after_add_marker_callback: undefined
    },
    map: undefined,
    markerList: [],

    onAdd: function(map) {
      "use strict";
      this.map = map;
      var marker_container = L.DomUtil.create('div', 'marker_controls');

      if (this.options.add_control) {
        let that = this
        this.options.marker_icon.forEach(function(d) {
          var add_marker_div = L.DomUtil.create('div', d.class, marker_container);
          add_marker_div.title = 'Add a marker';
          L.DomEvent.addListener(add_marker_div, 'click', L.DomEvent.stopPropagation)
            .addListener(add_marker_div, 'click', L.DomEvent.preventDefault)
            .addListener(add_marker_div, 'click', that.enterAddMarkerMode.bind(that));
        })
      }
      if (this.options.delete_control) {
        var del_marker_div = L.DomUtil.create('div', 'del_marker_control', marker_container);
        del_marker_div.title = 'Delete a marker';


        L.DomEvent.addListener(del_marker_div, 'click', L.DomEvent.stopPropagation)
          .addListener(del_marker_div, 'click', L.DomEvent.preventDefault)
          .addListener(del_marker_div, 'click', this.enterDelMarkerMode.bind(this));
      }

      return marker_container;
    },

    enterAddMarkerMode: function() {
      "use strict";
      if (this.markerList !== '') {
        for (var marker = 0; marker < this.markerList.length; marker++) {
          if (typeof(this.markerList[marker]) !== 'undefined') {
            this.markerList[marker].removeEventListener('click', this.onMarkerClickDelete.bind(this));
          }
        }
      }
      this.map._container.style.cursor = 'crosshair';
      this.options.before_add_marker_callback && this.options.before_add_marker_callback()
      this.map.addEventListener('click', this.onMapClickAddMarker.bind(this, event.target.className))
    },

    enterDelMarkerMode: function() {
      "use strict";
      for (var marker = 0; marker < this.markerList.length; marker++) {
        if (typeof(this.markerList[marker]) !== 'undefined') {
          this.markerList[marker].addEventListener('click', this.onMarkerClickDelete.bind(this));
          this.map._container.style.cursor = 'crosshair';
        }
      }
    },

    onMapClickAddMarker: function(className, e) {
      "use strict";
      this.map.removeEventListener('click');
      this.map._container.style.cursor = 'auto';

      var marker_options = { draggable: this.options.marker_draggable, class: className };
      if (this.options.marker_icon) {
        marker_options.icon = this.options.marker_icon.find(d => d.class === className).icon;
      }
      var marker = L.marker(e.latlng, marker_options);
      if (this.options.allow_popup) {
        var popupContent = "You clicked on the map at " + e.latlng.toString();
        var the_popup = L.popup({ maxWidth: 160, closeButton: false });
        the_popup.setContent(popupContent);
        marker.bindPopup(the_popup).openPopup();
      }
      if (this.options.add_marker_callback) {
        this.options.add_marker_callback(marker);
      }
      marker.addTo(this.map);
      this.markerList.push(marker);
      this.options.after_add_marker_callback && this.options.after_add_marker_callback()
      return false;
    },

    onMarkerClickDelete: function(e) {
      "use strict";
      this.map._container.style.cursor = 'auto';
      if (this.markerList.indexOf(e.target) !== -1) {
        this.map.removeLayer(e.target);
        var marker_index = this.markerList.indexOf(e.target);
        delete this.markerList[marker_index];

        for (var marker = 0; marker < this.markerList.length; marker++) {
          if (typeof(this.markerList[marker]) !== 'undefined') {
            this.markerList[marker].removeEventListener('click', this.onMarkerClickDelete);
          }
        }
        return false;
      }
    },
    deleteAllMarkers: function() {
      let that = this
      this.markerList.forEach(function(marker) {
        if (marker) {
          that.map.removeLayer(marker)
        }
      })
      this.markerList = []
    }
  });
  return L.Control.SimpleMarkers
})
