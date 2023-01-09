# QVIEW

Simple, configurable open source map viewer for ArcGIS Server layers.

qview is a simple map viewer used with json configuration files to load and style layers from ArcGIS Server using [MapLibre GL JS](https://maplibre.org/maplibre-gl-js-docs/api/).  
Configuration files define what buttons will be added to the map, what their icons and text will be and what layers each button will turn on and off.  
Layers are preloaded for the defined area.

## Usage

The system has a base URL at [https://gis.tel-aviv.gov.il/qview](https://gis.tel-aviv.gov.il/qview)

it can be controlled with URL parameters to configure loaded layers, and area of interest.   
These are the currently enabled URL parameters with `examples`:  

- map - The current configuration of buttons and layers: `map=digitel_parking` (will load the configuration from *digitel_parking.json* file)
- ne - Focus to a neighborhhod by **ID**, neighborhoods layer can be found [here](https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/511), example: `ne=6` will load "נוה אביבים וסביבתה"
- shemShchuna - Focus to a neighborhhod by **Name**, neighborhoods layer can be found [here](https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/511), example: `shemShchuna=בבלי` 
- AreaName - Focus to an Area ('מרחב') by **Name**, uses the ['**מרחבי מנהל הקהילה**'](https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/567) layer, example: `AreaName=מרחב מרכז מזרח`
- point - Focus to a point by coordinates
  - can be X,Y or Y,X in ITM (EPSG:2039), example: `point=181358.767, 667492.592` will focus on the same point as `point=667492.592, 181358.767` 
  - can be X,Y (Longitude, Latitude) or Y,X (Latitude, Longitude) in WGS84 (EPSG:4326), example: `point=34.800898, 32.10055509` (X,Y) will focus on the same point as `point=32.10055509, 34.800898` (Y,X)
- radius: Rdaius around point or address to focus on, smaller number will focus zoom in closer to the point, defaults to `radius=200`
- k_rechov - street code to focus on, can be used together with `ms_bayit` to focus to specific house, or without to focus to entire street both use [addressServiceUrl](https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/527) to get the address. example: `k_rechov=566&ms_bayit=52` (Moshe Sharet, 52)