'use strict';
//uit-combobox - Grid Editor for Combo, developed using Kendo 
//e.g. <div uit-combobox uit-data='dropDownSvc.findContacts' uit-data-param-business-associate='businessAssociateId' uit-data-param-role-type='roleTypeId' uit-runtime-data='ctrl.getContactsCriteria' uit-model-input-id='contactId' uit-model-input='contactName' uit-data-id-field='contactId' uit-data-display-field='fullName' uit-data-id-field-contact-role-id='contactRoleId'/>
//uit-data-param-{API_PARAM}='{ROW_FIELD_NAME}' where ROW_FIELD_NAME's value will be copied into ROW_FIELD_NAME
//e.g. uit-data-param-business-associate='businessAssociateId'
//uit-data-id-field-{COMBO_MODEL_FIELD}='{ROW_FIELD_NAME}' where COMBO_MODEL_FIELD's value will be copied into ROW_FIELD_NAME
//e.g. uit-data-id-field-contact-role-id='contactRoleId'
angular.module('crossroads').directive('uitCombobox', ['$injector', '$timeout', function($injector, $timeout) {

    function assignValues(attributes, sourceObject, targetObject) {
        var prefix = 'uitDataIdField';
        var otherPrefix = 'uit-data-id-field-';
        if (sourceObject === undefined) {
            throw 'sourceObject must be provided';
        }
        // Filter all object properties for the prefix
        var propertyNames = _.filter(_.keys(attributes), function(property) { return property.substring(0, prefix.length) === prefix; });
        var sourceKeys = _.keys(sourceObject);

        // Add the property values to the target object
        if (propertyNames !== undefined && propertyNames.length > 0) {
            if (targetObject === undefined) {
                throw 'targetObject must be provided';
            }
            angular.forEach(propertyNames, function(propertyName) {
                var fieldName = attributes.$attr[propertyName].substr(otherPrefix.length);
                if (fieldName.indexOf("-") == -1) {
                    var fieldNames = _.filter(sourceKeys, function(property) { return property.toUpperCase() === fieldName.toUpperCase(); });
                    if (fieldNames && fieldNames.length > 0) {
                        fieldName = fieldNames[0];
                        targetObject.set(attributes[propertyName], sourceObject[fieldName]);
                    }
                } else {
                    // truncate the name, throw away the prefix
                    var truncatedName = propertyName.substr(prefix.length);
                    // Adjust the first letter to be lowerCase
                    truncatedName = truncatedName.substring(0, 1).toLowerCase() + truncatedName.substring(1);
                    targetObject.set(attributes[propertyName], sourceObject[truncatedName]);
                }
            });
        }
    }

    // any static value which need to be passed to an API
    function getStaticValueParameters(attributes) {
        var parameters = {};
        var prefix = 'uitDataStaticValue';

        // Filter all object properties for the prefix
        var parameterNames = _.filter(_.keys(attributes), function(property) { return property.substring(0, prefix.length) === prefix; });
        // Add the property values to the target object
        if (parameterNames !== undefined && parameterNames.length > 0) {
            angular.forEach(parameterNames, function(parameterName) {
                // truncate the name, throw away the prefix
                var truncatedName = parameterName.substr(prefix.length);
                // Adjust the first letter to be lowerCase
                truncatedName = truncatedName.substring(0, 1).toLowerCase() + truncatedName.substring(1);
                parameters[truncatedName] = attributes[parameterName];
            });
        }
        return parameters;
    }

    function getDataParameters(attributes, model) {
        var parameters = {};
        var prefix = 'uitDataParam';
        if (model === undefined) {
            return parameters;
        }
        // Filter all object properties for the prefix
        var parameterNames = _.filter(_.keys(attributes), function(property) { return property.substring(0, prefix.length) === prefix; });
        // Add the property values to the target object
        if (parameterNames !== undefined && parameterNames.length > 0) {
            angular.forEach(parameterNames, function(parameterName) {
                // truncate the name, throw away the prefix
                var truncatedName = parameterName.substr(prefix.length);
                // Adjust the first letter to be lowerCase
                truncatedName = truncatedName.substring(0, 1).toLowerCase() + truncatedName.substring(1);
                parameters[truncatedName] = model[attributes[parameterName]];
            });
        }
        return parameters;
    }

    function getRuntimeParams($scope, fnName, model) {
        var dataProvider = $scope.$eval(fnName);
        return dataProvider(model);
    }

    return {
        template: '<input class="pw-widget-combobox"/>',
        replace: true,
        link: function($scope, element, attrs, controller) {
            var selectValueTimeout;

            var kendoEditorOptions = $scope['kendoEditorOptions'];
            var readOnly = $scope.$eval(attrs.uitDisabled, kendoEditorOptions.model);
            if (readOnly) {
                var modelValue = kendoEditorOptions.model.get(kendoEditorOptions.field);
                element.closest('td').html(modelValue);
                return;
            }
            var bindField = attrs.uitBindField;
            if (!_.isEmpty(bindField)) {
                element.attr('data-bind', "value:" + bindField);
            } else {
                element.attr('data-bind', "value:" + kendoEditorOptions.field);
            }
            var comboBoxProps = {
                filter: "contains",
            }

            if (!_.isUndefined(attrs.uitAutoBind) && attrs.uitAutoBind != 'undefined') {
                comboBoxProps.autoBind = attrs.uitAutoBind;
            } else {
                comboBoxProps.autoBind = true;
            }

            // added attribute to set first suggested value in the dropdown
            if (attrs.uitSuggest != undefined) {
                comboBoxProps.suggest = attrs.uitSuggest;
            } else {
                comboBoxProps.suggest = true;
            }

            var widthValue = 0;

            // combo box data display field         

            var templateValue;
            var headerTemplateValue;
            var displayFields = attrs.uitDataDisplayField.split(",");
            if (displayFields.length > 1) {
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

            // if there are multiple display fields then which field should be used to set value in the grid
            if (attrs.uitDataDisplayValueField) {
                comboBoxProps.dataValueField = attrs.uitDataDisplayValueField;
                comboBoxProps.dataTextField = attrs.uitDataDisplayValueField;
            } else if (attrs.uitModelInput) {
                comboBoxProps.dataValueField = displayFields[0];
                comboBoxProps.dataTextField = displayFields[0];
            } else { //This is a case where you dont have description field coming from server in data array
                comboBoxProps.dataValueField = attrs.uitDataIdField;
                comboBoxProps.dataTextField = displayFields[0];
            }

            if (_.isString(attrs.uitHeaderTemplate)) {
                comboBoxProps.headerTemplate = attrs.uitHeaderTemplate;
            } else {
                comboBoxProps.headerTemplate = headerTemplateValue;
            }

            if (_.isString(attrs.uitTemplate)) {
                comboBoxProps.template = attrs.uitTemplate;
            } else {
                if (!_.isUndefined(templateValue)) {
                    comboBoxProps.template = templateValue;
                }
            }
            $scope['uitDataProvider'] = $scope.$eval(attrs.uitData);
            if (!$scope['uitDataProvider']) {
                //This is a service
                $scope['uitSvc'] = attrs.uitData.split(".")[0];
                $scope['uitSvcMet'] = attrs.uitData.split(".")[1];
            }
            var loadData = function() {
                var dataParameters = getDataParameters(attrs, kendoEditorOptions.model);

                var staticValueParameters = getStaticValueParameters(attrs, kendoEditorOptions.model);

                if (staticValueParameters) {
                    dataParameters = angular.extend(dataParameters, staticValueParameters);
                }

                if (attrs.uitRuntimeData) {
                    //In case the data provider is a service
                    var runtimeData = getRuntimeParams($scope, attrs.uitRuntimeData, kendoEditorOptions.model);
                    dataParameters = angular.extend(dataParameters, runtimeData);
                }
                if (!$scope.uitDataProvider) {
                    var service = $injector.get($scope['uitSvc']);
                    return service[$scope['uitSvcMet']](dataParameters);
                } else {
                    if (_.isFunction($scope.uitDataProvider)) {
                        return $scope.uitDataProvider(dataParameters);
                    } else {
                        return $scope.uitDataProvider;
                    }
                }
            }

            var uitPreLoadCallback = $scope.$eval(attrs.uitPreLoadCallback);
            var newDataLoaded;
            comboBoxProps.dataSource = {
                transport: {
                    read: function(options) {
                        var validRows = [];
                        var shouldLoadData = true;
                        if (_.isFunction(uitPreLoadCallback)) {
                            shouldLoadData = uitPreLoadCallback(kendoEditorOptions.model);
                        }
                        if (shouldLoadData) {
                            var dataPromise = loadData();
                            //It is not an asynch call
                            if (dataPromise.$promise) {
                                newDataLoaded = true;
                                //Filter out rows where the displayField property is null
                                validRows = _.filter(dataPromise, function(row) {
                                    return !_.isUndefined(row[comboBoxProps.dataTextField]) && !_.isNull(row[comboBoxProps.dataTextField]);
                                });
                                options.success(validRows);
                            } else if (Array.isArray(dataPromise)) {
                                newDataLoaded = true;
                                //Filter out rows where the displayField property is null
                                validRows = _.filter(dataPromise, function(row) {
                                    return !_.isUndefined(row[comboBoxProps.dataTextField]) && !_.isNull(row[comboBoxProps.dataTextField]);
                                });
                                options.success(validRows);
                            } else {
                                dataPromise.then(function success(result) {
                                    newDataLoaded = true;
                                    //Filter out rows where the displayField property is null
                                    validRows = _.filter(result, function(row) {
                                        return !_.isUndefined(row[comboBoxProps.dataTextField]) && !_.isNull(row[comboBoxProps.dataTextField]);
                                    });
                                    options.success(validRows);
                                });
                            }
                        } else {
                            options.success(validRows);
                        }
                    }
                }
            };

            $scope.modelInputId = kendoEditorOptions.model.get(attrs.uitModelInputId);


            comboBoxProps.dataBound = function(e) {
                var dataItemIdValue = $scope.modelInputId;
                if (newDataLoaded) {
                    if (!_.isUndefined(dataItemIdValue) || !_.isNull(dataItemIdValue)) {
                        var index = _.findIndex(this.dataSource.data(), function(item) {
                            return item[attrs.uitDataIdField] == dataItemIdValue;
                        });

                        //Default value from model
                        if (index >= 0) {
                            this.select(index);
                        }
                    }

                    var that = this;
                    if (_.isUndefined(templateValue)) {
                        $(this.items()).each(function(index, item) {
                            var toolTip = that.dataSource.data()[index][attrs.uitDataDisplayField];
                            $(item).attr("title", toolTip);
                        });
                    }

                    // select the value in dropdown when tabbed
                    selectValueTimeout = $timeout(function() {
                        e.sender.open();
                        that.input.select();
                    });

                    newDataLoaded = false;
                }
            };

            var uitChangeCallback = $scope.$eval(attrs.uitChangeCallback);

            comboBoxProps.change = function(e) {
                var selectedItem = this.dataItems()[this.selectedIndex];
                var text = this.text();
                if (!_.isUndefined(selectedItem)) {
                    assignValues(attrs, selectedItem, kendoEditorOptions.model);
                } else {
                    selectedItem = {};
                }
                kendoEditorOptions.model.set(attrs.uitModelInput, text);
                kendoEditorOptions.model.set(attrs.uitModelInputId, selectedItem[attrs.uitDataIdField]);

                if (_.isFunction(uitChangeCallback)) {
                    uitChangeCallback.call($scope, selectedItem, kendoEditorOptions.model);
                }
            };

            // creating control
            var comboBoxControl = element.kendoComboBox(comboBoxProps).data('kendoComboBox');

            // adding clearing "x" button
            var spanElement = document.createElement('span');
            spanElement.setAttribute("unselectable", "on");
            spanElement.setAttribute("class", "k-icon k-i-close");
            spanElement.setAttribute("title", "clear");
            spanElement.setAttribute("role", "button");
            spanElement.setAttribute("tabindex", "-1");
            comboBoxControl._inputWrapper[0].insertBefore(spanElement, comboBoxControl._inputWrapper[0].lastChild);
            $(spanElement).on("click", function(event) {
                comboBoxControl.value(null);
                comboBoxControl._triggerChange();
            });

            comboBoxControl.focus();

            if (attrs.uitListWidth) {
                comboBoxControl.list.width(attrs.uitListWidth);
            } else if (widthValue > 0) {
                comboBoxControl.list.width(widthValue);
            }

            $scope.$on('$destroy', function() {
                if (selectValueTimeout) {
                    $timeout.cancel(selectValueTimeout);
                }
            });
        }
    };
}]);
