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
  public regionsData;
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
    if (this.country && this.country.toLowerCase() === 'us') {
      this.selectedRegion = 'region';
      this.regionChange();
    } else {
      this.mapService.getLatitudeAndLongitude().subscribe((data) => {
        this.latAndLonData = data;
        this.mapService.getRegionsData('list').subscribe((list) => {
          this.list = list;
          this.mapService.getRegionsData('world').subscribe((world) => {
            this.world = world;
            this.mapInit();
            this.heighLitingCountry();
          });
        });
      });
    }
  }

  mapInit() {
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
  }

  heighLitingCountry() {
    this.world.features.forEach((selected) => {
      if (this.country && selected.dsm_id === this.list[this.country.toUpperCase()]) {
        let geojson = L.geoJSON(selected, {
          style: {
            weight: 0,
            fillColor: "#49a7db",
            fillOpacity: 0.7
          }
        }).addTo(this.map);
        geojson.eachLayer(function (layer) {
          layer.bindPopup(layer.feature.properties.name);
        });
      }
    });
  }

  regionChange() {
    this.mapService.getRegionsData("regional")
      .subscribe(data => {
        this.mapInitialization();
        this.regionsData = data || {};
        L.geoJSON(this.regionsData, { style: this.countieStyle }).addTo(this.map);
        this.yearChange();
      },
      error => {
        console.log(error)
      });
  }

  mapInitialization() {
    let mapdiv = document.getElementById('map');
    mapdiv.setAttribute('style', 'height:' + (window.outerHeight - 100) + 'px');
    window.addEventListener('resize', () => {
      mapdiv.setAttribute('style', 'height:' + (window.outerHeight - 100) + 'px');
    });
    this.map = L.map('map').setView([39.8, -96], 4);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxAccessToken, {
      id: 'mapbox.light',
      attribution: ''
    }).addTo(this.map);
  }

  countieStyle(feature) {
    return {
      weight: 0.3
    };
  }

  canvasInitialization() {
    this.isCanvas = true;
    const canvasEl: HTMLCanvasElement = this.myCanvas.nativeElement;
    let ctx = canvasEl.getContext("2d");
    var my_gradient = ctx.createLinearGradient(0, 0, 285, 0);
    my_gradient.addColorStop(0, "#1c92d2");
    my_gradient.addColorStop(0.25, "#a4d3ed");
    my_gradient.addColorStop(0.5, "#f5f5f5");
    my_gradient.addColorStop(0.75, "#f9d4d3");
    my_gradient.addColorStop(1, "#f29492");
    ctx.fillStyle = my_gradient;
    ctx.fillRect(20, 20, 250, 25);
  }

  yearChange() {
    this.selectedYear = "2016-15";
    let params = {
      'year': this.selectedYear || ""
    }
    this.mapService.getNPSRegion(params)
      .subscribe(
      data => {
        this.map.remove();
        this.mapInitialization();
        this.npsRegions = data || {};
        this.isCanvas = false;
        this.npsObject = {};
        for (let i in this.regionsData.features) {
          let feature: any = this.regionsData.features[i] || {};
          let properties = feature.properties || {};
          let npsRegion;
          if (this.selectedRegion == "region") {
            npsRegion = this.npsRegions[properties.terrid] || {};
            this.regionsData.features[i].properties.dsm_id = properties.terrid;
          }
          else {
            npsRegion = this.npsRegions[properties.dsm_id] || {};
          }
          if (npsRegion.change) {
            this.regionsData.features[i].npsRegion = npsRegion || {};
            this.regionsData.features[i].isNpsRegion = true;
          }
          else {
            this.regionsData.features[i].npsRegion = {};
            this.regionsData.features[i].isNpsRegion = false;
            this.regionsData.features[i].npsRegion["2016"] = { "Q1": {}, "Q2": {}, "Q3": {}, "Q4": {} };
            this.regionsData.features[i].npsRegion["2015"] = { "Q1": {}, "Q2": {}, "Q3": {}, "Q4": {} };
            this.regionsData.features[i].npsRegion["2014"] = { "Q1": {}, "Q2": {}, "Q3": {}, "Q4": {} };
          }
          this.regionsData.features[i].selecredYear = this.selectedYear;
        }
        this.onQ1Select();
      },
      error => {
        console.log(error)
      }
      );
  }

  onQ1Select() {
    this.map.remove();
    this.mapInitialization();
    this.isCanvas = false;
    this.npsObject = {};
    let NPSValues = this.regionsData.features.map(function (o) { return o.npsRegion.Q1dt; })
    NPSValues = NPSValues.filter((NPS) => NPS != undefined);
    if (NPSValues.length > 0) {
      let max = Math.max.apply(Math, NPSValues);
      this.npsObject.maxNPS = Math.round(max) || "";
    }
    NPSValues = this.regionsData.features.map(function (o) { return o.npsRegion.Q1dt; })
    NPSValues = NPSValues.filter((NPS) => NPS != undefined);
    if (NPSValues.length > 0) {
      let min = Math.min.apply(Math, NPSValues);
      this.npsObject.minNPS = Math.round(min) || "";
    }
    if (this.npsObject.maxNPS && this.npsObject.minNPS) {
      this.canvasInitialization();
    }
    console.log(this.regionsData);
    L.geoJSON(this.regionsData, { style: this.countiesStyleBYQ1, onEachFeature: this.onEachFeatureQ1 }).addTo(this.map);
  }

  onEachFeatureQ1(feature, layer) {
    let npsValue = {};
    npsValue['2016'] = feature.npsRegion['2016'] || { "Q1": {} };
    npsValue['2016'] = npsValue['2016'].Q1 || {};
    npsValue['2015'] = feature.npsRegion['2015'] || { "Q1": {} };
    npsValue['2015'] = npsValue['2015'].Q1 || {};
    npsValue['2014'] = feature.npsRegion['2014'] || { "Q1": {} };
    npsValue['2014'] = npsValue['2014'].Q1 || {};

    if ((npsValue['2016'].NPS || npsValue['2016'].NPS == 0.0) && (npsValue['2015'].NPS || npsValue['2015'].NPS == 0.0) && feature.selecredYear.indexOf('2016') != -1) {
      npsValue['2016'].NPS = Math.round(npsValue['2016'].NPS);
      npsValue['2015'].NPS = Math.round(npsValue['2015'].NPS);
      let diff: any = npsValue['2016'].NPS - npsValue['2015'].NPS;
      diff = Math.round(diff);
      let icon = "";
      if (diff > 0) {
        icon = 'glyphicon-arrow-up color-blue';
      }
      else {
        icon = 'glyphicon-arrow-down color-red';
      }
      layer.bindPopup(`<div>
          <h4 class="set-margincls">${feature.properties.dsm_id}</h2>            
          <table class="table table-hover">
            <thead>
              <tr>
                <th></th>
                <th>NPS</th>
                <th>Survey Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2016</td>
                <td>${npsValue['2016'].NPS}</td>
                <td>${npsValue['2016'].N}</td>
              </tr>
              <tr>
                <td>2015</td>
                <td>${npsValue['2015'].NPS}</td>
                <td>${npsValue['2015'].N}</td>
              </tr>
              <tr>
                <td>Diff</td>
                <td colspan="2">${diff} <span class="glyphicon  ${icon} "></td>
              </tr>
            </tbody>
          </table>
        </div>
      `);
    }
    else if ((npsValue['2016'].NPS || npsValue['2016'].NPS == 0.0) && feature.selecredYear.indexOf('2016') != -1) {
      npsValue['2016'].NPS = Math.round(npsValue['2016'].NPS);
      layer.bindPopup(`<div>
          <h4 class="set-margincls">${feature.properties.dsm_id}</h2>            
          <table class="table table-hover">
            <thead>
              <tr>
                <th></th>
                <th>NPS</th>
                <th>Survey Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2016</td>
                <td>${npsValue['2016'].NPS}</td>
                <td>${npsValue['2016'].N}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `);
    }
    else if ((npsValue['2015'].NPS || npsValue['2015'].NPS == 0.0) && (npsValue['2014'].NPS || npsValue['2014'].NPS == 0.0) && feature.selecredYear.indexOf('2015') != -1) {
      npsValue['2014'].NPS = Math.round(npsValue['2014'].NPS);
      npsValue['2015'].NPS = Math.round(npsValue['2015'].NPS);
      let diff: any = npsValue['2015'].NPS - npsValue['2014'].NPS;
      diff = Math.round(diff);
      let icon = "";
      if (diff > 0) {
        icon = 'glyphicon-arrow-up color-blue';
      }
      else {
        icon = 'glyphicon-arrow-down color-red';
      }

      layer.bindPopup(`<div>
          <h4 class="set-margincls">${feature.properties.dsm_id}</h2>            
          <table class="table table-hover">
            <thead>
              <tr>
                <th></th>
                <th>NPS</th>
                <th>Survey Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2015</td>
                <td>${npsValue['2015'].NPS}</td>
                <td>${npsValue['2015'].N}</td>
              </tr>
              <tr>
                <td>2014</td>
                <td>${npsValue['2014'].NPS}</td>
                <td>${npsValue['2014'].N}</td>
              </tr>
              <tr>
                <td>Diff</td>
                <td colspan="2">${diff} <span class="glyphicon  ${icon} "></td>
              </tr>
            </tbody>
          </table>
        </div>
      `);
    }
    else if ((npsValue['2015'].NPS || npsValue['2015'].NPS == 0.0) && feature.selecredYear.indexOf('2015') != -1) {
      npsValue['2015'].NPS = Math.round(npsValue['2015'].NPS);
      layer.bindPopup(`<div>
          <h4 class="set-margincls">${feature.properties.dsm_id}</h2>            
          <table class="table table-hover">
            <thead>
              <tr>
                <th></th>
                <th>NPS</th>
                <th>Survey Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2015</td>
                <td>${npsValue['2015'].NPS}</td>
                <td>${npsValue['2015'].N}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `);
    }
    else {
      layer.bindPopup('<div class="info-div"> <b>' + feature.properties.dsm_id + '</b> </div>');
    }
    layer.on("mouseover", function (e) {
      layer.openPopup(e.latlng);
    });
    layer.on("mouseout", function () {
      layer.closePopup();
    });
  };

  countiesStyleBYQ1(feature) {
    if (feature.isNpsRegion) {
      let npsValue = {};
      let diff = 0;
      npsValue['2016'] = feature.npsRegion['2016'] || {};
      npsValue['2016'] = npsValue['2016'].Q1 || {};
      npsValue['2015'] = feature.npsRegion['2015'] || {};
      npsValue['2015'] = npsValue['2015'].Q1 || {};
      npsValue['2014'] = feature.npsRegion['2014'] || {};
      npsValue['2014'] = npsValue['2014'].Q1 || {};

      if ((npsValue['2016'].NPS || npsValue['2016'].NPS == 0.0) && (npsValue['2015'].NPS || npsValue['2015'].NPS == 0.0) && feature.selecredYear.indexOf('2016') != -1) {
        diff = npsValue['2016'].NPS - npsValue['2015'].NPS;
      }
      else if ((npsValue['2016'].NPS || npsValue['2016'].NPS == 0.0) && feature.selecredYear.indexOf('2016') != -1) {
        diff = npsValue['2016'].NPS;
      }
      else if ((npsValue['2015'].NPS || npsValue['2015'].NPS == 0.0) && (npsValue['2014'].NPS || npsValue['2014'].NPS == 0.0) && feature.selecredYear.indexOf('2015') != -1) {
        diff = npsValue['2015'].NPS - npsValue['2014'].NPS;
      }
      else {
        diff = npsValue['2015'].NPS
      }

      let styleObj = {
        fillColor: diff > 45 ? '#1c92d2' :
          diff > 25 ? '#49a7db' :
            diff > 7 ? '#a4d3ed' :
              diff > 1 ? '#d1e9f6' :
                diff == 0 ? '#ffffff' :
                  diff > -7 ? '#fbdede' :
                    diff > -25 ? '#f9d4d3' :
                      diff > -59 ? '#f4a9a7' :
                        diff > -200 ? '#f29492' :
                          diff == undefined ? "#000000" :
                            '#f5f5f5',
        weight: 0,
        fillOpacity: 0.7
      };
      return styleObj;
    }
    else {
      let styleObj = {
        // weight:0.3
        weight: 0,
        fillColor: "#000000",
        fillOpacity: 0.3
      };
      return styleObj;
    }
  }


}


