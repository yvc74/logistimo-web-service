/**
 * Created by yuvaraj on 21/11/17.
 */
logistimoApp.controller('assetTemplateController', ['$scope', '$timeout','domainCfgService', function ($scope, $timeout, domainCfgService) {
    domainCfgService.getAssetSysCfg('2').then(function(data) {
        $scope.allAssets = data.data;
    }).catch(function error(msg) {
        $scope.showErrorMsg(msg);
    }).finally(function () {
        $scope.hideLoading();
    });

    $scope.filterAssets = function (query) {
        var rData = {results: []};
        for(var key in $scope.allAssets) {
            if($scope.allAssets[key].toLowerCase().indexOf(query.term.toLowerCase()) != -1) {
                rData.results.push({'text': $scope.allAssets[key], 'id': key});
            }
        }
        query.callback(rData);
    };

    $scope.filterStatus = function(query){

        var sData = {results: []};

        sData.results[0] = {id:'tn',text:"Normal"};
        sData.results[1] = {id:'tl',text:"Low"};
        sData.results[2] = {id:'th',text:"High"};
        sData.results[3] = {id:'tu',text:"Unknown"};

        query.callback(sData);
    };

    $scope.$watch('widget.conf.entityTag',function(newVal,oldVal){
        if (oldVal != newVal) {
            if (newVal instanceof Object || newVal == undefined) {
                $scope.widget.conf.exEntityTag = "";
            }
        }
    });

    $scope.$watch('widget.conf.exEntityTag',function(newVal,oldVal){
        if (oldVal != newVal) {
            if (newVal instanceof Object || newVal == undefined) {
                $scope.widget.conf.entityTag = "";
            }
        }
    });
    
    }
]);