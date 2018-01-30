import { MapService } from './../../services/mapservice.service';

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import _ from 'lodash';
import { Services } from '@angular/core/src/view';

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
  public regionsData;
  public nps;
  public geoCodes = [];
  public isCanvas: boolean = false;
  public npsRegions: any = {};
  public selectedYear: string = "";
  public npsObject: any = {};
  public selectedRegion: string = "";

  @ViewChild("myCanvas") myCanvas;
  constructor(public mapService: MapService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.country = params['country'] ? params['country'] : null;
    });
    if (this.country) {
      if (this.country.length === 3) {
        this.country = this.country.substr(1);
      }
    }
    this.mapService.getLatitudeAndLongitude().subscribe((data) => {
      this.latAndLonData = data;
      this.mapService.getRegionsData('list').subscribe((list) => {
        this.list = list;
        this.mapService.getRegionsData('world').subscribe((world) => {
          this.world = world;
          this.mapInitLization();
        });
      });
    });
  }


  mapInitLization() {
    let mapdiv = document.getElementById('map');
    mapdiv.setAttribute('style', 'height:' + (window.outerHeight - 100) + 'px');
    window.addEventListener('resize', () => {
      mapdiv.setAttribute('style', 'height:' + (window.outerHeight - 100) + 'px');
    });
    if (this.country) {
      _.forEach(this.latAndLonData, (o, k) => {
        if (k === this.country.toLowerCase()) {
          this.map = L.map('map').setView([o[0], o[1]], 4);
        }
      });
    }
    if (this.map === undefined) {
      this.map = L.map('map').setView([0, 0], 2);
    }
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxAccessToken, {
      id: 'mapbox.light',
      attribution: ''
    }).addTo(this.map);
    this.getGeoCodesFromJsonFile();
  }

  getGeoCodesFromJsonFile() {
    this.mapService.getJsonFile("nps_total_year_2017").subscribe((nps) => {
      this.nps = nps;
      if (this.nps && this.nps.geo) {
        this.nps.geo.forEach((v) => {
          if (this.geoCodes.indexOf(v.geoid) === -1) {
            this.geoCodes.push(v.geoid);
          }
        });
        this.heighLitingCountrys();

      }
    });
  }
  heighLitingCountrys() {
    let geo = [];
    this.world.features.forEach((selected) => {
      this.geoCodes.forEach((v) => {
        if (selected.dsm_id === this.list[v.toUpperCase()]) {
          let npsValues = [];
          this.nps.geo.forEach((g) => {
            if (g.geoid === v) {
              npsValues.push(g);
            }
          });
          selected.geoValues = npsValues;
          geo.push(selected);
        }
      })
    });
    let geojson = L.geoJSON(geo, {
      style: this.countieStyle, onEachFeature: this.onEachFeature
    }).addTo(this.map);
  }

  countieStyle(feature) {
    return {
      weight: 0,
      fillColor: feature.dsm_id === 'ARG' ? 'blue' : feature.dsm_id === 'BRA' ? 'green' : "yellow",
      fillOpacity: 0.7
    };
  }

  onEachFeature(feature, layer) {
    layer.bindPopup(`<div>
          <h4 class="set-margincls">${feature.dsm_id}</h2>            
          <table class="table table-hover">
            <thead>
              <tr>
                <th></th>
                <th>actual</th>
                <th>ytdActual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${feature.geoValues[0].label}</td>
                <td>${feature.geoValues[0].actual}</td>
                <td>${feature.geoValues[0].ytdActual}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `);
      layer.on("mouseover", function (e) {
        layer.openPopup(e.latlng);
      });
      layer.on("mouseout", function () {
        layer.closePopup();
      });
  }
}


