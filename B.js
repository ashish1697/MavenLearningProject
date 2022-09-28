'use strict';
angular.module('riskModule').directive('sgeDealGridTradeDropdown', ['$http', '$q', '$rootScope', 'TradeDropdownSvc', 'dealGridDropDownSvc','dealEntrySvc','dealGridSvc','$timeout', '$log','defaultManagerSvc','sgeDateUtilSvc', function($http, $q, $rootScope, TradeDropdownSvc, dealGridDropDownSvc, dealEntrySvc, dealGridSvc, $timeout, $log,defaultManagerSvc,sgeDateUtilSvc) {

    return {
        template: '<input/>',
        replace: true,
        link: function($scope, element, attrs, controller) {
            var selectValueTimeout;
            $scope.beanProperty = attrs.dgBeanProperty;

            var kendoEditorOptions = $scope['kendoEditorOptions'];

            element.attr('data-bind', "value:" + kendoEditorOptions.field);
            dealGridDropDownSvc.parentScope = $scope;

            var widthValue = 0;
            var templateValue;
            var headerTemplateValue;
            // create clearing "x" button
            var spanElement = document.createElement('span');
            spanElement.setAttribute("unselectable", "on");
            spanElement.setAttribute("class", "k-icon k-i-close");
            spanElement.setAttribute("title", "clear");
            spanElement.setAttribute("role", "button");
            spanElement.setAttribute("tabindex", "-1");

            var displayFields = attrs.dgDataDisplayField.split(",");
            if (displayFields.length >= 1) {
                templateValue = '<table><tr>';
                headerTemplateValue = '<table style="border-bottom:1px solid lightgray; height:25px;"><tr>';
                displayFields.map(function(field) {
                    var fieldValue = '#= ' + field + ' != null ? ' + field + ' : "" #';
                    templateValue = templateValue + '<td width="150px" class="uit-text-nowrap" title="' + fieldValue + '" >' + fieldValue + '</td>';
                    headerTemplateValue = headerTemplateValue + '<td width="150px">&nbsp;&nbsp;<b>' + field + '</b></td>';
                    widthValue = widthValue + 150;
                });
                templateValue = templateValue + '</tr></table>';
                headerTemplateValue = headerTemplateValue + '</tr></table>';
            }

            var loadDropDownData = function(options){
                if($scope.currentSelectedRowUid === kendoEditorOptions.model.uid && kendoEditorOptions !== undefined &&  $scope.dealGrid.isEditable === true && kendoEditorOptions.model.TRADETEMPLATE !== undefined){ 
                    let existingData = getDropDownData()
                    if(existingData!=null && existingData.length > 0){
                        //Set dropdown data if it is already available, it prevents rest call
                        newDataLoaded = true;
                        options.success(existingData);
                    }else{
                        var validRows = [];
                        // Fetch Drop down data
                        var dataPromise= dealGridDropDownSvc.getDropdownDataWithDealSession(kendoEditorOptions.model);
                        dataPromise.then(function(result) {
                            newDataLoaded = true;
                            //Filter out rows where the displayField property is null
                            validRows = _.filter(result, function(row) {
                                return !_.isUndefined(row[comboBoxProps.dataTextField]) && !_.isNull(row[comboBoxProps.dataTextField]);
                            });
                            validRows = setDropDownData(validRows);
                            options.success(validRows);
                        },function(result) {
                            newDataLoaded = true;
                            validRows = [{
                                  DESCRIPTION: "",
                                  ID: "No data......"
                            }]
                            options.success(validRows); 
                        });
                    }
                }
            }
            
            function setDropDownData(data){
                // Sets drop data in Map to prevent rest call using row UID
                data = isRestrictedDropdown(data);
                if(_.isUndefined($scope.dropDownFieldsMap[$scope.currentSelectedRowUid])){
                    $scope.dropDownFieldsMap[$scope.currentSelectedRowUid]={};
                    $scope.dropDownFieldsMap[$scope.currentSelectedRowUid][$scope.beanProperty]=data;
                }else{
                    $scope.dropDownFieldsMap[$scope.currentSelectedRowUid][$scope.beanProperty]=data;
                }
                return data;
            }
            function isRestrictedDropdown(data){
                let templateId = kendoEditorOptions.model.TRADETEMPLATEID || kendoEditorOptions.model.DEALPACKAGEID;
                if(!!dealGridSvc.defaultManagerMap[templateId]){
                    let defaultManger = dealGridSvc.defaultManagerMap[templateId].defaultManager;
                    if(!!defaultManger && !!defaultManger[$scope.beanProperty]){
                        let restrictedValues = defaultManagerSvc.dmRestrictedValues(defaultManger[$scope.beanProperty]);
                        return restrictedValues != null ? defaultManagerSvc.dmRestrictedValue(restrictedValues,data) : data;
                    }
                }   
                return data;
            }
            
            function getDropDownData(){
                let rowuidData = $scope.dropDownFieldsMap[$scope.currentSelectedRowUid];
                return !_.isUndefined(rowuidData) && !_.isUndefined(rowuidData[$scope.beanProperty]) && $scope.beanProperty !== 'tpowFunit' ?rowuidData[$scope.beanProperty]:null;
            }

            $scope.modelInputId = kendoEditorOptions.model.get(attrs.dgFieldName);

            var onDropDownLoad = function(e) {
                let dataItemIdValue = $scope.modelInputId;
                if(newDataLoaded){
                    if (!_.isUndefined(dataItemIdValue) && !_.isNull(dataItemIdValue)) {
                        let index = _.findIndex(this.dataSource.data(), function(item) {
                               return item[attrs.dgDataFieldId] == dataItemIdValue || item["DESCRIPTION"] == dataItemIdValue || item["DESCRIPTION"] == dataItemIdValue.toUpperCase();
                        });
                        if (index >= 0) {
                            this.select(index);
                        }else{
                            kendoEditorOptions.model.set(attrs.dgFieldName,"") ;     
                        }
                    }
                    let that = this;
                    // called to remove highlighted field if data loaded
                    if(!!e.sender.dataSource && !!e.sender.dataSource.data() && !!e.sender.dataSource.data()[0] 
                        && e.sender.dataSource.data()[0].ID !== "No data......"){
                        dealGridDropDownSvc.dropDowInvalidated($scope.beanProperty,false);
                    }

                    selectValueTimeout = $timeout(function() {
                        e.sender.open();
                        that.input.select();
                    });
                    newDataLoaded = false;
                }
            };

            var onDropDownChange = function(e) {
                var selectedItem = this.dataItems()[this.selectedIndex];
                //var text = this.text();
                if (_.isUndefined(selectedItem)) {
                    selectedItem = {};
                }
                //kendoEditorOptions.model.set(attrs.dgFieldName, text);
                //Update changed value
                let selectedValue = selectedItem[dealGridDropDownSvc.getIdOrDescription(kendoEditorOptions.field)];
                kendoEditorOptions.model.set(attrs.dgFieldName, selectedValue);   
                dealGridDropDownSvc.fireDropDownValueChanged(kendoEditorOptions.model)     
                dealGridDropDownSvc.invalidatCommDropDown(kendoEditorOptions.model,$scope.beanProperty,selectedValue);
                if($scope.beanProperty === "tpowFunit"){
                    var parameter={};
                    parameter.funitcode =selectedValue;                                        
                    var futureCodesPromise = dealEntrySvc.getFutureCodes(parameter);
                    futureCodesPromise.then(function(results) {
                        var ddate ={}
                        ddate.uid = kendoEditorOptions.model.uid;
                        ddate.result = results;
                        $rootScope.$broadcast("rowDgFieldChanged",ddate);
                    });   
                }
                //if(kendoEditorOptions.field=="COMPONENT1"||kendoEditorOptions.field=="CPTY"&&kendoEditorOptions.model)
                   //kendoEditorOptions.model.PRECISION = $scope.getGridPrecision(kendoEditorOptions.model.MARKET1,kendoEditorOptions.model.COMPONENT1,kendoEditorOptions.model.CPTY)               
            };
            var newDataLoaded;
            var comboBoxProps = {
                dataValueField: attrs.dgDataFieldId,
                dataTextField: displayFields[0],
                filter: "contains",
                autoBind: true,
                headerTemplate: headerTemplateValue,
                template: templateValue,
                change: onDropDownChange,
                dataBound: onDropDownLoad,
                dataSource: {
                    transport: {
                        read: function(options) {
                            loadDropDownData(options);
                        }
                    }
               }
            }

            var comboBoxControl = element.kendoComboBox(comboBoxProps).data('kendoComboBox');

            comboBoxControl._inputWrapper[0].insertBefore(spanElement, comboBoxControl._inputWrapper[0].lastChild);
            //Binding on-click event with clear 'x' button
            $(spanElement).on("click", function(event) {
                comboBoxControl.value(null);
                comboBoxControl._triggerChange();
            });
            
            comboBoxControl.focus()
            comboBoxControl.list.width(widthValue);
        
            $scope.$on('$destroy', function() {
                if (selectValueTimeout) {
                    $timeout.cancel(selectValueTimeout);
                }
            });
        }
    };
}]);
