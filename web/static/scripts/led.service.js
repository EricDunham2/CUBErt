class LedService {
    off() {
        return new Promise(function (resolve, reject) {
            axios.get("/off").then(handle)
    
            function handle(response) {
                resolve(response)
            }
        });
    }

    on() {
        return new Promise(function (resolve, reject) {
            axios.get("/on").then(handle)
    
            function handle(response) {
                resolve(response)
            }
        });
    }

    apply(payload) {
        return new Promise(function (resolve, reject) {
            axios
                .post("/setLeds", JSON.stringify(payload))
                .then(handle);

            function handle(response) {
                resolve(response);
            }
        });
    }
}