class MapHeader {
    onAdd(map){
      this.map = map;
      this.container = document.createElement('div');
      this.container.className = 'mapboxgl-ctrl map-header';
      this.container.style.margin = 0;
      this.container.innerHTML = '<div ng-if="\'True\' ==\'True\'" class="ShhunaReSize smallSize ng-scope">\
                                  <div class="ShhunaReSizeBtn "></div>\
                                  <div class="ShhunaReSizeTxt">פתח מפה במסך מלא</div>\
                              </div>\
                              <div ng-if="\'True\' ==\'True\'" class="ShhunaTitle ng-binding ng-scope" ng-bind-html="\'<b>מפת מרחב</b> הצג לפי:\'"><b>מפת מרחב</b> הצג לפי:</div>';
      return this.container;
    }
    onRemove(){
      this.container.parentNode.removeChild(this.container);
      this.map = undefined;
    }
  }

class MapLegendButton {
  onAdd(map){
    this.map = map;
    this.container = document.createElement('div');
    this.container.id = "add-map-legend-button"
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group map-legend-button';
    this.container.innerHTML = '<button><i class="fg-map-legend fg-lg" style="color:#000;"></i></button>';
    this.container.title = "הדלקת מקרא"
    this.container.value = 0;
    this.container.onclick = LegendBuilder.addLegend
    return this.container;
  }
  onRemove(){
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}

class MapChangeBoundsButton {
  onAdd(map){
    this.map = map;
    this.container = document.createElement('div');
    this.container.id = "change-bounds"
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group map-legend-button';
    this.container.innerHTML = '<button><i class="fg-map-extent fg-lg" style="color:#000;"></i></button>';
    this.container.value = 0;
    //this.container.onclick = LegendBuilder.addLegend
    return this.container;
  }
  onRemove(){
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}

class MapLegend {
  onAdd(map){
    this.map = map;
    this.container = document.createElement('div');
    this.container.id = "map-legend"
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group map-legend';
    this.container.innerHTML = '';
    this.container.onclick = function(e){
      e.stopPropagation()
    }
    return this.container;
  }
  onRemove(){
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}