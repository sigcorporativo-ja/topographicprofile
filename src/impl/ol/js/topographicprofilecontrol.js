/* eslint-disable no-console */
/**
 * @module M/impl/control/TopographicprofileControl
 */
import Profil from './profilcontrol';
import { getValue } from '../../../facade/js/i18n/language';

//let PROFILE_URL = 'https://servicios.idee.es/wcs-inspire/mdt?request=GetCoverage&bbox=';
//let PROFILE_URL_SUFFIX = '&service=WCS&version=1.0.0&coverage=Elevacion4258_500&' +
//  'interpolationMethod=bilinear&crs=EPSG%3A4258&format=ArcGrid&width=2&height=2';
let PROFILE_URL = 'https://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_WCS_mdt?request=GetCoverage&bbox=';
let PROFILE_URL_SUFFIX = '&service=WCS&version=1.0.0&coverage=Modelo%20Digital%20de%20Elevaciones%20(MDE)%20de%20Andalucia%20100%20m&' +
  'interpolationMethod=bilinear&crs=EPSG%3A4258&format=image%2Fx-aaigrid&width=2&height=2';

export default class TopographicprofileControl extends M.impl.Control {

  constructor(opts) {

    super();
    [this.distancePoinst_, this.mercator_, this.serviceURL, this.coordEPSG4326] = [30, 'EPSG:900913', opts.serviceURL, "EPSG:4326"];
    [this.projectionMap_, this.profil_, this.facadeMap_, this.vector_, this.source_, this.vectorProfile_, this.sourceProfile_, this.draw_, this.lineCoord_, this.pointsCoord_, this.dataPoints_, this.pt] = [null, null, null, null, null, null, null, null, null, null, null, null];
    [this.lineString_, this.feature_, this.style_] = [null, null, null];
    this.layer_ = opts.layer;
    this.mode_ =(opts.mode? opts.mode : 'interactive');
    this.includesAltitude_ = false;
    this.forcews = opts.forcews;

    if(opts.wcs) {
      PROFILE_URL = opts.wcs.url + '?request=GetCoverage&bbox=';
      PROFILE_URL_SUFFIX = '&service=WCS&version=' + opts.wcs.version + '&coverage=' + opts.wcs.coverage + '&' +
      'interpolationMethod=' + opts.wcs.interpolationMethod + '&crs=EPSG%3A4258&format=' + opts.wcs.format + '&width=2&height=2';
    } 

  }

  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {M.Map} map to add the plugin
   * @param {HTMLElement} html of the plugin
   * @api stable
   */
  addTo(map, html) {
    this.facadeMap_ = map;
    // Si la capa la ha pasado por nombre
    if(this.layer_ && (typeof this.layer_ === 'string' || this.layer_ instanceof String)) {
      this.layer_ = this.facadeMap_.getLayers({'name':this.layer_})[0];
     } 
    this.initOlLayers();
    // super addTo - don't delete
    super.addTo(map, html);
    if(this.mode_ == 'fixed') {
      this.activate();
    }
  }

  // Add your own functions
  initOlLayers() {
    this.style_ = function(evt) {
      let style;
      if (evt.getGeometry().getType() == 'LineString') {
        style = [new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#4286f4',
            width: 2
          })
        })];
      } else {
        style = [new ol.style.Style({
          image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({
              color: '#4286f4'
            })
          }),
          stroke: new ol.style.Stroke({
            color: '#4286f4',
            width: 2
          }),
          fill: new ol.style.Fill({
            color: '#4286f4'
          })
        })];
      }
      return style;
    }
    this.source_ = new ol.source.Vector({
      wrapX: false
    });
    this.vector_ = new ol.layer.Vector({
      source: this.source_,
      style: this.style_,
      name: 'capatopo',
    });
    this.sourceProfile_ = new ol.source.Vector();
    this.vectorProfile_ = new ol.layer.Vector({
      source: this.sourceProfile_,
    });
    this.vector_.setZIndex(100000);
    this.facadeMap_.getMapImpl().addLayer(this.vector_);
    this.projectionMap_ = this.facadeMap_.getProjection().code;


  }

  findNewPoints(originPoint, destPoint) {
    let addX, addY;
    let points = new String();
    let oriMete = ol.proj.transform(originPoint, this.projectionMap_, this.mercator_);
    let destMete = ol.proj.transform(destPoint, this.projectionMap_, this.mercator_);
    let angle = this.getAngleBetweenPoints(oriMete, destMete);
    let distance = this.getDistBetweenPoints(originPoint, destPoint);
    if (distance < 50) {
      points += (ol.proj.transform(oriMete, this.mercator_, this.coordEPSG4326)).slice(0,2) + ",";
      points += (ol.proj.transform(destMete, this.mercator_, this.coordEPSG4326)).slice(0,2) + "|";
      return points;
    }
    let distPoint = (distance / this.distancePoinst_ > this.distancePoinst_) ? distance / this.distancePoinst_ : this.distancePoinst_;
    for (let i = 0; i <= distance / distPoint; i++) {
      if (angle >= 0 && angle <= 90) {
        [addX, addY] = [1, 1];
      } else if (angle >= 90) {
        [addX, addY] = [-1, 1];
      } else if (angle <= 0 && angle >= -90) {
        [addX, addY] = [1, -1];
      } else {
        [addX, addY] = [-1, -1];
      }
      let newPointA = [(Math.cos(angle * Math.PI / 180) * (distPoint * i)) + oriMete[0], (Math.sin(angle * Math.PI / 180) * (distPoint * i)) + oriMete[1]];
      let newPointB = [(Math.cos(angle * Math.PI / 180) * ((distPoint * i) + addX)) + oriMete[0], (Math.sin(angle * Math.PI / 180) * ((distPoint * i) + addY)) + oriMete[1]];
      points += (ol.proj.transform(newPointA, this.mercator_, this.coordEPSG4326)) + ",";
      points += (ol.proj.transform(newPointB, this.mercator_, this.coordEPSG4326)) + "|";
    }

    return points;
  }


  getDistBetweenPoints(firstPoint, secondPoint) {
    let line = new ol.geom.LineString([ol.proj.transform(firstPoint, this.projectionMap_, this.mercator_), ol.proj.transform(secondPoint, this.projectionMap_, this.mercator_)]);
    return line.getLength();

  }

  getAngleBetweenPoints(firstPoint, secondPoint) {
    let p1 = {
      x: firstPoint[0],
      y: firstPoint[1]
    };
    let p2 = {
      x: secondPoint[0],
      y: secondPoint[1]
    };
    // angle in degrees
    let angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    return angleDeg;
  }

  /*startLoad() {
    document.body.style.cursor = 'wait';
    this.deactivate();
    let panel = document.querySelector(".m-topographicprofile.activated");
    panel.style.pointerEvents = "none";

  }


  endLoad() {
    document.body.style.cursor = 'default';
    this.activate();
    let panel = document.querySelector(".m-topographicprofile.activated");
    panel.style.pointerEvents = "auto";
  }*/

  // FBMA
  activate() {
    if(this.mode_ == 'interactive') {
      if (!this.draw_) {
        this.createIteraction("LineString");
        }
        this.facadeMap_.getMapImpl().addInteraction(this.draw_);
    } else {
      // Si aun no hemos cargado la primera vez
      if(!this.lineCoord_) {
        this.createIteraction("LineString");
      } 
    }
    document.querySelector('#m-topographicprofile-btn').classList.add('activated');
  }

  createIteraction(typeGeom) {
    if(this.mode_ == 'interactive') {
      this.draw_ = new ol.interaction.Draw({
      source: this.source_,
      type: /** @type {ol.geom.GeometryType} */ (typeGeom)
      });
      this.draw_.on('drawstart', function(evt) {
        this.projectionMap_ = this.facadeMap_.getProjection().code;
        this.clearLayer();
      }.bind(this));
      this.draw_.on('drawend', function(evt) {
        this.lineCoord_ = evt.feature.getGeometry().getCoordinates();
        this.pointsCoord_ = new String();
        for (let i = 1; i < this.lineCoord_.length; i++) {
          this.pointsCoord_ = this.pointsCoord_.concat(this.findNewPoints(this.lineCoord_[i - 1], this.lineCoord_[i]));
        }
        this.getDataFromService();
      }.bind(this));
    } else {
      this.pointsCoord_ = new String();
      this.lineCoord_ = this.layer_.getFeatures()[0].getGeometry().coordinates;
      if(this.layer_.getFeatures()[0].getGeometry().type == 'MultiLineString') {
        this.lineCoord_ = this.lineCoord_[0];
      }
      // Si las coordenadas incluyen altura y no se fuerza el WS
      if((this.lineCoord_[0].length == 3) && !this.forcews) {
        const arrayXZY = [];
        this.lineCoord_.forEach((coord) => {
          arrayXZY.push(coord);
        });
        this.controlProfile();
        this.lineString_.setCoordinates(arrayXZY);
      } else {
        for (let i = 1; i < this.lineCoord_.length; i++) {
          this.pointsCoord_ = this.pointsCoord_.concat(this.findNewPoints(this.lineCoord_[i - 1], this.lineCoord_[i]));
        }
        this.getDataFromService();
      }
    }
  }

  getDataFromService() {
    document.body.style.cursor = 'wait';
    if (!this.pointsCoord_) return;
    let pointsBbox = this.pointsCoord_.split('|');
    const altitudes = [];
    const promises = [];
    pointsBbox = pointsBbox.filter((elem) => {
      return elem !== '' && elem.trim().length > 3;
    });

    pointsBbox.forEach((bbox) => {
      const url = `${PROFILE_URL}${bbox}${PROFILE_URL_SUFFIX}`;
      promises.push(M.remote.get(url));
    });

    Promise.all(promises).then((responses) => {
      responses.forEach((response) => {
        // TODO: diferencia dy / cellsize?
        if(response.text.split('dy')[1]) {
        const alt = response.text.split('dy')[1].split(' ').filter((item) => {
          return item !== '';
        })[1];
        altitudes.push(parseFloat(alt));
       } else if(response.text.split('cellsize')[1]) {
        const alt = response.text.split('cellsize')[1].split(' ').filter((item) => {
          return item !== '';
        })[1];
        altitudes.push(parseFloat(alt));
      } 
      });

      const arrayXZY = [];
      altitudes.forEach((data, index) => {
        const points = pointsBbox[index].split(',');
        const center = ol.extent.getCenter([parseFloat(points[0]), parseFloat(points[1]),
          parseFloat(points[2]), parseFloat(points[3])
        ]);
        arrayXZY.push([center[0], center[1], data]);
      });
      document.body.style.cursor = 'auto';
      this.controlProfile();

      const arrayXZY2 = arrayXZY.map((coord) => {
        return ol.proj.transform(coord, 'EPSG:4326', this.facadeMap_.getProjection().code);
      });

      this.lineString_.setCoordinates(arrayXZY2);
    }).catch((error) => {
      console.log('ERROR', error);
      M.dialog.error('No se han obtenido datos');
      document.body.style.cursor = 'auto';
    });
    // this.deactivate();
  }


  controlProfile() {
    if (!this.profil_) {
      this.lineString_ = new ol.geom.LineString([]);
      this.feature_ = new ol.Feature({
        geometry: this.lineString_,
        name: 'Line'
      });
      this.sourceProfile_.addFeature(this.feature_);
      this.profil_ = new Profil({
        info: {
          zmin: getValue('profil.zmin'),
          zmax: getValue('profil.zmax'),
          altitude: getValue('profil.altitude'),
          distance: getValue('profil.distance'),
          ytitle: getValue('profil.ytitle'),
          xtitle: getValue('profil.xtitle'),
          altitudeUnits: 'm',
          "distanceUnitsM": 'm',
          'distanceUnitsKM': 'km'
        },
        projection: this.facadeMap_.getProjection().code,
        map: this.facadeMap_.getMapImpl(),
        source: this.source_
      });
      this.facadeMap_.getMapImpl().addControl(this.profil_);
      let drawPoint = function(e) {
        if (!this.pt) return;
        if (e.type == "over") { // Show point at coord
          this.pt.setGeometry(new ol.geom.Point(e.coord));
          //this.pt.setStyle(null);
          // icono
          let style = new ol.style.Style({
            image: new ol.style.Icon({
            anchor: [0.5, 32],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAANbY1E9YMgAABPBJREFUWIWtl3tMW1Ucxw+0hfEorwIDhdFSKJRnaSnl0ZZXKa9CC4wCo1RhPESWuUQTFd2cuKiJ07hItrnBmFFnXOaymZllWZwic1uMYzGZyZZgMrc/xCnExCjh1Z+/c90qwr0Tj5J8cnO59/zO9/7O9/x+pwQACB8/dzjIrLuB3G6zkfM1xeSdEgN5WZ8lcicrDIkhwYM+Pj4jhJCjxIeMKEKCdzoT4wtfM2SLjxTnkbPVZvI9jqPjaRyhOSiCD+4LuIOBvqwvJ7u06TmxQYHnxL6+SzmR4dCZkgg7MlTQhVddVASIRaLl2KCAC89q1IZxWykn/H8RMOt2kGc06kfwa+cbFHHwTaMVPD1OgMe2ePH0tMC3TVXQqkzAiGTpiQxV/8y98f9JwHzXZrI3X9OJQeGIOQ+gHyfsawXPVicsbW32sozQ/9PnH5QVAC4PvJSbOUDHMwv4wVVPzlSacnHyhaMlBoCBdm6ipQfACRlwwXFLIc2E54Sl0DSNcZgEXG2wkmxZ2LlGTDv0//PkK4HH28GtUoAqVDrxld0iZhLwqj7LJPL1hWtNlQC9reuenBPQ2wI3W2pBIvKFndq0SiYBmsjw5zNl4Vyw1V9/qb4cHkX3ywIDuCu95/OEIToSkkOlQ0wC8O+wE11NjbX6C+mkYrHYC71fkwUc15WaSAONsAoY605V8gqgX75SAL3nE7AjK4UGGmMVcLBBEc/tc9YMuFRyGugQkwBTbNRTyWFSWO52snkAvZOFHtJGRTzHJGC4SKfFgjI/XleOhmr7d7sADfh1g5UWJM/e/Gwjk4CLdWXEGBN1zBQThcvQBp5u57omX+7+M/1V8bG0R5wet5WxFaLpdjvB1Cr9RaLZodwMLuh6ihEtWq/nawBryK+f2UrT7mIcJgEzXC9opm3Ygkaa21eo5d0Rq403WpxHjbd4wKirW8BeMMPaC+hAygKKOGTSN9GGdKbKzC0H/7q3wQSakTYizEDn/UbE3oza673MdW4m29KTd8s2+MN0hwMA2+/fJkd//N7VDMqQYGhPShimon9yOchdl52DScCtVpuX22115M6WOlFKWMjl9iT5mtpAU48HFgj39/vuelNV6K3WWjLVUuOFScAkdsOV3GiupktRRpdisvGvBgV4OPkRsxKIBWm3LqNryllDruH7K2EScKG2ZA1X7BaikYV/4lRu8maBfv0redkQ4e93E7eu/2V8hx7hVsJcB1Zz1VFB3izIqcCtCbgknBcWcd8rpEHQp1Y+OdloJV/ge6thEnDaalzDx8gpq1Ei9ZNM4XJwp59Ldgvd83OnrEUJVxzl5GJ92RqYBBwvL+AFj2mk9KHot2ilg+1uPHCkg1waNEGX6GyVmRcmAaNmPS/vlRrI9gxVdVTABlhEDxRsjAS7/OHBkxVF+CyfFyYBh016XkbNeeSN/JzYQIn4t89tpbARO+KgJs34Pk40hj9K+GAS8KIug5ehe2BRuvG0Rg14/WVfgVZGhQmJZhLwgjZdkD25mSQxRPqpPloGm4KDrr+Np/eDRh05IACTgF61UhAsywQPmx8GSSSQFCo9jz9CCJpRECYBPalKQQbSkkmWLGw/rYrykOCPXMly0qLcJAiTgP2YOiGosezyuF1UQEVczPAxNKDQrqEwCaCuFuKkpYj0qZPcVECHSr7tREUheRe3pxAPEvAHoSjT1B9h9DoAAAAASUVORK5CYII='
              })
            });
          this.pt.setStyle(style);
          // fin icono
        } else { // hide point
          this.pt.setStyle([]);
        }
      }.bind(this);
      this.sourceProfile_.once('change', function(e) {
        if (this.sourceProfile_.getState() === 'ready') {
          this.profil_.setGeometry(this.sourceProfile_.getFeatures()[0]);
          this.pt = new ol.Feature(new ol.geom.Point([0, 0]));
          this.pt.setStyle([]);
          this.source_.addFeature(this.pt);
        }
      }.bind(this));

      this.profil_.on(["over", "out"], function(e) {
        if (e.type == "over") this.profil_.popup(e.coord[2] + " m");
        drawPoint(e);
      }.bind(this));

    }
    this.profil_.show();
  }

  deactivate() {
    // Si es interactivo se elimina todo
    if (this.draw_) {
      this.facadeMap_.getMapImpl().removeInteraction(this.draw_);
    } else {
      this.lineCoord_ = null;
    }
    this.clearLayer();
    document.querySelector('#m-topographicprofile-btn').classList.remove('activated');
    
  }

  clearLayer() {
    this.source_.clear();
    if (this.profil_) {
      this.profil_.hide();
      this.sourceProfile_.clear();
      this.facadeMap_.getMapImpl().removeControl(this.profil_);
      this.profil_ = null;
    }
  }

  removeLayer() {
    this.deactivate();
    this.clearLayer();
    this.facadeMap_.getMapImpl().removeLayer(this.vector_);
  }

  destroy() {
    this.removeLayer();
    this.facadeMap_.getMapImpl().removeControl(this);
  }

  toggle() {
    if (this.profil_) {
      this.profil_.toggle();
    }
  }


}
