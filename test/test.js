import Topographicprofile from 'facade/topographicprofile';

// EJ 1: Capa geojson con altura
const map = M.map({
  container: 'mapjs',
  controls:['mouse','scale','panzoombar'],
  wmcfile: ['satelite','mapa'],
  center: [261137,4214200],
  zoom: 10
});

let layer = new M.layer.GeoJSON(
  {
    name: "Provincias", 
    url: 'https://raw.githubusercontent.com/sigcorporativo-ja/topographicprofile/develop/test/1.geojson',
    extract: false
  });

  let estiloCapa = new M.style.Generic({
    line: {
       fill: {
          color: 'red',
          width: 2
       }
    }
   });
  
   layer.setStyle(estiloCapa);

   layer.on(M.evt.LOAD, () => {
    
    const mp = new Topographicprofile({
      mode: 'fixed',
      //mode: 'interactive',
      layer: layer,
      //forcews: true,
      //position: 'TL'
      // wcs: {
      //   url: 'https://servicios.idee.es/wcs-inspire/mdt',
      //   coverage: 'Elevacion4258_500',
      //   format: 'ArcGrid',
      //   version: '1.0.0',
      //   interpolationMethod: 'bilinear'
      //   }
      // wcs: {
      //     url: 'https://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_WCS_mdt',
      //     coverage: 'Modelo%20Digital%20de%20Elevaciones%20(MDE)%20de%20Andalucia%20100%20m',
      //     format: 'image%2Fx-aaigrid',
      //     version: '1.0.0',
      //     interpolationMethod: 'bilinear'
      //     }
     }
    );
    map.addPlugin(mp);
    window.map = map;
    window.mp = mp;
    window.layer = layer;
 });

 map.addLayers(layer);


// EJ 2: Capa servida sin altura, la obtiene de WCS
/*const map = M.map({
  container: 'mapjs',
  controls:['mouse','scale','panzoombar'],
  wmcfile: ['satelite','mapa'],
  center: [189406,4200949],
  zoom: 10
});

let layer = new M.layer.GeoJSON(
  {
    name: "Sendero", 
    url: 'https://www.ideandalucia.es/services/DERA_g9_transport_com/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=DERA_g9_transport_com:g09_20_Sendero&TYPENAME=DERA_g9_transport_com:g09_20_Sendero&SRSNAME=urn:ogc:def:crs:EPSG::25830&FeatureID=g09_20_Sendero.10908600001194&OUTPUTFORMAT=application/json',
    extract: false
  });

  let estiloCapa = new M.style.Generic({
    line: {
       fill: {
          color: 'red',
          width: 2
       }
    }
   });
  
   layer.setStyle(estiloCapa);

   layer.on(M.evt.LOAD, () => {
    
    const mp = new Topographicprofile({
      mode: 'fixed',
      //mode: 'interactive',
      layer: layer,
      //forcews: true,
      //position: 'TL'
      // wcs: {
      //   url: 'https://servicios.idee.es/wcs-inspire/mdt',
      //   coverage: 'Elevacion4258_500',
      //   format: 'ArcGrid',
      //   version: '1.0.0',
      //   interpolationMethod: 'bilinear'
      //   }
      // wcs: {
      //     url: 'https://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_WCS_mdt',
      //     coverage: 'Modelo%20Digital%20de%20Elevaciones%20(MDE)%20de%20Andalucia%20100%20m',
      //     format: 'image%2Fx-aaigrid',
      //     version: '1.0.0',
      //     interpolationMethod: 'bilinear'
      //     }
     }
    );
    map.addPlugin(mp);
    window.map = map;
    window.mp = mp;
    window.layer = layer;
  });
  map.addLayers(layer);*/

 // EJ 3: INTERACTIVO
 /*const map = M.map({
  container: 'mapjs',
  controls:['mouse','scale','panzoombar'],
  wmcfile: ['satelite','mapa'],
  center: [189406,4200949],
  zoom: 10
  });
 const mp = new Topographicprofile({
    'mode': 'interactive',
    }
  );
  map.addPlugin(mp);*/

 // EJ 4: CAPA PROVISTA 25830 SIN ALTURA
 /*const map = M.map({
  container: 'mapjs',
  controls:['mouse','scale','panzoombar'],
  wmcfile: ['satelite','mapa'],
  center: [466691,4096053],
  zoom: 5
  });

 let miFeature = new M.Feature("featurePrueba002", {
  "type": "Feature",
  "id": "sendero1",
  "geometry": {
    "type": "LineString",
    "coordinates": [
          [453302,4101951],
          [461188,4099800],
          [473553,4092632],
          [477523,4096819],
      ]
  },
  "geometry_name": "geometry",
  "properties": {
    "nombre": "Sendero de ejemplo", 
    }
  });

 let layer = new M.layer.GeoJSON({
  source: {
    'crs': {'properties': {'name': 'EPSG:25830'},'type': 'name'},
    // Se añade su notacion GeoJSON
    'features': [miFeature.getGeoJSON()],
    'type': 'FeatureCollection'
    },
  name: 'prueba'
});

let estiloCapa = new M.style.Generic({
  line: {
     fill: {
        color: 'red',
        width: 2
     }
  }
 });

 layer.setStyle(estiloCapa);
 
 layer.on(M.evt.LOAD, () => {

    const mp = new Topographicprofile({
      mode: 'fixed',
      //mode: 'interactive',
      layer: layer,
      forcews: true,
      //position: 'TL'
      // wcs: {
      //   url: 'https://servicios.idee.es/wcs-inspire/mdt',
      //   coverage: 'Elevacion4258_500',
      //   format: 'ArcGrid',
      //   version: '1.0.0',
      //   interpolationMethod: 'bilinear'
      //   }
      //   wcs: {
      //     url: 'https://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_WCS_mdt',
      //     coverage: 'Modelo%20Digital%20de%20Elevaciones%20(MDE)%20de%20Andalucia%20100%20m',
      //     format: 'image%2Fx-aaigrid',
      //     version: '1.0.0',
      //     interpolationMethod: 'bilinear'
      //     }
      }
    );
    map.addPlugin(mp);
    window.map = map;
    window.mp = mp;
    window.layer = layer;
 });

 map.addLayers(layer);*/
 

 // EJ 5: CAPA PROVISTA 4326 SIN ALTURA
 /*const map = M.map({
  container: 'mapjs',
  controls:['mouse','scale','panzoombar'],
  wmcfile: ['satelite','mapa'],
  center: [233328,4196034],
  zoom: 7
  });

 let miFeature = new M.Feature("featurePrueba002", {
  "type": "Feature",
  "id": "sendero1",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [ -6.0787104, 37.8730713 ],
      [ -6.0443899, 37.8751017 ],
      [ -6.0057493, 37.8716721 ],
      [ -5.9834488, 37.8625622 ],
      ]
  },
  "geometry_name": "geometry",
  "properties": {
    "nombre": "Sendero de ejemplo", 
    }
  });

 let layer = new M.layer.GeoJSON({
  source: {
    'crs': {'properties': {'name': 'urn:ogc:def:crs:OGC:1.3:CRS84'},'type': 'name'},
    // Se añade su notacion GeoJSON
    'features': [miFeature.getGeoJSON()],
    'type': 'FeatureCollection'
    },
  name: 'prueba'
});

let estiloCapa = new M.style.Generic({
  line: {
     fill: {
        color: 'red',
        width: 2
     }
  }
 });

 layer.setStyle(estiloCapa);
 
 layer.on(M.evt.LOAD, () => {

    const mp = new Topographicprofile({
      mode: 'fixed',
      //mode: 'interactive',
      layer: layer,
      forcews: true,
      //position: 'TL'
      // wcs: {
      //   url: 'https://servicios.idee.es/wcs-inspire/mdt',
      //   coverage: 'Elevacion4258_500',
      //   format: 'ArcGrid',
      //   version: '1.0.0',
      //   interpolationMethod: 'bilinear'
      //   }
      //   wcs: {
      //     url: 'https://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_WCS_mdt',
      //     coverage: 'Modelo%20Digital%20de%20Elevaciones%20(MDE)%20de%20Andalucia%20100%20m',
      //     format: 'image%2Fx-aaigrid',
      //     version: '1.0.0',
      //     interpolationMethod: 'bilinear'
      //     }
      }
    );
    map.addPlugin(mp);
    window.map = map;
    window.mp = mp;
    window.layer = layer;
 });

 map.addLayers(layer);*/

