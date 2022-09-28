/**

Grid control wrapper for kendo Grid control
This wrapper inttends to give Aligne Dev Group to have 100% control of how the kendo grid is used.  It avoids creating unnecesary angular scopes per row
performing better than fis-grid

Note: Document all changes and all code that is not documented, this is a common library and many people may interact with it.  Get approval to modifications 
and make sure : Tapas, Fernando, Sohan, Arpit, Bhagyesh and Paul are notified of new requirements or bugs.

Structure of this comments:

Directive Attributes  
Directive Callbacks or Handler functions

Grid Controllers access



@class uitGrid
@type directive

@prop {string}      uit-grid                - This can be the element
@prop {string}      uit-grid-control-var    - Name of the controller we want the uitgrid to add to our scope so we interact with it.
@prop {object}      set-grid-settings       - Set preferences
@prop {number}      uit-controller-level    - Scopes above the uit-grid we want the grid controller to be placed at.  1 is parent scope, don't forget fis-panel is a directive and creates an extra level
@prop {function}    uit-data                - Function returning the grid's source data.  IMPORTANT: It currently support only a PROMISE if is ana array wrap in a promise
@prop {string}      uit-selection-mode      - "multiple" or "row"
@prop {string}      uit-context-menu-id     - Unique of the defined context menu this is used to match the uit grid with the context menu
@prop {string}      uit-editable            - Creates the grid in edit mode or read only mode
@prop {string}      uit-kendo-control       - Name of property to be added to the grid controller to access the kendo grid control directly.   Example: set ... <uit-grid uit-kendo-control="gridObject".... then in controller use like   ctrl.myGridCtrl.gridObject  
@prop {boolean}     uit-grid-enable-sorting - Enable disable sorting for the whole grid
@prop {object|array}        uit-Grid-Aggregate-Options - Gets or sets the aggregate configuration, look for kendo datasource.aggregate for more info.
@prop {boolean}     uit-grid-paging         - if true will add a pager to the grid, by default virtual paging is enabled if supported
@prop {string}      uit-grid-page-size      - size of each page
@prop {string}      uit-grid-page-sizes     - will display a dropdown so the user can select the desired size for paging.
@prop {objecvt}     uit-grid-change-handler - This is not just a handler but an object with mulitple handlers: 
                                                    {dependents: {
                                                     col1: function(currentRow, kendoModel, oldValue) {
                                                            ctrl.categoryChanged(kendoModel['col1'], kendoModel);
                                                     },
                                                     col2: function(currentRow, kendoModel, oldValue) {
                                                            ctrl.category2Changed(kendoModel['col2'], kendoModel);
                                                     }}}
@prop {boolean}     uit-grid-move-footer    - Move will move the footer to the top instead of default bottom
@prop {boolean}     uit-select-on-update    - Will auto select a row if cell is edited by the user, preparing the row to be 'posted'
@prop {boolean}     uit-a5-user-time-zone   - Default is false, when true it will call the format and editor to apply date ofsetting when the timezone of browser is different than the one of the preference.  Needs to be true (most time) for gas, gas common, gas operations and false all others.
@prop {string}      uit-edit-existing-row   - Used for Security Implementation of CRUD, to handle edit and new independently
==========================================================

@prop {function} uit-select-on-row-nav      - Name of event handler function callback called when navigating to a row as the result of clicking on it, (or arrow nav when in future)
@prop {function} uit-on-row-navigation      - Name of event handler function called when row is set as current row by navigating to it.
@prop {function} uit-grid-row-selection-change  - Name of event handler function called when row selection has changed, function is callbacke passing 'selected rows' array
@prop {function} uit-grid-row-click-handler     - Name of event handler function called when row is been clicked, this can be used for reacting to clicks on action columsn with icons etc.
@prop {function} uit-grid-row-edit-handler      - Name of event handler function called when row is edited, this can be used to disable fields conditionally.
@prop {function} uit-data-source-bound-handler  - Name of event handler function called when rows on the screen are 'rendered', this comes from the dataBound of kendo grid is not only fired when finsihed loading the whole data but when the grid 'view' is refreshed.
@prop {function} uit-context-menu-open-event    - Name of event handler function called when the content menu is about to be opened, this allows updating the context menu to reflect functions pertaining the current row.  You can combine with getCurrentRowData
@prop {function} uit-on-filtering               - Sript angular evaluated when filtering is triggered, Note that is not just the name of the function but the actual call.  example: uit-on-filtering="filteringEvent()"
@prop {function} uit-grid-footer-event          - Name of event handler function called when totals are calculated and gives user the chance to OVERRIDE those values, parameters the handler receives: mapOfFooterValues, footerObj
@prop {function} uit-grid-edit-handler          - Name of event handler function fired when the user edits or creates a data item,  parametes handler receives: event, fieldName
@prop {function} uit-sort-callback              - Name of event handler called when the data is sorted, not parameters passed
@prop {function} uit-grid-navigation        - Name of event handler function called when navigating to row and column by selection, tabbing/arrow key press, function is callback passing 'selected row and column details'

=========================================================
Grid Controller Access Functions, search for the actual function to read the documentations

setMetaData,
setColumns,
setSchema,
createGrid,
setEditable,
getEditorTemplate: getEditorTemplate,
getFieldType,

// User Preferences                  
getGridSettings,
setGridSettings,
retainSettings,
editExistRow,
// Grid Functions                       
setGridDimensions, // Don't set dimentions on the grid but only on the parent container taking advantage of a container set to 100% then grid will automatically size
resize,
refresh,
hasChanges,
getFieldName,
enablePaging,
disablePaging,
getAllData,
isPagingEnabled,
isGridCreatedWithPaging,
getPagingOption,
positionPager,

// Selection                        
getSelectedData,
selectRowsByColumnValue,
selectRowsByFilterFunction,
selectRow,
addRowInError,
markRow,
unmarkRow,

// Fiters
applyFilter,
clearFilter,

// CRUD
add,
addRows,
cancelSelectedRows,
cancelCurrentRow,
markForDelete,
cloneRow,

// Export-Import
importData,
exportData,

cleanUp,
clearGridData,
showHideColumns,
getFilteredData,
getCurrentRowData,
highlightRow,
removeRowHighlight,
getKendoControl,
getKendoContextMenuControl,
isEditable,
getDirtyRows,
setCurrentRow

*/

'use strict';
angular.module('crossroads').directive('uitGrid', ['$filter', '$parse', 'fisI18nService', '$timeout', '$compile', 'fisPubSubService', 'fisDateTimeFormatService', 'uitComponentSvc', 'fisEditorFactory', '$log', '$q', '$interpolate', 'AligneWebUtilityService', 'ALIGNEWEB_DATE_TIME_CONSTANTS', 'uitViewPreferencesSvc', '$route', 'ALIGNE_EVENT_CONSTANTS',
    function($filter, $parse, fisI18nService, $timeout, $compile, fisPubSubService, fisDateTimeFormatService, uitComponentSvc, fisEditorFactory, $log, $q, $interpolate, AligneWebUtilityService, ALIGNEWEB_DATE_TIME_CONSTANTS, uitViewPreferencesSvc, $route, ALIGNE_EVENT_CONSTANTS) {

        var a5UserTimeZoneForModule = false;

        var uncamelcase = $filter('uncamelcase');

        // class for alignment datatypes
        var right = {
            'class': 'datatype-align-right'
        };

        var left = {
            'class': 'datatype-align-left'
        };

        var center = {
            'class': 'datatype-align-center'
        };
        var typeMapping = {
            'integer': {
                format: '{0:n}',
                precision: 0,
                schemaType: {
                    type: 'number'
                },
                attributes: right,
                headerAttributes: center,
                maxPrecision: 0
            },
            'double': {
                format: '{0:n}',
                precision: 2,
                schemaType: {
                    type: 'number'
                },
                attributes: right,
                headerAttributes: center
            },
            'string': {
                format: '{0}',
                schemaType: {
                    type: 'string'
                },
                attributes: left,
                headerAttributes: center
            },
            'currency': {
                format: '{0:c}',
                precision: 2,
                schemaType: {
                    type: 'number'
                },
                attributes: right,
                headerAttributes: center
            },
            'percentage': {
                format: '{0:p}',
                precision: 2,
                schemaType: {
                    type: 'number'
                },
                attributes: right,
                headerAttributes: center
            },
            'date': {
                format: '{0:MM/dd/yyyy}',
                schemaType: {
                    type: 'date'
                },
                attributes: center,
                headerAttributes: center
            },
            'datetime': {
                format: '{0:MM/dd/yyyy h:mm:ss tt}',
                schemaType: {
                    type: 'datetime'
                },
                attributes: center,
                headerAttributes: center
            },
            'time': {
                format: '{0:h:mm:ss tt}',
                schemaType: {
                    type: 'time'
                },
                attributes: right,
                headerAttributes: center
            },
            'boolean': {
                schemaType: {
                    type: 'boolean'
                },
                attributes: center,
                headerAttributes: center
            }
        };

        //update date, datetime and time format as per locale/kendo culture
        function updateTypeMapping() {
            var locale;
            // set the date format from the format Service.
            typeMapping['date'].format = '{0:' + fisDateTimeFormatService.getDateFormat(locale) + '}';
            typeMapping['datetime'].format = '{0:' + fisDateTimeFormatService.getDateTimeFormat(locale, '12') + '}';
            typeMapping['time'].format = '{0:' + fisDateTimeFormatService.getTimeFormat(locale, '12') + '}';
        }

        updateTypeMapping();

        var localeChangeHandle = fisPubSubService.subscribe('fisLocaleChanged', function(locale) {
            if (!_.isUndefined(locale)) {
                updateTypeMapping();
            }
        });

        function mergeAttributes(oldAttrObj, newAttrObj) {
            var mergedObj = undefined;

            if (_.isUndefined(oldAttrObj) && !_.isUndefined(newAttrObj)) {
                return newAttrObj;
            }

            if (_.isObject(oldAttrObj) && _.isObject(newAttrObj)) {
                mergedObj = newAttrObj;

                var oldAttrKeys = _.keys(oldAttrObj);
                var newAttrKeys = _.keys(newAttrObj);

                //check if object 1 contains a ng-class and if object 2 contains a class
                if (_.contains(oldAttrKeys, 'ng-class') && _.contains(newAttrKeys, 'class')) {
                    _.each(oldAttrKeys, function(key) {
                        var matchKey = _.find(newAttrKeys, function(nKey) {
                            return nKey === key;
                        });
                        if (!_.isUndefined(matchKey)) {
                            mergedObj[matchKey] = oldAttrObj[matchKey] + " " + newAttrObj[matchKey];
                        }

                    });
                }

                // extract keys that do not exist in both object and then add them to merged object
                var oldExtraKeys = _.difference(oldAttrKeys, newAttrKeys);
                var newExtaKeys = _.difference(newAttrKeys, oldAttrKeys);

                _.each(oldExtraKeys, function(extraKey) {
                    mergedObj[extraKey] = oldAttrObj[extraKey];
                });

                _.each(newExtaKeys, function(extraKey) {
                    mergedObj[extraKey] = newAttrObj[extraKey];
                });

            }
            return mergedObj;
        }

        function columnFilter(element) {
            var set = new Set();
            var data = this.jQGridElement.getKendoGrid().dataSource.data();
            for(let i of data) {
                let field = this['field'];
                if(i[field] !== null && i[field] !== undefined){
                    set.add(i[field]);
                }
            }
            element.kendoAutoComplete({
                filter: "contains",
                dataSource: Array.from(set)
            });
        }
        
        var MINIMUM_COLUMN_WIDTH = 30;
        var DEFAULT_COLUMN_WIDTH = 150;

        function transformDataTypeToColumn(originalCols, userPreference, gridPrecision, jQGridElement) {
            // to process userPreference

            // var metadata = angular.copy( originalCols );
            var metadata = originalCols;

            for (var i = 0; i < metadata.length; i++) {

                var column = metadata[i];

                var dataType = getColumnDataType(column, gridPrecision);

                if (!_.isUndefined(dataType) && (dataType.format || dataType.schemaType)) {

                    column.format = dataType.format;
                    column.schemaType = dataType.schemaType;
                    column.precision = dataType.precision;

                    if (_.isUndefined(column.editor) && !_.isUndefined(dataType.editor)) {
                        column.editor = dataType.editor;
                    }

                    var cellAttributes = angular.copy(dataType.attributes);
                    var headerAttributes = angular.copy(dataType.headerAttributes);
                    // set the column text alignment
                    column.attributes = mergeAttributes(column.attributes, cellAttributes);
                    column.headerAttributes = mergeAttributes(column.headerAttributes, headerAttributes);
                }

                if (!column.width) {
                    column.width = DEFAULT_COLUMN_WIDTH;
                }

                if (column.width < MINIMUM_COLUMN_WIDTH) {
                    column.width = MINIMUM_COLUMN_WIDTH;
                }

                if(!column.filterable && column.editor !== 'dateEditor' && column.editor !== 'dateTimeEditor' && column.editor !== 'monthEditor' && (!column.schemaType || column.schemaType.type != 'number') && column.disableAutoComplete !== true){
                    column.filterable = {
                        ui: $.proxy(columnFilter, { field: column.field , 'jQGridElement' : jQGridElement})
                    };
                }

                // These are not lockable
                column.lockable = false;
            }

            // TODO: Need to refactor this, find a way to merge the above and below for for-loops
            // Apply column order            
            if (userPreference) {
                var preferencePosition = 0;
                if (userPreference.newPwPreference) {
                    _.each(userPreference.columnPreferences, function(preferenceColumn, index) {
                        var col = undefined;
                        for (var i = 0; i < originalCols.length; i++) {
                            col = originalCols[i];
                            if (col && col.field == preferenceColumn.name) {
                                col.hidden = !!preferenceColumn.hidden;
                                col.width = preferenceColumn.width;

                                // bring it to the preferencePosition
                                for (var j = i; j > preferencePosition; j--) {
                                    originalCols[j] = originalCols[j - 1];
                                }
                                originalCols[preferencePosition] = col;
                                preferencePosition++;

                                break;
                            }
                        }
                    });
                } else {
                    _.each(userPreference.columnOrder, function(preferenceColumn, index) {
                        var col = undefined;
                        for (var i = 0; i < originalCols.length; i++) {
                            col = originalCols[i];
                            if (col && col.field == preferenceColumn.name) {
                                col.hidden = !!preferenceColumn.hidden;

                                if (!col.hidden) {
                                    // TODO: need to find a way, where the we also save the 
                                    // width of the hidden columns                                                           
                                    var colWidthValue = _.find(userPreference.colWidths, function(colItem) {
                                        return colItem.field === col.field;
                                    })

                                    if (colWidthValue) {
                                        col.width = colWidthValue.width;
                                    }
                                } else {
                                    col.width = DEFAULT_COLUMN_WIDTH;
                                }

                                if (col.width < MINIMUM_COLUMN_WIDTH) {
                                    // TODO: this is the minimum width the column should have
                                    col.width = MINIMUM_COLUMN_WIDTH;
                                }

                                // bring it to the preferencePosition
                                for (var j = i; j > preferencePosition; j--) {
                                    originalCols[j] = originalCols[j - 1];
                                }

                                originalCols[preferencePosition] = col;
                                preferencePosition++;

                                break;
                            }
                        }
                    });
                }
            }

            return metadata;
        }

        function getColumnDataType(part, gridPrecision) {
            var myKendoType;

            if (!_.isEmpty(part)) {
                if (!_.isUndefined(part['dataType'])) {
                    var myDt = part['dataType'].split(':');
                    var kendoType = typeMapping[myDt[0].toLowerCase()] || typeMapping['string'];
                    //Fallback to string for unknown dataType values
                    myKendoType = angular.copy(kendoType);
                    if (!_.isUndefined(myKendoType.precision)) {
                        var precision = myKendoType.precision.valueOf();
                        var disableSpinner = (part.spinner === 'false');
                        if (!_.isUndefined(part.precisionOverride)) {
                            precision = part.precisionOverride;
                        } else if (!_.isUndefined(gridPrecision)) {
                            precision = gridPrecision;
                        } else if (!_.isUndefined(myDt[1])) {
                            // if it is specified
                            precision = myDt[1].valueOf();
                        }
                        if (!_.isUndefined(kendoType.maxPrecision) && precision > kendoType.maxPrecision) {
                            precision = kendoType.maxPrecision;
                        }

                        myKendoType.format = kendoType.format.substring(0, [kendoType.format.length - 1]) + precision + '}';
                        // other editor types could be added in a 'better' way ???
                        if (myKendoType.schemaType.type === 'number') {
                            myKendoType.editor = fisEditorFactory.getNumberEditor(precision, disableSpinner);
                        }
                        myKendoType.precision = precision;
                    }
                    //Get default kendo dateTimePicker/timePicker based on data types
                    if (myKendoType.schemaType.type === 'datetime' || myKendoType.schemaType.type === 'date') {
                        myKendoType.editor = fisEditorFactory.getDateTimeEditor(fisDateTimeFormatService);
                    } else if (myKendoType.schemaType.type === 'time') {
                        myKendoType.editor = fisEditorFactory.getTimeEditor(fisDateTimeFormatService);
                    }

                    // override the datatype alignment if it is set
                    if (!_.isUndefined(part.align)) {
                        var align = part.align.valueOf().toLowerCase();
                        if (align === 'right') {
                            myKendoType.attributes = right;
                            myKendoType.headerAttributes = right;
                        } else if (align === 'left') {
                            myKendoType.attributes = left;
                            myKendoType.headerAttributes = left;
                        } else {
                            myKendoType.attributes = center;
                            myKendoType.headerAttributes = center;
                        }
                    }

                    // Check to see if kendo specific formatting needs to be done
                    //Tapas : We don't need to consider any format passed in for number fields
                    if (!myKendoType.schemaType.type === 'number') {
                        if (!_.isEmpty(part) && !_.isUndefined(part['format'])) {
                            myKendoType.format = part['format'];
                        }
                    }
                    //Tapas
                } else {
                    myKendoType = angular.copy(typeMapping['string']);
                }
            }
            return myKendoType;
        }

        return {
            restrict: 'AE',
            scope: true,
            replace: true,
            template: '<div>\
                            <div class="uit-grid-empty">\
                                <i>Nothing to display</i>\
                            </div>\
                           <div class="uit-grid" >\
                           </div>\
                        </div>',
            controller: ['$scope', '$element', function($scope, $element) {

                this.getUITGridControl = function() {
                    return $scope['uitGridControl'];
                }
            }],
            link: function($scope, $element, $attrs, ctrls) {

                var UITGridTotalsBarCtrl = $scope.$parent['GridTotalControl'];

                var gridElem = $element.find('div.uit-grid');

                var contextMenuControlTimeOut = null;
                var dataSourceBoundHandleTimeOut = null;
                var postCreateBindingTimeOut = null;
                var enablePagingTimeOut = null;
                var disablePagingTimeOut = null;
                var addTimeOut = null;
                var cancelSelectedRowsTimeOut = null;
                var cancelCurrentRowTimeOut = null;
                var cloneRowTimeOut = null;
                var selectAllRowTimeOut = null;
                var setCurrentRowTimeOut = null;
                var gridEditFocusTimeout;
                var postRefreshBindingsTimeOut = null;

                var handleGridKeyDown = function(event, args) {

                    if (event.which == 69 && (event.ctrlKey || event.metaKey)) {
                        // CTRL + E for Export
                        gridElem.triggerHandler('uit.grid.export');
                    } else if (event.which == 67 && (event.ctrlKey || event.metaKey)) {
                        // CTRL + C for copy
                        gridElem.triggerHandler('uit.grid.copy');
                    }
                }

                gridElem.on('keydown', handleGridKeyDown);

                $scope.$on('$destroy', function() {
                    fisPubSubService.unsubscribe(localeChangeHandle);
                    gridElem.off('keydown', handleGridKeyDown);
                    kendo.destroy(gridElem);
                    GridControl.destroy();
                    gridElem.empty();
                    $timeout.cancel(contextMenuControlTimeOut);
                    $timeout.cancel(postCreateBindingTimeOut);
                    $timeout.cancel(dataSourceBoundHandleTimeOut);
                    $timeout.cancel(postRefreshBindingsTimeOut);
                    $timeout.cancel(gridEditFocusTimeout);
                    clearTimeout(enablePagingTimeOut);
                    clearTimeout(disablePagingTimeOut);
                    clearTimeout(addTimeOut);
                    clearTimeout(cancelSelectedRowsTimeOut);
                    clearTimeout(cancelCurrentRowTimeOut);
                    clearTimeout(cloneRowTimeOut);
                    clearTimeout(selectAllRowTimeOut);
                    clearTimeout(setCurrentRowTimeOut);
                    GridControl = undefined;
                });

                $attrs.$observe('uitEditExistingRow', function(value) {
                    GridControl.editExistRow($scope.$eval($attrs.uitEditExistingRow))
                });

                var GridControl = (function(angularScope, jQGridElement, GridColumnProcessor, GridDataCallback, fisI18nService) {

                    var userPreference;
                    var gridMetaData;
                    var schema;
                    var columns;
                    var showCheckBoxColumn;

                    var gridConfiguration;
                    var kendoGridControl;
                    var editable = false;
                    var liveFiltering = !!$attrs.uitLiveFiltering;
                    var liveFilteringMode = $attrs.uitLiveFilteringMode;
                    var pagingEnabled = angularScope.$eval($attrs.uitGridPaging);
                    var disableGridVirtualScrolling = angularScope.$eval($attrs.uitGridDisableVirtualScrolling);
                    var pageSize = angularScope.$eval($attrs.uitGridPageSize);
                    var pageSizes = angularScope.$eval($attrs.uitGridPageSizes);
                    /*Added new attribute to support custom Page size for Virtual Scrolling. By default, it was 200.*/
                    var virtualPageSize = angularScope.$eval($attrs.uitGridVirtualPageSize);
                    var gridCreatedWithPaging = pagingEnabled;
                    var activePage = 0;

                    var selectedRows = {};
                    var rowsMarked = {};
                    var allRowsSelected = false;
                    var rowsInErrorsIndex = [];
                    var successfulRowsIndex = [];

                    var contextMenuControl = undefined;
                    var VirtualScrolling = undefined;

                    var editExistingRow = false;

                    /* Uncomment the below block to enable virtual scrolling */
                    if (!pagingEnabled) {
                        if (disableGridVirtualScrolling === true) {
                            disableVirtualScrolling();
                        } else {
                            enableVirtualScrolling();
                        }
                    } else {
                        disableVirtualScrolling();
                    }

                    function enableVirtualScrolling() {
                        if (kendo.support.browser.msie) {
                            if (kendo.support.browser.version < 10) {
                                VirtualScrolling = {
                                    pageSize: 10
                                }
                            } else {
                                VirtualScrolling = {
                                    pageSize: 20
                                }
                            }
                        } else {
                            /*Added grid attribute to support custom page size for virtual scrolling. If no page size is specified then default is 200.*/
                            if (_.isUndefined(virtualPageSize)) {
                                virtualPageSize = 200
                            }

                            VirtualScrolling = {
                                pageSize: virtualPageSize
                            }
                        }
                    }

                    function disableVirtualScrolling() {
                        VirtualScrolling = undefined;
                    }

                    contextMenuControlTimeOut = $timeout(function() {
                        if (!!$attrs.uitContextMenuId) {
                            var contextMenuElement = $('[uit-context-menu=' + $attrs.uitContextMenuId + '] .fis-context-menu');
                            //contextMenuElement.hide();

                            contextMenuControl = $(contextMenuElement).kendoContextMenu({
                                target: jQGridElement,
                                filter: '.k-grid-content table[role="grid"] > tbody > tr',
                                animation: {
                                    close: {
                                        duration: 0
                                    }
                                }
                            }).data('kendoContextMenu');

                            angularScope.contextMenuControl = contextMenuControl;

                            contextMenuControl.bind("open", function(event) {
                                var openEvent = angularScope.$eval($attrs.uitContextMenuOpenEvent);
                                if (_.isFunction(openEvent)) {
                                    var uid = $(event.target).attr("data-uid");
                                    var dataItem = _.any(uid) ? kendoGridControl.dataSource.getByUid(uid) : null;
                                    openEvent.call(this, event, dataItem);
                                }
                            });

                            var ctxGtter = $parse($attrs.uitContextMenuControl);
                            if (ctxGtter && _.isFunction(ctxGtter.assign)) {
                                var targetScope = angularScope.$parent;
                                var level = $attrs.uitControllerLevel;
                                if (!level) {
                                    level = 1;
                                }
                                for (var cnt = 1; cnt < level; cnt++) {
                                    targetScope = targetScope.$parent;
                                }
                                ctxGtter.assign(targetScope, contextMenuControl);
                            }
                        }
                    }, 0, contextMenuControl);

                    /**
                     *   Grid Event Handlers - START
                     */
                    var UITGridChangeEventHandler = (function(dependencyResolvers, selectOnUpdate, rowKey) {

                        var that = this;
                        var _resolvers = dependencyResolvers;
                        var _gridCtrl = kendoGridControl;
                        var _selectRowOnUpdate = selectOnUpdate;
                        var _rowKey = rowKey;

                        var itemchange = function(event, originalValues) {
                            if (event.items && _.isArray(event.items)) {
                                var dataItemToUpdate = event.items[0];
                                var isEditable = true;
                                var fieldName = event.field;

                                event.items.forEach((item) => {
                                    item.dirty = true;
                                });

                                if ($scope && $scope['uitGridControl']) {
                                    var gridControl = $scope['uitGridControl'];
                                    isEditable = gridControl.isEditable(fieldName);
                                    if (_.isUndefined(isEditable)) {
                                        isEditable = true;
                                    }
                                }

                                //Select row on update
                                if (_selectRowOnUpdate && isEditable) {
                                    selectRow(dataItemToUpdate['uid']);
                                    dataItemToUpdate.updated = true
                                }

                                // Process Dependent columns            
                                var previousValue;
                                if (originalValues.name === fieldName) {
                                    previousValue = originalValues.value;
                                }

                                if (!!$attrs.uitGridRowEditHandler) {
                                    var rowEditBack = angularScope.$eval($attrs.uitGridRowEditHandler);
                                    if(rowEditBack)
                                        rowEditBack.call(event, dataItemToUpdate, originalValues.value, fieldName);
                                }

                                // find the dependent columns
                                if (_resolvers && fieldName && _resolvers['dependents'] && _.isFunction(_resolvers['dependents'][fieldName])) {

                                    var dependentColumnsArr = _resolvers['dependents'][fieldName].call(undefined, {
                                        set: function() {
                                            if (arguments.length === 1) {
                                                var propertyList = arguments[0];
                                                _.each(propertyList, function(propertyValue, propertyName) {
                                                    dataItemToUpdateset(propertyName, propertyValue);
                                                })
                                            } else if (arguments.length === 2) {
                                                var propertyName = arguments[0],
                                                    propertyValue = arguments[1];
                                                dataItemToUpdate.set(propertyName, propertyValue);
                                            }
                                        }
                                    }, dataItemToUpdate, previousValue);
                                }
                            }
                        }

                        var add = function(event) {
                            if (event.items && _.isArray(event.items)) {
                                var dataItemToUpdate = event.items[0];

                                selectRow(dataItemToUpdate['uid']);

                                // Defaulting
                                if (_resolvers && _resolvers['defaults'] && _.isFunction(_resolvers['defaults'])) {

                                    _resolvers['defaults'].call(undefined, {
                                        set: function() {
                                            if (arguments.length === 1) {
                                                var propertyList = arguments[0];
                                                _.each(propertyList, function(propertyValue, propertyName) {
                                                    if (dataItemToUpdate[propertyName] == undefined || dataItemToUpdate[propertyName] == null) {
                                                        dataItemToUpdate.set(propertyName, propertyValue);
                                                    }
                                                })
                                            } else if (arguments.length === 2) {
                                                var propertyName = arguments[0],
                                                    propertyValue = arguments[1];
                                                if (dataItemToUpdate[propertyName] == undefined || dataItemToUpdate[propertyName] == null) {
                                                    dataItemToUpdate.set(propertyName, propertyValue);
                                                }
                                            }
                                        }
                                    }, dataItemToUpdate)
                                }
                            }
                        }

                        var remove = function(event) {
                            if (Array.isArray(event.items) && event.items.length === 1) {
                                var uid = event.items[0].uid;
                                delete selectedRows[uid];
                                delete rowsMarked[uid];
                                clearErrorForUid(uid);
                            }

                        }

                        var sync = function(event) {}

                        return {
                            handleEvent: function(event, originalValue) {
                                if (event && event.action) {
                                    switch (event.action) {

                                        case 'itemchange':
                                            itemchange(event, originalValue);
                                            break;

                                        case 'add':
                                            add(event, originalValue);
                                            break;

                                        case 'remove':
                                            remove(event, originalValue);
                                            break;

                                        case 'sync':
                                            sync(event);
                                            break;
                                    }
                                }
                            }
                        }
                    })(angularScope.$eval($attrs.uitGridChangeHandler), $attrs.uitSelectOnUpdate, 'uid');

                    // initialize the variable, which will hold the scroll positions
                    var scrollOffset = {
                        left: 0,
                        top: 0,
                        activeCellIndex: 0,
                        activeRowId: undefined,
                    };

                    /* function to move the footer to the top.
                     * @param {gridObj} - uit grid object
                     */
                    function moveTotalsToTop(gridObj) {
                        if (!$(".k-grid-footer", gridObj.element).prev().hasClass("k-grid-header")) { // only move up when is at bottom
                            $(".k-grid-footer", gridObj.element).insertAfter($(".k-grid-header", gridObj.element));
                        }
                    }

                    var DataSourceBoundHandler = function(e) {
                        var container;
                        if (VirtualScrolling) {
                            container = e.sender.wrapper.find(".k-grid-content > .k-virtual-scrollable-wrap");
                        } else {
                            container = e.sender.wrapper.children(".k-grid-content");
                        }
                        container.scrollLeft(scrollOffset.left);
                        container.scrollTop(scrollOffset.top);
                        if (scrollOffset.activeRowId) {
                            e.sender.current(container.find("tr[data-uid='" + scrollOffset.activeRowId + "'] > td").eq(scrollOffset.activeCellIndex));
                        }

                        if ($attrs.uitDataSourceBoundHandler) {
                            var uitBound = angularScope.$eval($attrs.uitDataSourceBoundHandler);
                            if (_.isFunction(uitBound)) {
                                uitBound.call();
                            }
                        }

                        if (!!$attrs.uitGridFooterEvent) {
                            EventCallbacks.footerTemplateCallback(this);
                        }
                        if (!!this.lockedTable) {
                        var grid = this;
                        this.lockedTable.find(".k-grouping-row").each(function(index) {
                        var arrow = $(this).find("a");
                        grid.tbody.find(".k-grouping-row:eq("+index+") td").text($(this).text())
                        $(this).find("p").text("").append(arrow);
                        });
                        }

                        dataSourceBoundHandleTimeOut = $timeout(function() {
                            setGridDimensions();

                            kendoGridControl.resize(true);

                            showProgress(false);
                            handleEmptyGridHeight();

                            retainSelection();

                            retainRowMarkers();

                            // if the databound event has occured due to new data being imported, then select them
                            selectImportedData();

                            highlightErrorRows();

                            highlightSuccessfulRows(successfulRowsIndex);

                            buildingGrid = false;
                        });
                    }

                    var DataSourceBindingHandler = function(e) {
                        var container;
                        if (VirtualScrolling) {
                            container = e.sender.wrapper.find(".k-grid-content > .k-virtual-scrollable-wrap");
                        } else {
                            container = e.sender.wrapper.children(".k-grid-content");
                        }

                        var activeCell = $(e.sender.current());
                        scrollOffset.left = container.scrollLeft();
                        scrollOffset.top = container.scrollTop();
                        scrollOffset.activeCellIndex = activeCell.index();
                        scrollOffset.activeRowId = activeCell.closest("tr[role='row']").data('uid');

                        showProgress(true);
                    }

                    var previousFilter, fieldChange, fieldChange = {
                        name: undefined,
                        value: undefined
                    };
                    var DataSourceChangeHandler = function(e) {
                        if (!_.isEqual(previousFilter, e.sender._filter) && !_.isUndefined(e.sender._filter)) {
                            EventCallbacks.filter({
                                event: e.sender._filter
                            });
                            // we want only the filter details.
                            previousFilter = e.sender._filter;
                            //empty previousFilter to see current filter in popup showing the filter event.
                            previousFilter = {};
                        }
                        EventCallbacks.sort();

                        UITGridChangeEventHandler.handleEvent(e, fieldChange);
                        fieldChange.name = undefined;
                        fieldChange.value = undefined;
                    }

                    var kendoGridEditHandler = function(e) {

                        // Non numeric textbox  doesnot hold value for Ms Edge browser-> This fix resolves the issue for Ms edge version 42 and allows to hold values on Tab press or mouse click.
                        if (navigator.userAgent.indexOf("Edge/17.17134") > -1) {
                            e.container.find("input").on("blur", function(e) {
                                $(e.target).trigger("change");
                            })
                        }

                        // select/highlight the value in the cell on focus. By default it is yes.
                        var selectOnFocus = true;
                        if ($attrs.uitGridSelectOnFocus && $attrs.uitGridSelectOnFocus == "false") {
                            selectOnFocus = false;
                        }

                        if (selectOnFocus) {
                            var input = e.container.find("input");
                            gridEditFocusTimeout = $timeout(function() {
                                if (input && typeof input.select === 'function') {
                                    input.select();
                                }
                            });
                        }

                        var fieldName = getFieldName(e.container);
                        fieldChange.name = fieldName;
                        fieldChange.value = e.model[fieldName];

                        //If edit is not allowed on grid, but we want to allow new row -> we are allowing edit for new row and restricting for other cells
                        //Our grid will be editable in this to support new insert, however it will be restricted to allow only new row.
                        //This piece gets invoked for editable grids
                        //In TRM, there is requirement to allow NEW/CLONE and not allow EDIT on grid
                        if (!_.isUndefined(editExistingRow) && !_.isNull(editExistingRow)) {
                            if (editExistingRow == false && e.model["isNewRow"] != true) {
                                e.sender.closeCell();
                                e.sender.table.focus();
                            }
                        }


                        var rowEditCallback = angularScope.$eval($attrs.uitGridEditHandler);
                        if (rowEditCallback && typeof rowEditCallback === 'function') {
                            rowEditCallback(e, fieldName);
                        }
                    }


                    var retainRowMarkers = function() {
                        _.each(rowsMarked, function(marker, uid) {
                            if (marker) {
                                marker.mark(uid);
                            }
                        });
                    }

                    var retainSelection = function() {
                        if (allRowsSelected) {
                            selectAllRowsOnPage(true);
                        } else {
                            _.each(selectedRows, function(selected, uid) {
                                if (selected) {
                                    selectRow(uid, true);
                                }
                            });
                        }
                    }

                    var clearCleanRowSelection = function() {
                        _.each($scope.uitGridControl.getSelectedData(), function(selectedRow) {
                            if (!selectedRow.updated) {
                                selectRow(selectedRow.uid, false);
                            }
                        });
                    }

                    var ErrorMessagesByUID = {};
                    var highlightErrorRows = function() {
                        rowsInErrorsIndex = _.filter(rowsInErrorsIndex, function(uid) {
                            return setRowInError(uid);
                        });
                    }

                    var buildErrorsForTooltip = function(kendoModelRow) {
                        var allErrors = [];

                        _.each(kendoModelRow.error, function(errors, field) {
                            if (errors && errors.forEach) {
                                errors.forEach(function(errorString, index) {
                                    if (!_.isEmpty(errorString)) {
                                        allErrors.push(errorString);
                                    }
                                });
                            }
                        });

                        return allErrors;
                    }

                    var clearErrorForUid = function(uid) {
                        ErrorMessagesByUID[uid] = undefined;
                        var uidIndex = rowsInErrorsIndex.indexOf(uid)
                        if (uidIndex >= 0) {
                            rowsInErrorsIndex.splice(uidIndex, 1);
                        }
                    }

                    var setRowInError = function(uidOrObject) {
                        var kendoRowModel;

                        if (_.isString(uidOrObject)) {
                            // it is uid                            
                            kendoRowModel = kendoGridControl.dataSource.getByUid(uidOrObject);
                        } else if (_.isObject(uidOrObject)) {
                            // it is an object
                            kendoRowModel = uidOrObject;
                        }

                        if (kendoRowModel) {
                            var rowInError = kendoGridControl.lockedTable.find("tr[data-uid='" + kendoRowModel.uid + "'] > td");
                            var allErrors = buildErrorsForTooltip(kendoRowModel);
                            if (allErrors.length > 0) {
                                ErrorMessagesByUID[kendoRowModel.uid] = allErrors;
                                if (rowInError.hasClass('uit-gridcell-error')) {
                                    var kendoToolTip = kendoGridControl.lockedTable.data('kendoTooltip');
                                    if (kendoToolTip) {
                                        kendoToolTip.refresh();
                                    }
                                } else {
                                    rowInError.addClass("uit-gridcell-error");
                                    rowInError.removeClass("uit-gridcell-success");
                                }

                                return true;
                            } else {
                                rowInError.removeClass("uit-gridcell-error");
                                ErrorMessagesByUID[kendoRowModel.uid] = undefined;

                                return false;
                            }
                        } else {
                            if (_.isString(uidOrObject)) {
                                ErrorMessagesByUID[uidOrObject] = undefined;
                            }
                            return false;
                        }
                    }

                    /**
                    Puts a row in error list
                    TODO:REQUEST DOCUMENTATION
                    **/
                    var addRowInError = function(uidOrObject) {
                        var kendoRowModel;
                        if (_.isString(uidOrObject)) {
                            // it is uid                            
                            kendoRowModel = kendoGridControl.dataSource.getByUid(uidOrObject);
                        } else if (_.isObject(uidOrObject)) {
                            // it is the object
                            kendoRowModel = uidOrObject;
                        }
                        var currentIndex = _.indexOf(rowsInErrorsIndex, kendoRowModel.uid);
                        if (setRowInError(kendoRowModel)) {
                            if (currentIndex === -1) {
                                rowsInErrorsIndex.push(kendoRowModel.uid);
                            }
                        } else {
                            if (currentIndex !== -1) {
                                rowsInErrorsIndex.splice(currentIndex, 1);
                            }
                        }
                    }

                    // highlights the checkbox area for successfull rows
                    var highlightSuccessfulRows = function(selectedRows) {
                        var kendoRowModel;
                        successfulRowsIndex = [];
                        for (var i = 0; i < selectedRows.length; i++) {
                            kendoRowModel = selectedRows[i];

                            if (kendoRowModel) {
                                var rowInError = kendoGridControl.lockedTable.find("tr[data-uid='" + kendoRowModel.uid + "'] > td");
                                rowInError.removeClass("uit-gridcell-error");
                                rowInError.addClass("uit-gridcell-success");
                                ErrorMessagesByUID[kendoRowModel.uid] = undefined;
                                clearErrorForUid(kendoRowModel.uid);
                                successfulRowsIndex.push({ uid: kendoRowModel.uid });
                            }
                        }
                    }

                    function RowMarkHelper() {
                        this._markConfig = {};
                    }

                    RowMarkHelper.prototype.selectCellClass = function() {
                        if (arguments.length === 0) {
                            return this._markConfig.selectCellClass;
                        } else if (arguments.length === 1) {
                            this._markConfig.selectCellClass = arguments[0];
                        }
                    }

                    RowMarkHelper.prototype.selectCellTooltip = function() {
                        if (arguments.length === 0) {
                            return this._markConfig.selectTooltip;
                        } else if (arguments.length === 1) {
                            this._markConfig.selectTooltip = arguments[0];
                        }
                    }

                    RowMarkHelper.prototype.rowClassAdd = function() {
                        if (arguments.length === 0) {
                            return this._markConfig.rowClassAdd;
                        } else if (arguments.length === 1) {
                            this._markConfig.rowClassAdd = arguments[0];
                        }
                    }

                    RowMarkHelper.prototype.rowClassRemove = function() {
                        if (arguments.length === 0) {
                            return this._markConfig.rowClassRemove;
                        } else if (arguments.length === 1) {
                            this._markConfig.rowClassRemove = arguments[0];
                        }
                    }

                    RowMarkHelper.prototype.mark = function(uid) {

                        if (this.selectCellClass()) {
                            var selectCell = kendoGridControl.lockedTable.find("tr[data-uid='" + uid + "'] > td");
                            selectCell.addClass('uit-gridcell-marked');
                            selectCell.addClass(this.selectCellClass());
                        }

                        kendoGridControl.element.find("tr[data-uid='" + uid + "']").addClass(this.rowClassAdd()).removeClass(this.rowClassRemove());
                    }

                    RowMarkHelper.prototype.unmark = function(uid) {

                        kendoGridControl.lockedTable.find("tr[data-uid='" + uid + "'] > td").removeClass('uit-gridcell-marked').removeClass(this.selectCellClass());

                        kendoGridControl.element.find("tr[data-uid='" + uid + "']").removeClass(this.rowClassAdd()).addClass(this.rowClassRemove());
                    }

                    /**
                    Adds row marker
                    TODO:REQUEST DOCUMENTATION
                    **/
                    var markRow = function(uid) {
                        if (!uid || arguments.length === 1) {
                            return;
                        }

                        if (arguments.length === 2 && arguments[1] instanceof RowMarkHelper) {
                            rowsMarked[uid] = arguments[1];
                            arguments[1].mark(uid);
                        } else {
                            var rowMarker = new RowMarkHelper();
                            if (arguments.length === 3) {
                                rowMarker.selectCellClass(arguments[1]);
                                rowMarker.selectCellTooltip(arguments[2]);
                            } else if (arguments.length === 5) {
                                rowMarker.selectCellClass(arguments[1]);
                                rowMarker.selectCellTooltip(arguments[2]);
                                rowMarker.rowClassAdd(arguments[3]);
                                rowMarker.rowClassRemove(arguments[4]);
                            }

                            rowsMarked[uid] = rowMarker;
                            rowMarker.mark(uid);
                            return rowMarker;
                        }
                    }

                    var unmarkRow = function(uid) {
                        rowsMarked[uid].unmark(uid);
                        delete rowsMarked[uid];
                    }

                    var ErrorTooltipContent = function(event) {
                        var uid = $(event.target).closest('tr[role=row]').data('uid');
                        if (_.isArray(ErrorMessagesByUID[uid]) && ErrorMessagesByUID[uid].length > 0) {

                            var html = '<div style="text-align: left;">\
                                <ul style="list-style-position: inside; list-style-type: circle; margin: 0px; padding: 0px">';

                            _.each(ErrorMessagesByUID[uid], function(message) {
                                html += '<li style="color: red;">' + message + '</li>'
                            });

                            html += '</ul></div>';

                            return angular.element(html);

                        } else {
                            $(event.target).removeClass('uit-gridcell-error');

                            clearErrorForUid(uid);

                            var marker = rowsMarked[uid];
                            if (marker && marker instanceof RowMarkHelper) {
                                return angular.element('<div style="text-align: left;color: #ff8c00;">' + marker.selectCellTooltip() + '</div>');
                            } else {
                                $(event.target).removeClass('uit-gridcell-marked');
                            }

                            return undefined;
                        }
                    }

                    var bindTooltipOnErrorCells = function() {
                        if (!!kendoGridControl.lockedTable) {
                            kendoGridControl.lockedTable.kendoTooltip({
                                filter: "td.uit-gridcell-error,td.uit-gridcell-marked",
                                width: 200,
                                position: "right",
                                showAfter: 1000,
                                autoHide: true,
                                content: ErrorTooltipContent
                            });
                        }
                    }

                    var unbindTooltipOnErrorCells = function() {
                        var kendoToolTip = kendoGridControl.lockedTable.data('kendoTooltip');
                        if (kendoToolTip) {
                            kendoToolTip.destroy();
                        }
                    }
                    /**
                        uit-grid-row-click-handler      - Called on the databound of the grid for adding this event handler

                    **/
                    var KendoGridContentClickHandler = function(event) {
                        var row = $(event.target).closest("tr"),
                            dataItem = kendoGridControl.dataItem(row);

                        if (dataItem) {
                            EventCallbacks.rowNavigate(event, row, dataItem);

                            $log.debug($scope)
                        }

                        if ($attrs.uitGridRowClickHandler) {
                            var column = $(event.target).closest("td");
                            var columnIdx = $("td", row).index(event.target);
                            var columnName = kendoGridControl.thead.find('th').eq(columnIdx).data('field');
                            var rowClickCallback = angularScope.$eval($attrs.uitGridRowClickHandler);
                            if (rowClickCallback && typeof rowClickCallback === 'function') {
                                rowClickCallback.call(this, event, row, column, columnName, dataItem);
                            }
                        }
                    }

                    var KendoGridSelectAllHandler = function(event) {
                        var eventTarget = $(event.target);
                        if (eventTarget.is('input.select-all')) {
                            event.preventDefault();
                            selectAllRow(eventTarget);
                        } else if (eventTarget.is('th[data-selectallcell]')) {
                            sortSelectColumn(eventTarget);
                        }
                        triggerUitGridRowSelectionChange();
                    }

                    function sortSelectColumn(selectTHCellElement) {
                        if (isNoRowSelected() || isAllRowSelected()) {
                            return;
                        }

                        var currentSortings = kendoGridControl.dataSource.sort();
                        var selectColSorting;
                        if (_.isArray(currentSortings) && currentSortings.length > 0) {
                            for (var i = 0; i < currentSortings.length; i++) {
                                if (currentSortings[i].field == SELECT_CELL_FIELD_NAME) {
                                    selectColSorting = currentSortings.splice(i, 1)[0];
                                    break;
                                }
                            }
                        } else {
                            if (_.isObject(currentSortings) && currentSortings.field == SELECT_CELL_FIELD_NAME) {
                                selectColSorting = currentSortings;
                            }
                            currentSortings = [];
                        }

                        if (selectColSorting) {
                            if (selectColSorting.dir === 'desc') {
                                selectColSorting.dir = 'asc';
                                currentSortings.splice(0, 0, selectColSorting);
                                selectTHCellElement.find('span.uit-dir-indicator').remove();
                                $("<span class='uit-dir-indicator k-icon k-i-arrow-s'></span>").appendTo(selectTHCellElement);
                            } else {
                                selectTHCellElement.find('span.uit-dir-indicator').remove();
                            }
                        } else {
                            currentSortings.splice(0, 0, {
                                field: SELECT_CELL_FIELD_NAME,
                                dir: "desc"
                            });
                            selectTHCellElement.find('span.uit-dir-indicator').remove();
                            $("<span class='uit-dir-indicator k-icon k-i-arrow-n'></span>").appendTo(selectTHCellElement);
                        }

                        kendoGridControl.dataSource.sort(currentSortings);
                    }

                    /**
                    Triggers the handler specified in the attribute uit-grid-row-selection-change , callback with 'selected rows'
                    @function               
                    @private
                    @return undefined
                    */
                    function triggerUitGridRowSelectionChange() {
                        var selectionChangeHandler = angularScope.$eval($attrs.uitGridRowSelectionChange);
                        if (selectionChangeHandler != undefined) {
                            selectionChangeHandler.call(this, $scope.uitGridControl.getSelectedData(), $scope.backedUpSelectedData);
                        }
                    }
                    /**
                    Called only when selection box is clicked, this will call the process that keeps the internal selec
                    @function
                    @private
                    @return undefined
                    */
                    var KendoGridSelectHandler = function(event) {
                        var eventTarget = $(event.target);
                        if (eventTarget.is('input.select-row')) {
                            var checked = eventTarget[0].checked;
                            selectRow(eventTarget.closest("tr").data('uid'), checked);
                        } else if (eventTarget.is('td[data-selectcell]') || eventTarget.hasClass('fa fa-caret-right')) {
                            if (!!$scope.backedUpSelectedData && !event.shiftKey && !event.ctrlKey) {
                                _.each($scope.backedUpSelectedData, function(selectedRow) {
                                    selectRow(selectedRow.uid);
                                });
                            }
                            $scope.backedUpSelectedData = undefined;
                        }

                        triggerUitGridRowSelectionChange();

                    }

                    /**
                     * { event handling when data is pasting in a grid }
                     * Update the data in the cells and then apply dirty flag.
                     *
                     * @param      {object}  e       { event }
                     */
                    var KendoGridPasteHandler = function(e) {
                        var kendoRow = $(event.target).closest("tr");
                        var rowIndex = kendoGridControl.tbody.find('tr').index(kendoRow);

                        var column = $(event.target).closest("td");
                        var columnIdx = $("td", kendoRow).index(column);
                        var columnName;
                        var dataItem;
                        var cells;
                        var i;
                        var j;
                        var pastedData = e.originalEvent.clipboardData.getData('Text');
                        var editableColumnNames = getAllEditableColumnNames();

                        if (pastedData) {
                            var rows = pastedData.split('\n');

                            if (rows && rows.length > 1) {

                                // Stop data actually being pasted into div if multiple rows are pasted
                                e.stopPropagation();
                                e.preventDefault();

                                for (i = 0; i < rows.length; i++) {
                                    kendoRow = kendoGridControl.tbody.find('tr').eq(rowIndex + i);
                                    dataItem = kendoGridControl.dataItem(kendoRow);

                                    if (rows[i] != "") {
                                        cells = rows[i].split('\t');
                                        for (j = 0; j < cells.length; j++) {
                                            if (cells[j] != "") {
                                                if (typeof cells[j] === 'string') {
                                                    if(cells[j].trim() === "")
                                                        continue;
                                                    else
                                                        cells[j] = cells[j].trim(); 
                                                }
                                                columnName = kendoGridControl.thead.find('th').eq(columnIdx + j).data('field');

                                                if (editableColumnNames.includes(columnName)) {
                                                    if (dataItem[columnName] == cells[j]) {
                                                        dataItem[columnName] = null; // setting to null so that change event is triggered
                                                    }
                                                    dataItem.set(columnName, cells[j]);
                                                }
                                            }
                                        }
                                    }
                                }

                                kendoGridControl.refresh();

                                for (i = 0; i < rows.length; i++) {
                                    kendoRow = kendoGridControl.tbody.find('tr').eq(rowIndex + i);
                                    dataItem = kendoGridControl.dataItem(kendoRow);

                                    if (rows[i] != "") {
                                        cells = rows[i].split('\t');
                                        for (j = 0; j < cells.length; j++) {
                                            if (cells[j] != "") {
                                                if (typeof cells[j] === 'string' && cells[j].trim() === "") {
                                                    continue;
                                                }
                                                columnName = kendoGridControl.thead.find('th').eq(columnIdx + j).data('field');

                                                if (editableColumnNames.includes(columnName)) {
                                                    kendoRow.children().eq(columnIdx + j).addClass("k-dirty-cell");
                                                    kendoRow.children().eq(columnIdx + j).prepend('<span class="k-dirty"/>');
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    /**
                     * Gets all editable column names.
                     *
                     * @return     {Array}  All editable column names.
                     */
                    function getAllEditableColumnNames() {
                        var editableColumnNames = [];
                        var kendoColumn;
                        var kendoColumns = kendoGridControl.columns;
                        for (var i = 0; i < kendoColumns.length; i++) {
                            kendoColumn = kendoColumns[i];
                            if (kendoColumn.editable != false) {
                                editableColumnNames.push(kendoColumn.field);
                            }
                        }
                        return editableColumnNames;
                    }

                    /**
                     *   Grid Event Handlers - END
                     **/

                    var EventCallbacks = {

                        footerTemplateCallback: function(gridObj) {
                            if (!!$attrs.uitGridFooterEvent) {
                                var rowCallback = angularScope.$eval($attrs.uitGridFooterEvent)
                                if (!!rowCallback && _.isFunction(rowCallback)) {
                                    var tdWithIds = {};
                                    var filteredTds = {};
                                    var tr = $(".k-grid-footer", gridObj.element).find('.k-grid-footer-wrap .k-footer-template')[0];

                                    $(tr).each(function(index, tr) {
                                        $('td', tr).each((index, td) => {
                                            if (!!$(td).attr('id')) {
                                                tdWithIds[$(td).attr('id')] = $(td).text();
                                                filteredTds[$(td).attr('id')] = $(td);
                                            }
                                        });
                                    });

                                    var footerObj = {
                                        success: function(response) {
                                            for (var property in response) {
                                                if (!!filteredTds[property]) {
                                                    if (!!response[property]) {
                                                        $(filteredTds[property]).html(response[property]);
                                                    } else {
                                                        $(filteredTds[property]).html("");
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    rowCallback.call(undefined, tdWithIds, footerObj);
                                }
                            }
                        },
                        filter: function(locals) {
                            angularScope.$eval($attrs.uitOnFiltering, locals);
                        },
                        sort: function() {
                            if (!!$attrs.uitSortCallback) {
                                var callback = angularScope.$eval($attrs.uitSortCallback);
                                callback.call();
                            }
                        },
                        rowNavigate: function(event, row, data) {
                            var rowNavCallback = angularScope.$eval($attrs.uitOnRowNavigation);
                            var prevActiveRow = kendoGridControl.tbody.find("tr.fis-row-activated");
                            if (_.isFunction(rowNavCallback)) {
                                var currentRowUid = data['uid'];
                                var prevActiveRowUid = prevActiveRow.data('uid');
                                if (currentRowUid != prevActiveRowUid) {
                                    kendoGridControl.element.find("tr.fis-row-activated").removeClass("fis-row-activated");
                                    kendoGridControl.element.find("tr[data-uid='" + currentRowUid + "']").addClass('fis-row-activated');
                                    rowNavCallback.call(this, event, {
                                        previousRow: kendoGridControl.dataSource.getByUid(prevActiveRowUid),
                                        currentRow: data
                                    });
                                }
                            }
                            if (!!$attrs.uitSelectionMode && $attrs.uitSelectionMode == "multiple") {
                                if(!! kendoGridControl.lockedContent) {
                                    if (!!$scope.lastSelectedUid) {
                                        var prevCheckBox = kendoGridControl.lockedContent.find("tr[data-uid='" + $scope.lastSelectedUid + "'] td>input.select-row");
                                        var removeElem = $(prevCheckBox.parent()[0]).find(".selected").remove();
                                    }
                                    var currCheckBox = kendoGridControl.lockedContent.find("tr[data-uid='" + data['uid'] + "'] td>input.select-row");
                                    $(currCheckBox.parent()[0]).append("<span id='rowspan_" + data['uid'] + "' class='selected' style='margin-left: 5px'><i class='fa fa-caret-right'></i></span>");
                                }
                            }
                            $scope.lastSelectedUid = data['uid'];
                        }
                    }

                    var HEADER_HEIGHT = 30;
                    var ROW_HEIGHT = 17;
                    var SCOLLBAR_HEGIHT = 19;
                    var containerHeight;
                    var containerWidth;
                    var MIN_HEIGHT = HEADER_HEIGHT + SCOLLBAR_HEGIHT;
                    var SELECT_COLUMN_WIDTH = 35;
                    var SELECT_CELL_FIELD_NAME = 'tmp_selected';
                    var VERTICAL_SCROLLBAR_WIDTH = 19;

                    function getPagerHeight() {
                        return jQGridElement.find('.k-grid-pager').outerHeight() || 0;
                    }
                    /**
                    Sets specific size for the grid, if  grid needs to be 100% the parents size then don't call this method or call it with no parameters
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return gridController
                    */
                    var setGridDimensions = function(overrideContinerHeight, overrideContinerWidth) {

                        if (overrideContinerHeight) {
                            containerHeight = overrideContinerHeight;
                        } else {
                            containerHeight = jQGridElement.parent().height();
                        }

                        if (overrideContinerWidth) {
                            containerWidth = overrideContinerWidth;
                        } else {
                            containerWidth = jQGridElement.parent().width();
                        }

                        //                  var numberOfRows = 0;
                        //                  var headerWidth;
                        //                  if (kendoGridControl) {
                        //                      numberOfRows = kendoGridControl.dataSource.view().length;
                        //                      headerWidth = kendoGridControl.element.find('.k-grid-header-wrap > table ').outerWidth();
                        //                      headerWidth = headerWidth + SELECT_COLUMN_WIDTH + VERTICAL_SCROLLBAR_WIDTH;
                        //                  }

                        //                  var additionalHeight = 0;
                        //                  if (numberOfRows > 0 && numberOfRows < 4) {
                        //                      additionalHeight = 10;
                        //                  }

                        //                  if (liveFiltering) {
                        //                      additionalHeight += 45;
                        //                  }

                        jQGridElement.css('height', containerHeight); //Math.max(MIN_HEIGHT, Math.min((numberOfRows * ROW_HEIGHT + MIN_HEIGHT + getPagerHeight() + additionalHeight), containerHeight)));

                        jQGridElement.css('width', 'inherit');

                        return this;
                    }

                    var showProgress = function(loading) {
                        kendo.ui.progress($element, !!loading);
                    }

                    var GridEmptyIndicatorElm = $element.find('.uit-grid-empty');

                    var gridIsEmpty = function(empty) {
                        GridEmptyIndicatorElm.css('display', 'block');
                    }

                    var gridIsNotEmpty = function(empty) {
                        GridEmptyIndicatorElm.css('display', 'none');
                    }

                    /** 
                    Used while creating the component.
                    @param {array of objects} metadata - TODO
                    @param {boolean} showCheckBox  - True will add a 'selection' checkbox for each row and add a select all header, this will provide
                    @param {function} precisionResolver - TODO
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return uitGridController
                    */
                    var setMetaData = function(metadata, showCheckBox, precisionResolver) {
                        gridMetaData = metadata;
                        setColumns(metadata, showCheckBox, precisionResolver);
                        return this;
                    }
                    /** 
                    Used while creating the component to set the columsn
                    @param {array of objects} newColumns - The object for each column is very similar to the kendo specs with some variants.  TODO(Add specific description)
                    @param {boolean} showCheckBox  - True will add a 'selection' checkbox for each row and add a select all header, this will provide
                    @param {function} precisionResolver - TODO
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return uitGridController
                    */
                    var setColumns = function(newColumns, showCheckBox, precisionResolver) {
                        showCheckBoxColumn = showCheckBox;
                        columns = GridColumnProcessor(newColumns, userPreference, precisionResolver, jQGridElement);
                        if (showCheckBox) {
                            //width of the checkbox column is set to 40 to avoid occupying unnecessary column space
                            columns.splice(0, 0, {
                                width: SELECT_COLUMN_WIDTH,
                                reorderable: false,
                                lockable: false,
                                // custom property so we manually avoid changing position of that column
                                headerTemplate: '<input type="checkbox" class="select-all"/>',
                                headerAttributes: {
                                    'data-selectallcell': 'true'
                                },
                                template: '<input type="checkbox" style="height : inherit" class="select-row" />',
                                locked: true,
                                attributes: {
                                    "class": "datatype-align-center",
                                    'data-selectcell': 'true',
                                    "id": 'uitGridCheckBoxColumn'
                                },
                                uitGridMultiselectCheckbox: true
                            });
                        }
                        return this;
                    }
                    /** 
                    Used while creating the component.
                    @param {array of objects} metadata - TODO
                    @param {boolean} showCheckBox  - True will add a 'selection' checkbox for each row and add a select all header, this will provide
                    @param {function} precisionResolver - TODO
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return uitGridController
                    */
                    var setSchema = function(newSchema) {
                        schema = newSchema;
                        return this;
                    }

                    var clear = function() {
                        userPreference = undefined;
                        schema = undefined;
                        columns = undefined;

                        return this;
                    }

                    var clearSelectionVariables = function() {
                        selectedRows = {};
                        rowsMarked = {};
                        allRowsSelected = false;
                        rowsInErrorsIndex = [];
                        successfulRowsIndex = [];
                        ErrorMessagesByUID = {};
                        $scope.lastSelectedUid = undefined;
                        scrollOffset = {
                            left: 0,
                            top: 0,
                            activeCellIndex: 0,
                            activeRowId: undefined,
                        }
                    }

                    function unbindEveryThing() {
                        kendoGridControl.tbody.off('paste', KendoGridPasteHandler);
                        kendoGridControl.dataSource.unbind('change', DataSourceChangeHandler);
                        kendoGridControl.tbody.off('click', KendoGridContentClickHandler);
                        if (!!kendoGridControl.lockedHeader) {
                            kendoGridControl.lockedHeader.off('click', KendoGridSelectAllHandler);
                        }
                        if (!!kendoGridControl.lockedContent) {
                            kendoGridControl.lockedContent.off('click', KendoGridSelectHandler);
                        }
                        if (!!kendoGridControl.lockedTable) {
                            unbindTooltipOnErrorCells();
                        }
                    }

                    var destroy = function() {
                        previousFilter = undefined;

                        if (kendoGridControl && kendoGridControl.thead) {
                            kendoGridControl.thead.children().find('th').each(function(index, el) {
                                var dropTarget = $(el).data('kendoDropTarget');
                                if (dropTarget) {
                                    kendo.ui.DropTarget.destroyGroup(dropTarget.options.group);
                                }
                            });
                            if (!!kendoGridControl.lockedHeader) {
                                kendoGridControl.lockedHeader.children().find('th').each(function(index, el) {
                                    var dropTarget = $(el).data('kendoDropTarget');
                                    if (dropTarget) {
                                        kendo.ui.DropTarget.destroyGroup(dropTarget.options.group);
                                    }
                                });
                            }
                            unbindEveryThing();
                            kendoGridControl.element.empty();
                        }

                        kendoGridControl = undefined;

                        // Need to call "empty()" when recreating a grid - see here:
                        // http://www.kendoui.com/forums/mvc/grid/recreate-the-grid-on-demand.aspx
                        jQGridElement.empty()
                        gridIsEmpty();
                    }
                    /**
                    Releases all kendo memory
                    **/
                    var cleanUp = function() {
                        clearSelectionVariables();
                        destroy();
                        gridConfiguration = undefined;
                        exposekendoControl();
                        // to set the kendoGridControl as undefined
                        if (contextMenuControl) {
                            contextMenuControl.unbind();
                            contextMenuControl.destroy();
                        }
                        jQGridElement.off();
                        jQGridElement = undefined;
                    }

                    /**
                    Clears out the kendo grid datatasource
                    **/
                    var clearGridData = function() {
                        if (kendoGridControl)
                            kendoGridControl.dataSource.data([]);
                    }

                    /**
                    Show or hide columns
                    @param {array} Columns to hide
                    @param {boolean} True for hide false for show
                    **/
                    var showHideColumns = function(columnsToShowHide, isHide) {
                        var column;
                        for (column in columnsToShowHide) {
                            if (isHide) {
                                kendoGridControl.hideColumn(columnsToShowHide[column]);
                            } else {
                                kendoGridControl.showColumn(columnsToShowHide[column]);
                            }
                        }
                    }

                    var init = function() {
                        destroy();
                        clearSelectionVariables();
                        gridIsNotEmpty();
                        kendoGridControl = jQGridElement.kendoGrid(gridConfiguration).data('kendoGrid');
                        kendoGridControl.resize();
                        handleEmptyGridHeight();
                        postCreateBindings();
                        exposekendoControl();
                        broadcastGridCreateEvent();
                    }

                    function broadcastGridCreateEvent() {
                        $scope.$parent.$broadcast(ALIGNE_EVENT_CONSTANTS.UIT_GRID_DATACHANGE_EVENT, {

                        });
                    }

                    var postCreateBindings = function() {
                        // Move the pager to top
                        if (pagingEnabled) {
                            var pagerEl = jQGridElement.find(".k-grid-pager").insertBefore(kendoGridControl.element.children(".k-grid-header"));
                        }

                        //Move totals footer row to the top.
                        if ($attrs.uitGridMoveFooter) {
                            moveTotalsToTop(kendoGridControl);
                        }

                        kendoGridControl.dataSource.bind('change', DataSourceChangeHandler);
                        postCreateBindingTimeOut = $timeout(function() {
                            // this was done because even after the databound the events were getting wiped out
                            kendoGridControl.tbody.on('click', KendoGridContentClickHandler);
                            kendoGridControl.tbody.off('paste', KendoGridPasteHandler);
                            kendoGridControl.tbody.on('paste', KendoGridPasteHandler);
                            if (!!kendoGridControl.lockedHeader) {
                                kendoGridControl.lockedHeader.on('click', KendoGridSelectAllHandler);
                                kendoGridControl.lockedContent.on('click', KendoGridSelectHandler);
                            }

                            bindTooltipOnErrorCells();
                        }, 1000);
                    }

                    var postRefreshBindings = function() {
                        kendoGridControl.tbody.off('paste', KendoGridPasteHandler);
                        kendoGridControl.tbody.on('paste', KendoGridPasteHandler);
                        kendoGridControl.dataSource.bind('change', DataSourceChangeHandler);
                        kendoGridControl.tbody.off('click', KendoGridContentClickHandler);
                        kendoGridControl.tbody.on('click', KendoGridContentClickHandler);
                        postRefreshBindingsTimeOut = $timeout(function() {
                            // this was done because even after the databound the events were getting wiped out
                            if (!!kendoGridControl.lockedHeader) {
                                kendoGridControl.lockedHeader.on('click', KendoGridSelectAllHandler);
                                kendoGridControl.lockedContent.on('click', KendoGridSelectHandler);
                            }
                            bindTooltipOnErrorCells();
                        }, 1000);

                        if (UITGridTotalsBarCtrl) {
                            UITGridTotalsBarCtrl.bindOnDataSource(kendoGridControl.dataSource);
                        }
                    }

                    var preRefreshUnbindings = function() {

                        if (kendoGridControl && kendoGridControl.thead) {
                            var el = kendoGridControl.thead.children().find('th')[0];
                            var dropTarget = $(el).data('kendoDropTarget');
                            if (dropTarget) {
                                kendo.ui.DropTarget.destroyGroup(dropTarget.options.group);
                            }

                            if (!!kendoGridControl.lockedHeader) {
                                var el = kendoGridControl.lockedHeader.children().find('th')[0];
                                var dropTarget = $(el).data('kendoDropTarget');
                                if (dropTarget) {
                                    kendo.ui.DropTarget.destroyGroup(dropTarget.options.group);
                                }
                            }

                        }
                        if (UITGridTotalsBarCtrl) {
                            UITGridTotalsBarCtrl.unbindOnDataSource(kendoGridControl.dataSource);
                        }
                    }

                    var exposekendoControl = function() {
                        // For existing menu compatibility              
                        var getter = $parse($attrs.uitKendoControl);
                        if (getter && _.isFunction(getter.assign)) {
                            getter.assign(angularScope.$parent, kendoGridControl);
                        }

                        getter = $parse($attrs.uitGrid);
                        if (getter && _.isFunction(getter.assign)) {
                            getter.assign(angularScope.$parent, kendoGridControl);
                        }
                    }

                    /**
                    Get a5UserTimeZone setting, works as overrides from column to defaulting looking at a variable depending on the path, where those
                    instances where the path contains the wrod "gas" will apply offset unless overriden
                    **/
                    var getA5UserTimeZoneFlag = function(column) {

                        if (column && _.any(column.a5UserTimeZone)) {
                            return String(column.a5UserTimeZone) == "true"; // true if a5UserTimeZone is an attribute of the column and is true
                        }

                        if ($attrs.uitA5UserTimeZone && _.any($attrs.uitA5UserTimeZone)) {
                            return String($attrs.uitA5UserTimeZone) == "true"; // true only if the grid has the attribute a5UserTimeZone and the value 'true'
                        }

                        return a5UserTimeZoneForModule; // true if path of ui is within gas
                    }

                    /**
                    Get a5ServerTimeZone setting, reads value from column definition
                    **/
                    var getA5ServerTimeZoneFlag = function(column) {
                        if (column && column.a5ServerTimeZone) {
                            return String(column.a5ServerTimeZone) == "true"; // true if a5ServerTimeZone is an attribute of the column and is true
                        }
                    }

                    var ELLIPSE = "...";
                    var getKendoRenderer = function(templateIdentifier, column) {
                        switch (templateIdentifier) {
                            case 'dateRenderer':
                                return function(dataItem) {
                                    var a5UserTimeZone = getA5UserTimeZoneFlag(column);
                                    if (dataItem[column.field]) {
                                        if (dataItem[column.field] == ELLIPSE) {
                                            return dataItem[column.field];
                                        } else {
                                            return (a5UserTimeZone) ?
                                                AligneWebUtilityService.formatDateByType(dataItem[column.field], ALIGNEWEB_DATE_TIME_CONSTANTS.DATE_FORMAT, a5UserTimeZone) :
                                                kendo.toString(dataItem[column.field], 'd'); // this is more performant and already been defaulted to usual format
                                        }
                                    } else {
                                        return '';
                                    }
                                }
                            case 'dateTimeRenderer':
                                return function(dataItem) {
                                    var a5UserTimeZone = getA5UserTimeZoneFlag(column);
                                    if (dataItem[column.field]) {
                                        if (dataItem[column.field] == ELLIPSE) {
                                            return dataItem[column.field];
                                        } else {
                                            return AligneWebUtilityService.formatDateByType(dataItem[column.field], ALIGNEWEB_DATE_TIME_CONSTANTS.DATE_TIME_FORMAT, a5UserTimeZone);
                                        }
                                    } else {
                                        return '';
                                    }
                                }
                            case 'monthRenderer':
                                return function(dataItem) {
                                    var a5UserTimeZone = getA5UserTimeZoneFlag(column);
                                    var a5ServerTimeZone = getA5ServerTimeZoneFlag(column);
                                    if (dataItem[column.field]) {
                                        if (dataItem[column.field] == ELLIPSE) {
                                            return dataItem[column.field];
                                        } else {
                                            if (a5ServerTimeZone) {
                                                return AligneWebUtilityService.formatDateByType(dataItem[column.field], ALIGNEWEB_DATE_TIME_CONSTANTS.MONTH_FORMAT, null, a5ServerTimeZone);
                                            } else {
                                                return AligneWebUtilityService.formatDateByType(dataItem[column.field], ALIGNEWEB_DATE_TIME_CONSTANTS.MONTH_FORMAT, a5UserTimeZone);
                                            }
                                        }
                                    } else {
                                        return '';
                                    }
                                }
                            case 'numericRenderer':
                                return function(dataItem) {
                                    if (dataItem[column.field] == ELLIPSE) {
                                        return dataItem[column.field];
                                    }
                                    if (!_.isUndefined(dataItem[column.field]) && dataItem[column.field] !== null) {
                                        var decimalPrecision = 0;
                                        // PRECISION IS SPECIFIED IN A DIFFERENT COLUMN AT ROW LEVEL
                                        if (column.decimalsColumn && dataItem[column.decimalsColumn]) {
                                            decimalPrecision = parseInt(dataItem[column.decimalsColumn]);
                                        } // PRECISION IS A SCOPE SPECIFIED VARIABLE
                                        else {
                                            decimalPrecision = angularScope.$parent.$eval(column.decimals);
                                            // attempt to parse a decimals variable wthin the scope
                                            if (!_.isNumber(decimalPrecision) && !_.isUndefined(column.decimals) && column.decimals != 'undefined') {
                                                decimalPrecision = parseInt(column.decimals);
                                                // look for an Numeric value in the column decimals
                                            }
                                        }
                                        // USE COLUMN PRECISION, ONE FOR ALL GRID
                                        if (!_.isNumber(decimalPrecision)) {
                                            // use the attribute precision from the column definition
                                            decimalPrecision = column.precision;
                                        }
                                        if (_.isNumber(decimalPrecision)) {
                                            if (column.showOnlyRequiredDecimals) {
                                                return kendo.format(uitComponentSvc.getExtendedNumberFormat(decimalPrecision, column.showOnlyRequiredDecimals), dataItem[column.field]);
                                            } else {
                                                return kendo.format(uitComponentSvc.getNumberFormat(decimalPrecision), dataItem[column.field]);
                                            }
                                        }
                                    }
                                    return '';
                                }
                            default:
                                return undefined;
                        }
                    }

                    var getKendoEditor = function(templateIdentifier, columnInfo) {
                        switch (templateIdentifier) {
                            case 'readOnlyEditor':
                                return function(container, options) {
                                    container.text(options.model[options.field]);
                                }
                            case 'numericEditor':
                                return function(container, options) {
                                    var cellEditor = uitComponentSvc.getNumericEditorTemplate(columnInfo, options.model);
                                    var cellScope = angular.element(container).scope().$new();
                                    cellScope['kendoEditorOptions'] = options;

                                    var editor = angular.element(cellEditor);
                                    editor.attr('uit-kendo-editor-options', 'kendoEditorOptions');
                                    container.append(editor);
                                    $compile(editor)(cellScope);
                                }
                            case 'textEditor':
                                return function(container, options) {
                                    var cellEditor = uitComponentSvc.getTextEditorTemplate(columnInfo);
                                    var cellScope = angular.element(container).scope();
                                    var editor = angular.element(cellEditor);
                                    editor.val(options.model[options.field]);
                                    container.append(editor);
                                    $compile(editor)(cellScope);
                                }
                            case 'dateEditor':
                                return function(container, options) {
                                    var a5UserTimeZone = getA5UserTimeZoneFlag(columnInfo);
                                    var cellEditor;
                                    if (a5UserTimeZone) {
                                        cellEditor = "<div a5-date-picker-field a5-size='responsive' a5-user-timezone='true' a5-model-date=" + options.field + " a5-date-only='true'></div>"
                                    } else {
                                        cellEditor = "<div a5-date-picker-field a5-size='responsive' a5-model-date=" + options.field + " a5-date-only='true'></div>"
                                    }

                                    var containerScope = angular.element(container).scope();
                                    containerScope['kendoEditorOptions'] = options.model;
                                    var editor = angular.element(cellEditor);
                                    editor.attr('uit-kendo-editor-options', 'kendoEditorOptions');
                                    $compile(editor)(containerScope);
                                    container.append(editor);
                                }
                            case 'dateTimeEditor':
                                return function(container, options) {
                                    var a5UserTimeZone = getA5UserTimeZoneFlag(columnInfo);
                                    var cellEditor;
                                    if (a5UserTimeZone) {
                                        cellEditor = "<div a5-date-time-picker-field a5-size='responsive' a5-user-timezone='true' a5-model-date=" + options.field + "></div>"
                                    } else {
                                        cellEditor = "<div a5-date-time-picker-field a5-size='responsive' a5-model-date=" + options.field + "></div>"
                                    }

                                    var containerScope = angular.element(container).scope();
                                    containerScope['kendoEditorOptions'] = options.model;
                                    var editor = angular.element(cellEditor);
                                    editor.attr('uit-kendo-editor-options', 'kendoEditorOptions');
                                    $compile(editor)(containerScope);
                                    container.append(editor);
                                }
                            case 'monthEditor':
                                return function(container, options) {
                                    var a5UserTimeZone = getA5UserTimeZoneFlag(columnInfo);
                                    var a5ServerTimeZone = getA5ServerTimeZoneFlag(columnInfo);
                                    var cellEditor;
                                    if (a5ServerTimeZone) {
                                        cellEditor = "<div a5-month-picker-field a5-size='responsive' a5-server-timezone='true' a5-model-date=" + options.field + "></div>"
                                    } else if (a5UserTimeZone) {
                                        cellEditor = "<div a5-month-picker-field a5-size='responsive' a5-user-timezone='true' a5-model-date=" + options.field + "></div>"
                                    } else {
                                        cellEditor = "<div a5-month-picker-field a5-size='responsive' a5-model-date=" + options.field + "></div>"
                                    }

                                    var containerScope = angular.element(container).scope();
                                    containerScope['kendoEditorOptions'] = options.model;
                                    var editor = angular.element(cellEditor);
                                    editor.attr('uit-kendo-editor-options', 'kendoEditorOptions');
                                    $compile(editor)(containerScope);
                                    container.append(editor);
                                }
                            default:
                                if (templateIdentifier !== 'false' && templateIdentifier !== 'default') {
                                    return function(container, options) {
                                        var editor;
                                        var cellEditor = angular.element(container).scope()['uitGridControl'].getEditorTemplate(options.field);
                                        if (_.isFunction(cellEditor)) {
                                            var editorString = cellEditor.call(this, options.model);
                                            editor = angular.element(editorString);
                                        } else {
                                            editor = angular.element(cellEditor);
                                        }
                                        var cellScope = angular.element(container).scope().$new();
                                        cellScope['kendoEditorOptions'] = options;
                                        //var editor = angular.element(cellEditor);
                                        editor.attr('uit-kendo-editor-options', 'kendoEditorOptions');
                                        container.append(editor);
                                        $compile(editor)(cellScope);
                                    }
                                } else {
                                    return undefined;
                                }
                        }
                    }

                    // iterate columns and assign editor and renderer to columns
                    var assignEditorsAndRenderers = function(columns) {

                        _.each(columns, function(column) {
                            if (!!column.editor && !_.isFunction(column.editor)) {
                                column.editor = getKendoEditor(column.editor, column);
                            }
                            if (!!column.renderer && !_.isFunction(column.renderer)) {
                                column.template = getKendoRenderer(column.renderer, column);
                            }


                            // iterate columns and assign editor and renderer to columns inside a column
                            if (!!column.columns && _.isArray(column.columns)) {
                                _.each(column.columns, function(column) {
                                    if (!!column.editor && !_.isFunction(column.editor)) {
                                        column.editor = getKendoEditor(column.editor, column);
                                    }
                                    if (!!column.renderer && !_.isFunction(column.renderer)) {
                                        column.template = getKendoRenderer(column.renderer, column);
                                    }
                                });
                            }
                        });
                    }

                    /**
                    Retuns the kendo field type from our fis compatible data types.  For example: double returns numeric
                    **/
                    var getFieldType = function(type) {
                        if (type.toLowerCase() == 'integer') {
                            return 'number';
                        } else if (type.toLowerCase() == 'double') {
                            return 'number';
                        } else if (type.toLowerCase() == 'date') {
                            return 'date';
                        } else if (type.toLowerCase() == 'datetime') {
                            return 'date';
                        } else if (type.toLowerCase() == 'time') {
                            return 'date';
                        } else if (type.toLowerCase() == 'currency') {
                            return 'number';
                        } else if (type.toLowerCase() == 'percentage') {
                            return 'number';
                        } else if (type.toLowerCase() == 'string') {
                            return 'string';
                        } else if (type.toLowerCase() == 'boolean') {
                            return 'boolean';
                        }
                        return type;
                    }

                    var buildColumnsSchema = function() {
                        if (gridMetaData) {
                            var modelFields = {};
                            schema = {
                                model: {
                                    fields: modelFields
                                }
                            }
                            _.each(gridMetaData, function(columnInfo) {
                                if (columnInfo['field']) {
                                    var fieldSchema = {};
                                    modelFields[columnInfo['field']] = fieldSchema;
                                    var editorMapping = columnInfo['editor'];

                                    if (!_.isUndefined(columnInfo['editable']) && !columnInfo['editable']) {
                                        fieldSchema['editable'] = false;
                                    } else if (_.isString(editorMapping) && "FALSE" === editorMapping.toUpperCase()) {
                                        fieldSchema['editable'] = false;
                                    }

                                    if (!_.isUndefined(columnInfo['nullable'])) {
                                        fieldSchema['nullable'] = columnInfo['nullable'];
                                    } else {
                                        fieldSchema['nullable'] = true;
                                    }
                                    if (!_.isUndefined(columnInfo['dataType'])) {
                                        var fieldType = getFieldType(columnInfo['dataType']);
                                        fieldSchema['type'] = fieldType;
                                    }
                                    if (!_.isUndefined(columnInfo['parse'])) {
                                        fieldSchema['parse'] = columnInfo['parse'];
                                    }
                                }
                            });
                        }
                    }

                    var buildConfiguration = function() {
                        buildColumnsSchema();
                        assignEditorsAndRenderers(columns);

                        var uitGridSortable = {
                            mode: 'multiple',
                            allowUnsort: true,
                            showIndexes: true
                        };

                        if ($attrs.uitGridEnableSorting) {
                            uitGridSortable = $scope.$eval($attrs.uitGridEnableSorting);
                        }

                        gridConfiguration = {
                            groupable: false,
                            autoBind: true,
                            sortable: uitGridSortable,
                            resizable: true,
                            navigatable: true,
                            reorderable: true,
                            scrollable: true,
                            filterable: true,
                            change: onRowSelectionChange,
                            columns: columns,
                            navigate: onGridNavigation
                            //                      columnMenu: {
                            //                          messages: {
                            //                              columns: fisI18nService.translate(['fisGrid', 'columnMenuColumns'], 'Columns'),
                            //                              filter: fisI18nService.translate(['fisGrid', 'columnMenuFilter'], 'Filter'),
                            //                              sortAscending: fisI18nService.translate(['fisGrid', 'columnMenuSortAsc'], 'Sort Ascending'),
                            //                              sortDescending: fisI18nService.translate(['fisGrid', 'columnMenuSortDesc'], 'Sort Descending')
                            //                          }
                            //                      }
                        }

                        if (!!$attrs.uitGroupable) {
                            gridConfiguration.groupable = true;
                        }

                        if (!!$attrs.uitSelectionMode) {
                            gridConfiguration.selectable = $attrs.uitSelectionMode;
                        }

                        if (liveFiltering) {
                            gridConfiguration.filterable = {
                                mode: "menu, row"
                            }
                        }

                        if (liveFilteringMode) {
                            gridConfiguration.filterable = {
                                mode: liveFilteringMode
                            }
                        }

                        if (editable) {
                            gridConfiguration.editable = {
                                mode: "incell",
                                createAt: 'top',
                                confirmation: false
                            }
                        } else {
                            gridConfiguration.editable = false;
                            gridConfiguration.autoBind = true;
                        }

                        if (pagingEnabled) {
                            gridConfiguration.pageable = {
                                pageSize: pageSize,
                                pageSizes: pageSizes,
                                buttonCount: 5
                            }
                        } else if (VirtualScrolling) {
                            // Virtual Scrolling
                            gridConfiguration.scrollable = {
                                virtual: true
                            }

                        } else {
                            gridConfiguration.pageable = false;
                        }

                        gridConfiguration.dataBound = DataSourceBoundHandler;
                        gridConfiguration.dataBinding = DataSourceBindingHandler;
                        gridConfiguration.edit = kendoGridEditHandler;

                        return this;
                    }

                    var onRowSelectionChange = function(event) {
                        if (!!$attrs.uitSelectionMode && $attrs.uitSelectionMode == "multiple") {
                            var selectedRows = event.sender.tbody.find('.k-state-selected');
                            $scope.backedUpSelectedData = $scope.uitGridControl.getSelectedData();
                            clearCleanRowSelection();
                            _.each(selectedRows, function(selectedRow) {
                                selectRow($(selectedRow).data()['uid']);
                            });
                            _.each($scope.uitGridControl.getSelectedData(), function(selectedRow) {
                                selectRow(selectedRow.uid);
                            });
                        } else if ($attrs.uitSelectionMode === "row") {
                            var selectedRows = event.sender.tbody.find('.k-state-selected');
                            _.each($scope.uitGridControl.getSelectedData(), function(selectedRow) {
                                selectRow(selectedRow.uid, false);
                            });
                            _.each(selectedRows, function(selectedRow) {
                                selectRow($(selectedRow).data()['uid']);
                            });
                        }
                        // this can be made smarter to only be fire when the new selections is different than previous
                        triggerUitGridRowSelectionChange();

                    }
                    //Any Navigation over the grid trigger's callback event
                    const onGridNavigation = function(event) {
                        let rowNavigation = angularScope.$eval($attrs.uitGridNavigation);
                        if (rowNavigation != undefined) {
                            const row = $(event.element).closest('tr')
                            const column = $(event.element).closest("td");
                            const columnIdx = $("td", row).index(event.element);
                            const rowId = kendoGridControl.tbody.find('tr').index(row);
                            const kendoRow = kendoGridControl.tbody.find('tr').eq(rowId)
                            let dataItem = kendoGridControl.dataItem(kendoRow)
                            const columnField = kendoGridControl.thead.find('th').eq(columnIdx).data('field');
                            rowNavigation.call(this, dataItem, columnField, column, columnIdx, row, rowId);
                        }
                    }

                    var buildDataSource = function(data) {
                        // Build datasource
                        var dataSourceOptions = {};

                        dataSourceOptions.batch = true;
                        dataSourceOptions.schema = schema;
                        if (userPreference) {
                            dataSourceOptions.sort = userPreference.sortOrder;
                            dataSourceOptions.filter = userPreference.filters;
                        }

                        if (pagingEnabled && pageSize) {
                            dataSourceOptions.pageSize = pageSize;
                            if (activePage)
                                dataSourceOptions.page = activePage;
                        } else if (VirtualScrolling) {
                            dataSourceOptions.pageSize = VirtualScrolling.pageSize
                        }

                        if (_.isArray(data)) {
                            if (data.length > 0 && data[0].constructor.name === "Object") {
                                dataSourceOptions.data = data;
                            } else {
                                dataSourceOptions.data = angular.fromJson(angular.toJson(data));
                            }
                        } else {
                            dataSourceOptions.data = [];
                        }

                        if (!!$attrs.uitGroupable) {
                            if ($attrs.uitGroupField) {
                                dataSourceOptions.group = JSON.parse($attrs.uitGroupField);
                            }
                        }

                        var ds = new kendo.data.DataSource(dataSourceOptions);
                        if (!!$attrs.uitGridAggregateOptions && !!angularScope.$eval($attrs.uitGridAggregateOptions)) {
                            ds.aggregate(angularScope.$eval($attrs.uitGridAggregateOptions));
                        }

                        return ds;
                    }

                    var pendingDataPromise = undefined;
                    var ERR_REFRESH_CANCELLED = 99;
                    var ERR_FETCH_DATA_FAILED = 33;
                    var rejectPendingFetchData = function() {
                        if (pendingDataPromise) {
                            pendingDataPromise.reject(ERR_REFRESH_CANCELLED);
                            pendingDataPromise = undefined;
                        }
                    }
                    var generateUid = function() {
                        return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, function() {
                            return Math.floor(Math.random() * 16).toString(16);
                        });
                    }
                    var fetchData = function() {
                        rejectPendingFetchData();
                        pendingDataPromise = $q.defer();

                        var uid = generateUid();
                        pendingDataPromise.uid = uid;
                        GridDataCallback().then(function fetchDataSucess(data) {
                            if (pendingDataPromise && pendingDataPromise.uid === uid) {
                                pendingDataPromise.resolve(data);
                                pendingDataPromise = undefined;
                            }
                        }, function fetchDataError() {
                            $log.error("Remote Error : grid data fetch failed");
                            if (pendingDataPromise && pendingDataPromise.uid === uid) {
                                pendingDataPromise.reject(ERR_FETCH_DATA_FAILED);
                                pendingDataPromise = undefined;
                            }
                        });

                        return pendingDataPromise.promise;
                    }

                    var buildingGrid;
                    var isGridReady = function() {
                        return !buildingGrid && !_.isUndefined(kendoGridControl);
                    }

                    /**
                    Used while creating the component.
                    @function 
                    @param {object} data - kendo accepted dataSoruce parameter
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return uitGridController
                    */
                    var buildGrid = function(data) {
                        activePage = 0;
                        if (_.isArray(columns) && ((showCheckBoxColumn && columns.length > 1) || (!showCheckBoxColumn && columns.length > 0))) {
                            buildingGrid = true;
                            showProgress(true);
                            gridIsNotEmpty();
                            buildConfiguration();
                            gridConfiguration.dataSource = buildDataSource(data);
                            init();
                            setColumnHeaderListeners();
                        } else {
                            gridIsEmpty();
                            showProgress(false);
                        }

                        return this;
                    }
                    /**
                    Sets listeners for columsn, this is for private use only as part of the grid mechanics
                    @function
                    @private
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return undefined
                    */
                    var setColumnHeaderListeners = function() {
                        var columnHeaders = jQGridElement.find('.k-grid-header-wrap > table > thead > tr[role="row"] > th[role="columnheader"]');
                        if (!!columnHeaders) {
                            _.each(columnHeaders, function(ch) {
                                if (!!$attrs.uitSortCallback) {
                                    $(ch).off('click', angularScope.$eval($attrs.uitSortCallback));
                                    $(ch).click(angularScope.$eval($attrs.uitSortCallback));
                                }
                            });
                        }
                    }
                    /** 
                    Used for creating the component
                    @public 
                    @param {boolean} withData - Immediately fetches the data by calling the uit-data promise.
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return gridController
                    */
                    var createGrid = function(withData) {
                        rejectPendingFetchData();
                        if (withData) {
                            showProgress(true);
                            gridIsNotEmpty();
                            fetchData().then(function(data) {
                                buildGrid(data);
                            }, function(error) {
                                if (error === ERR_REFRESH_CANCELLED) {
                                    $log.warn("Previous load data request during recreate grid cancelled!");
                                } else {
                                    buildGrid();
                                }
                            });
                        } else {
                            buildGrid();
                        }
                    }


                    function handleEmptyGridHeight() {
                        //                  if (kendoGridControl.dataSource.view().length === 0) {
                        //                      kendoGridControl.element.find('.k-grid-content').css('height', '17px');
                        //                  }
                    }

                    /**
                    Favor sizing the container of the grid instead of the grid.  The container of the gird could use something like uitStretchToContainer class 
                    Used to size the grid up.               
                    **/
                    var resize = function(height, width) {
                        if (kendoGridControl) {
                            containerHeight = height;
                            containerWidth = width;
                            setGridDimensions();
                            kendoGridControl.resize();
                            handleEmptyGridHeight();
                        }

                    }
                    /**
                    Replace the grid data with the provided data
                    @param {array} Array of objects or a json with an array of objects
                    **/
                    var updateGridWithLocalDataSource = function(data) {
                        if (kendoGridControl) {
                            clearSelectionVariables();
                            preRefreshUnbindings();

                            kendoGridControl.setDataSource(buildDataSource(data));

                            postRefreshBindings();
                        } else {
                            showProgress(false);
                        }
                    }
                    /**
                    Refreshes data by calling the uit-data promise
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return undefined
                    */
                    var refresh = function(retainGridSettings) {

                        var refreshPromise = $q.defer();


                        if (retainGridSettings) {
                            retainSettings();
                            activePage = kendoGridControl.dataSource.page();
                            pageSize = kendoGridControl.dataSource.pageSize();
                        } else {
                            activePage = 0;
                        }
                        if (isGridReady()) {
                            showProgress(true);
                            fetchData().then(function(data) {
                                updateGridWithLocalDataSource(data);
                                setColumnHeaderListeners();
                                refreshPromise.resolve();
                            }, function(error) {
                                if (error === ERR_REFRESH_CANCELLED) {
                                    $log.warn("Previous load data request for refresh cancelled!");
                                } else {
                                    updateGridWithLocalDataSource();
                                    // clear the grid
                                    setColumnHeaderListeners();
                                }
                                refreshPromise.reject();
                            });
                        }
                        return refreshPromise.promise;
                    }
                    /**
                    Enable pagingEnabled
                    @param {integer}    - Page size
                    @param {array}      - Array of ingegers with the predefined page sizes
                    **/
                    var enablePaging = function(pageSize, pageSizes) {
                        if (!pagingEnabled && isGridReady()) {
                            showProgress(true);
                            pagingEnabled = true;
                            disableVirtualScrolling();
                            if (enablePagingTimeOut) {
                                clearTimeout(enablePagingTimeOut);
                            }
                            enablePagingTimeOut = setTimeout(function() {
                                buildGrid(kendoGridControl.dataSource.data().toJSON());
                            });

                            return true;
                        }

                        return false;
                    }
                    /**
                    Disable paging
                    **/
                    var disablePaging = function() {
                        if (pagingEnabled && isGridReady()) {
                            showProgress(true);
                            pagingEnabled = false;
                            enableVirtualScrolling();
                            if (disablePagingTimeOut) {
                                clearTimeout(disablePagingTimeOut)
                            }
                            disablePagingTimeOut = setTimeout(function() {
                                buildGrid(kendoGridControl.dataSource.data().toJSON());
                            });

                            return true;
                        }

                        return false;
                    }
                    /**
                    Is paging enabled
                    **/
                    var isPagingEnabled = function() {
                        return pagingEnabled;
                    }

                    /** 
                    Is grid created with paging enabled with passed paging parameters
                    **/
                    var isGridCreatedWithPaging = function() {
                        return gridCreatedWithPaging;
                    }

                    var getPagingOption = function() {
                        return gridConfiguration.pageable;
                    }

                    var positionPager = function() {
                        if (!editable && pagingEnabled) {
                            var pagerEl = jQGridElement.find(".k-grid-pager").insertBefore(kendoGridControl.element.children(".k-grid-header"));
                            //pagerEl.css('display', 'inline');

                        }
                    }

                    /**
                    Add Row when grid is editable, returns nothig 
                    **/
                    var add = function() {
                        if (editable) {
                            showProgress(true);
                            if (addTimeOut) {
                                clearTimeout(addTimeOut);
                            }
                            addTimeOut = setTimeout(function() {
                                kendoGridControl.addRow();
                            });
                            // TODO: Need to improve this, it causes complete grid refresh                            
                        }
                    }
                    /**
                    Adds multiple rows, with predefined data
                    **/
                    var addRows = function(rowsToAdd) {
                        _.each(rowsToAdd, function(row, index) {
                            kendoGridControl.dataSource.insert(0, row);
                        });
                    }

                    /**
                    Gets the field name for the pased on TABLE cell. If more then one column is locked then correct the column offset.
                    **/
                    // TODO: need to figure out where locked content is.
                    var getFieldName = function(gridCell) {
                        var lockedContentOffset = jQGridElement.find('.k-grid-content-locked').length > 0 ? 1 : 0;

                        var lockedCells = jQGridElement.find('.k-grid-content-locked colgroup col');
                        if (lockedCells && lockedCells.length > 1) {
                            lockedContentOffset = lockedCells.length;
                        }

                        var headerRow = jQGridElement.find('.k-grid-header-wrap > table > thead > tr[role="row"]');
                        return headerRow.find('th[data-index=' + ((gridCell[0].cellIndex) + lockedContentOffset) + ']').data('field');
                    }

                    /**
                    Refreshes an specific html row with the data provided.
                    **/
                    var refreshRow = function(row, specificDataItem) {
                        var dataItem = specificDataItem;

                        if (!dataItem) {
                            dataItem = kendoGridControl.dataItem(row);
                        }

                        if (!dataItem) {
                            return;
                        }

                        var headerRow = jQGridElement.find('.k-grid-header-wrap > table > thead > tr[role="row"]');

                        $(row).children('td[role="gridcell"]').each(function(index, gridCell) {
                            var jQGridCell = $(gridCell);

                            if (jQGridCell.data('selectcell')) {
                                return;
                            }

                            var fieldName = headerRow.find('th[data-index=' + ++index + ']').data('field');
                            jQGridCell.removeClass('k-dirty-cell');
                            if (fieldName) {
                                var column = _.find(kendoGridControl.columns, function(columnConf) {
                                    return columnConf.field === fieldName
                                });

                                var template = column.template;

                                if (template !== undefined) {
                                    var kendoTemplate = kendo.template(template);
                                    // Render using template
                                    jQGridCell.html(kendoTemplate(dataItem));
                                } else {
                                    var fieldValue = dataItem[column.field];
                                    if (fieldValue == null) {
                                        fieldValue = undefined;
                                    }
                                    var format = column.format;
                                    var values = column.values;

                                    if (values !== undefined && values != null) {
                                        // use the text value mappings (for enums)
                                        for (var j = 0; j < values.length; j++) {
                                            var value = values[j];
                                            if (value.value == fieldValue) {
                                                jQGridCell.html(value.text);
                                                break;
                                            }
                                        }
                                    } else if (format !== undefined) {
                                        // use the format
                                        jQGridCell.html(kendo.format(format, fieldValue));
                                    } else {
                                        // Just dump the plain old value
                                        jQGridCell.html(fieldValue);
                                    }
                                }
                            }
                        });
                    }

                    // Updates given rows in a kendo grid without firing a databound event.
                    // This is needed since otherwise the entire grid will be redrawn.
                    function cancelRow(rows) {

                        kendoGridControl.closeCell();

                        $(rows).each(function(index, row) {

                            var dataItem = kendoGridControl.dataItem(row);
                            kendoGridControl.dataSource.cancelChanges(dataItem);

                            $(row).removeClass("k-state-disabled");
                            // TODO: Commenting this, as it causes some inconsistency (like grid totals do not get recalculated) between the dataSource, and view                            
                            // refreshRow( row ); 

                            // Since individual items are cancelled, it will not fire 'change' event on 
                            // dataSource. But we need to update the totals, so below call
                            //UITGridTotalsBarCtrl.updateTotals();          TOOD: may be need to write our own aggrgates                  
                        });
                    }

                    /**
                    Cancels all cahanges for the selected rows, restores the ui to the previous data and removes changed indicaters
                    @returns nothing
                    **/
                    var cancelSelectedRows = function() {
                        showProgress(true);
                        if (cancelSelectedRowsTimeOut) {
                            clearTimeout(cancelSelectedRowsTimeOut);
                        }
                        cancelSelectedRowsTimeOut = setTimeout(function() {
                            iterateSelecteData(function(dataItem) {
                                kendoGridControl.dataSource.cancelChanges(dataItem);
                            });

                            kendoGridControl.dataSource.fetch();
                            kendoGridControl.refresh();
                        })
                    }

                    /**
                    cancels changes for current row, refreshes the data and view removing changed indicators
                    @returns nothing
                    **/
                    var cancelCurrentRow = function() {
                        showProgress(true);
                        if (cancelCurrentRowTimeOut) {
                            clearTimeout(cancelCurrentRowTimeOut);
                        }
                        cancelCurrentRowTimeOut = setTimeout(function() {
                            cancelRow(getCurrentRow());
                            kendoGridControl.dataSource.fetch();
                            kendoGridControl.refresh();
                        })
                    }
                    /**
                    Gets the last selected row DATA
                    @returns {object}   object with all the column values from the datasource item
                    **/
                    var getCurrentRowData = function() {
                        if ($scope.lastSelectedUid) {
                            if (kendoGridControl.select().length === 1 && $scope.lastSelectedUid !== kendoGridControl.dataItem(kendoGridControl.select()[0]).uid) {
                                $scope.lastSelectedUid = kendoGridControl.dataItem(kendoGridControl.select()[0]).uid;
                            } else if (kendoGridControl.select().length === 2 && showCheckBoxColumn && $scope.lastSelectedUid !== kendoGridControl.dataItem(kendoGridControl.select()).uid) {
                                $scope.lastSelectedUid = kendoGridControl.dataItem(kendoGridControl.select()).uid;
                            }
                            var selectedElement = kendoGridControl.tbody.find("tr[data-uid='" + $scope.lastSelectedUid + "']");
                            return kendoGridControl.dataItem(selectedElement);

                        } else if (kendoGridControl.select().length == 1) {
                            return kendoGridControl.dataItem(kendoGridControl.select());
                        } else if (kendoGridControl.select().length == 2 && showCheckBoxColumn) {
                            return kendoGridControl.dataItem(kendoGridControl.select());
                        }
                    }


                    /**
                    Gets the current TR jquery element.
                    @returns {object} Jquery object for the selected row html TR
                    **/
                    var getCurrentRow = function() {
                        var selectedElement = kendoGridControl.current();
                        if (selectedElement) {
                            return selectedElement.closest('tr[role="row"]');
                        }
                    }

                    /**
                    Clones a row and calls the passed callback
                    @param {function} Callback function receiving the newly cloned data dnd the current row data
                    @returns nothing
                    **/
                    var cloneRow = function(resetRowCallback) {
                        var jqRow = getCurrentRow();
                        if (editable && jqRow) {
                            var currentRowData = kendoGridControl.dataItem(jqRow);
                            if (currentRowData) {
                                showProgress(true);
                                if (cloneRowTimeOut) {
                                    clearTimeout(cloneRowTimeOut);
                                }
                                cloneRowTimeOut = setTimeout(function() {
                                    var cloneData = {};

                                    _.each(kendoGridControl.dataSource.options.schema.model.fields, function(schemaObj, key) {
                                        cloneData[key] = currentRowData[key];
                                    });

                                    cloneData[kendoGridControl.dataSource.options.schema.model.id] = undefined;

                                    if (!_.isUndefined(resetRowCallback) && resetRowCallback != null) {
                                        resetRowCallback(cloneData, currentRowData);
                                    }

                                    kendoGridControl.dataSource.insert(0, cloneData);
                                }, 100);
                            }

                        }
                    };

                    var applyFilter = function(filters) {
                        kendoGridControl.dataSource.filter(filters);
                    };

                    var clearFilter = function() {
                        if (kendoGridControl) {
                            kendoGridControl.dataSource.filter({});
                        }
                    };

                    var clearSort = function() {
                        if (kendoGridControl) {
                            var currentSortings = kendoGridControl.dataSource.sort();
                            if (_.isArray(currentSortings) && currentSortings.length > 0) {
                                kendoGridControl.dataSource.sort({});
                            }
                        }
                    };

                    /**
                        Given the field name will return the editor template for the column.
                    **/
                    var getEditorTemplate = function(fieldName) {
                        for (var cnt = 0; cnt < columns.length; cnt++) {
                            if (columns[cnt].field === fieldName) {
                                return columns[cnt].editorTemplate;
                            }

                            // get tempalte for columns inside a column.
                            var level2Columns = columns[cnt].columns;
                            if (level2Columns && level2Columns.length > 0) {
                                for (var cnt2 = 0; cnt2 < level2Columns.length; cnt2++) {
                                    if (level2Columns[cnt2].field === fieldName) {
                                        return level2Columns[cnt2].editorTemplate;
                                    }
                                }
                            }
                        }
                    }
                    /**
                    Retrurns true false if the Passed column name is editable
                    @param {string} -   Column name
                    @returns {boolean}
                    **/
                    var isEditable = function(fieldName) {
                        for (var cnt = 0; cnt < columns.length; cnt++) {
                            if (columns[cnt].field === fieldName) {
                                return columns[cnt].editable;
                            }
                        }

                        return false;
                    }

                    var selectImportedData = function() {
                        if (importHappened && (selectionStartIndex <= selectionEndIndex)) {
                            importHappened = false;
                            if (!pagedIndex) {
                                pagedIndex = selectionEndIndex;
                            }

                            var rowModel;
                            kendoGridControl.items().each(function(idx, row) {
                                if (selectionStartIndex <= pagedIndex) {
                                    rowModel = kendoGridControl.dataItem(row);
                                    var uid = rowModel.get('uid');
                                    selectRow(uid, true);
                                    selectionStartIndex++;
                                    if (rowModel['error']) {
                                        rowsInErrorsIndex.push(uid);
                                    }
                                } else {
                                    return false;
                                }
                            });

                            if (pagedIndex <= selectionEndIndex) {
                                var remainingItems = selectionEndIndex - pagedIndex;
                                while (remainingItems > 0) {
                                    var dataAt = kendoGridControl.dataSource.at(selectionStartIndex++);
                                    selectedRows[dataAt.uid] = true;
                                    if (dataAt['error']) {
                                        rowsInErrorsIndex.push(dataAt.uid);
                                    }
                                    remainingItems--;
                                }
                            }
                        }

                        selectionStartIndex = selectionEndIndex = pagedIndex = undefined;
                    }

                    var importHappened, selectionStartIndex, selectionEndIndex, pagedIndex;
                    var importData = function(dataToLoad) {
                        if (editable) {
                            if (dataToLoad.data && dataToLoad.data.length > 0) {
                                showProgress(true);
                                if (VirtualScrolling) {
                                    kendoGridControl.dataSource.page(1);
                                }

                                var currentData = kendoGridControl.dataSource.data().toJSON();
                                var pageSize = kendoGridControl.dataSource.pageSize(),
                                    currentPage = kendoGridControl.dataSource.page();

                                selectionStartIndex = selectionEndIndex = pagedIndex = undefined;

                                if (pageSize > 0) {
                                    var tmp;
                                    selectionStartIndex = ((currentPage - 1) * pageSize);
                                    pagedIndex = selectionStartIndex + pageSize - 1;
                                    tmp = currentData.splice(0, selectionStartIndex);
                                    tmp = tmp.concat(dataToLoad.data);
                                    tmp = tmp.concat(currentData);
                                    currentData = tmp;
                                } else {
                                    selectionStartIndex = 0;
                                    currentData = dataToLoad.data.concat(currentData);
                                }

                                selectionEndIndex = selectionStartIndex + dataToLoad.data.length - 1;
                                if (_.isNumber(pagedIndex) && selectionEndIndex < pagedIndex) {
                                    pagedIndex = selectionEndIndex;
                                }
                                importHappened = true;

                                clearSelectionVariables();

                                showProgress(false);
                                kendoGridControl.dataSource.data(currentData);
                                kendoGridControl.refresh();
                            }
                        }
                    }

                    var exportData = function() {
                        throw "Export not supported";
                    }

                    /**
                    Gets the grid 'settings' to be saved in the preferences.  {columnPreferences (width,hidden), sortOrder, filters}
                    **/
                    var getGridSettings = function() {

                        if (kendoGridControl) {
                            var columnPreferences = [];
                            var kendoColumn;
                            var kendoColumns = kendoGridControl.columns;
                            var startIndex = 0;
                            if (showCheckBoxColumn) {
                                startIndex = 1;
                            }
                            for (var i = startIndex; i < kendoColumns.length; i++) {
                                kendoColumn = kendoColumns[i];

                                columnPreferences.push({
                                    name: kendoColumn.field,
                                    hidden: kendoColumn.hidden,
                                    width: (kendoColumn.hidden ? DEFAULT_COLUMN_WIDTH : ((kendoColumn.width < MINIMUM_COLUMN_WIDTH) ? MINIMUM_COLUMN_WIDTH : kendoColumn.width))
                                });
                            }

                            return {
                                columnPreferences: columnPreferences,
                                sortOrder: kendoGridControl.dataSource.sort(),
                                filters: kendoGridControl.dataSource.filter(),
                                newPwPreference: true
                            }
                        } else {
                            return userPreference;
                        }
                    }

                    /**
                    Sets preference , check code in getGridSettings to find the expected object             
                    **/
                    var setGridSettings = function(newUserPreference) {
                        userPreference = newUserPreference;

                        return this;
                    }

                    /**
                    Maintain the settings for the grid after refreshing (page, sorting, filters, column order)
                    **/
                    var retainSettings = function() {
                        userPreference = getGridSettings();

                        return this;
                    }

                    function getColumnWidth() {
                        var columnWidths = [];
                        var headerRow = jQGridElement.find('.k-grid-header-wrap > table > thead > tr[role="row"]');
                        headerRow.find('th').each(function(i, col) {
                            var fieldName = $(col).data('field')
                            if (!_.isEmpty(fieldName)) {
                                columnWidths.push({
                                    field: fieldName,
                                    width: col.offsetWidth
                                });
                            }
                        });

                        return columnWidths;
                    }
                    /**
                    Sets the grid to editable mode
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return gridController
                    */
                    var setEditable = function(isEditable) {
                        editable = isEditable;

                        return this;
                    }

                    /**
                    Sets if edit allowed on grid,to support New independent of Edit operation
                    Used for Security Implementation of CRUD
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return gridController
                    */
                    var setEditExistingRow = function(isEditExistingRow) {
                        editExistingRow = isEditExistingRow;
                        return this;
                    }
                    var DeleteMarker = new RowMarkHelper();
                    DeleteMarker.rowClassAdd("k-state-disabled");
                    DeleteMarker.rowClassRemove("k-grid-edit-row fis-row-activated");

                    /**
                    TODO
                    **/
                    var markForDelete = function() {
                        if (editable) {
                            iterateSelecteData(function(dataItem) {
                                dataItem.cmd = 123;
                                // TODO : This piece of code breaks module consistency, need to move this outside
                                markRow(dataItem.uid, DeleteMarker);
                            });
                        }
                        return this;
                    }

                    var iterateSelecteData = function(callback) {
                        var that = this;
                        _.each(selectedRows, function(selected, uid) {
                            if (selected) {
                                var dataItem = kendoGridControl.dataSource.getByUid(uid);
                                if (dataItem) {
                                    callback.call(that, dataItem);
                                }
                            }
                        });
                    }

                    var iterateSelectedRow = function(callback) {
                        var that = this;
                        var jqRowSelected;
                        _.each(selectedRows, function(selected, uid) {
                            if (selected) {
                                jqRowSelected = kendoGridControl.element.find("tr[data-uid='" + uid + "']");
                                callback.call(that, uid, jqRowSelected);
                            }
                        });
                    }

                    function selectRow(uid, rowSelected) {
                        var jqRowSelected;
                        var dataItem = kendoGridControl.dataSource.getByUid(uid);
                        if (rowSelected !== undefined) {
                            var jqRowSelected;
                            if (rowSelected) {
                                jqRowSelected = kendoGridControl.element.find("tr[data-uid='" + uid + "']");
                                jqRowSelected.addClass("k-state-selected");
                                selectedRows[uid] = true;
                                selectTheCheckbox(uid, true);
                                if(dataItem)
									dataItem[SELECT_CELL_FIELD_NAME] = true;
                                processAllRowSelection();
                            } else {
                                jqRowSelected = kendoGridControl.element.find("tr[data-uid='" + uid + "']");
                                jqRowSelected.removeClass("k-state-selected");
                                selectedRows[uid] = false;
                                selectTheCheckbox(uid, false);
                                if(dataItem)
									dataItem[SELECT_CELL_FIELD_NAME] = undefined;
                                processAllRowSelection();
                            }
                        } else {
                            jqRowSelected = kendoGridControl.element.find("tr[data-uid='" + uid + "']");
                            jqRowSelected.addClass("k-state-selected");
                            selectedRows[uid] = true;
                            selectTheCheckbox(uid, true);
                            if(dataItem)
								dataItem[SELECT_CELL_FIELD_NAME] = true;
                            processAllRowSelection();
                        }
                        return jqRowSelected;
                    }
                    // selects the rows that meet the filter function criteria
                    function selectRowsByFilterFunction(fn) {
                        var filteredDataRows = getAllData().filter(fn);
                        filteredDataRows.forEach(function(curRow) {
                            selectRow(curRow.uid);
                        });

                    }
                    //
                    function selectRowsByColumnValue(columnName, values) {
                        var filterFn = null;
                        values = _.unique(values);
                        if (Array.isArray(values)) {
                            filterFn = function(row) {
                                return values.contains(row[columnName]);
                            }
                        } else {
                            filterFn = function(row) {
                                return values === row[columnName];
                            }
                        }
                        selectRowsByFilterFunction(filterFn);
                    }

                    function selectedItemsLength() {
                        var len = 0;
                        _.each(selectedRows, function(value, key) {
                            if (value === true) {
                                len++;
                            }
                        });
                        return len;
                    }

                    function processAllRowSelection() {
                        if (!kendoGridControl.lockedHeader) {
                            return;
                        }
                        var selectedRowsCount = selectedItemsLength();
                        var selectAllCell = kendoGridControl.lockedHeader.find("input.select-all");
                        if (selectedRowsCount === 0) {
                            allRowsSelected = false;
                            selectAllCell.prop("checked", false);
                            selectAllCell.prop("indeterminate", false);
                        } else if (selectedRowsCount === kendoGridControl.dataSource.data().length) {
                            allRowsSelected = true;
                            selectAllCell.prop("checked", true);
                            selectAllCell.prop("indeterminate", false);
                        } else {
                            allRowsSelected = false;
                            selectAllCell.prop("indeterminate", true);
                        }
                    }

                    function selectAllRowsOnPage(select) {
                        kendoGridControl.items().each(function(idx, row) {
                            if (_.isUndefined(select) || select === true) {
                                var idValue = $(row).addClass("k-state-selected").data('uid');
                                selectTheCheckbox(idValue, true);
                                //if (!_.isUndefined(selectedRows[idValue])) {
                                selectedRows[idValue] = true;
                                // }
                                var dataItem = kendoGridControl.dataSource.getByUid(idValue);
                                if (dataItem) {
                                    dataItem[SELECT_CELL_FIELD_NAME] = true;
                                }
                            } else {
                                var idValue = $(row).removeClass("k-state-selected").data('uid');
                                selectTheCheckbox(idValue, false);
                                if (!_.isUndefined(selectedRows[idValue])) {
                                    selectedRows[idValue] = false;
                                }
                                var dataItem = kendoGridControl.dataSource.getByUid(idValue);
                                if (dataItem) {
                                    dataItem[SELECT_CELL_FIELD_NAME] = undefined;
                                }
                            }
                        });
                    }

                    function isNoRowSelected() {
                        return !_.some(selectedRows, function(value, key) {
                            return !!value
                        });
                    }
                    /**
                    Select/Deselect all rows programatically and trigger a row selection change
                    @function
                    @private
                    @param {boolean} selectAllCell - uid of the row to highlight
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return undefined
                    */
                    function selectAllRow(selectAllCell) {
                        if (selectAllRowTimeOut) {
                            clearTimeout(selectAllRowTimeOut);
                        }
                        selectAllRowTimeOut = setTimeout(function() {
                            if (selectAllCell.prop('indeterminate') === true) {
                                iterateSelectedRow(function(uid, jqRow) {
                                    $(jqRow).removeClass("k-state-selected");
                                    selectTheCheckbox(uid, false);
                                    selectedRows[uid] = false;
                                    var dataItem = kendoGridControl.dataSource.getByUid(uid);
                                    if (dataItem) {
                                        dataItem[SELECT_CELL_FIELD_NAME] = undefined;
                                    }
                                });

                                allRowsSelected = false;
                                selectAllCell.prop("checked", false);
                                selectAllCell.prop("indeterminate", false);
                            } else if (selectAllCell.prop('checked') === true) {
                                selectAllRowsOnPage(false);
                                allRowsSelected = false;
                                selectAllCell.prop("checked", false);
                                selectAllCell.prop("indeterminate", false);
                                selectedRows = {};
                            } else {
                                selectAllRowsOnPage(true);
                                allRowsSelected = true;
                                selectAllCell.prop("checked", true);
                                selectAllCell.prop("indeterminate", false);
                            }

                            triggerUitGridRowSelectionChange();
                        })
                    }
                    /**
                    this helps quickly getting all the rows without iterating to find dirty rows
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return {array} of objects(maps)
                    */
                    function isAllRowSelected() {
                        return allRowsSelected;
                    }

                    function selectTheCheckbox(uid, check) {
                        if (!!kendoGridControl.lockedContent) {
                            if (!check) {
                                $("#rowspan_" + uid + "").remove();
                            }
                            kendoGridControl.lockedContent.find("tr[data-uid='" + uid + "'] td>input.select-row").prop("checked", !!check);
                        }

                    }
                    /**
                    Gets the selected data, no parameters. If 'select all rows' is checked and if filter is applied, then return the filtered data, else return all the data.
                    Otherwise, return the 'user selected' data.
                    @function
                    @public
                    @return {array} Array of maps 
                
                    */
                    var getSelectedData = function() {
                        var data = [];
                        if (allRowsSelected) {
                            let filter = kendoGridControl.dataSource.filter();
                            if (!_.isUndefined(filter) && !_.isNull(filter)) {
                                var uitFilterOnAllPages = angularScope.$eval($attrs.uitFilterOnAllPages);
                                if (uitFilterOnAllPages) {
                                    data = getFilteredDataOnAllPages();
                                } else {
                                    data = kendoGridControl.dataSource.view();
                                }
                            } else {
                                data = kendoGridControl.dataSource.data();
                            }

                        } else {
                            iterateSelecteData(function(dataItem) {
                                data.push(dataItem);
                            });
                        }

                        return data;
                    }

                    var getFilteredDataOnAllPages = function() {
                        var dataSource = kendoGridControl.dataSource;
                        var filters = dataSource.filter();
                        var allData = dataSource.data();
                        var query = new kendo.data.Query(allData);
                        var data = query.filter(filters).data;
                        return data;
                    }

                    /**
                    Gets only the visible data on the grid
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return {array} of objects(maps)
                    */
                    var getFilteredData = function() {
                        return (kendoGridControl && kendoGridControl.dataSource) ? kendoGridControl.dataSource.view() : [];
                    }

                    var getFilteredGroupedData = function() {
                        var group = kendoGridControl ? kendoGridControl.dataSource.group() : null;

                        if (!group || group.length == 0) {
                            return getFilteredData();
                        } else {
                            var groupedData = getFilteredData();
                            var data = [];
                            for (var i = 0; i < groupedData.length; i++) {
                                getGroupedItems(groupedData[i], data);
                            }
                           return data;
                        }
                    }

                    function getGroupedItems(inputData, outputArr) {
                        if (!inputData || inputData.length == 0) 
                            return;
                        
                        if(inputData.hasSubgroups) {
                            for (var i = 0; i < inputData.items.length; i++) {
                                getGroupedItems(inputData.items[i], outputArr);
                            } 
                        } else {
                            for (var i = 0; i < inputData.items.length; i++) {
                                outputArr.push(inputData.items[i]);
                            } 
                        }
                    }

                    /**
                    This will get the total total, includding filtered data
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return {array} of objects(maps)
                    */
                    var getTotalFilteredDataCount = function() {
                        return (kendoGridControl && kendoGridControl.dataSource) ? kendoGridControl.dataSource._total : [];
                    }

                    /**
                    Gets the datasource data
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return {array} of objects (maps)
                    */
                    var getAllData = function() {
                        return (kendoGridControl && kendoGridControl.dataSource) ? kendoGridControl.dataSource.data() : [];
                    }

                    /**
                    Returns true If the data source in the grid has changes
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return {boolean}
                    */
                    var hasChanges = function() {
                        return (kendoGridControl && kendoGridControl.dataSource.hasChanges());
                    }

                    /**
                    Affects a row css for the give uid
                    @param {guid} uid - uid of the row to highlight
                    @param {string} cls - single or comma separated array of css classes
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return undefined
                    */
                    var highlightRow = function(uid, cls) {
                        if (!uid || arguments.length === 1) {
                            return;
                        }

                        if (arguments.length === 2) {
                            var rowToHighlight = kendoGridControl.element.find("tr[data-uid='" + uid + "']");
                            rowToHighlight.addClass(cls);
                        }
                    }

                    /**
                    Affects a row css for the give uid, by removing the classes mentioned in cls
                    @param {guid} uid - uid of the row to highlight
                    @param {string} cls - single or comma separated array of css classes
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return undefined
                    */
                    var removeRowHighlight = function(uid, cls) {
                        if (!uid || arguments.length === 1) {
                            return;
                        }

                        if (arguments.length === 2) {
                            var rowToRemoveHighlight = kendoGridControl.element.find("tr[data-uid='" + uid + "']");
                            rowToRemoveHighlight.removeClass(cls);
                        }
                    }

                    /**
                    Gets the created kendo control
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return kendo Control Object
                    */
                    var getKendoControl = function() {
                        return kendoGridControl;
                    }

                    /**
                    Returns the context menu kendo control
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return {object} kendo control pointer
                    */
                    var getKendoContextMenuControl = function() {
                        return contextMenuControl;
                    }

                    /**
                    Gets a list of the dirty rows, can be used with has changes or by itself
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return {array} of maps 
                    */
                    var getDirtyRows = function() {
                        var data = kendoGridControl.dataSource.data();
                        var dirtyRows = $.grep(data, function(item) {
                            if (item.dirty) {
                                return item;
                            }
                        });
                        return dirtyRows;
                    }

                    /**
                    Sets and selects the current row to the given uid. This programitically selects the row and triggers the row click event.
                    @param {guid} uid - uid of the row to be set and selected as the current row
                    @memberOf - aligneWeb.uitGrid.uitGridController
                    @return undefined 
                    */
                    var setCurrentRow = function(uid) {
                        var row = kendoGridControl.element.find("tr[data-uid='" + uid + "']");
                        if (setCurrentRowTimeOut) {
                            clearTimeout(setCurrentRowTimeOut);
                        }
                        setCurrentRowTimeOut = setTimeout(function() {
                            row.click();
                        });
                    }

                    // returns the columns of kendo grid
                    var getColumns = function() {
                        if (kendoGridControl) {
                            return kendoGridControl.columns;
                        }
                    }

                    var getDataItemByIndex = function(index) {
                        var data = kendoGridControl.dataSource.data();
                        if (data && data.length >= index) {
                            return data[index];
                        }
                    }

                    var getDataItemByUid = function(uid) {
                        return kendoGridControl.dataSource.getByUid(uid);
                    }

                    var removeRowByDataItem = function(dataItem) {
                        if (dataItem) {
                            return kendoGridControl.dataSource.remove(dataItem);
                        }
                    }

                    // GRID CONTROLLER API 
                    return {
                        //configure : configure, // TODO : need to remove this;
                        metadata: setMetaData,
                        columns: setColumns,
                        schema: setSchema,
                        createGrid: createGrid,
                        editable: setEditable,
                        getEditorTemplate: getEditorTemplate,
                        getFieldType: getFieldType,
                        // User Preferences                  
                        getGridSettings: getGridSettings,
                        setGridSettings: setGridSettings,
                        retainSettings: retainSettings,

                        //Used for Security Implementation of CRUD
                        editExistRow: setEditExistingRow,

                        // Grid Functions                       
                        setGridDimensions: setGridDimensions,
                        resize: resize,
                        refresh: refresh,
                        hasChanges: hasChanges,
                        getFieldName: getFieldName,
                        enablePaging: enablePaging,
                        disablePaging: disablePaging,
                        getAllData: getAllData,
                        isPagingEnabled: isPagingEnabled,
                        isGridCreatedWithPaging: isGridCreatedWithPaging,
                        getPagingOption: getPagingOption,
                        positionPager: positionPager,
                        showLoading: function() {
                            showProgress(true);
                        },
                        hideLoading: function() {
                            showProgress(false);
                        },

                        // Selection                        
                        getSelectedData: getSelectedData,
                        selectRowsByColumnValue: selectRowsByColumnValue,
                        selectRowsByFilterFunction: selectRowsByFilterFunction,
                        selectRow: selectRow,
                        handleRowErrors: addRowInError,
                        markRow: markRow,
                        unmarkRow: unmarkRow,

                        // Fiters
                        applyFilter: applyFilter,
                        clearFilter: clearFilter,

                        //Sort,
                        clearSort: clearSort,
                        // CRUD
                        add: add,
                        addRows: addRows,
                        cancelSelectedRows: cancelSelectedRows,
                        cancelCurrentRow: cancelCurrentRow,
                        markForDelete: markForDelete,
                        cloneRow: cloneRow,

                        // Export-Import
                        importData: importData,
                        exportData: exportData,

                        destroy: cleanUp,
                        clearGridData: clearGridData,
                        showHideColumns: showHideColumns,
                        getFilteredDataOnAllPages: getFilteredDataOnAllPages,
                        getFilteredData: getFilteredData,
                        getTotalFilteredDataCount: getTotalFilteredDataCount,
                        getCurrentRowData: getCurrentRowData,
                        highlightRow: highlightRow,
                        removeRowHighlight: removeRowHighlight,
                        getKendoControl: getKendoControl,
                        getKendoContextMenuControl: getKendoContextMenuControl,
                        isEditable: isEditable,
                        getDirtyRows: getDirtyRows,
                        setCurrentRow: setCurrentRow,
                        getColumns: getColumns,
                        getDataItemByIndex: getDataItemByIndex,
                        getDataItemByUid: getDataItemByUid,
                        removeRowByDataItem: removeRowByDataItem,
                        highlightSuccessfulRows: highlightSuccessfulRows,
                        getFilteredGroupedData: getFilteredGroupedData
                    }
                })($scope, gridElem, transformDataTypeToColumn, $parse($attrs.uitData)($scope.$parent), fisI18nService);

                GridControl.editable($scope.$eval($attrs.uitEditable) && !uitViewPreferencesSvc.isActiveViewPanelBrowseOnly());
                GridControl.setGridSettings($scope.$eval($attrs.uitGridSettings));
                GridControl.editExistRow($scope.$eval($attrs.uitEditExistingRow));

                $scope['uitGridControl'] = GridControl;
                if (!_.isEmpty($attrs.uitGridControlVar)) {
                    var targetScope = $scope.$parent;
                    var level = $attrs.uitControllerLevel;
                    if (!level) {
                        level = 1;
                    }
                    for (var cnt = 1; cnt < level; cnt++) {
                        targetScope = targetScope.$parent;
                    }
                    $parse($attrs.uitGridControlVar).assign(targetScope, GridControl);
                } else {
                    var targetScope = $scope.$parent;
                    var level = $attrs.uitControllerLevel;
                    if (!level) {
                        level = 1;
                    }
                    for (var cnt = 1; cnt < level; cnt++) {
                        targetScope = targetScope.$parent;
                    }
                    targetScope['uitGridControl'] = GridControl;

                }
            }
        }
    }
]);
