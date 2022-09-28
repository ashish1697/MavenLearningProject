
angular.module('riskModule').service('TradeDropdownSvc', ['$q', '$http', '$rootScope', function($q, $http, $rootScope) {
    //Static dependencies to prevent a rest call.
    //IMPORTANT : Update the map as per updted in the ZainetFieldDependencies.xml
    var self = this;
    var dependeeToDependentMap = {   
        "TpowUnit2": ["TpowUnit", "TpowLoc"],
        "TpowProvisionid": ["TradeManum", "TpowBs"],
        "TradeScsched": ["TradeSales", "TradeScomm"],
        "TpowAdhocdays": ["TradeManum"],
        "TradeBookDesc": ["LegalEntity", "TradeBook"],
        "RetailProfile": ["TpowEnddate", "TpowStartdate"],
        "Lossflag": ["ToggleDefaultMode"],
        "TpowContact": ["TradeCpty"],
        "TpowFirm": ["TpowFixpset"],
        "TpowHdayloc": ["TradeTrdtyp", "TpowLoc", "TpowHdaymkt"],
        "TpowPeriod": ["IsTimeBandFormula", "TpowUnit", "TpowLoc"],
        "TpowLossloc": ["TpowLossmkt"],
        "TpowUnitprem": ["TpowUnit2", "TpowUnit", "currCompType", "TpowLoc"],
        "TradeCcsched": ["TradeCpty", "TradeCcomm"],
        "InterContract": ["TradeCpty", "TradeBook"],
        "TpowTransco": ["TpowIdxmkt", "TpowIdxloc", "TpowMkt", "TpowLoc"],
        "TpowFix2sche": ["TpowIdxloc", "TpowIdxflag"],
        "TpowPeriodprem": ["TpowLoc"],
        "EmissionsCptyAcctId": ["TradeCpty", "EmissionsCptyCountry", "EmissionsCptyRegion", "TradeBook"],
        "TpowMkt": ["TradeTrdtyp", "TpowTradetype"],
        "IndexPricedMarket": ["TpowMkt", "TpowLoc"],
        "EfpFuture": ["TpowIdxmkt", "TpowIdxloc"],
        "TpowIdxmkt": ["TradeTrdtyp", "TpowIdxflag", "currCompType"],
        "IndexPricedComp": ["IndexPricedMarket", "TpowMkt", "TpowLoc"],
        "TradeManum": ["TradeTdate", "TpowDates", "TpowSubtype", "TpowDatee", "TradeCpty", "TpowContracttype", "TpowOpt1type", "TradeBook"],
        "EmissionsOurAcctId": ["TradeBook", "EmissionsOurCountry", "EmissionsOurRegion"],
        "TpowOpt1extype": ["TpowFix2sche", "TpowOpt1type"],
        "TpowFixsche": ["TpowLoc"],
        "TpowoptStrikeloc": ["TpowoptStrikemkt"],
        "TradeBook": ["LegalEntity", "TradeBook"],
        "BlockTimeband": ["TimebandGroup"],
        "TradeBcsched": ["TradeBcomm", "TradeBro"],
        "TpowLoc": ["TradeTrdtyp", "TpowTradetype", "TpowMkt"],
        "InterContact1": ["TradeBook"],
        "InterContact2": ["TradeBook"],
        "Timeband": ["TimebandGroup"],
        "TpowAdhocperiod": ["TradeManum"],
        "TpowFunit": ["TpowMkt", "TradeTdate", "TpowIdxloc", "TpowOpt1type", "TpowLoc"],
        "TradeCpty": ["InterBookDTO.InterLegalEntity"],
        "TpowOpt1model": ["TpowOpt1type", "TpowFixsche"],
        "TpowScomp2": ["TpowIdxmkt", "TpowIdxloc", "TpowCcy"],
        "TradeCptyDesc": ["InterBookDTO.InterLegalEntity"],
        "TpowUnit": ["IsTimeBandFormula", "TpowLoc"],
        "TpowHdaymkt": ["TradeTrdtyp", "TpowMkt"],
        "TpowIdxloc": ["TpowIdxmkt", "TradeTrdtyp", "TpowIdxflag", "TpowLoc"],
        "TpowScomp1": ["TpowMkt", "TpowLoc"],
        "TpowContact2": ["TradeCpty"],
        "TPOWAUX_CPBALGRP": ["TpowMkt", "TradeBook", "TradeCpty", "TpowIdxmkt", "TpowBs"],
        "TPOWAUX_LEBALGRP": ["TpowMkt", "TradeBook", "TradeCpty", "TpowIdxmkt", "TpowBs"],
        "Compdesc1": ["TradeTrdtyp", "TpowTradetype", "TpowMkt"],
        "Compdesc2": ["TpowIdxmkt", "TradeTrdtyp", "TpowIdxflag", "TpowLoc"]

    };


    self.dependeeToDefaultMap = {
        "tradeCpty": ["tpowInvprec"],
        "tpowLoc": ["tpowInvprec", "tpowUnit", "tpowUnit2", "tpowPeriod", "tpowCcy", "tpowPeriodprc","TpowFixsche"],
        "tpowIdxloc": ["tpowInvprec","TpowFix2sche"]
    };
    // service variables
    var invalidBeanProperties = [];
    var dealSession = null;
    var callBackMap = {};
    var dropDownMap = {};

    this.reset = function() {
        while (invalidBeanProperties.length > 0) {
            invalidBeanProperties.pop();
        }
        dealSession = null;
        for (var member in callBackMap) {
            delete callBackMap[member];
        }
        for (var member in dropDownMap) {
            delete dropDownMap[member];
        }


    }

    //Data structure for a drop down.
    var SgeDropDown = function(beanProp, selectedVal, defaultVal, invalidatedMethodCallback, defaultUpdateCallbackRef, enableDisableCallbackRef,dropDownReinitMethodCallback) {
        var isInvalidated = false;
        var beanProperty = beanProp;
        var defaultValue = {
            ID: defaultVal
        };
        var selectedValue = selectedVal ? selectedVal : defaultValue;
        var oldValue = null;
        var invalidatedCallback = invalidatedMethodCallback;

        var dependentMap = self.getDependentMap(beanProperty);
        var dependeeMap = self.getDependeeMap(beanProperty);
        var defaultUpdateCallback = defaultUpdateCallbackRef;
        var enableDisableCallback = enableDisableCallbackRef;

        var validateSelf = function() {
            var index = invalidBeanProperties.indexOf(beanProperty);
            if (index > -1) {
                invalidBeanProperties.splice(index, 1);
            }
            return index;
        }

        return {
            getSelectedValue: function() {
                return selectedValue;
            },
            setSelectedValue: function(selected, updateDOM) {
                oldValue = selectedValue;
                selectedValue = selected;
                if (updateDOM && selected && selected.ID) {
                    defaultUpdateCallback(selected);
                    validateSelf();
                }
            }, 
            getDefaultValue: function() {
                return defaultValue;
            },
            getOldValue: function() {
                return oldValue;
            },
            invokeInvalidatedCallback: function() {
                invalidatedCallback();
            },
            isDropdownInvalidated: function() {
                return isInvalidated;
            },
            setDropdownInvalidated: function(invalidated) {
                isInvalidated = invalidated;
            },
            getDependents: function() {
                return dependentMap;
            },
            getDependees: function() {
                return dependeeMap;
            },
            enableDisableDropDown: function(value) {
                enableDisableCallback(value);
            },
            invokeReinitMethodCallback : function(){
            	return dropDownReinitMethodCallback();
            }
        };
    }

    //API to get the dependent fields for a bean propertiess
    self.getDependentMap = function(beanProperty) {
        var capitalizedBeanProperty = beanProperty[0].toUpperCase() + beanProperty.slice(1);
        var dependentData = [];

        angular.forEach(dependeeToDependentMap, function(value, key) {
            angular.forEach(value, function(v, k) {
                if (v === capitalizedBeanProperty) {
                    var smallBeanProp = key[0].toLowerCase() + key.slice(1);
                    dependentData.push(smallBeanProp);
                    return;
                }
            });
        });
        var dependents = [];
        if (dependentData != undefined) {
            dependents = $.map(dependentData, function(value, index) {
                return [value[0].toLowerCase() + value.slice(1)];
            });
        }
        return dependents;
    }

    self.getDependeeMap = function(beanProperty) {
        var capitalizedBeanProperty = beanProperty[0].toUpperCase() + beanProperty.slice(1);
        var dependeeMap = dependeeToDependentMap[capitalizedBeanProperty];
        var dependees = [];
        if (dependeeMap != undefined) {
            dependees = $.map(dependeeMap, function(value, index) {
                return [value[0].toLowerCase() + value.slice(1)];
            });
        }
        return dependees;
    }

    this.updateDealInServer = function(zkey) {
        var dealSession = this.dealSession;
        var deferred = $q.defer();
        var promise = $http({
            method: 'GET',
            url: "restapi/trade/updateDeal/" + zkey,
            headers: {
                'dealSession': dealSession
            },
            transformResponse: undefined
        }).then( function onSuccess(resp){
            var data = resp.data;
            console.log('Deal updated in TRM server for zkey ' + zkey + ' with deal session ' + dealSession);
            deferred.resolve(data);
        }, function onError(resp){
            var error = resp.data;
            console.error("Error updating deal with deal session " + dealSession + " for zkey " + zkey);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    this.getDropdownData = function(beanProperty, tradeMetaID, firstLoad) {
        var deferred = $q.defer();

        var dropDown = dropDownMap[beanProperty];
        var dependentData = {};
        var rejected = false;

        try {
            angular.forEach(dropDown.getDependees(), function(value, key) {
                var beanProp = value[0].toLowerCase() + value.slice(1);
                if (invalidBeanProperties.indexOf(value) > -1) {
                    throw BreakException
                } else {
                    if(beanProperty == "tpowFunit" && value == "tradeTdate"){
                        if($("#TRADE_TDATE")[0]!= undefined || $("#TRADE_TDATE")[0] != null){
                            dependentData[beanProp] = moment( $("#TRADE_TDATE")[0].value).format("YYYY-MM-DD");
                        }                        
                    }else{
                        var beanVal = dropDownMap[beanProp] ? dropDownMap[beanProp].getSelectedValue() : undefined;
                        if (firstLoad && beanVal == null && beanVal == undefined) {
                            beanVal = dropDownMap[beanProp] ? dropDownMap[beanProp].getDefaultValue() : undefined;
                        }
                        if (beanVal != null && beanVal != undefined && beanVal && beanVal.ID != "") {
                            dependentData[beanProp] = beanVal["ID"];
                        }
                    }
                }
            });
        } catch (e) {
            //Return empty array
            deferred.reject([]);
            rejected = true;
        }
        if (!rejected) {
            if (this.dealSession == null) {
                var dropDownData = [];
                deferred.resolve(dropDownData);
                return deferred.promise;
            }
            var getUrl = 'restapi/trademdata/filterview/' + beanProperty;

            var request = {
                    method: 'GET',
                    url: getUrl,
                    headers: {
                        'dealSession': this.dealSession
                    },
                    params: dependentData
                }
                // $http.get(url).then( function onSuccess(resp){
            //var data = resp.data;
            //var status = resp.status;
            $http(request).then( function onSuccess(resp){
                var data = resp.data;
                var status = resp.status;
                //Just return array of view entities
                var dropDownData = $.map(data.mapList, function(value, index) {
                    return [value];
                });
                var skipSort = false;
                if(beanProperty === "tpowFunit"){
                    skipSort = true;
                    if(dependentData.tpowLoc== undefined || dependentData.tpowLoc == null){
                        dropDownData = [];
                    }
                }
                self.cleanupJson(dropDownData,skipSort);
                if (dropDownData.length > 0) {
                    var index = invalidBeanProperties.indexOf(beanProperty);
                    if (index > -1) {
                        invalidBeanProperties.splice(index, 1);
                    }
                    deferred.resolve(dropDownData);
                } else {
                    invalidateDependents(beanProperty, null, null);
                    invalidateSelf(beanProperty);
                    deferred.reject([]);
                }

            }, function onError(resp){
                var data = resp.data;
                var status = resp.status;
                invalidateDependents(beanProperty, null , null);
                invalidateSelf(beanProperty);
                deferred.reject(data);
            });
        }
        return deferred.promise;
    };

    this.registerDropdown = function(beanProp, selectedVal, defaultVal, invalidatedMethodCallback, defaultUpdateCallback, enableDisableCallback,dropDownReinitMethodCallback) {
        var dropDown = SgeDropDown(beanProp, selectedVal, defaultVal, invalidatedMethodCallback, defaultUpdateCallback, enableDisableCallback,dropDownReinitMethodCallback);
        dropDownMap[beanProp] = dropDown;
    }

    function invalidateDependents(beanProperty, selected,actionCommand) {
        var dropDown = dropDownMap[beanProperty];
        var dependents = dropDown.getDependents();
        for (var index = 0; index < dependents.length; index++) {
            var dependentBeanProperty = dependents[index];
            if (!(dependentBeanProperty in dropDownMap)) {
                var capitalizedBeanProperty = dependentBeanProperty[0].toUpperCase() + dependentBeanProperty.slice(1);
                if (capitalizedBeanProperty in dropDownMap) {
                    dependentBeanProperty = capitalizedBeanProperty;
                }
            }
            if (dependentBeanProperty in dropDownMap && dependentBeanProperty !== beanProperty) {
                if (invalidBeanProperties.indexOf(dependentBeanProperty) <= -1) {
                    var dependentDropdown = dropDownMap[dependentBeanProperty]
                    let isDependentBeanPropertyValid = isDependentPropertyValid(dependentDropdown,selected,actionCommand);
                    /*AGN-219546 
                    * isDependentBeanPropertyValid flag will check whether field has valid default value and not update Deal operation
                    * If bean property value changed, it will invalidate all dependent fields
                    */
                    if(!isDependentBeanPropertyValid){
                      invalidBeanProperties.push(dependentBeanProperty);  
                    }
                    let actionCmd = selected == null?actionCommand:0;
                    invalidateDependents(dependentBeanProperty, null, actionCmd);

                    dependentDropdown = dropDownMap[dependentBeanProperty];
                    isDependentBeanPropertyValid = isDependentPropertyValid(dependentDropdown,selected ,actionCommand);
                    if(!isDependentBeanPropertyValid){
                        dependentDropdown.invokeInvalidatedCallback();
                    }
                }
            }
        };
    };

    //AGN-219546 
    function isDependentPropertyValid(dropDown,selected,actionCommand){
       let defaultValue = dropDown.getDefaultValue();
       return (!_.isUndefined(defaultValue) || !_.isEmpty(defaultValue)) && selected == null && (actionCommand == 3 ||  actionCommand == 2);
    }

    this.fetchDefaultValues = function(propertyList, valueMap) {
        self = this;
        var getUrl = 'restapi/trademdata/defaultValues';
        var request = {
                method: 'GET',
                url: getUrl,
                headers: {
                    'dealSession': this.dealSession,
                    'propertyList': propertyList
                },
                params: valueMap
            }
            // $http.get(url).then( function onSuccess(resp){
        //var data = resp.data;
        //var status = resp.status;
        $http(request).then( function onSuccess(resp){
            var data = resp.data;
            var status = resp.status;
            for (var key in data) {
                if (key === "tpowInvprec") {
                    var resultMap = {};
                    resultMap["precision"] = data[key];
                    $rootScope.$broadcast('fetchDefaultValuesEvent', resultMap);
                } else {
                    if (key === "tpowCcy" || key === "tpowUnit") {
                        var resultMap = (key === "tpowCcy") ? {
                            "tpowCcy": data["tpowCcy"]
                        } : {
                            "tpowUnit": data["tpowUnit"]
                        };
                        $rootScope.$broadcast('fetchPremiumDefaultsEvent', resultMap);
                    }
                    // ONLY UPDATE WHEN CURRENT VALUE IS NOT NULL
                    //if (self.getDropdownSelectedValueId(key) == null)
                    if (data[key] && String(data[key]).trim().length >0 // there is an actual value to set
                    	&& dropDownMap && dropDownMap[key] &&  (! ( dropDownMap[key].getDefaultValue() && dropDownMap[key].getDefaultValue().ID)||self.isEditOrClone()) )  // current selection is actually null
                    	self.setDefaultDropdownSelectedValueId(key, self.getdefaultViewObject(data[key]));
                    else// set the current value back again just for having the value highlighted
                    	self.setDefaultDropdownSelectedValueId(key, self.getdefaultViewObject(self.getDropdownSelectedValueId(key)));
                    
                    if(key === "TpowFixsche" || key === "TpowFix2sche"){
                        var value= data[key];
                        key= key.charAt(0).toLowerCase()+ key.slice(1);
                        data[key]=value;
                        if (data[key] && String(data[key]).trim().length >0 // there is an actual value to set
                        && dropDownMap && dropDownMap[key] && ( dropDownMap[key].getDefaultValue() && dropDownMap[key].getDefaultValue().ID) )  // current selection is actually null
                            self.setDefaultDropdownSelectedValueId(key, self.getdefaultViewObject(data[key]));

                    }
                }
            }
        }, function onError(resp){

        var data = resp.data;

        var status = resp.status;

        });
    }

    this.setEditOrClone =function(status){
       this.isOnEditMode =status;
    }

    this.isEditOrClone=function(){
        return this.isOnEditMode;
    }

    this.isBeanPropertyInvalid = function(beanProperty) {
        var index = invalidBeanProperties.indexOf(beanProperty);
        if (index > -1)
            return true;
        return false;
    }

    this.setDealSession = function(dealSession) {
        this.reset();
        this.dealSession = dealSession;

    }

    this.setDealSessionNoReset = function (dealSession){
    	this.dealSession = dealSession;
    	for (var member in dropDownMap){
			dropDownMap[member].invokeReinitMethodCallback();
		}
    }

    this.fireDropDownValueChanged = function(beanProperty, selectedItem, actionCommand) {
        //Update the changed value.
        var dropDown = dropDownMap[beanProperty];
        dropDown.setSelectedValue(selectedItem, false);
        //Invalidate dependents
        var action = angular.copy(actionCommand);
        if(beanProperty === 'ibBook') 
            beanProperty = 'tradeBook';
        else if(beanProperty === 'ibCpty') 
            beanProperty = 'tradeCpty';
        invalidateDependents(beanProperty, selectedItem, action);
        if (self.dependeeToDefaultMap[beanProperty] != undefined && (selectedItem != null && selectedItem.ID != "")) {
            var valueMap = [];
            valueMap[beanProperty] = selectedItem.ID;
            this.fetchDefaultValues(self.dependeeToDefaultMap[beanProperty], valueMap);
        }
    }

    this.getDropdownSelectedValueId = function(beanProperty) {
        var dropDown = dropDownMap[beanProperty];
        if (dropDown != undefined) {
            return dropDown.getSelectedValue() ? dropDown.getSelectedValue()["ID"] : null;
        }
        return null;
    }

    this.getDropdownSelectedValue = function(beanProperty) {
        var dropDown = dropDownMap[beanProperty];
        if (dropDown != undefined) {
            return dropDown.getSelectedValue() ? dropDown.getSelectedValue() : null;
        }
        return null;
    }


    this.getdefaultViewObject = function(viewData) {
        var obj = {};
        if (viewData != null) {
            obj.ID = viewData;
        }
        return obj
    }


    this.setDropdownSelectedValueId = function(beanProperty, value) {
        var dropDown = dropDownMap[beanProperty];
        if (dropDown != undefined) {
            return dropDown.setSelectedValue(value, false);
        }
    }

    this.setDefaultDropdownSelectedValueId = function(beanProperty, value) {
        var dropDown = dropDownMap[beanProperty];
        if (dropDown != undefined) {
            return dropDown.setSelectedValue(value, true);
        }
    }

    function invalidateSelf(beanProperty) {
        if (invalidBeanProperties.indexOf(beanProperty) <= -1 && beanProperty in dropDownMap) {
            invalidBeanProperties.push(beanProperty);

            var dropDown = dropDownMap[beanProperty];
            dropDown.invokeInvalidatedCallback();
        }
    }

    self.cleanupJson = function(items,skipSort) {
        mapKeysToUpperCase(items);
        if (items != null && items.length > 0) {
            if (angular.isDefined(items[0].TYPE)) {
                items.sort(function(a, b) {
                    if (a.TYPE !== null && b.TYPE !== null) {
                        try {
                            return a.TYPE.localeCompare(b.TYPE);
                        } catch (err) {
                            return 0;
                        }
                    } else {
                        return -1;
                    }
                });
            } else {
                if(!(skipSort && skipSort === true)){
                    items.sort(function(a, b) {
                        if (a.ID !== null && b.ID !== null) {
                            try {
                                return a.ID.localeCompare(b.ID);
                            } catch (err) {
                                return 0;
                            }
                        } else {
                            return -1;
                        }
                    });
                }
            }
            for (var f in items) {
                if (angular.isDefined(items[f].DISPLAYVALUE) && items[f].DISPLAYVALUE != null) {
                    items[f].displayValue = items[f].DISPLAYVALUE;
                } else {
                    if (!angular.isDefined(items[f].ID) || items[f].ID === null) {
                        items[f].ID = "";
                    }

                    //AGN-220571
                    if (!angular.isDefined(items[f].DESCRIPTION) || items[f].DESCRIPTION === null || _.isEmpty(items[f].DESCRIPTION)) {
                        items[f].DESCRIPTION = items[f].ID;
                    }
                    // AGN-207151 - Removed 30 characters length restriction and trim the descriptioon
                    // else if (items[f].DESCRIPTION.length > 30) {
                    else if(typeof items[f].DESCRIPTION === "string"){
                        var sliced = items[f].DESCRIPTION.trim();
                        items[f].DESCRIPTION = sliced;
                    }
                    var tmpDisplayValue = items[f].ID + " - " + items[f].DESCRIPTION;
                    items[f].displayValue = tmpDisplayValue;
                }
            }
        }

        return items
    }

    // Upper-case the keys in the corresponding map
    function mapKeysToUpperCase(dataMap) {
        for (var i = 0; i < dataMap.length; i++) {
            var getKey = dataMap[i];
            for (var key in getKey) {
                var temp;
                if (getKey.hasOwnProperty(key)) {
                    temp = getKey[key];
                    delete getKey[key];
                    getKey[key.toUpperCase()] = temp;
                }
            }
            dataMap[i] = getKey;
        }
        return dataMap;
    }

    this.getAllTemplateDefaults = function() {
        var screenDropDowns = $.map(dropDownMap, function(value, index) {
            return index;
        })
        if (screenDropDowns != undefined) {
            var valueMap = [];
            for (var index in screenDropDowns) {
                var dropDown = screenDropDowns[index];
                var dropDownDefaultValue = dropDownMap[dropDown] ? dropDownMap[dropDown].getDefaultValue() : undefined;
                if (dropDownDefaultValue != undefined && dropDownDefaultValue && dropDownDefaultValue.ID != "") {
                    valueMap[dropDown] = dropDownDefaultValue.ID;
                }
            }
        }
        this.fetchDefaultValues(screenDropDowns, valueMap);
    }

    this.enableDisableDependent = function(properties) {
        if (properties != undefined) {
            angular.forEach(properties, function(value, key) {
                var dropDown = dropDownMap[key];
                if (dropDown != undefined) {
                    dropDown.enableDisableDropDown(value);
                }
            });
        }
    }
    this.clearTradeDropDown = function(beanProp){
        var element = $("[bean-property="+beanProp+"]");
        element.find("[role=combobox]").addClass('highlightedAsWarning')
        let ibField = angular.element(element).scope();
        ibField.select.value = null;
    }

}]);
