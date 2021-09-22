Vue.component('generate', {
    data: function () {
        return {
            presets: [],
            loading: false,
            selectedPreset:null,
            transitionInterval: null,
            code: false,
            expression: "",
            expressionOutput: "",
            gradientMode: "rgb",
            cubertService: new CubertService(),
            ledService: new LedService(),
            currentColors: [],
            settings: {
                rows: 32,
                cols: 32,
            },
            panels: [],
        }
    },
    methods: {
        applyPreset() {
            /*this.selectedPreset.forEach(pre => {
                let panel = Math.floor(pre.x / this.settings.rows);
                let pRow = pre.x - (this.settings.rows * panel);

                this.panels[panel][pRow][pre.y].setColor(pre.r, pre.g, pre.b);
            });*/

            var colors = this.selectedPreset.colors;

            if (colors[0]._rgb) {
  	        for(var i = 0; i < 4; i++) {
	    	    colors[i] = chroma.rgb(colors[i]._rgb[0], colors[i]._rgb[1], colors[i]._rgb[2]).hex()
	        }
	    }

	    
            this.gradientMode = this.selectedPreset.mode ? this.selectedPreset.mode : "rgb";

            this.createCube(colors[0], colors[1], colors[2], colors[3]);

            this.$forceUpdate();
        },
        getPresets() {
            var vm = this;
            this.loading = true;

            this.cubertService.getPresets().then(handle)

            function handle(response) {
                vm.loading = false;

                if (!response || !response.data) {
                    return;
                }

                response.data.forEach(preset => {
                    try {
                        preset.colors = JSON.parse(preset.colors);
                        vm.presets.push(preset);
                    } catch (err) {
                        console.log(err);
                    }
                });
            }
        },
        setPreset() {
            var vm = this;

            var title = window.prompt("Please enter a title for the current configuration.", "");

	   if (this.currentColors[0]._rgb) {
	       this.currentColors.forEach(color => {
	    	    color = chroma.rgb(color._rgb[0], color._rgb[1], color._rgb[2]).hex()
	
	       });
	   }

            var payload = {
                "title": title,
                "colors": JSON.stringify(this.currentColors),
                "mode": this.gradientMode.toLowerCase()
            };


            this.loading = true;

            this.cubertService.setPreset(payload).then(handle);

            function handle(response) {
                this.loading = false;
                vm.getPresets();
            }

        },
        showCode() {
            this.code = !this.code;
            setTimeout(function () {
                custom_input();
            }, 50);
        },
        evaluateExp() {
            try {
                this.expressionOutput += "\n";
                this.expressionOutput += eval(this.expression);
            } catch (e) {
                this.expressionOutput += "\n";
                this.expressionOutput += e
                console.log(e);
            }
        },
        bundle(modifiedOnly) {
            var data = []

            this.panels.forEach(panel => {
                Object.keys(panel).forEach(row => {
                    var cols = panel[row];
                    Object.keys(cols).forEach(col => {
                        if (panel[row][col].modified && modifiedOnly) {
                            panel[row][col].modified = false;
                            data.push(panel[row][col])
                        } else {
                            data.push(panel[row][col])
                        }
                    });
                });
            });
            return data;
        },
        apply() {
            var vm = this;
            var payload = this.bundle();

            this.loading = true;
            this.cubertService.stopTransition().then(sendLeds);

            function sendLeds() {
                var self = vm;
                vm.ledService.apply(payload).then(handle);

                function handle(response) {
                    console.log(response)
                    self.loading = false;
                }
            }
        },
        linearGradient(c1, c2, panel) {
            var pixels = this.panels[panel];
            var calcGradient = chroma.scale([c1, c2]).domain([0, this.settings.rows]).mode(this.gradientMode.toLowerCase());

            Object.keys(pixels).forEach(row => {
                var color = calcGradient(row);
                Object.keys(pixels[row]).forEach(col => {
                    pixels[row][col].setColor(Math.round(color._rgb[0]), Math.round(color._rgb[1]), Math.round(color._rgb[2]));
                });
            });

            this.$forceUpdate();

        },
        cubeGradient(c1, c2, c3, c4, panel) {
            //this.gradientMode = "hsv"

            var pixels = this.panels[panel];
            var calcGradientX1 = chroma.scale([c1, c2]).domain([0, this.settings.rows - 1]).mode(this.gradientMode.toLowerCase());
            var calcGradientX2 = chroma.scale([c4, c3]).domain([0, this.settings.rows - 1]).mode(this.gradientMode.toLowerCase());

            Object.keys(pixels).forEach(row => {
                var x1 = calcGradientX1(row);
                var x2 = calcGradientX2(row);

                var calcGradientY = chroma.scale([x1, x2]).domain([0, this.settings.rows]).mode(this.gradientMode.toLowerCase());

                Object.keys(pixels[row]).forEach(col => {
                    //var x3 = chroma.mix(x1,x2,col/32, this.gradientMode)
                    var x3 = calcGradientY(col);
                    //var x3 = chroma.blend(x1, x2, 'multiply');
                    pixels[row][col].setColor(Math.round(x3._rgb[0]), Math.round(x3._rgb[1]), Math.round(x3._rgb[2]));
                    //this.$forceUpdate();
                });
            });
            //this.gradientMode = "lch"
            this.$forceUpdate();
        },
        createMatrix() {
            var panelNum = this.panels.length;
            var pixels = {};

            for (var i = 0; i < this.settings.rows; ++i) {
                pixels[i] = {};
                for (var j = 0; j < this.settings.cols; ++j) {
                    var offset = this.settings.rows * panelNum;
                    pixels[i][j] = new Pixel(i + offset, j, 0, 0, 0, panelNum);
                }
            }

            this.panels.push(pixels);
            this.$forceUpdate();

            return panelNum;
        },
        createTransition() {
            var colors = [];
            var payload = [];
            var vm = this;

            var colors = window.prompt(`Please enter the colors in hex and csv format`, "")
            var steps = window.prompt(`Please enter number of steps`,"");
            var stepInterval = window.prompt(`Please enter time between steps`,"");

            payload.push(colors.split(","));
            payload.push(this.gradientMode.toLowerCase());
            payload.push(parseInt(steps));
            payload.push(parseInt(stepInterval));

            this.loading = true;

            if (!colors || !this.gradientMode || !parseInt(steps) || !parseInt(stepInterval)) { return; }

            this.cubertService.stopTransition().then(setTransition);

            function setTransition() {
                var self = vm;
                vm.cubertService.setTransition(payload).then(handle);

                function handle(response) {
                    self.loading = false;
                    console.log(response);
                }
            }
            /*clearInterval(this.transitionInterval);

            let start = this.createCube();
            let end = this.createCube();

            let steps = 32;

            var scale1 = chroma.scale([start[0], end[0]]).domain([0, steps]).mode(this.gradientMode);
            var scale2 = chroma.scale([start[1], end[1]]).domain([0, steps]).mode(this.gradientMode);
            var scale3 = chroma.scale([start[2], end[2]]).domain([0, steps]).mode(this.gradientMode);
            var scale4 = chroma.scale([start[3], end[3]]).domain([0, steps]).mode(this.gradientMode);

            var currentStep = 0
            var steppingUp = true;

            var vm = this;
            var data = [];

            while (currentStep <= steps) {
                vm.createCube(scale1(currentStep)._rgb, scale2(currentStep)._rgb, scale3(currentStep)._rgb, scale4(currentStep)._rgb);
                data[currentStep] = JSON.parse(JSON.stringify(vm.bundle()));

                currentStep++;
            }

            this.loading = true;

            axios.post("/setTransistion", JSON.stringify(data))

            this.loading = false;

            currentStep = 0

            this.transitionInterval = setInterval(function () {
                vm.selectedPreset = data[currentStep];
                vm.applyPreset()

                if (currentStep <= steps && steppingUp) {
                    currentStep++
                    if (currentStep >= steps) {
                        steppingUp = false;
                    }
                }
                else if (!steppingUp && currentStep >= 0) {
                    currentStep--
                    if (currentStep <= 0) {
                        steppingUp = true;
                    }
                }
            }, 200);*/
        },
        customCube() {
            var color1 = window.prompt(`Please enter color #${1} in hex format`,"");
            var color2 = window.prompt(`Please enter color #${2} in hex format`,"");
            var color3 = window.prompt(`Please enter color #${3} in hex format`,"");
            var color4 = window.prompt(`Please enter color #${4} in hex format`,"");

            this.currentColors = [];

            this.currentColors.push(color1);
            this.currentColors.push(color2);
            this.currentColors.push(color3);
            this.currentColors.push(color4);

            this.createCube(color1, color2, color3, color4);
        },
        createCube(color1, color2, color3, color4) {
            clearInterval(this.transitionInterval);

            if (this.panels.length < 6) {
                var numOfPanelsNeeded = 6 - this.panels.length;

                for(var i = 0; i < numOfPanelsNeeded; i++) {
                    this.createMatrix();
                }
            }

            color1 = (typeof color1 !== "undefined") ? color1 : chroma.random(); //Top Right
            color2 = (typeof color2 !== "undefined") ? color2 : chroma.random(); //Top Left
            color3 = (typeof color3 !== "undefined") ? color3 : chroma.random(); //Bottom Right
            color4 = (typeof color4 !== "undefined") ? color4 : chroma.random(); //Bottom Left

            this.cubeGradient(color4, color1, color2, color3, 0);
            this.linearGradient(color1, color2, 1);
            this.linearGradient(color2, color3, 2);
            this.linearGradient(color3, color4, 3);
            this.linearGradient(color4, color1, 4);
            this.cubeGradient(color1, color4, color3, color2, 5);

            this.currentColors = [];

            this.currentColors.push(color1);
            this.currentColors.push(color2);
            this.currentColors.push(color3);
            this.currentColors.push(color4);

            return [color1, color2, color3, color4];
        }
    },
    mounted() {
        custom_input();
	this.getPresets();
        this.createCube();
    },
    beforeMount() {
        this.createMatrix();
    },
    template: `
    <div class="flex-container col-100 vhc">
        <div class="panel-content vhc overlay" v-if="loading"
            style="height:110vh; background: rgba(21,21,21,.7); position:fixed; top: 0px !important;">
            <div>
                <div class="loading-row clearfix">
                    <div class="square one"></div>
                    <div class="square two"></div>
                    <div class="square three"></div>
                </div>

                <div class="loading-row clearfix">
                    <div class="square eight"></div>
                    <div class="square nine"></div>
                    <div class="square four"></div>
                </div>

                <div class="loading-row clearfix">
                    <div class="square seven"></div>
                    <div class="square six"></div>
                    <div class="square five"></div>
                </div>
            </div>
        </div>
        <div class="l1 vhc" id="particles-js" style="position:absolute; top: 0; width: 100vw; height: 100vh;" />
        <template>
            <div class="panel col-70" style="display:flex; flex:wrap;">
                <div class="panel-header tc"></div>
                <div class="panel-content vhc">
                    <div class="matrix"
                        style="margin-top:10px; margin-left: 40px !important; -webkit-transform: rotate(90deg); transform: rotate(90deg);"
                        v-for="(panel, index) in panels">
                        <div class="row hc col-100" v-for="row in panel">
                            <div class="pixel" v-for="pixel in row" v-bind:style="pixel.style"
                                v-bind:x="pixel.x" v-bind:y="pixel.y"></div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <div class="footer vhc" style="position:sticky; height:250px; overflow-y:scroll; background:#112;">
            <div class="vhc col-100">
                <div style="height:230px; position:relative; top: 20px;" class="col-100">
                    <div class="panel col-100">
                        <div class="panel-header tc">Painting</div>
                        <div class="panel-content vhc">
                            <div class="input-group">
                                <label for="col" id="panel-label" class="dyn-input-label">Columns</label>
                                <input type="text" placeholder="1-1000" id="panel-input" name="col" class="dyn-input"
                                    v-on:keyup.enter="createMatrix()" v-model="settings.cols">
                            </div>
                            <div class="input-group">
                                <label for="row" id="panel-label" class="dyn-input-label">Rows</label>
                                <input type="text" placeholder="1-1000" id="panel-input" name="row" class="dyn-input"
                                    v-on:keyup.enter="createMatrix()" v-model="settings.rows">
                            </div>
                            <div class="input-group">
                                <label for="gradientMode" id="panel-label" class="dyn-input-label">Gradient Mode</label>
                                <input type="text" placeholder="hsl, rgb, hsv" id="panel-input" name="gradientMode" class="dyn-input"
                                    v-model="gradientMode">
                            </div>
                        </div>
                    </div>
                    <div class="panel col-100">
                        <div class="panel-header tc">Pre Fabs</div>
                        <div class="panel-content vhc">
                            <div class="col-100">
                                <div class="input-group">
                                    <select v-on:change="applyPreset()" v-model="selectedPreset">
                                        <option value="null">None</option>
                                        <option v-for="item in presets" v-text="item.title" v-bind:value="item"></option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-100 vhc">
                                <label for="cube" class="toggle-lbl vh-center" @click="createCube()">
                                    <span class="v-center" style="text-transform: uppercase;">Cube</span>
                                </label>
                                <label for="transition" class="toggle-lbl vh-center" @click="customCube()">
                                    <span class="v-center" style="text-transform: uppercase;">Custom Cube</span>
                                </label>
                                <label for="transition" class="toggle-lbl vh-center" @click="createTransition()">
                                    <span class="v-center" style="text-transform: uppercase;">Transition</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="panel col-100">
                        <div class="panel-header tc">Actions</div>
                        <div class="panel-content vhc">
                            <div class="btn-group col-100">
                                <label for="setPreset" class="toggle-lbl vh-center" @click="setPreset()">
                                    <span class="v-center" style="text-transform: uppercase;">Save</span>
                                </label>
                                <label for="apply" class="toggle-lbl vh-center" @click="apply()">
                                    <span class="v-center" style="text-transform: uppercase;">Apply</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
});
