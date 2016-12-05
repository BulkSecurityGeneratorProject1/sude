(function() {
    'use strict';

    angular
        .module('sudeApp')
        .controller('SdOrderHeaderDialogController', SdOrderHeaderDialogController);

    SdOrderHeaderDialogController.$inject = ['Principal','$timeout','$filter', '$scope','orderItems','$http', '$stateParams','sequence', '$uibModalInstance', 'entity','SdStation','OneSdStation', 'SdOrderHeader','SdOrderItemUpdate'];

    function SdOrderHeaderDialogController (Principal,$timeout,$filter, $scope,orderItems,$http, $stateParams,sequence, $uibModalInstance, entity,SdStation,OneSdStation, SdOrderHeader,SdOrderItemUpdate) {
        var vm = this;

        vm.sdOrderHeader = entity;
        vm.clear = clear;
        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.save = save;
//        vm.sumPay = sumPay;
        vm.ids = $stateParams.ids;
        vm.sdStations = SdStation.query({page: 0,size: 100,sort: null});
        vm.nowDate = $filter("date")(new Date(), "yyyyMM");
        vm.sdOrderHeader.orderHeaderNo = vm.nowDate+"-"+sequence.seqId;
        vm.sdOrderHeader.departBatch = vm.nowDate+"-"+sequence.seqId;
        vm.sdOrderItems = orderItems;
        Principal.identity().then(function(account) {
            vm.sdOrderHeader.fromStation = account.station;
            vm.station = SdStation.get({id:vm.sdOrderHeader.fromStation}).$promise;
            
        });
        
    	
//        function sumPay(){
//        	vm.sdOrderHeader.freightSum = 0;
//        	if(vm.sdOrderHeader.cashPay){
//        		vm.sdOrderHeader.freightSum += vm.sdOrderHeader.cashPay;
//        	}
//        	if(vm.sdOrderHeader.driverCollection){
//        		vm.sdOrderHeader.freightSum += vm.sdOrderHeader.driverCollection;
//        	}
//        	if(vm.sdOrderHeader.handlingCharges){
//        		vm.sdOrderHeader.freightSum += vm.sdOrderHeader.handlingCharges;
//        	}
//        	if(vm.sdOrderHeader.receiveShipment){
//        		vm.sdOrderHeader.freightSum += vm.sdOrderHeader.receiveShipment;
//        	}
//        	if(vm.sdOrderHeader.reply){
//        		vm.sdOrderHeader.freightSum += vm.sdOrderHeader.reply;
//        	}
//        }
        
        $timeout(function (){
        	//统计总运费、实际载重
            vm.sdOrderHeader.freightSum = 0;
            vm.sdOrderHeader.practical = 0;
            for (var i = orderItems.length; i--;) {
            	vm.sdOrderHeader.freightSum += orderItems[i].totalFreight;
            	vm.sdOrderHeader.practical += orderItems[i].totalWeight;
            }
            angular.element('.form-group:eq(1)>input').focus();
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function save () {
            vm.isSaving = true;
            if (vm.sdOrderHeader.id !== null) {
                SdOrderHeader.update(vm.sdOrderHeader, onSaveSuccess, onSaveError);
            } else {
                SdOrderHeader.save(vm.sdOrderHeader, updateOrderItem, onSaveError);
            }
        }
        
        /**
         * 修改订单状态
         */
        function updateOrderItem(result){
        	// 从后台搜索获取数据
            $http.get('/api/sd-order-items-update', {
                params: {
                	orderStat: "orderStat_2",
                	ids: vm.ids,
                	orderHeaderNo:result.id
                }
              }).then(function(response){
            	  $uibModalInstance.close();
              });
        }
        
        function onSaveSuccess (result) {
            $scope.$emit('sudeApp:sdOrderHeaderUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError () {
            vm.isSaving = false;
        }

        vm.datePickerOpenStatus.departureTime = false;

        function openCalendar (date) {
            vm.datePickerOpenStatus[date] = true;
        }
        
        // 从后台搜索获取数据
        $scope.getStation = function(val) {
        	return $http.get('/api/_search/searchSdStation', {
        		params: {
        			query: val,
        			sensor: false
        		}
        	}).then(function(response){
        		return response.data;
        	});
        };
        //选中目的站
        $scope.setconStationDetail = function ($item, $model) { 
        	vm.sdOrderHeader.toStation = $item.id;
        	vm.sdOrderHeader.toStationName = $item.stationName;
        };
        //选中卸货地站
        $scope.setconStationUnload = function ($item, $model) { 
        	vm.sdOrderHeader.unloadPlace = $item.stationName;
        };
        
        // 选择起运地改变合同编号
        $scope.changeStation = function(selectedValue) {
//        	var promise = OneSdStation.query({id:selectedValue});
//        	promise.then(function(data) {
//        		//$scope.user = data; //调用接口，如果获取数据成功 resolve()方法
//                console.log("data="+data);
//            }, 
//            function(data) {
//            	console.log("data="+data);
//            });
        };
        
        // 从后台搜索获取数据
        $scope.getCars = function(val) {
        	return $http.get('/api/_search/searchById', {
        		params: {
        			id: val,
        			sensor: false
        		}
        	}).then(function(response){
        		return response.data;
        	});
        };
        
        //选中车号
        $scope.setconCarNo = function ($item, $model) { 
        	vm.sdOrderHeader.carNo = $item.id;
        };
        
        // 从后台搜索获取数据
        $scope.getDrivers = function(val) {
        	return $http.get('/api/_search/sd-drivers', {
        		params: {
        			query: val,
        			sensor: false
        		}
        	}).then(function(response){
        		return response.data;
        	});
        };
        
        //选中司机
        $scope.setconDriver = function ($item, $model) { 
        	vm.sdOrderHeader.driverId = $item.id;
        	vm.sdOrderHeader.driverName = $item.driverName;
        	vm.sdOrderHeader.mobilePhone = $item.mobilePhone;
        };
        
    }
})();
