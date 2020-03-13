 class CubertService {
     getPresets() {
         return new Promise(function (resolve, reject) {
             axios
                 .get("/getPresets")
                 .then(handle)

             function handle(response) {
                 resolve(response);
             }
         });
     }

     setPreset(data) {
        return new Promise(function (resolve, reject) {
            axios
                .post("/setPreset", JSON.stringify(data))
                .then(handle);

            function handle(response) {
                resolve(response);
            }
        });
     }

     setTransition(data) {
        return new Promise(function (resolve, reject) {
            axios
                .post("/setTransition", JSON.stringify(data))
                .then(handle);

            function handle(response) {
                resolve(response);
            }
        });
     }
 
     stopTransition() {
        return new Promise(function (resolve, reject) {
            axios
                .get("/stopTransition")
                .then(handle);

            function handle(response) {
                resolve(response);
            }
        });
     }
}