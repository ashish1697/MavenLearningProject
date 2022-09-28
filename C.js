
  angular.module('riskModule').
  directive('sgeTradeDropdown', ['$compile', '$http', '$q', '$rootScope', 'TradeDropdownSvc', '$timeout', '$log','defaultManagerSvc', function($compile, $http, $q, $rootScope, TradeDropdownSvc, $timeout, $log,defaultManagerSvc) {

      return {
          restrict: 'EA',
          replace: true,
          // template: '<select ng-model="select.value" ng-disabled="editlock||enableDisable" class="sgeTradeDropdown" ng-options="o.displayValue for o in select.options track by o.ID" ng-focus="handleEvent()" ng-change="onDropdownChange(select.value)" ></select>',
          template: '<div fis-combo-box-field placeholder-input=" - " fis-select-mode="true" ng-model-input="select.value" class="sgeTradeDropdown" fis-reinit="reinitCB" fis-options="item.displayValue for item in select.options" fis-data="select.options" ng-focus="handleEvent()" ng-change-input="onDropdownChange(select.value)" fis-update-object="true"></div>',
          scope: true,

          link: function($scope, $element, $attrs) {
             // console.log('in link');
          },
          controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
              $scope.reinitCB = 0;

              $timeout(function() {
                  $("[data-role=combobox]", $element).each(function() {
                      var widget = $(this).getKendoComboBox();
                        if(widget!=undefined){
                                widget.list.addClass("sge-trade-dropdown-list");
                                widget.input.on("focus click", function(e) {
                                $scope.handleEvent();
                                widget.open();
                                widget.input.select();
                            });
                        }
                  });
              }, 0);

              $scope.beanProperty = $attrs.beanProperty;
              $scope.tradeMetaId = $attrs.tradeMetaId;
              $scope.defaultvalue = $attrs.defaultvalue;
              $scope.dealSession = $attrs.dealSession;
              $scope.colName = $attrs.colName;
              $scope.editlock =( $attrs.editlock === 'true'|| $attrs.editlock === true) ? true : false;
              $scope.enableDisable = $attrs.enableDisable;
              $scope.ismultiplepoints = $attrs.ismultiplepoints;
              $scope.commodityid = $attrs.commodityid;
              $scope.enableDisable = false;
              $scope.dmRistrictedValues = $attrs.dmrestrictedvalues;
              $scope.fisDisabled = $scope.editlock || $scope.enableDisable;
              if($scope.dmRistrictedValues != undefined && $scope.dmRistrictedValues != 'null'){
                 $scope.restrictedFieldMap[$scope.beanProperty] = defaultManagerSvc.resolveRestricetedValues($scope.dmRistrictedValues);                 
              }
              $scope.defaultvalue = ($scope.defaultvalue === 'undefined' || $scope.defaultvalue === undefined) ? null : $scope.defaultvalue;

              $scope.select = {
                  options: [{
                      ID: "",
                      DESCRIPTION: "Loading...",
                      displayValue: "Loading..."
                  }]
              };

              
              $scope.$evalAsync(function(){
                loadData(); 
              });

              $scope.select.value = null;

              //Callback in case of invalidation of this dropdown
              var dropDowInvalidated = function() {
                  $element.find("[role=combobox]").addClass('highlightedAsWarning');
              }

              var defaultUpdateCallback = function(newDefValue) {
                  $element.find("[role=combobox]").removeClass('highlightedAsWarning');

                  for (var index in $scope.select.options) {
                      var nextitem = $scope.select.options[index];
                      if (nextitem && nextitem.ID && newDefValue && newDefValue.ID && ( typeof nextitem.ID === "string" && nextitem.ID.trim() == newDefValue.ID.trim())) {
                          $scope.select.value = nextitem;
                          break;
                      }
                  }
                  $element.find("[role=combobox]").effect("highlight", {
                      color: "#85e0e0"
                  }, 3000);
              }

              var enableDisableCallback = function(value) {
                  $scope.enableDisable = value;
              }

              var dropDownRestart = function(){
                loadData();
              }
              TradeDropdownSvc.registerDropdown($scope.beanProperty, null, $scope.defaultvalue, dropDowInvalidated, defaultUpdateCallback, enableDisableCallback, dropDownRestart);

              function loadData(){
                if ($scope.ismultiplepoints) {
                    if ($scope.beanProperty == "tpowMkt") {
                        var defaultSelectOption = {
                            'ID': "#MULTI",
                            'DESCRIPTION': "#MULTI",
                            'displayValue': "#MULTI - #MULTI"
                        };
                        $scope.select.options = [];
                        $scope.select.options.unshift(defaultSelectOption);
                        $scope.select.value = defaultSelectOption;
                        TradeDropdownSvc.setDropdownSelectedValueId($scope.beanProperty, $scope.select.value);
                        return;
                    } else if ($scope.beanProperty == "tpowLoc") {
                        if ($scope.commodityid == "-1001") {
                            var defaultSelectOption = {
                                'ID': "#DELIV",
                                'DESCRIPTION': "#DELIV",
                                'displayValue': "#DELIV - #DELIV"
                            };
                            $scope.select.options = [];
                            $scope.select.options.unshift(defaultSelectOption);
                            $scope.select.value = defaultSelectOption;
                            TradeDropdownSvc.setDropdownSelectedValueId($scope.beanProperty, $scope.select.value);
                            return;
                        }
                    }
                }

                var promise = TradeDropdownSvc.getDropdownData($scope.beanProperty, $scope.tradeMetaId, true);
                promise.then(function(data) {
                     var selectedValue = '';
                     if($scope.dmRistrictedValues != undefined && $scope.dmRistrictedValues != "null" && data != undefined && data != null){
                        $scope.select.options = defaultManagerSvc.dmRestrictedValue($scope.dmRistrictedValues,data);
                        selectedValue = $scope.defaultvalue;
                      }else{
                        $scope.select.options = data;
                        selectedValue = $scope.defaultvalue;
                      }

                    $element.find("[role=combobox]").addClass('highlightedAsWarning');
                    var item = null;
                    for (var index in $scope.select.options) {
                        var nextitem = $scope.select.options[index];
                        if (nextitem && nextitem.ID && (typeof nextitem.ID === "string" && nextitem.ID.trim() == selectedValue)) {
                            $element.find("[role=combobox]").removeClass('highlightedAsWarning');
                            item = nextitem;
                            break;
                        }else if(nextitem && nextitem.DESCRIPTION && (typeof nextitem.DESCRIPTION === "string" && nextitem.DESCRIPTION.trim() == selectedValue)){
                            $element.find("[role=combobox]").removeClass('highlightedAsWarning');
                            item = nextitem;
                            break;
                        }
                    }
                    if (item != null) {
                        $scope.select.value = item;
                        TradeDropdownSvc.setDropdownSelectedValueId($scope.beanProperty, $scope.select.value);
                        
                        //Not sure since when the default value setting is no longer triggering a change event
                        //so make an explicitly broadcast of the dropdown value change event to deal entry screen.
                        $rootScope.$broadcast('sgeComboBoxValueChanged', {
                              "value": item.ID,
                              "name": $scope.colName,
                              "mapfieldname": $scope.beanProperty
                        });

                        // occasionally it is observed that the valid default value is not shwoing up
                        // in the dropdown on deal entry screen when editing a deal. gives some delay
                        // on ng-model change for the dropdown list to complete rendering. AGN-149883
                        $timeout(function() {
                            $scope.select.value = item;
                            TradeDropdownSvc.setDropdownSelectedValueId($scope.beanProperty, $scope.select.value);
                            $scope.reinitCB++;
                            $scope.fisDisabled = $scope.editlock || $scope.enableDisable;
                        }, 0);
                    } else {
                        if ($scope.select.value == undefined || ($scope.select.value && $scope.select.value.ID && $scope.select.value.ID === "")) {
                           
                            $timeout(function() {
                                if ($scope.select.options && $scope.select.options.length > 0) {
                                    $scope.select.value =null;
   
                                    TradeDropdownSvc.setDropdownSelectedValueId($scope.beanProperty, $scope.select.value);
                                    $scope.reinitCB++;
                                    $scope.fisDisabled = $scope.editlock || $scope.enableDisable;
                                }
                            }, 0);
                        }
                    }

                }, function(error) {
                    $scope.select.options = [];
                    $scope.reinitCB++;
                    $log.debug("Error while fetching dropdown data: " + $scope.beanProperty);
                });
              }

              $scope.handleEvent = function() {
                  if (TradeDropdownSvc.isBeanPropertyInvalid($scope.beanProperty)) {
                          $scope.select.value = null;
                          $scope.select = {
                              options: [{
                                  ID: "",
                                  DESCRIPTION: "Loading...",
                                  displayValue: "Loading..."
                              }]
                          };
                          //this line can be uncommented if we do not wish to show loading . . as selected value
                         // $scope.select.value = $scope.select.options[0];
                      var promise = TradeDropdownSvc.getDropdownData($scope.beanProperty, $scope.tradeMetaId);
                      //var promise = $scope.simulatePromise();
                      promise.then(function(data) {
                          if($scope.restrictedFieldMap != undefined && $scope.restrictedFieldMap[$scope.beanProperty]){
                            $scope.select.options = defaultManagerSvc.processRestrictedValue($scope.restrictedFieldMap[$scope.beanProperty],data);
                          }else{
                            $scope.select.options = data;
                          }
                          $scope.reinitCB++;
                          $element.find("[role=combobox]").removeClass('highlightedAsWarning');
                      }, function(reason) {
                          $timeout(function() {
                             
                             $scope.select.options = [{
                                  DESCRIPTION: "No data......",
                                  displayValue: "No data.......",
                                  ID: "",
                              }];
                              $scope.select.value = $scope.select.options[0];                              
                              $scope.reinitCB++;
                              $log.error(reason);
                          }, 0);
                      });
                  }
              }

              $scope.onDropdownChange = function(selected) {
                if( selected && ( selected.ID === TradeDropdownSvc.getDropdownSelectedValueId($scope.beanProperty) )) return;
                if (typeof selected === "object") {
                      $element.find("[role=combobox]").removeClass('highlightedAsWarning');
                      TradeDropdownSvc.fireDropDownValueChanged($scope.beanProperty, selected, $scope.actionCommand);

                      if (selected == null) {
                          $rootScope.$broadcast('sgeComboBoxValueChanged', {
                              "value": "",
                              "name": $scope.colName,
                              "mapfieldname": $scope.beanProperty
                          });
                      } else {
                          $rootScope.$broadcast('sgeComboBoxValueChanged', {
                              "value": selected.ID,
                              "name": $scope.colName,
                              "mapfieldname": $scope.beanProperty
                          });
                      }
                  }
              };

              $scope.$on('resetDropDownValue', function(event, beanProperty, value, fireEvent) {
                  if (beanProperty == $scope.beanProperty && angular.isDefined(value) && value != null) {
                      if (angular.isDefined($scope.select.options) && $scope.select.options != null && $scope.select.options.length > 0) {
                          for (var i = 0; i < $scope.select.options.length; i++) {
                              if ($scope.select.options[i].ID == value || $scope.select.options[i].DESCRIPTION == value) {
                                  $scope.select.value = $scope.select.options[i];
                                  if (angular.isDefined(fireEvent) && fireEvent === true) {
                                      $scope.onDropdownChange($scope.select.value);
                                  }
                                  else {
                                      TradeDropdownSvc.setDropdownSelectedValueId($scope.beanProperty, $scope.select.value);
                                  }
                                  return;
                              }
                          }
                      }
                  }
              });


              var combobox = $element[0];
              if (angular.isDefined(combobox) && combobox != null) {
                combobox.getValue=function() {
                  if (angular.isDefined($scope.select.value) && $scope.select.value != null) {
                      return $scope.select.value.ID;
                  }
                  return null;
                }
                combobox.setValue=function(value) {
                  if (angular.isDefined($scope.select.options) && $scope.select.options != null && $scope.select.options.length > 0) {
                      for (var i = 0; i < $scope.select.options.length; i++) {
                          if ($scope.select.options[i].ID == value) {
                              $scope.select.value = $scope.select.options[i];
                              TradeDropdownSvc.setDropdownSelectedValueId($scope.beanProperty, $scope.select.value);
                              return;
                          }
                      }
                  }
                }
                combobox.clearSelection=function() {
                  $scope.select.value = null;
                  $scope.reinitCB++;
                  TradeDropdownSvc.setDropdownSelectedValueId($scope.beanProperty, $scope.select.value);
                }
                combobox.getOptionList=function() {
                  return $scope.select.options;
                }
                combobox.disable=function(value) {
                  $scope.fisDisabled = value;
                  $scope.reinitCB++;
                }
              }
          }],
      }
  }]);
