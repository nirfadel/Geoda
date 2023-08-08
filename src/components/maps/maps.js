import React, { useEffect, useRef } from 'react';
import MapView from "@arcgis/core/views/MapView";
import esriConfig from "@arcgis/core/config";
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import Map from "@arcgis/core/Map";
import Graphic from "@arcgis/core/Graphic";
import Circle from "@arcgis/core/geometry/Circle";
import * as locator from '@arcgis/core/rest/locator';
import * as arcgisRest from '@esri/arcgis-rest-request';
import { queryDemographicData } from '@esri/arcgis-rest-demographics';
import './maps.css';

const GISMaps = (props) => {
    const key = "AAPKa002ef523ac94d3e9a0aaf395aed2649wiBvM1-q7qmocDSVIc-68VsGRG_Pq_MzbwasdVGM-wNzS0aZtoB33J3EULr5gtXM";
    esriConfig.apiKey= key;
    const authentication = arcgisRest.ApiKeyManager.fromKey(key);
    const mapDiv = useRef(null);
    useEffect(() => {
        if (mapDiv.current) {
           

    const map = new Map({
      basemap: "arcgis-navigation"
    });

    const view = new MapView({
      map: map,
      center: [31.4117257, 35.0818155],
      zoom: 8,
      container: mapDiv.current,
      constraints: {
        minZoom: 7
      },
    });

      const WorldCitiesFeatureLayer = new FeatureLayer({
        url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Cities/FeatureServer/0",
        popupEnabled: true,

      });
      
      map.add(WorldCitiesFeatureLayer);

      const circleGeometry = new Circle({
        center: [ -113, 36 ],
        geodesic: true,
        numberOfPoints: 100,
        radius: 100,
        radiusUnit: "kilometers"
      });
      
      view.graphics.add(new Graphic({
        geometry: circleGeometry,
        symbol: {
          type: "simple-fill",
          style: "none",
          outline: {
            width: 3,
            color: "red"
          }
        }
      }));

      view.on("click", (e) => {

        const params = {
          location: e.mapPoint,
          outFields: "*"
        };
        const locatorUrl = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

        locator
          .locationToAddress(locatorUrl, params)

          .then(
            function (response) {
              const city = response.attributes.City || response.attributes.Region;
              getDemographicData(city, params.location);
            },
            function (err) {
              view.graphics.removeAll();
              console.log("No address found.");
            }
          );

      });

      function getDemographicData(city, point) {

          queryDemographicData({
            studyAreas: [
              {
                geometry: {
                  x: point.longitude,
                  y: point.latitude
                }
              }
            ],
            authentication: authentication
         
          });

      }

    }
    }, []);
    return (
        <div id="viewDiv" ref={mapDiv} style={{ height: '100vh', width: '100%' }}></div>
    );
 
    }
  export default GISMaps;