new Vue({
	el: '#index',
	data: {
		component: "generate",
		ledService: new LedService(),
		powerState: true,
		http: {
			"OK": 200,
		}
	},
	methods: {
		setComponent: function(value){
			this.component = value;
			document.getElementById("sidebar-toggle").checked = false;
			
			var navbar = document.getElementsByClassName("navbar")[0];
			navbar.style.background = "#1b2127"
		},
		scrollHandler() {
			var body = document.getElementsByTagName("body")[0];
			var navbar = document.getElementsByClassName("navbar")[0];
		
			if (body.scrollTop >= 50) {
				navbar.style.background = "#1b2127";//"rgba(0,0,0,.9)";
			} else {
				navbar.style.background = "#1b2127";
			}
		},
		turnOff() {
			var vm = this;
			this.ledService.off().then(handle);

			function handle(response) {
				if (response.status === vm.http.OK) {
					vm.powerState = false;
				}
			}
		},
		turnOn() {
			var vm = this;
			this.ledService.on().then(handle);

			function handle(response) {
				if (response.status === vm.http.OK) {
					vm.powerState = true;
				}
			}
		}
	},
	mounted() {
		this.turnOn();
	},
	created() {
		window.addEventListener('scroll', this.scrollHandler);
	}
});
