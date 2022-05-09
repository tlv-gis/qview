utils = (function(){

    return {
        getLayer: getLayer,
        getLayerUrl: getLayerUrl,
        parseOpacity: parseOpacity,
        updateCurrentBounds: updateCurrentBounds,
        updateSource: updateSource,
        getParamsFromUrl: getParamsFromUrl
    }

    // get layer object from the current mapJson
    function getLayer(id){
        layer = mapJson["layers"].filter(obj => {
            return obj.id === id
          })[0]
        return layer
    }

    // get URL for retreiving a GeoJson contained by a buffer of the neighborhood
    function getLayerUrl(layer){

        countUrl = baseUrl+layer["id"]+"/query?"
        
        
        var params = {
            where:'1=1',
            returnGeometry:true,
            geometryPrecision:6,
            outSR:4326,
            f:'json',
            returnIdsOnly:true,
            returnCountOnly:false,
            inSR:4326,
            geometryType:'esriGeometryEnvelope',
            geometry:turf.bbox(turf.buffer(current_bounds,100,{units: 'meters'}))
            }
        countUrl += new URLSearchParams(params).toString();
        fetch(countUrl)
        .then(res => res.json())
        .then(data => {
            featureIDs = data["objectIds"]
            getLayerData(featureIDs,layer)
            console.log(featureIDs)
        })
        
        
        
        

        url = baseUrl+layer["id"]
        url += "/query?where=1%3D1&returnGeometry=true&geometryPrecision=6&outSR=4326&f=geojson"
        url += "&inSR=4326&geometryType=esriGeometryEnvelope&geometry="+turf.bbox(turf.buffer(current_bounds,100,{units: 'meters'}))

        
        if('fields' in layer){
            fields = layer['fields']
            if('label_field' in layer){
                fields = fields.concat(layer['label_field'])
            }
            url += "&outFields="+fields.join()
        }else{
            url += "&outFields="
        }
        return url
    }

    // Convert 8bit value to normalized opacity
    function parseOpacity(inputOpacity){
        xMax = 1;
        xMin = 0;

        yMax = 255;
        yMin = 0;

        percent = (inputOpacity - yMin) / (yMax - yMin);
        output = percent * (xMax - xMin) + xMin;
        return output
    }

    function updateCurrentBounds(map){
        bounds = map.getBounds()
        east = bounds.getEast()
        west = bounds.getWest()
        north = bounds.getNorth()
        south = bounds.getSouth()
        coords = [west, north,east,south]
        return turf.bboxPolygon(coords)
    }

    function getLayerData(featureIDs,layer){
        let requests = [];
        let baseGeoJson = {
            "type": "FeatureCollection",
            "features": []
          }
        for(var i=0; i<featureIDs.length;i += 100){
            let ids = featureIDs.slice(i,i+100)
            let queryUrl = baseUrl+layer["id"]+"/query?"
            var params = {
                where:'1=1',
                returnGeometry:true,
                geometryPrecision:6,
                outSR:4326,
                f:'geojson',
                objectIds: ids.join()
                }
            if('fields' in layer){
                fields = layer['fields']
                if('label_field' in layer){
                    fields = fields.concat(layer['label_field'])
                }
                params["outFields"] = fields.join()
            }
            queryUrl += new URLSearchParams(params).toString();
            requests.push(queryUrl)
        }
        console.log(requests)
        requests.forEach(element => {
            getDataBatch(element)
            .then(rows => {
                let features = rows.features;
                baseGeoJson.features.push(...features)
                updateSource(layer,baseGeoJson)
            })
            
        });

    }

    async function getDataBatch(url){
        let res = await fetch(url);
        let data = await res.json();
        return data;
    }

    function updateSource(layer,data){
        let sourceName =  layer['name']+"-source"
        let layerSource = map.getSource(sourceName)
        layerSource.setData(data)
    }

    function getParamsFromUrl(url) {
        url = decodeURI(url);
        if (typeof url === 'string') {
            let params = url.split('?');
            let eachParamsArr = params[1].split('&');
            let obj = {};
            if (eachParamsArr && eachParamsArr.length) {
                eachParamsArr.map(param => {
                    let keyValuePair = param.split('=')
                    let key = keyValuePair[0];
                    let value = keyValuePair[1];
                    obj[key] = value;
                })
            }
            return obj;
        }
    }

})();