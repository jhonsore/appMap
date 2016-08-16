<html>
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    <link href="reset.css" rel="stylesheet">
    <link href="geral.css" rel="stylesheet">
    <script type="text/javascript" src="jquery.min.js"></script>
    <script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=true"></script>
    <script type="text/javascript" src="BpTspSolver.js"></script>
    <script type="text/javascript" src="appMap.js"></script>

<!-- ////////////////////////////////////// -->
<!-- ////////////////////////////////////// -->
<!-- ////////////////////////////////////// -->
<script type="text/javascript">
    $(function() {



    });
</script>

</head>
<body>
    <div class="wrapper-control">
        <div class="wrapper-control__inner">
            <div class="border-separator box-add-location">
                <div class="box-add-location__address">
                    <form name="address" id="form-add-adress">
                        <div class="adress-field">
                            <span class="adress-field-box"><input class="adress-field-input" name="addressStr" type="text"></span>
                        </div>
                        <input class="adress-field-button" type="button" value="Add" id="js-bt-add-location">
                    </form>
                </div>
            </div>
            <div class="box-add-list-location">
                <form name="listOfLocations" id="js-list-of-locations">
                    <textarea class="input-list-locations" name="inputList" id="js-input-list-locations" placeholder="One destination per line"></textarea><br>
                    <input type="button" id="js-bt-add-list-location" value="Add list of locations">
                </form>
            </div>
            <div class="router-options border-separator">
                <strong class="router-options__title">Route options</strong>
                <form name="travelOpts">
                    <p class="router-options__line"><input id="walking" type="checkbox"> Walking<br></p>
                    <p class="router-options__line"><input id="bicycling" type="checkbox"> Bicycling<br></p>
                    <p class="router-options__line"><input id="avoidHighways" type="checkbox"> Avoid highways<br></p>
                    <p class="router-options__line"><input id="avoidTolls" type="checkbox"> Avoid toll roads</p>
                </form>
            </div>
            <!--  -->
            <a href="#" class="wrapper-control__bt" id="route-roundtrip">Calculate Fastest Roundtrip</a>
            <a href="#" class="wrapper-control__bt" id="route-trip">Calculate Fastest A-Z Trip</a>
            <a href="#" class="wrapper-control__bt" id="start-over-route">Start Over Again</a>
        </div>
    </div>
    <div id="map_canvas" style="width:100%; height:100%"></div>

</body>
</html>