/*
 * Copyright © 2018 Logistimo.
 *
 * This file is part of Logistimo.
 *
 * Logistimo software is a mobile & web platform for supply chain management and remote temperature monitoring in
 * low-resource settings, made available under the terms of the GNU Affero General Public License (AGPL).
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
 * Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.  If not, see
 * <http://www.gnu.org/licenses/>.
 *
 * You can be released from the requirements of the license by purchasing a commercial license. To know more about
 * the commercial license, please contact us at opensource@logistimo.com
 */

/**
 * Created by Mohan Raja on 11/03/18.
 */


logistimoApp.controller('CreateReturnsController', CreateReturnsController);
logistimoApp.controller('DetailReturnsController', DetailReturnsController);
logistimoApp.controller('ReceiveReturnsController', ReceiveReturnsController);
logistimoApp.controller('ListReturnsController', ListReturnsController);

CreateReturnsController.$inject = ['$scope','$location', 'returnsService','trnService'];
DetailReturnsController.$inject = ['$scope', '$uibModal', 'requestContext', 'RETURNS', 'returnsService', 'conversationService', 'activityService'];
ListReturnsController.$inject = ['$scope', '$location', 'requestContext', 'RETURNS', 'returnsService', 'exportService'];

function CreateReturnsController($scope, $location, returnsService, trnService) {

    const SOURCE_WEB = 1;

    $scope.returnItems = returnsService.getItems();
    $scope.returnOrder = returnsService.getOrder();

    $scope.showLoading();
    trnService.getReasons('ro')
        .then(function (data) {
            $scope.reasons = [""].concat(data.data.rsns);
            $scope.defaultReason = data.data.defRsn;
        })
        .then(function () {
            angular.forEach($scope.returnItems, function (returnItem) {
                if (returnItem.materialTags) {
                    trnService.getReasons('ro', returnItem.materialTags).then(function (data) {
                        returnItem.reasons = [""].concat(data.data.rsns);
                        returnItem.returnReason = data.data.defRsn;
                        angular.forEach(returnItem.returnBatches, function (returnBatch) {
                            returnBatch.returnReason = angular.copy(returnItem.returnReason);
                        });
                    });
                } else {
                    returnItem.reasons = angular.copy($scope.reasons);
                    returnItem.returnReason = angular.copy($scope.defaultReason);
                    angular.forEach(returnItem.returnBatches, function (returnBatch) {
                        returnBatch.returnReason = angular.copy(returnItem.returnReason);
                    });
                }
            })
        }).catch(function error(msg) {
            $scope.showErrorMsg(msg);
        }).finally(function () {
            $scope.hideLoading();
        });

    $scope.cancel = function() {
        $scope.setPageSelection('orderDetail');
        $scope.enableScroll();
    };

    $scope.create = function() {
        if(isReturnValid('returnQuantity')) {
            if(isReturnValid('returnReason')) {
                if(!$scope.transConfig.rosm || isReturnValid('returnMaterialStatus')) {
                    $scope.showLoading();
                    returnsService.create(getCreateRequest()).then(function (data) {
                        $scope.showSuccess("Returns created successfully");
                        $location.path('/orders/returns/detail/' + data.data.return_id);
                    }).catch(function error(msg) {
                        $scope.showErrorMsg(msg);
                    }).finally(function () {
                        $scope.hideLoading();
                    });
                } else {
                    $scope.showWarning("Material status is mandatory for all materials being returned")
                }
            } else {
                $scope.showWarning("Reason is mandatory for all materials being returned")
            }
        } else {
            $scope.showWarning("Please specify return quantity for all materials")
        }
    };

    function isReturnValid(field) {
        return $scope.returnItems.every(function (returnItem) {
            if (checkNotNullEmpty(returnItem.returnBatches)) {
                return returnItem.returnBatches.some(function (returnBatch) {
                    return checkNotNullEmpty(returnBatch[field]);
                });
            } else {
                return checkNotNullEmpty(returnItem[field]);
            }
        });
    }

    function getCreateRequest() {
        var items = [];
        angular.forEach($scope.returnItems, function(returnItem) {
            var item = {
                material_id : returnItem.id,
                return_quantity : returnItem.returnQuantity,
                material_status : returnItem.returnMaterialStatus,
                reason : returnItem.returnReason
            };
            if(checkNotNullEmpty(returnItem.returnBatches)) {
                item.batches = [];
                var totalReturnQuantity = 0;
                angular.forEach(returnItem.returnBatches, function(returnBatch){
                    if(checkNotNullEmpty(returnBatch.returnQuantity)) {
                        item.batches.push({
                            batch_id: returnBatch.id,
                            return_quantity: returnBatch.returnQuantity,
                            material_status: returnBatch.returnMaterialStatus,
                            reason: returnBatch.returnReason
                        });
                        totalReturnQuantity += returnBatch.returnQuantity * 1;
                    }
                });
                item.return_quantity = totalReturnQuantity;
            }
            items.push(item);
        });

        return {
            order_id : $scope.order.id,
            comment : $scope.comment,
            items : items,
            source : SOURCE_WEB
        }
    }
}

function DetailReturnsController($scope, $uibModal, requestContext, RETURNS, returnsService, conversationService, activityService) {
    $scope.RETURNS = RETURNS;
    $scope.page = 'detail';
    $scope.subPage = 'consignment';

    var returnId = requestContext.getParam("returnId");

    $scope.getReturn = function() {
        $scope.showLoading();
        returnsService.get(returnId)
            .then(function (data) {
                $scope.returns = data.data;
            })
            .then(getMessageCount)
            .then(getStatusHistory)
            .then(checkStatusList)
            .catch(function error(msg) {
                $scope.showErrorMsg(msg);
            }).finally(function () {
                $scope.hideLoading();
            });
    };
    $scope.getReturn();

    function getMessageCount() {
        conversationService.getMessagesByObj('RETURNS', returnId, 0, 1, true).then(function (data) {
            if (checkNotNullEmpty(data.data)) {
                $scope.messageCount = data.data.numFound;
            }
        })
    }

    $scope.setMessageCount = function (count) {
        $scope.messageCount = count;
    };

    function getStatusHistory() {
        activityService.getStatusHistory(returnId, 'RETURNS', null).then(function (data) {
            if (checkNotNullEmpty(data.data) && checkNotNullEmpty(data.data.results)) {
                $scope.history = data.data.results;
                var hMap = {};
                var pVal;
                $scope.history.forEach(function (data) {
                    if (checkNullEmpty(hMap[data.newValue])) {
                        hMap[data.newValue] = {
                            "status": RETURNS.statusLabel[data.newValue],
                            "updatedon": data.createDate,
                            "updatedby": data.userName,
                            "updatedId": data.userId
                        };
                        if (RETURNS.status.CANCELLED == data.newValue) {
                            pVal = data.prevValue;
                        }
                    }
                });
                $scope.si = [];
                var end = false;
                var siInd = 0;

                function constructStatus(stCode, stText) {
                    if ($scope.returns.status.status != RETURNS.status.CANCELLED || !end) {
                        $scope.si[siInd] = (!end && hMap[stCode]) ? hMap[stCode] : {
                            "status": stText,
                            "updatedon": "",
                            "updatedby": ""
                        };
                        $scope.si[siInd].completed = $scope.returns.status.status == stCode ? "end" : (end ? "false" : "true");
                        siInd += 1;
                    }
                    if (!end) {
                        end = $scope.returns.status.status == stCode || ($scope.returns.status.status == RETURNS.status.CANCELLED && pVal == stCode);
                    }
                }

                constructStatus(RETURNS.status.OPEN, RETURNS.statusLabel[RETURNS.status.OPEN]);
                constructStatus(RETURNS.status.SHIPPED, RETURNS.statusLabel[RETURNS.status.SHIPPED]);
                constructStatus(RETURNS.status.RECEIVED, RETURNS.statusLabel[RETURNS.status.RECEIVED]);
                if ($scope.returns.status.status == RETURNS.status.CANCELLED) {
                    $scope.si[siInd] = hMap[RETURNS.status.CANCELLED];
                    $scope.si[siInd].completed = "cancel";
                }
            }
        });
    }

    $scope.toggleStatusHistory = function () {
        $scope.displayStatusHistory = !$scope.displayStatusHistory;
    };

    function checkStatusList() {
        switch ($scope.returns.status.status) {
            case RETURNS.status.OPEN:
                if ($scope.returns.customer.has_access) {
                    $scope.statusList = [RETURNS.status.SHIPPED];
                }
                $scope.statusList.push(RETURNS.status.CANCELLED);
                break;
            case RETURNS.status.SHIPPED:
                $scope.statusList = [];
                if ($scope.returns.vendor.has_access) {
                    $scope.statusList.push(RETURNS.status.RECEIVED);
                }
                $scope.statusList.push(RETURNS.status.CANCELLED);
                break;
            default:
                $scope.statusList = [];
        }
    }

    $scope.changeStatus = function (value) {
        $scope.new_status = value;
        $scope.newStatus = {};
        if (value == RETURNS.status.RECEIVED) {
            $scope.toggleReceive();
            return;
        }
        $scope.modalInstance = $uibModal.open({
            templateUrl: 'views/returns/returns-ship.html',
            scope: $scope,
            keyboard: false,
            backdrop: 'static'
        });
    };

    $scope.toggleReceive = function (update) {
        if ($scope.page == 'detail') {
            $scope.page = "receive";
        } else {
            $scope.page = 'detail';
            if (update) {
                $scope.getReturn();
            }
        }
    };

    $scope.doShip = function() {
        $scope.showLoading();
        returnsService.ship(returnId, {comment:$scope.newStatus.comment}).then(function (data) {
            $scope.closeShip();
            $scope.getReturn();
        }).catch(function error(msg) {
            $scope.showErrorMsg(msg);
        }).finally(function () {
            $scope.hideLoading();
        });
    };

    $scope.closeShip = function () {
        $scope.modalInstance.dismiss('cancel');
    };
}

function ReceiveReturnsController($scope, returnsService, requestContext) {

    var returnId = requestContext.getParam("returnId");
    $scope.comment = undefined;

    $scope.doReceive = function() {
        $scope.showLoading();
        returnsService.receive(returnId,{comment:$scope.comment}).then(function (data) {
            $scope.toggleReceive(true);
        }).catch(function error(msg) {
            $scope.showErrorMsg(msg);
        }).finally(function () {
            $scope.hideLoading();
        });
    }
}

function ListReturnsController($scope, $location, requestContext, RETURNS, returnsService, exportService) {

    $scope.RETURNS = RETURNS;
    $scope.wparams = [["eid", "entity.id"], ["status", "status"], ["from", "from", "", formatDate2Url], ["to", "to", "", formatDate2Url], ["oid", "orderId"], ["o", "offset"], ["s", "size"]];

    ListingController.call(this, $scope, requestContext, $location);

    $scope.localFilters = ['entity', 'status', 'from', 'to', 'orderId'];
    $scope.initLocalFilters = [];

    $scope.fetch = function() {
        $scope.showLoading();
        returnsService.getAll({
            customerId: checkNotNullEmpty($scope.entity) ? $scope.entity.id : undefined,
            vendorId: checkNotNullEmpty($scope.entity) ? $scope.entity.id : undefined,
            status: $scope.status,
            startDate: formatDate($scope.from),
            endDate: formatDate($scope.to),
            orderId: $scope.orderId
        }).then(function (data) {
            $scope.filtered = data.data.returns;
            $scope.setResults({
                results: data.data.returns,
                numFound: data.data.total_count
            });
        }).catch(function error(msg) {
            $scope.showErrorMsg(msg);
        }).finally(function () {
            $scope.loading = false;
            $scope.hideLoading();
        });
    };

    $scope.init = function() {
        var entityId = requestContext.getParam("eid");
        if (checkNotNullEmpty(entityId)) {
            if (checkNullEmpty($scope.entity) || $scope.entity.id != parseInt(entityId)) {
                $scope.entity = {id: parseInt(entityId), nm: ""};
                $scope.initLocalFilters.push("entity")
            }
        }
        $scope.status = requestContext.getParam("status") || "";
        $scope.from = parseUrlDate(requestContext.getParam("from"));
        $scope.to = parseUrlDate(requestContext.getParam("to"));
        $scope.orderId = requestContext.getParam("oid");
        $scope.fetch();
    };
    $scope.init();

    $scope.exportData = function() {
        $scope.showLoading();
        exportService.exportData({
            from_date: checkNotNullEmpty($scope.from) ? formatDate2Url($scope.from) : undefined,
            end_date: checkNotNullEmpty($scope.to) ? formatDate2Url($scope.to) : undefined,
            customer_id: eid,
            vendor_id: eid,
            order_id: $scope.orderId,
            status: $scope.status,
            titles: {
                filters: getCaption()
            },
            module: module,
            templateId: templateId
        }).then(function (data) {
            $scope.showSuccess(data.data);
        }).catch(function error(msg) {
            $scope.showErrorMsg(msg);
        }).finally(function(){
            $scope.hideLoading();
        });
    }
}


