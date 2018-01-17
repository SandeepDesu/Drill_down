import { MapService } from './../../services/mapservice.service';

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import _ from 'lodash';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  public map: any;
  public mapboxAccessToken: string = 'pk.eyJ1IjoiYW5pbHBhdGh1cmkiLCJhIjoiY2oybDhmcWF0MDAwMDJxcWtzMDgwZWI3cyJ9.hzryXsu_ec_AafR-QzzVUQ';
  public country: string = "";
  public latAndLonData;
  public list;
  public world;
  constructor(public mapService: MapService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.country = params['country'] ? params['country'] : null;
    });
    this.mapService.getLatitudeAndLongitude().subscribe((data) => {
      this.latAndLonData = data;
      this.mapService.getRegionsData('list').subscribe((list) => {
        this.list = list;
        this.mapService.getRegionsData('world').subscribe((world) => {
          this.world = world;
          this.mapInitilization();
        });
      });
    });
  }


  mapInitilization() {
    let mapdiv = document.getElementById('map');
    mapdiv.setAttribute('style', 'height:' + (window.outerHeight - 100) + 'px');
    window.addEventListener('resize', () => {
      mapdiv.setAttribute('style', 'height:' + (window.outerHeight - 100) + 'px');
    });
    if (this.country) {
      if (this.country.length === 3) {
        this.country = this.country.substr(1);
      }
      _.forEach(this.latAndLonData, (o, k) => {
        if (k === this.country.toLowerCase()) {
          this.map = L.map('map').setView([o[0], o[1]], 4);
        }
      });
    }
    if (!this.map) {
      this.map = L.map('map').setView([40.82259, -1.8125], 2);
    }
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxAccessToken, {
      id: 'mapbox.light',
      attribution: ''
    }).addTo(this.map);
    this.world.features.forEach((selected) => {
      if (this.country && selected.dsm_id === this.list[this.country.toUpperCase()]) {
        let geojson = L.geoJson(selected).addTo(this.map);
        geojson.eachLayer(function (layer) {
          layer.bindPopup(layer.feature.properties.name);
        });
      }
    });

  }


}


