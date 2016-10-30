
// Define the `myApp` module
var myApp = angular.module('myApp', []);

// Define the `CartController` controller on the `myApp` module
myApp.controller('CartController', function CartController($scope) {

    $scope.cart = [
        {
            id: 1,
            name: "iPhone",
            quantity: 2,
            price: 4300
        },
        {
            id: 2,
            name: "iPad",
            quantity: 7,
            price: 2300
        },
        {
            id: 3,
            name: "iMac",
            quantity: 3,
            price: 14300
        },
        {
            id: 4,
            name: "iPod",
            quantity: 8,
            price: 430
        },
        {
            id: 5,
            name: "iWatch",
            quantity: 1,
            price: 3300
        }
    ];

    $scope.totalPrice = function () {
        var total = 0;
        angular.forEach($scope.cart, function (item) {
            total += item.quantity * item.price;
        });
        return total;
    }

    $scope.totalQuantity = function () {
        var total = 0;
        angular.forEach($scope.cart, function (item) {
            total += item.quantity;
        });
        return total;
    }

    $scope.findIdx = function (id) {
        var idx = -1;
        angular.forEach($scope.cart, function (item, key) {
            if (item.id === id) {
                idx = key;
                return;
            }
        });

        return idx;
    }

    $scope.remove = function (id) {
        var idx = $scope.findIdx(id);
        if (idx !== -1) {
            $scope.cart.splice(idx, 1);
        }
    }

    $scope.reduce = function (id) {
        var idx = $scope.findIdx(id);
        if (idx !== -1) {
            if ($scope.cart[idx].quantity > 1) {
                --$scope.cart[idx].quantity;
            }
            else {
                var ret = confirm("是否从购物车删除该商品？");
                if (ret) {
                    $scope.remove(id);
                }
            }
        }
    }

    $scope.increase = function (id) {
        var idx = $scope.findIdx(id);
        if (idx !== -1) {
            ++$scope.cart[idx].quantity;
        }
    }

    $scope.$watch("cart", function (newValue, oldValue) {
        angular.forEach(newValue, function (item, key) {
            if (item.quantity < 1) {
                var ret = confirm("是否从购物车删除该商品？");
                if (ret) {
                    $scope.remove(item.id);
                }
                else {
                    newValue[key].quantity = oldValue[key].quantity;
                }
            }
        })
    }, true);
});