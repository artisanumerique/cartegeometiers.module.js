'use strict';

/**
 * @ngdoc overview
 * @name cartegeometiersmodulejsApp
 * @description
 * # cartegeometiersmodulejsApp
 *
 * Main module of the application.
 */
angular
  .module('cartegeometiersmodulejsApp', [
    'ngAnimate',
    'ngResource',
    'ngRoute',
    'geometiersmodulejsApp',
    'angularUtils.directives.dirPagination',
  ])
  .constant("config", {
        "API": "http://qualimetiers.fr/api",
        "urlstyle": "cixlnex77000s2sntu1jcfn6o",
  })
  .config(["$routeProvider", "$locationProvider", "$provide", function ($routeProvider,$locationProvider,$provide) {

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

    $provide.decorator('$location', [
      '$delegate',
      '$injector',
      '$rootScope',
      '$timeout',
      function locationServiceDecorator($delegate, $injector, $rootScope, $timeout) {

        var location = $delegate.url;
        var $route;
    
        function aNewLocation(url, reload) {

         $route = $injector.get('$route');

          if(arguments[1] == false){
             
                var lastRoute = $route.current;
                var un = $rootScope.$on('$locationChangeSuccess', function () {
                    $route.current = lastRoute;
                    un();
                });
          }
         
         return  $timeout(location.apply($delegate, arguments),0);
        }

        $delegate.url = aNewLocation;
        return $delegate;
      }
    ]);

 
    $routeProvider
      // page carte, liste des artisans
      .when('/:nomterritoire/lat/:lat/lon/:lon/?', {
        templateUrl: 'views/cartegeometiers.template.html',
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .run(['$route', '$rootScope', '$location','$timeout', function ($route, $rootScope, $location, $timeout) {

    $rootScope.$on('$viewContentLoaded', function(event) {
    $timeout(function() {
        componentHandler.upgradeAllRegistered();
    }, 0);
    });
    

}])

'use strict';

/**
 * @ngdoc function
 * @name cartegeometiersmodulejsApp.controller:CartegeometiersCtrl
 * @description
 * # CartegeometiersCtrl
 * Controller of the cartegeometiersmodulejsApp
 */
/**
 * @ngdoc function
 * @name cartegeometiersmodulejsApp.controller:CartegeometiersCtrl
 * @description
 * # CartegeometiersCtrl
 * Controller of the cartegeometiersmodulejsApp
 */
angular.module('cartegeometiersmodulejsApp')
  .controller('CartegeometiersCtrl', ["$scope", "$location", "$routeParams", "$timeout", "FiltreBounds", "Filtre", "Webservice", "tools", "$window", "config", function ($scope, $location, $routeParams, $timeout, FiltreBounds, Filtre, Webservice, tools, $window, config) {
    
   FiltreBounds.init($routeParams);
   $scope.map = { center: {lat: FiltreBounds.lat, lng: FiltreBounds.lon}, zoom: FiltreBounds.zoom };

   $scope.items = [];
   $scope.totalItems = 0;
   $scope.loading = false;
   $scope.itemsPerPage = 25;
   $scope.currentPage = FiltreBounds.page;//page actuelle
   $scope.urlstyle = config.urlstyle;

   // on récupère la liste des items
  var getItems = function(i){
	
		$scope.loading = true;

		Webservice.get(FiltreBounds.getParams(i),function(datas){
			$scope.loading 	= false;
      $scope.refresh 	= true;
      $scope.items	   = datas.features;	
			$scope.totalItems  = $scope.items.length;
			FiltreBounds.page  = $scope.currentPage;
      $location.url(FiltreBounds.url(),false);
		})

  }

  // initialise la liste d'items d'après les paramètre url
  $scope.getItemsWhenUrlChange = function(i){
      // si aucune requête n'est en cours
      //if($scope.loading == false)
        getItems(i);
  }

  // initialise la liste d'items quand on bouge la carte
  // la vue ne doit pas être rechargée
  $scope.getItemsWhenMapMove = function(i){
     // si aucune requête n'est en cours
     //if($scope.loading == false){
        $scope.currentPage = 1;
        getItems(i);
     // }
  }

  $scope.pageChange = function(v){
      FiltreBounds.page = $scope.currentPage;
      $location.url(FiltreBounds.url(),false);
      $scope.refresh = true;
  }

  $scope.setSiret = function(siret){ 
    $scope.$broadcast('newsiret',siret);
  }

  // évenement déclenché après changement de localisation
  $scope.$on('update.location', function() {

      $scope.loading = true;

      // on récupère les paramètres
      var params = Filtre.params();
      params.push({name:'action',value:'filtrer'});

      Webservice.get(tools.arrayToObject(params),function(datas){
       
        $scope.loading = false;
        
        // initialise le centre de la localisation
        if(datas.features.length > 0)
        FiltreBounds.setCenter(datas.features[0].properties.centre);

        FiltreBounds.insideCommune = true;
        FiltreBounds.zoom = 15;
        FiltreBounds.lieu = datas.statistique.titre[0];
        FiltreBounds.page  = 1;
        $scope.currentPage = 1;
        $scope.map = { center: {lat: FiltreBounds.lat, lng: FiltreBounds.lon}, zoom: FiltreBounds.zoom };
         
      })
  })

	// après changement de filtre
	$scope.$on('update.filtres', function() {
		FiltreBounds.zoom = 15;
		if(angular.isDefined(Filtre.getByName('siret')))
			$window.open(Filtre.url());
		else
			$scope.getItemsWhenUrlChange(false);
	})


  }]);
'use strict';

/**
 * @ngdoc service
 * @name cartegeometiersmodulejsApp.Icone
 * @description
 * # Icone
 * Factory in the cartegeometiersmodulejsApp.
 */
angular.module('cartegeometiersmodulejsApp')
  .factory('Icone', function () {
   
   var classname = function (valeur) {
    if (valeur > 0 && valeur <= 190){return 'marker-cluster un';}
    else if (valeur > 190 && valeur <= 455){return 'marker-cluster trois';}
    else if (valeur > 455 && valeur <= 675){return 'marker-cluster sept';}
    else {return 'marker-cluster sept';}
  }

  var iconsize = function (valeur) {
    if (valeur > 0 && valeur <= 190){return 34;}
    else if (valeur > 190 && valeur <= 455){return 44;}
    else {return 64}
  }
  

  var LeafIcon = L.Icon.extend({
      options: {
        shadowUrl: 'images/pins/shadow.png',
        number: '',
        iconSize:     [42, 60], // size of the icon
        shadowSize:   [42, 12], // size of the shadow
        shadowAnchor: [21, -18],  // the same for the shadow
        popupAnchor: [0, -18],
        className: 'cma-div-icon'
      
      },
      createIcon: function () {
        var div = document.createElement('div');
        var img = this._createImg(this.options['iconUrl']);
        var numdiv = document.createElement('div');
        numdiv.setAttribute ( "class", "number" );
        numdiv.innerHTML = this.options['number'] || '';
        div.appendChild ( img );
        div.appendChild ( numdiv );
        this._setIconStyles(div, 'icon');
        return div;
        },

  });
  
  var Iconsanstitre = new LeafIcon({iconUrl: 'images/pins/ico.png'}),
  Iconartisan = new LeafIcon({iconUrl: 'images/pins/icoblue.png'}),
  Iconmaitre = new LeafIcon({iconUrl: 'images/pins/icored.png'});
  //Iconprofil = new LeafIcon({iconUrl: 'images/pins/icoorange49x57.png'});

    var factory = {                        

        groupeartisan : function(){

          return  L.featureGroup();


          /*return L.markerClusterGroup({     
        
            maxClusterRadius:2,
            showCoverageOnHover:false,
            spiderfyDistanceMultiplier:1,
            disableClusteringAtZoom: 10,
            //singleMarkerMode:true,

              iconCreateFunction: function(cluster) {
              var c = cluster.getChildCount();
                var sizeIcon = iconsize(c);
                return new L.DivIcon({
                  className: classname(c),
                  html: '<div>'+c+'</div>',
                  iconSize:[sizeIcon,sizeIcon] });
              }
            })*/
        },
      pointToLayer: function (feature, latlng, n){
        
        if(feature.properties.titrequalif == "MAITRE ARTISAN" || feature.properties.titrequalif == "Maître artisan en métiers d'art"){
          return L.marker(latlng, {icon: Iconmaitre,riseOnHover:true});
        }
        else if(feature.properties.titrequalif == "ARTISAN" || feature.properties.titrequalif == "Artisan en métiers d'art"){
          return L.marker(latlng, {icon: Iconartisan,riseOnHover:true});
        }
        else{
          return L.marker(latlng, {icon: Iconsanstitre,riseOnHover:true});
        }
      },

      artisanMarkerIcon: function(v){
        //return Iconprofil;

        if(v == "MAITRE ARTISAN" || v == "Maître artisan en métiers d'art"){
          return Iconmaitre;
        }
        else if(v == "ARTISAN" || v == "Artisan en métiers d'art"){
          return Iconartisan;
        }
        else{
          return Iconsanstitre;
        }
      }

          }
    
    return factory;

  });

'use strict';

/**
 * @ngdoc service
 * @name cartegeometiersmodulejsApp.Artisan
 * @description
 * # Artisan
 * Factory in the cartegeometiersmodulejsApp.
 */
angular.module('cartegeometiersmodulejsApp')
  .factory('Artisans', ["$resource", "config", function ($resource, config) {
   
      return {
           
          fiche: $resource(config.API + '/artisans/:id', {}, {
            
                 get: { method: 'GET', cache:true}
            
          }),

          photos: $resource(config.API + '/artisans/:id/photos', {}, {
            
                 get: { method: 'GET', cache:true}

          }),

          videos: $resource(config.API + '/artisans/:id/videos', {}, {
            
               get: { method: 'GET', cache:true, isArray : true}
            
          }),

      }
    
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name cartegeometiersmodulejsApp.directive:drawmap
 * @description
 * # drawmap
 */
/**
 * @ngdoc directive
 * @name cartegeometiersmodulejsApp.directive:drawmap
 * @description
 * # drawmap
 */
angular.module('cartegeometiersmodulejsApp')
  .directive('drawMap', ["$animate", "$location", "$timeout", "FiltreBounds", "Icone", "limitToFilter", function ($animate,$location,$timeout,FiltreBounds,Icone,limitToFilter) {
    return {
      
      restrict: 'EA',
      replace: true,
      templateUrl:'views/drawmap.template.html',
      scope : true,
      link: function postLink(scope, element, attrs) {
      	
      	//! IMPORTANT on désactive ngAnimate pour cet element
      	$animate.enabled(false, element)

      	var map = L.map(attrs['id'],

      		 {
	       		scrollWheelZoom: false,
	 	        doubleClickZoom: false,
	 	        boxZoom: true,
	 	        minZoom:13,
	 	        maxZoom:18,
	 	        attributionControl: false,
	 	        center: [scope.map.center.lat,scope.map.center.lng],
	 	        zoom: scope.map.zoom
       	    }

      	).setView([scope.map.center.lat,scope.map.center.lng], scope.map.zoom);
      	L.tileLayer('https://api.mapbox.com/styles/v1/art82/'+scope.urlstyle+'/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXJ0ODIiLCJhIjoic3hwSDFJRSJ9.D82gjhYrYR935Knj8cNVwg', {
    			 attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    		}).addTo(map);

        // on ajoute un groupe qui contiendra les markers à la map
      	scope.markers = Icone.groupeartisan();
	      map.addLayer(scope.markers);

        // on initialise les bornes en fonction du conteneur de la map
        FiltreBounds.setBounds(angular.toJson(map.getBounds()));
        scope.getItemsWhenUrlChange(true);


        // évenement carte
  	    map.on({
  	        moveend: function (){

              // on initialise les bornes en fonction du conteneur de la map
              FiltreBounds.setBounds(angular.toJson(map.getBounds()));
              // on active la recherche avec le déplacement de la carte ou pas
              if(scope.pinsonmove)
                scope.getItemsWhenMapMove(false);
              else{
                scope.rechercheActive = false;
                scope.$apply();
              }

  	        },
  	        zoomend :function(e){
  				    scope.map.zoom = e.target._zoom;
  				    FiltreBounds.zoom = scope.map.zoom;
  	        }
  	    });	

        // après changement des coordonnées de la carte
        scope.$watch('map', function () {
          map.setView([scope.map.center.lat,scope.map.center.lng], scope.map.zoom);
        });

        // si liste d'artisans change
        scope.$watch('items',function(){
            drawPins();    
        })
          
        // si currentPage change
        scope.$watch('currentPage',function(){
          drawPins();
        })

        scope.$on('newsiret',function(e,siret){
          scope.markers.eachLayer(function(layer) { 
            if(siret!=''){
              if(layer.feature.properties.numerosiret ==  siret)
                  layer.fireEvent('mouseover');
            }else
                layer.fireEvent('mouseout');
          })
        })

	      scope.move = function(){
		    	scope.rechercheActive = true;
		    	FiltreBounds.setBounds(angular.toJson(map.getBounds()));
		    	scope.getItemsWhenMapMove(false);
	    	}

		

		// dessiner pins
		var drawPins = function(){
		      
      var itemsReduit = limitToFilter(scope.items,scope.itemsPerPage,scope.itemsPerPage*(scope.currentPage-1));
			  	 
			scope.markers.clearLayers();	  

	        var g = L.geoJson(itemsReduit,{
				  pointToLayer: function (feature, latlng){
		  			return Icone.pointToLayer(feature, latlng);
		  		},
		  		onEachFeature: function (feature, layer){	
					layer.on({
		  		  		click: function(e){
		  		  				scope.$broadcast('selectpins',layer);
		  		  		},
		  		  		mouseover: function (e){
		  		  			layer.setZIndexOffset(1000);
		  		  			layer.openPopup();
		  		  		},          
		  			  	mouseout: function (e){
							layer.setZIndexOffset(100);
		  			  		layer.closePopup();
		  		  		}
		  		  	});
		  		  				
		  		  	var popup = L.popup({autoPan:false,closeButton:false,className:'pinspopup'})
		  		  	.setContent('<h4>' + feature.properties.raisonsociale + '</h4>');
		  		  	layer.bindPopup(popup);			
		  		}
		
	  		});
          		

	     var i = 0;
	     g.eachLayer(function(layer) {
	             i++;
	             layer.options.icon.options.number = i;
	             scope.markers.addLayer(layer);	
	     });
        	
		}


      }
    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name cartegeometiersmodulejsApp.directive:scrollIf
 * @description
 * # scrollIf
 */
angular.module('cartegeometiersmodulejsApp')
  .directive('scrollIf', function () {
    return {
        restrict: 'EA',
        scope: {
        	change: '=',
        },
        link: function(scope, element, attrs){
        	 scope.$watch('change', function (n) {
        		element.animate({scrollTop: 0}, "fast");
        		scope.change = false;
             });
        }
    };
  });

'use strict';

/**
 * @ngdoc directive
 * @name cartegeometiersmodulejsApp.directive:artisanThumbnail
 * @description
 * # artisanThumbnail
 */
angular.module('cartegeometiersmodulejsApp')
  .directive('artisanThumbnail', ["Artisans", function (Artisans) {
    return {
      template: '<span>'
      			+'<i class="material-icons mdl-list__item-avatar" ng-show="!thumbnail">person</i>'
      			+'<img class="material-icons mdl-list__item-avatar" src="{{thumbnail}}" ng-show="thumbnail"/>'
      			+'</span>',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        var o = scope.artisan;

         if(o.properties.fiche._profil_img != "")
          scope.thumbnail = o.properties.fiche._profil_img;

          /*var photos = Artisans.photos.get({id:o.properties.numerosiret}, function() {
          // if(photos.profil.length > 0)
        		//scope.thumbnail = "data:image/jpeg;base64," + photos.profil.thumbnailsbase64;
		      });*/

      }
    };
  }]);

  angular.module('cartegeometiersmodulejsApp')
  .directive('artisanThumbnaildetail', ["Artisans", function (Artisans) {
    return {
      template: '<span class="profilimg">'
            +"<i class='material-icons' ng-show='!thumbnail'>&#xE7FD;</i>"
           // +"<img src='{{thumbnail}}'  class='img-responsive' ng-show='thumbnail'/>"
             + '<div style="background: url({{thumbnail}}) center / cover #eee;" ng-show="thumbnail"></div>'
            +'</span>',
      restrict: 'EA',
      replace: true,
      
      link: function postLink(scope, element, attrs) {
        scope.$watch('artisan',function(){
          if(angular.isDefined(scope.artisan)){
              Artisans.photos.get({id:scope.artisan._numerosiret}, function(result) {
                  if(result.profil.length > 0)
                    scope.thumbnail = result.profil.large;
              });
          }
        })
      }
    };
  }]);



   
'use strict';

/**
 * @ngdoc directive
 * @name cartegeometiersmodulejsApp.directive:mdlUpgrade
 * @description
 * # mdlUpgrade
 */
angular.module('cartegeometiersmodulejsApp')
  .directive('mdlUpgrade', ["$timeout", function($timeout) {
    return {
      restrict: 'A',
      compile: function() {
        return {
          post: function postLink(scope, element) {
            $timeout(function() {
              componentHandler.upgradeElements(element[0]);
            }, 0);
          }
        };
      },
    };
}]);
'use strict';

/**
 * @ngdoc directive
 * @name cartegeometiersmodulejsApp.directive:drawList
 * @description
 * # drawList
 */
angular.module('cartegeometiersmodulejsApp')
  .directive('drawList', function () {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: function(element, attr) { return attr.templateUrl ? attr.templateUrl : 'views/drawlist.template.html' },
      link: function postLink(scope, element, attrs) {
       
      	var qualifs = [
      	'MAITRE ARTISAN',
      	'ARTISAN',
      	"Artisan en métiers d'art",
      	"Maître artisan en métiers d'art"]

      	scope.showLogo = function(q){
      		return qualifs.indexOf(q) != -1;
      	}

      }
    };
  });

'use strict';

/**
 * @ngdoc directive
 * @name cartegeometiersmodulejsApp.directive:carteGeometiers
 * @description
 * # carteGeometiers
 */
angular.module('cartegeometiersmodulejsApp')
  .directive('carteGeometiers', function () {
    return {
      templateUrl: function(element, attr) { return attr.templateUrl ? attr.templateUrl : 'views/cartegeometiers.template.html' },
      restrict: 'EA',
      replace: true
    };
  });

angular.module('cartegeometiersmodulejsApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/cartegeometiers.template.html',
    "<main class=\"sig-main mdl-layout__content\" ng-controller=\"CartegeometiersCtrl\"> <div class=\"resultat-list\"> <div id=\"opaque-modal\" ng-class=\"{'visible':loading}\"></div> <draw-list></draw-list> </div> <div class=\"resultat-carte\"> <draw-map id=\"map-pins\"></draw-map> </div> </main>"
  );


  $templateCache.put('views/dirPagination.tpl.html',
    "<div class=\"resultat-error\" ng-show=\"range.total == 0\"> <p><b>Désolés ! Aucun résultat ne correspond à votre recherche</b></p> <p>Essayez de : <ul> <li>Faire un zoom arrière sur la carte pour effectuer une recherche sur une zone plus importante</li> <li>Faire une recherche plus large sur les métiers, comme les secteurs par exemples (Alimentation, Services, Bâtiments, Fabrication)</li> <li>Désélectionner des filtres</li> </ul> </p> </div> <div ng-if=\"1 < pages.length || !autoHide\" class=\"range-label\">{{ range.lower }} / {{ range.upper }} sur {{ range.total }} artisan(s)</div> <div class=\"page\" ng-if=\"1 < pages.length || !autoHide\"> <button class=\"mdl-button mdl-js-button\" title=\"Page précédente\" ng-class=\"{ disabled : pagination.current == 1 }\" ng-click=\"setCurrent(pagination.current - 1)\"> <i class=\"material-icons\">&#xE314;</i> </button> <button class=\"mdl-button mdl-js-button\" title=\"Page suivante\" ng-class=\"{ disabled : pagination.current == pagination.last }\" ng-click=\"setCurrent(pagination.current + 1)\"> <i class=\"material-icons\">&#xE315;</i> </button> </div>"
  );


  $templateCache.put('views/drawlist.template.html',
    "<div scroll-if change=\"refresh\" class=\"mdl-layout__content\"> <ul class=\"mdl-list\"> <li class=\"mdl-list__item mdl-list__item--three-line\" dir-paginate=\"artisan in items | itemsPerPage: itemsPerPage\" current-page=\"currentPage\" id=\"{{artisan.properties.numerosiret}}\" ng-mouseover=\"setSiret(artisan.properties.numerosiret)\" ng-mouseleave=\"setSiret('')\" ng-click=\"select(artisan)\"> <span class=\"mdl-list__item-primary-content\"> <artisan-thumbnail></artisan-thumbnail> <span> <!--<span class=\"number\">{{$index + 1}}.</span>--> {{ artisan.properties.raisonsociale | limitTo: 25 }}{{artisan.properties.raisonsociale.length > 25 ? '...' : ''}}</span> <span class=\"mdl-list__item-text-body\">{{ artisan.properties.libelleaprm | limitTo: 75 }}{{artisan.properties.libelleaprm.length > 75 ? '...' : ''}}</span> </span> <span class=\"mdl-list__item-secondary-content\" ng-show=\"showLogo(artisan.properties.titrequalif)\"> <a class=\"mdl-list__item-secondary-action\" href=\"#\"><img src=\"images/logo-artisan-list.png\"></a> </span> </li> </ul> <dir-pagination-controls class=\"pagination-control\" on-page-change=\"pageChange()\" template-url=\"views/dirPagination.tpl.html\"></dir-pagination-controls> </div>"
  );


  $templateCache.put('views/drawmap.template.html',
    "<div id=\"map-pins\"> <div id=\"rechercher\" ng-init=\"rechercheActive=true\"> <div ng-show=\"rechercheActive\" class=\"dep\"> <label class=\"mdl-checkbox mdl-js-checkbox\" for=\"checkbox-1\" mdl-upgrade> <input type=\"checkbox\" id=\"checkbox-1\" class=\"mdl-checkbox__input\" checked ng-init=\"pinsonmove = true\" ng-click=\"pinsonmove = !pinsonmove\"> <span class=\"mdl-checkbox__label\">Rechercher en déplaçant la carte</span> </label> </div> <div ng-hide=\"rechercheActive\" class=\"refresh\"> <a ng-click=\"move()\">Relancer la recherche</a> <i class=\"material-icons\">&#xE5D5;</i> </div> </div> </div>"
  );

}]);
