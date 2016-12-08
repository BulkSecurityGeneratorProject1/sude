(function() {
    'use strict';

    angular
        .module('sudeApp')
        .controller('NavbarController', NavbarController);

    NavbarController.$inject = ['$state','$scope','$rootScope', 'Auth', 'Principal', 'ProfileService', 'LoginService'];

    function NavbarController ($state,$scope,$rootScope, Auth, Principal, ProfileService, LoginService) {
        var vm = this;

        $rootScope.showNavbar = true;
        
        vm.isNavbarCollapsed = true;
        vm.isAuthenticated = Principal.isAuthenticated;

        $scope.$on('authenticationSuccess', function() {
            getAccount();
        });

        getAccount();

        function getAccount() {
            Principal.identity().then(function(account) {
                vm.account = account;
            });
        }
        
        ProfileService.getProfileInfo().then(function(response) {
            vm.inProduction = response.inProduction;
            vm.swaggerEnabled = response.swaggerEnabled;
        });

        vm.login = login;
        vm.logout = logout;
        vm.toggleNavbar = toggleNavbar;
        vm.collapseNavbar = collapseNavbar;
        vm.$state = $state;

        function login() {
            collapseNavbar();
            LoginService.open();
        }

        function logout() {
            collapseNavbar();
            Auth.logout();
            vm.account = null;
            $rootScope.showNavbar = false;
            $state.go('login');
        }

        function toggleNavbar() {
            vm.isNavbarCollapsed = !vm.isNavbarCollapsed;
        }

        function collapseNavbar() {
            vm.isNavbarCollapsed = true;
        }
    }
})();
