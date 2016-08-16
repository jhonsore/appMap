$(function() {
    function AppMap(){
        "use strict";

        //configuração do mapa
        this.defaultsMaps = {
            zoom: 12,
            center: new google.maps.LatLng(-20.319538, -40.297228),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.BOTTOM
            },
            navigationControl: true,
            navigationControlOptions: {
                style: google.maps.NavigationControlStyle.ZOOM_PAN,
                position: google.maps.ControlPosition.TOP_LEFT
            },
            scaleControl: true,
            scaleControlOptions: {
                position: google.maps.ControlPosition.TOP_LEFT
            }
        }

        //elemento contendo o mapa
        this.mapsContainer = document.getElementById("map_canvas");

        //instância do google maps
        this.gMaps;

        //instância do tsp
        this.tsp;

        // Need pointers to all markers to clean up.
        this.markers = new Array();

        this.mode;

        // Need pointer to path to clean up.
        this.dirRenderer;
    }

    AppMap.prototype.constructor = AppMap;

    //-------------------------------------------------
    //-------------------------------------------------

    /*
     * método inicial do app
     * */
    AppMap.prototype.init = function (){

        $.appMap.initGoogleMaps(null);
        $.appMap.initTSP();
        $.appMap.initControlCalculate();
        $.appMap.initControlAddLocation();
        $.appMap.initControlAddListLocation();

        //inicia o mapa com os marcadores já definidos
        var _array = [
            "-20.344067, -40.408485",
            "-20.339319, -40.403421",
            "-20.336341, -40.402133",
            "-20.329178, -40.398271",
            "-20.314852, -40.395610",
            "-20.306963, -40.395009"
        ];

        $.appMap.initMapWithLocations(_array);
        $.appMap.directions(0);
        //-----------------------------------------------

        this.arrPositions =
        [
            [-20.344067, -40.408485],
            [-20.339319, -40.403421],
            [-20.336341, -40.402133],
            [-20.329178, -40.398271],
            [-20.314852, -40.395610],
            [-20.306963, -40.395009]
        ];

        this.counter = 0;

    }

    /*
     * retorna tempo estimado entre uma origem e um destino
     * https://developers.google.com/maps/documentation/javascript/directions?hl=pt-br
     * */
    AppMap.prototype.getEstimatedTravelTime = function (__args__){
        var origin = new google.maps.LatLng( __args__.origin.lat, __args__.origin.lon); // using google.maps.LatLng class
        var destination = new google.maps.LatLng( __args__.destination.lat, __args__.destination.lon);;//-20.307139 + ', ' + -40.394953; // using string

        var directionsService = new google.maps.DirectionsService();
        var request = {
            origin: origin, // LatLng|string
            destination: destination, // LatLng|string
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };

        directionsService.route( request, function( response, status ) {

            if ( status === 'OK' ) {
                var point = response.routes[ 0 ].legs[ 0 ];
                console.log( 'Estimated travel time: ' + point.duration.text + ' (' + point.distance.text + ')' );

                /*var polylineOptionsActual = new google.maps.Polyline({
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 6
                });

                var directionsDisplay = new google.maps.DirectionsRenderer();
                directionsDisplay.setOptions({polylineOptions: polylineOptionsActual});
                directionsDisplay.setMap($.appMap.gMaps);
                directionsDisplay.setDirections(response);*/

            }
        } );
    }

    /*
     * cria marcador do usuário
     * */
    AppMap.prototype.initMarkerUser = function (__arg__){

        var myLatLng = new google.maps.LatLng(__arg__.lat, __arg__.long);
        var marker = new google.maps.Marker( {position: myLatLng, map: $.appMap.gMaps} );
        marker.setMap( $.appMap.gMaps );
        this.markerUser = marker;

        this.timerMoveUser = setInterval(function(){

            if($.appMap.counter < $.appMap.arrPositions.length){
                $.appMap.moveMarkerUser({
                    lat:$.appMap.arrPositions[$.appMap.counter][0],
                    long:$.appMap.arrPositions[$.appMap.counter][1]
                });
            }else{
                clearInterval($.appMap.timerMoveUser);
            }

        },1000);

        //---
        var _objPos = {
            origin:{lat:$.appMap.arrPositions[0][0],lon: $.appMap.arrPositions[0][1]},
            destination:{lat:$.appMap.arrPositions[$.appMap.arrPositions.length-1][0],lon: $.appMap.arrPositions[$.appMap.arrPositions.length-1][1]}
        };

        $.appMap.getEstimatedTravelTime(_objPos);
    }

    /*
     * cria marcador do usuário
     * */
    AppMap.prototype.moveMarkerUser = function (__arg__){

        var _lat = __arg__.lat;
        var _long = __arg__.long;

        $.appMap.markerUser.setPosition( new google.maps.LatLng( _lat, _long ));
        $.appMap.gMaps.panTo( new google.maps.LatLng( _lat, _long ));

        //
        $.appMap.counter++;

        //--------------
        /*var _objPos = {
            origin:{lat:_lat,lon:_long},
            destination:{lat:$.appMap.arrPositions[$.appMap.counter][0],lon: $.appMap.arrPositions[$.appMap.counter][1]}
        };

        $.appMap.getEstimatedTravelTime(_objPos);*/

    };

    /*
     * inicia o mapa com os marcadores já definidos
     * */
    AppMap.prototype.initMapWithLocations = function (arrayLocations){
        if(arrayLocations.length){
            var _values = '';

            $.each(arrayLocations,function(index,value){
                _values += value+"\n";
            });

            $("#js-input-list-locations").html(_values);
            $("#js-list-of-locations").submit();
        }else
        {
            $.appMap.callMessage({msg:"Não foi possível adicionar as localizações no mapa"});
        }

    }

    /*
     *
     * */
    AppMap.prototype.initControlAddListLocation = function (addr, label){

        $("#js-bt-add-list-location").click($.appMap.clickedAddList);

        $("#js-list-of-locations").submit(function(){
            $.appMap.clickedAddList();
            return false;
        });

    }

    /*
     *
     * */
    AppMap.prototype.clickedAddList = function (){
        var val = document.listOfLocations.inputList.value;
        val = val.replace(/\t/g, ' ');
        document.listOfLocations.inputList.value = val;
        $.appMap.addList(val);
    }

    /*
     *
     * */
    AppMap.prototype.addList = function (listStr){

        if($.appMap.markers.length){
            //ao adiconar uma lista, limpamos tudo novamente
            $.appMap.startOver();
        }

        var listArray = listStr.split("\n");

        for (var i = 0; i < listArray.length; ++i) {
            var listLine = listArray[i];
            if (listLine.match(/\(?\s*\-?\d+\s*,\s*\-?\d+/) ||
                listLine.match(/\(?\s*\-?\d+\s*,\s*\-?\d*\.\d+/) ||
                listLine.match(/\(?\s*\-?\d*\.\d+\s*,\s*\-?\d+/) ||
                listLine.match(/\(?\s*\-?\d*\.\d+\s*,\s*\-?\d*\.\d+/)) {
                // Line looks like lat, lng.
                var cleanStr = listLine.replace(/[^\d.,-]/g, "");
                var latLngArr = cleanStr.split(",");
                if (latLngArr.length == 2) {
                    var lat = parseFloat(latLngArr[0]);
                    var lng = parseFloat(latLngArr[1]);
                    var latLng = new google.maps.LatLng(lat, lng);
                    $.appMap.tsp.addWaypoint(latLng, $.appMap.addWaypointSuccessCallbackZoom);
                }
            } else if (listLine.match(/\(?\-?\d*\.\d+\s+\-?\d*\.\d+/)) {
                // Line looks like lat lng
                var latLngArr = listline.split(" ");
                if (latLngArr.length == 2) {
                    var lat = parseFloat(latLngArr[0]);
                    var lng = parseFloat(latLngArr[1]);
                    var latLng = new google.maps.LatLng(lat, lng);
                    $.appMap.tsp.addWaypoint(latLng, $.appMap.addWaypointSuccessCallbackZoom);
                }
            } else if (listLine.match(/\S+/)) {
                // Non-empty line that does not look like lat, lng. Interpret as address.
                $.appMap.tsp.addAddress(listLine, $.appMap.addAddressSuccessCallbackZoom);
            }
        }
    }

    /*
     *
     * */
    AppMap.prototype.addWaypointSuccessCallbackZoom = function (latlng){
        if (latlng) {
            $.appMap.drawMarkers(true);
        }
    }

    /*
     *
     * */
    AppMap.prototype.addAddressAndLabel = function (addr, label){
        $.appMap.tsp.addAddressWithLabel(addr, label, $.appMap.addAddressSuccessCallbackZoom);
    }

    /*
     *
     * */
    AppMap.prototype.addAddress = function (addr){
        $.appMap.addAddressAndLabel(addr, null);
    }

    /*
     *
     * */
    AppMap.prototype.clickedAddAddress = function (){
        $.appMap.addAddress(document.address.addressStr.value);
    }

    /*
     *
     * */
    AppMap.prototype.addAddressSuccessCallbackZoom = function (address, latlng){
        if (latlng) {
            $.appMap.drawMarkers(true);
        } else {
            $.appMap.callMessage({msg:'Failed to geocode: ' + address});
        }
    }

    /*
     * adiciona um ponto no mapa via o input de adicionar localização
     * */
    AppMap.prototype.initControlAddLocation = function (){

        $("#js-bt-add-location").click($.appMap.clickedAddAddress);

        $("#form-add-adress").submit(function(){
            $.appMap.clickedAddAddress();
            return false;
        });

    }

    /*
     * checa se foi adiconado um ponto no mapa
     * */
    AppMap.prototype.checkRoute = function (){
        if($.appMap.markers.length <= 0){
            $.appMap.callMessage({msg:"Adicione uma rota"});
            return false;
        }
        return true;
    }

    /*
     * inicia o controle das funcionalidades
     * */
    AppMap.prototype.initControlCalculate = function (){

        //calcular rota com retorno para o ponto 1
        $("#route-roundtrip").click(function(){
            $.appMap.directions(0);
            return false;
        });

        //calcular rota sem retorno
        $("#route-trip").click(function(){
            $.appMap.directions(1);
            return false;
        });

        //começar novamente
        $("#start-over-route").click($.appMap.startOver);
    }

    /*
     * directions
     * cria a rota com o trajeto
     * */
    AppMap.prototype.directions = function (__arg__){

        if(!$.appMap.checkRoute()) return false;

        $.appMap.addLoader();

        var m, walking, bicycling, avoidHighways, avoidTolls;

        m = __arg__;
        walking = document.forms['travelOpts'].walking.checked;
        bicycling = document.forms['travelOpts'].bicycling.checked;
        avoidHighways = document.forms['travelOpts'].avoidHighways.checked;
        avoidTolls = document.forms['travelOpts'].avoidTolls.checked;

        $.appMap.mode = m;
        $.appMap.tsp.setAvoidHighways(avoidHighways);
        $.appMap.tsp.setAvoidTolls(avoidTolls);

        if (walking)
            $.appMap.tsp.setTravelMode(google.maps.DirectionsTravelMode.WALKING);
        else if (bicycling)
            $.appMap.tsp.setTravelMode(google.maps.DirectionsTravelMode.BICYCLING);
        else
            $.appMap.tsp.setTravelMode(google.maps.DirectionsTravelMode.DRIVING);

        $.appMap.tsp.setOnProgressCallback($.appMap.onProgressCallback);

        if (m == 0)
            $.appMap.tsp.solveRoundTrip($.appMap.onSolveCallback);
        else
            $.appMap.tsp.solveAtoZ($.appMap.onSolveCallback);
    }

    /*
     * onSolveCallback
     * */
    AppMap.prototype.onSolveCallback = function (){
        var dirRes = $.appMap.tsp.getGDirections();
        var dir = dirRes.routes[0];

        //inicia o marcador do usuário
        $.appMap.initMarkerUser({
            lat:$.appMap.arrPositions[0][0],
            long:$.appMap.arrPositions[0][1]
        });

        //----------
        $.appMap.removeOldMarkers();
        $.appMap.removeLoader();

        //----------
        // Add nice, numbered icons.
        if ($.appMap.mode == 1) {

            var myPt1 = dir.legs[0].start_location;
            var myIcn1 = new google.maps.MarkerImage("icon.png");
            var marker = new google.maps.Marker({
                label: String (1),
                position: myPt1,
                icon: myIcn1,
                map: $.appMap.gMaps });

            $.appMap.markers.push(marker);
        }

        for (var i = 0; i < dir.legs.length; ++i) {

            var route = dir.legs[i];
            var myPt1 = route.end_location;
            var myIcn1;
            var _label;

            if (i == dir.legs.length - 1 && $.appMap.mode == 0) {
                _label = '1';
                myIcn1 = new google.maps.MarkerImage("icon.png");
            } else {
                _label = String (i + 2);
                myIcn1 = new google.maps.MarkerImage("icon.png");
            }

            //marcador com o ícone
            var marker = new google.maps.Marker({
                label: _label,
                position: myPt1,
                icon: myIcn1,
                map: $.appMap.gMaps });

            $.appMap.markers.push(marker);

        }

        //----------
        // Clean up old path.
        if ($.appMap.dirRenderer != null) {
            $.appMap.dirRenderer.setMap(null);
        }

        $.appMap.dirRenderer = new google.maps.DirectionsRenderer({
            directions: dirRes,
            hideRouteList: true,
            map: $.appMap.gMaps,
            panel: null,
            preserveViewport: false,
            suppressInfoWindows: true,
            suppressMarkers: true });
    }

    /*
     * onProgressCallback
     * */
    AppMap.prototype.onProgressCallback = function (){
        var _val = 100 * ($.appMap.tsp.getNumDirectionsComputed()) / ($.appMap.tsp.getNumDirectionsNeeded());
        $(".loader-calculation").css({width:_val+"%"});
    }

    /*
     * directions
     * */
    AppMap.prototype.startOver = function (){

        var center = $.appMap.gMaps.getCenter();
        var zoom = $.appMap.gMaps.getZoom();

        $.appMap.initGoogleMaps({center:center,zoom:zoom});
        $.appMap.tsp.startOver(); // doesn't clearOverlays or clear the directionsPanel
        $.appMap.markers = new Array();

    }

    /*
     * inicia o google maps
     * */
    AppMap.prototype.initGoogleMaps = function (__args__){
        var _obj = $.appMap.defaultsMaps;

        if(__args__)
        {
            _obj = $.extend(false,$.appMap.defaultsMaps,__args__);
        }

        //inicia o mapa
        this.gMaps = new google.maps.Map(
            $.appMap.mapsContainer,
            _obj
        );

        //cria listener para o click no mapa
        google.maps.event.addListener(this.gMaps, "click", function(event) {
            $.appMap.tsp.addWaypoint(event.latLng, $.appMap.addWaypointSuccessCallback);
        });
    }

    /*
     * inicia o google maps
     * */
    AppMap.prototype.initTSP = function (){

        this.tsp = new BpTspSolver(
            this.gMaps
        );
        this.tsp.setDirectionUnits("m");

        google.maps.event.addListener(this.tsp.getGDirectionsService(), "error", function() {
            $.appMap.callMessage({msg:"Request failed: " + reasons[this.tsp.getGDirectionsService().getStatus().code]});
        });

    }

    /*
     * ao clicar no mapa é chamado addWaypoint no objeto tsp
     * addWaypointSuccessCallback é o listener no app para tal evento
     * */
    AppMap.prototype.addWaypointSuccessCallback = function (__latlng__){
        if (__latlng__) {
            $.appMap.drawMarkers(false);
        }
    }

    AppMap.prototype.drawMarkers = function (updateViewport){

        $.appMap.removeOldMarkers();

        var waypoints = $.appMap.tsp.getWaypoints();
        var addresses = $.appMap.tsp.getAddresses();
        var labels = $.appMap.tsp.getLabels();

        for (var i = 0; i < waypoints.length; ++i) {
            $.appMap.drawMarker(waypoints[i], addresses[i], labels[i], i);
        }

        if (updateViewport) {
            $.appMap.setViewportToCover(waypoints);
        }
    }

    /*
     * setViewportToCover
     * */
    AppMap.prototype.setViewportToCover = function (waypoints){
        var bounds = new google.maps.LatLngBounds();

        for (var i = 0; i < waypoints.length; ++i) {
            bounds.extend(waypoints[i]);
        }

        $.appMap.gMaps.fitBounds(bounds);
    }

    /*
     * remove os marcadores antigos
     * */
    AppMap.prototype.removeOldMarkers = function (){
        for (var i = 0; i < $.appMap.markers.length; ++i) {
            $.appMap.markers[i].setMap(null);
        }
        $.appMap.markers = new Array();
    }

    /*
     * cria marcador
     * */
    AppMap.prototype.drawMarker = function (latlng, addr, label, num) {

        //ícone
        var icon = new google.maps.MarkerImage("icon.png");
        var _val = String (num + 1);

        //marcador com o ícone
        var marker = new google.maps.Marker({
            label: _val,
            position: latlng,
            icon: icon,
            map: $.appMap.gMaps
        });

        //listener para o clique no marcador
        google.maps.event.addListener(marker, 'click', function(event) {
            var addrStr = (addr == null) ? "" : addr + "<br>";
            var labelStr = (label == null) ? "" : "<b>" + label + "</b><br>";
            var markerInd = -1;

            for (var i = 0; i < $.appMap.markers.length; ++i) {
                if ($.appMap.markers[i] != null && marker.getPosition().equals($.appMap.markers[i].getPosition())) {
                    markerInd = i;
                    break;
                }
            }

            //controle do marcador
            var infoWindow = new google.maps.InfoWindow({
                content: labelStr + addrStr
                + "<a href='javascript:$.appMap.setMarkerAsStart($.appMap.markers["
                + markerInd + "]"
                + ")'>"
                + "Iniciar a rota aqui"
                + "</a><br>"
                + "<a href='javascript:$.appMap.setMarkerAsStop($.appMap.markers["
                + markerInd + "])'>"
                + "Finalizar a rota aqui"
                + "</a><br>"
                + "<a href='javascript:$.appMap.removeMarker($.appMap.markers["
                + markerInd + "])'>"
                + "Remover marcador</a>",
                position: marker.getPosition() });
            marker.infoWindow = infoWindow;
            infoWindow.open($.appMap.gMaps);
            //    tsp.removeWaypoint(marker.getPosition());
            //    marker.setMap(null);
        });
        $.appMap.markers.push(marker);
    }

    /*
     * coloca o marcador como o ponto inicial da rota
     * */
    AppMap.prototype.setMarkerAsStart = function (marker) {
        marker.infoWindow.close();
        this.tsp.setAsStart(marker.getPosition());
        this.drawMarkers(false);
    }

    /*
     * coloca o marcador como o ponto final da rota
     * */
    AppMap.prototype.setMarkerAsStop = function (marker) {
        marker.infoWindow.close();
        this.tsp.setAsStop(marker.getPosition());
        this.drawMarkers(false);
    }

    /*
     * remove marcador
     * */
    AppMap.prototype.removeMarker = function (marker) {
        marker.infoWindow.close();
        this.tsp.removeWaypoint(marker.getPosition());
        this.drawMarkers(false);
    }

    /*
     * mensagem
     * */
    AppMap.prototype.callMessage = function (__args__){
        alert(__args__.msg);
    }

    /*
     * adiciona o loader
     * */
    AppMap.prototype.addLoader = function (){
        var _template = "<div class='box-calculator'>";
            _template += "<div class='loader-calculation'></div>";
            _template += "</div>";
        $("body").append(_template);
    }

    /*
     * remove o loader
     * */
    AppMap.prototype.removeLoader = function (){
        $(".box-calculator").remove();
    }

    //cria nova instância do app
    $.appMap = new AppMap();

    //inicia o app
    $.appMap.init();

});

//---------------------------------------------------------
//https://gist.github.com/badsyntax/2365949
//http://humaan.com/custom-html-markers-google-maps/
/*function CustomMarker(latlng, map, args) {
 this.latlng = latlng;
 this.args = args;
 this.setMap(map);
 }

 CustomMarker.prototype = new google.maps.OverlayView();

 CustomMarker.prototype.draw = function() {

 var self = this;

 var div = this.div;

 if (!div) {

 div = this.div = document.createElement('div');

 div.className = 'marker';

 div.style.position = 'absolute';
 div.style.cursor = 'pointer';
 div.style.width = '20px';
 div.style.height = '20px';
 div.style.background = 'blue';

 if (typeof(self.args.marker_id) !== 'undefined') {
 div.dataset.marker_id = self.args.marker_id;
 }

 google.maps.event.addDomListener(div, "click", function(event) {
 alert('You clicked on a custom marker!');
 google.maps.event.trigger(self, "click");
 });

 var panes = this.getPanes();
 panes.overlayImage.appendChild(div);
 }

 var point = this.getProjection().fromLatLngToDivPixel(this.latlng);

 if (point) {
 div.style.left = (point.x - 10) + 'px';
 div.style.top = (point.y - 20) + 'px';
 }
 };

 CustomMarker.prototype.remove = function() {
 if (this.div) {
 this.div.parentNode.removeChild(this.div);
 this.div = null;
 }
 };

 CustomMarker.prototype.getPosition = function() {
 return this.latlng;
 };*/
