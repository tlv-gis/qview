// the plugin adds support for RTL labels 
maplibregl.setRTLTextPlugin(
  'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
  null,
  true // Lazy load the plugin
  );
const isMobile = window.matchMedia("only screen and (max-width: 600px)").matches;
const baseUrl = "https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/"
// innerUrl = "https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/"
// outerUrl = "https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/"
const cityBorderUrl = "https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/890/query?where=1%3D1&outFields=Shape&geometryPrecision=6&outSR=4326&returnExtentOnly=true&f=geojson"
const addressServiceUrl  = "https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/527"
let env ={'version':0.3,'active_layers':[],'currentHighlightLayer':'','currentInfoLayer':''};
let baseStyle;
let QS;
let map;
let mapJson;
let popup = new maplibregl.Popup()
let neighborhood_url;
let buffered;
let mapCenterPoint;
let mapCenterRadius;
let radiusPolygon;
let neighborhhod_bounds;
let current_bounds;
let city_bounds = {"extent":{"crs":{"type":"name","properties":{"name":"EPSG:4326"}},"bbox":[34.738448375090996,32.028969143258138,34.851560920611377,32.146597154703457]}};
let tables;
let mapHeaderControl;
let hoveredStateId;
let topHeight;
let topPadding;
let jsonUrl;
let buttonDefs;
let legendAdd;
let legend = new MapLegend();
let locateMeControl = new maplibregl.GeolocateControl({
  positionOptions: {
  enableHighAccuracy: true
  },
  trackUserLocation: true
  })
let infoControl = new InfoControl()
let changeBounds;
let tableAdd;

proj4.defs([
  [
    'EPSG:4326',
    '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
  [
    "EPSG:2039",
    "+proj=tmerc +lat_0=31.73439361111111 +lon_0=35.20451694444445 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +towgs84=-48,55,52,0,0,0,0 +units=m +no_defs"
  ]
]);
const projConverter = proj4("EPSG:2039");



// load style for basemap
//fetch("js/IView_style.json")
fetch("js/IView_agol_style.json")
.then(response => response.json())
.then(style => {
  baseStyle = style;
    loadMap(baseStyle)
})

function loadMap(loadedStyle){
  map = new maplibregl.Map({
      container: 'gis-map', // container id
      style: loadedStyle,
      dragRotate: false,
      animate: false,
      center: [34.789071,32.085432], // starting position
      zoom: 12 // starting zoom
      });
  onMapLoad()
}

function onMapLoad(){
  try {
    
      QS = utils.getParamsFromUrl(decodeURI(location))
      let headerTitle ='';
      let headerLocation ='';
      let headerProperties = {'title':headerTitle,'location':headerLocation}
      createFilter(QS)
        map.on('load', function () {
            
            if(neighborhood_url){
            fetch(neighborhood_url)
            .then(response => response.json())
            .then(data => {
                neighborhhod_bounds = data;
                current_bounds = neighborhhod_bounds;
                
                if(current_bounds.features[0].properties && current_bounds.features[0].properties.shem_shchuna){
                  headerLocation = current_bounds.features[0].properties.shem_shchuna
                }else if(current_bounds.features[0].properties && current_bounds.features[0].properties.shem_merhav ){
                  headerLocation = current_bounds.features[0].properties.shem_merhav
                }
                
                headerProperties = {'title':headerTitle,'location':headerLocation}
                
                
                topHeight = map.getContainer().clientHeight*0.15
                topPadding = topHeight+30
                map.fitBounds(turf.bbox(neighborhhod_bounds), {
                    padding: {top: topPadding, bottom:20, left: 20, right: 20},
                    linear:true
                    })
                      

                // Set data source that noth layers use
                map.addSource('neighborhood', {
                      'type': 'geojson',
                      'data': data
                    })
                // add polygon layers
                map.addLayer({
                    'id': 'neighborhoods',
                    'type': 'fill',
                    'source': 'neighborhood',
                    'paint': {
                        'fill-color': 'rgba(200, 100, 240, 0)',
                        'fill-outline-color': 'rgba(200, 100, 240, 1)'
                    }
                },"????????????/label/?????????? ????????");
                // add line layer for thicker stroke
                map.addLayer({
                  'id': 'neighborhoods-stroke',
                  'type': 'line',
                  'source': 'neighborhood',
                  'paint': {
                      'line-color': 'rgba(200, 100, 240, 1)',
                      'line-width': 4
                  }
              },'neighborhoods');
              
                
            }).then(function(){
              parseMap(QS,headerProperties)
            });
          }else if(radiusPolygon){
            topHeight = map.getContainer().clientHeight*0.15
            topPadding = topHeight+30
            current_bounds = radiusPolygon;
            map.fitBounds(turf.bbox(radiusPolygon), {
              padding: {top: topPadding, bottom:20, left: 20, right: 20},
              linear:true
              })
            parseMap(QS)
          }else{
              current_bounds = turf.bboxPolygon(city_bounds.extent.bbox);
              parseMap(QS)
          }
              
            
              
              
          });
      addMapEvents()
      
      

  //}
  } catch (error) {
    console.error(error)
  }
  
  /*
  still needs a way to reload all layers for the new extent.
  map.addControl(changeBounds)
  */
}

function createFilter(QS){
  if("radius" in QS){
    mapCenterRadius = QS.radius;
  }else{
    mapCenterRadius = 200;
  }
  if("ne" in QS){
    let neighborhood_code = parseInt(QS.ne);
    neighborhood_url = baseUrl+"511/query?where=oid_shchuna="
    neighborhood_url += neighborhood_code+"&outFields=*&returnGeometry=true&outSR=4326&f=geojson"
  }else if("shemShchuna" in QS){
    let neighborhood_name = QS.shemShchuna
    neighborhood_url =  baseUrl+"511/query?text="
    neighborhood_url += neighborhood_name+"&outFields=*&returnGeometry=true&outSR=4326&f=geojson"
  }else if("AreaName" in QS){
    let neighborhood_name = QS.AreaName
    neighborhood_url = baseUrl+`/567/query?text=${neighborhood_name}&outFields=*&returnGeometry=true&outSR=4326&f=geojson`
  }else if("point" in QS){
    let point = QS.point.split(",").map(function(x){return Number(x.trim())})
    radiusPolygon = utils.checkPointCRS(point,mapCenterRadius)
  }else if("k_rechov" in QS){
    if("ms_bayit" in QS){
        utils.getAddressPoint(QS.k_rechov,QS.ms_bayit)
        .then(point => radiusPolygon = turf.buffer(point,0.2))
        
    }else{
      utils.getStreetLine(QS.k_rechov)
      .then(polygon => radiusPolygon = polygon)
    }
  }else if("layer" in QS && "feature" in QS){
    utils.getLayerFeature(baseUrl,QS.layer,QS.feature)
    .then(polygon => radiusPolygon = polygon)
  }
}

function parseMap(QS,headerProperties={}){
  
    legendAdd = new MapLegendButton({'LegendBuilder':LegendBuilder});
    
    changeBounds = new MapChangeBoundsButton();
    tableAdd = new MapTableButton();
    if("map" in QS){
      jsonUrl = QS["map"]+".json"
    }else{
      jsonUrl = "AreaProfile.json"
    }
    fetch(jsonUrl)
    .then(response => response.json())
    .then(data => {
        mapJson = data;
        env.mapJson = data;
        if('title' in mapJson){
          headerProperties.title = mapJson['title'];
        }
        mapHeaderControl = new MapHeader(headerProperties);
        let addTable = false;
        mapJson.layers.forEach(element => {
          if("table" in element){
            //addTable = true;
          }
        });
        //tables = new LayerTable({'layers':mapJson.layers});
        tables = new LayerTable({'layers':env.active_layers});
        map.addControl(mapHeaderControl);
        if(!isMobile){
          /*map.addControl(legendAdd)*/
          map.addControl(new maplibregl.NavigationControl(),'bottom-left');
        }else{
          map.addControl(locateMeControl);
          locateMeControl._container.classList.add('locate-container');
        }
        LegendBuilder.addLegend()
        map.addControl(infoControl,'bottom-right')
        if(addTable){
          //map.addControl(tableAdd)
        }
        addButtons(mapJson)
    })

}


function addButtons(mapJson){
  
  var mapHeader = document.getElementsByClassName('map-header')[0];
  let buttonDefs = mapJson['buttons']
  let buttonSpan

  buttonSpan = buildButtons(buttonDefs,mapJson)

  
  mapHeader.append(buttonSpan)
  if(isMobile){
    //map.addControl(legend,'bottom-right')
  }

  toggleLoader();
}

function buildButtons(buttonDefs,mapJson){
  let buttonsNav = document.createElement('nav');
  buttonsNav.classList.add(isMobile ? 'buttons-nav': 'desktop-buttons-nav')
  

  let buttonUL = document.createElement('ul');
  buttonUL.classList.add(isMobile ? 'buttons-span': 'desktop-buttons-span')
  buttonUL.classList.add(isMobile ? 'drop-down' : 'desktop-drop-down' ,'closed')

  let buttonNav = document.createElement('button');
  buttonNav.classList.add(isMobile ? 'button-nav': 'desktop-button-nav');
  buttonNav.classList.add(isMobile ? 'button': 'desktop-button');
  buttonNav.onclick = function() {

      this.parentNode.classList.toggle('closed')
  
  }
  let layersNavIcon = document.createElement('img');
  layersNavIcon.src = './icons/layers_closed_centered.svg';
  layersNavIcon.classList.add(isMobile ? 'layers-nav-icon': 'desktop-layers-nav-icon');
  buttonNav.append(layersNavIcon);
  let layersNavText = document.createElement('b');
  layersNavText.innerText = '??????????';
  layersNavText.classList.add(isMobile ? 'layers-nav-text' : 'desktop-layers-nav-text');
  buttonNav.append(layersNavText);

  buttonUL.append(buttonNav)
  for(let i=0;i<buttonDefs.length;i++){
    let buttonID = 'button-'+i
    mapJson['buttons'][i]['id'] = buttonID
    let currentButtonDef = buttonDefs[i]
    let layerIDs = currentButtonDef['layers']
    addButtonLayer(layerIDs)

    let newLI = document.createElement('li');
    let newButton = document.createElement('button');
    let newButtonIcon = document.createElement('img');
    let newButtonText = document.createElement('span');

    newButton.classList.add(isMobile ? 'button' : 'desktop-button')
    newButton.classList.add(isMobile ? 'mobile-button-closed': 'desktop-button-closed')
    newButton.id = buttonID
    newButton.classList.add(isMobile ? 'button-span' : 'desktop-button-span');
    newButton.type = "button";
    newButton.value = 0;
    newButton.onclick = function(){
      currentButtonDef = mapJson["buttons"].filter(obj => {
          return obj.id === this.id
        })[0]
      layerIDs = currentButtonDef['layers']
      addButtonLayer(layerIDs,()=>{
          if(this.value === "0"){
            this.value = "1"
            this.classList.add(isMobile ? "button-on": "desktop-button-on")
              for(let layerI in layerIDs){
                  let layerID = layerIDs[layerI]
                  let layer = mapJson["layers"].filter(obj => {
                      return obj.id === layerID
                    })[0]
                  if(layer){
                    env.active_layers.push(layer)
                    map.setLayoutProperty(layer["name"],'visibility','visible')  
                    let strokeLayerName = layer['name']+'-stroke'
                    let labelLayerName = layer['name']+'-labels'
                    if(neighborhood_url){}else{
                      let sourceName =  layer['name']+"-source"
                      
                      current_bounds = utils.updateCurrentBounds(map)
                      currentLayerUrl = utils.getLayerUrl(layer)
                      map.getSource(sourceName).setData(currentLayerUrl)
                    }
                    if(map.getLayer(strokeLayerName) !== undefined){
                      map.setLayoutProperty(strokeLayerName,'visibility','visible')  
                    }  
                    if(map.getLayer(labelLayerName) !== undefined){
                      map.setLayoutProperty(labelLayerName,'visibility','visible')  
                    }
                    if(layer["type"] && layer["type"] === "raster"){
                      sourceName = layer['name']+'-source'
                      esriRenderer.updateRaster(sourceName)
                      
                    }
                    map.once('sourcedataloading', function(e) {
                        waitForSource(e,layer,function(){
                          if(map.hasControl(tables)){
                            map.removeControl(tables)
                            tables = new LayerTable({'layers':env.active_layers});
                            map.addControl(tables)
                          }
                        })
                    });
                  }
              }
              
          }else{
            this.value = "0"
            this.classList.remove(isMobile ? "button-on" : "desktop-button-on")
              for(layerI in layerIDs){
                  layerID = layerIDs[layerI]
                  layer = mapJson["layers"].filter(obj => {
                      return obj.id === layerID
                    })[0]
                  env.active_layers = env.active_layers.filter(function( obj ) {
                      return obj.id !== layerID;
                  });
                  map.setLayoutProperty(layer["name"],'visibility','none')  
                  strokeLayerName = layer['name']+'-stroke'
                  labelLayerName = layer['name']+'-labels'
                  if(map.getLayer(strokeLayerName) !== undefined){
                    map.setLayoutProperty(strokeLayerName,'visibility','none')  
                  }  
                  if(map.getLayer(labelLayerName) !== undefined){
                    map.setLayoutProperty(labelLayerName,'visibility','none')  
                  }  
                  map.once('sourcedataloading', function(e) {
                    waitForSource(e,layer,function(){
                      if(map.hasControl(tables)){
                        map.removeControl(tables)
                        tables = new LayerTable({'layers':env.active_layers});
                        map.addControl(tables)
                      }
                    })
                });
                if(map.getLayer('highlight') && layer["name"] == env.currentHighlightLayer){
                    map.removeLayer('highlight');
                    env.currentHighlightLayer = '';
                }
                if(!infoControl.container.classList.contains('minimized') && layer["name"] == env.currentInfoLayer){
                  infoControl.container.classList.add('minimized')
                }
              }
              
          }
          
          LegendBuilder.updateLegend(mapJson)
      })
  }
    let b = document.createElement('b')
    b.innerText = currentButtonDef['label']+" "
    newButtonIcon.src = currentButtonDef['icon']
    newButtonIcon.classList.add(isMobile ? 'button-icon' : 'desktop-button-icon')
    newButtonText.innerText = currentButtonDef['label']
    newButtonText.classList.add(isMobile ? 'button-text' : 'desktop-button-text')
    newButton.append(newButtonIcon,newButtonText)
    //newSpan.append(newButton)
    newLI.append(newButton)
    buttonUL.append(newLI)

  }
  buttonsNav.append(buttonUL)
  return buttonsNav;
}
function addButtonLayer(layerIDs,_callback){
  
  for(var i=0;i<layerIDs.length;i++){
      let id = layerIDs[i]
      
      let layer = utils.getLayer(mapJson,id)
      
      if(layer && map.getLayer(layer['name']) === undefined){
		    esriRenderer.getMetadata(layer)
      }
  }
  if (_callback) {
      _callback();
  }
}
function addMapEvents(){
  map.on('sourcedataloading', function(e) {
    
  });
  map.on('click',function(e){
    let renderedFeatures = map.queryRenderedFeatures(e.point,{layers: env.active_layers.map(layer => layer.name) })
    if(renderedFeatures.length < 1){
      if(!infoControl.container.classList.contains('minimized')){
        env.currentInfoLayer = '';
        infoControl.container.classList.add('minimized');
      }
    }
    if(map.getLayer('highlight')){
        map.removeLayer('highlight');
        env.currentHighlightLayer = '';
    }
  })
  
}

/**
 * Toggles the visibility of the element with id "waitingSymbol".
 */
 function toggleLoader() {
  const element = document.getElementById("waitingSymbol");
  if (element) {
    if (element.style.display === "none") {
      element.style.display = "";
    } else {
      element.style.display = "none";
    }
  }
}

function waitForSource(e,layer,_callback){
  let sourceName = layer['id']+'-source';
  if(e.source.id == sourceName){
    if(_callback){
      _callback()
    }
    
  }
}



// For Documentation, definitions for the configuration files
/**
 * mapJson configuration settings
 * @global
 * @name mapJson
 * @type {object}
 * @property {Array} layers - Array of {@link mapJson-layer} Objects
 * @property {Array} buttons - CArray of {@link mapJson-button} Objects
 * @property {string} title - Identifying name for this layer within the mapJson
 */
/**
 * mapJson Layer configuration settings
 * @global
 * @name mapJson-layer
 * @type {object}
 * @property {integer} id - Layer ID within the ArcGIS Server map/featureservice
 * @property {boolean} table - Create a table for this layer
 * @property {string} name - Identifying name for this layer within the mapJson
 * @property {string} name_heb - Display name for this layer, used in button tabs and legend
 * @property {string} type - indicate wether layer should be loaded as a raster instead of recreating its symbology
 * @property {Array} label_field - field name to be used for a labeling layer
 * @property {Array} fields - Fields to query and display in popup nd table columns, can be set to [*] to display all fields except object ID field
 */
/**
 * mapJson button configuration settings
 * @global
 * @name mapJson-button
 * @type {object}
 * @property {Array} layers - Array of layer ids as integers
 * @property {string} label - Text to be displayed on the button
 * @property {string} icon - Icon to be displayed on the button, relative path to svg or png file
 */