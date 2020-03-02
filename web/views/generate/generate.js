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
            settings: {
                rows: 32,
                cols: 32,
            },
            panels: [],
        }
    },
    methods: {
        applyPreset() {
            this.selectedPreset;

            var panels = [];

            this.selectedPreset.forEach(pre => {
                let panel = Math.floor(pre.x / this.settings.rows);
                let pRow = pre.x - (this.settings.rows * panel);

                this.panels[panel][pRow][pre.y].setColor(pre.r, pre.g, pre.b);
            });

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
                    vm.presets.push(preset);
                })
            }
        },
        setPreset() {
            var data = this.bundle(false)

            var title = window.prompt("Please enter a title for the current configuration.", "");
            var payload = {
                "title": title,
                "pixels": data
            };

            this.loading = true;

            this.cubertService.setPreset(payload);

            this.loading = false;
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

            this.ledService.apply(payload).then(handle);

            function handle(response) {
                console.log(response)
                vm.loading = false;
            }
        },
        linearGradient(c1, c2, panel) {
            var pixels = this.panels[panel];
            var calcGradient = chroma.scale([c1, c2]).domain([0, this.settings.rows]).mode(this.gradientMode);

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
            var calcGradientX1 = chroma.scale([c1, c2]).domain([0, this.settings.rows - 1]).mode(this.gradientMode);
            var calcGradientX2 = chroma.scale([c4, c3]).domain([0, this.settings.rows - 1]).mode(this.gradientMode);

            Object.keys(pixels).forEach(row => {
                var x1 = calcGradientX1(row);
                var x2 = calcGradientX2(row);

                var calcGradientY = chroma.scale([x1, x2]).domain([0, this.settings.rows]).mode(this.gradientMode);

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

            for (var i = 0; i < 6; i++) {
                var color = window.prompt(`Please enter color #${i+1} in hex format`,"");
                colors.push(color);
            }

            var steps = window.prompt(`Please enter number of steps`,"");
            var stepInterval = window.prompt(`Please enter time between steps`,"");

            payload.push(colors);
            payload.push(this.gradientMode);
            payload.push(steps)
            payload.push(stepInterval);

            this.loading = true

            this.cubertService.setTransition(payload).then(handle)

            function handle(response) {
                this.loading = false;
                console.log(response);
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

            this.cubeGradient(color1, color2, color3, color4, 0);
            this.linearGradient(color1, color2, 1);
            this.linearGradient(color2, color3, 2);
            this.linearGradient(color3, color4, 3);
            this.linearGradient(color4, color1, 4);
            this.cubeGradient(color4, color1, color2, color3, 5);

            return [color1, color2, color3, color4];
        }
    },
    mounted() {
        custom_input();
        this.createCube();
    },
    beforeMount() {
        var css = '.navbar { background: rgba(0,0,0,.8) !important; } body { background: black;} .nav-menu { background:rgba(0,0,0,.8); }',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');
        style.id = "removeMe";

        head.appendChild(style);

        style.type = 'text/css';
        this.getPresets();

        if (style.styleSheet) {
            // This is required for IE8 and below.
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        this.createMatrix();
    },
    beforeDestroy() {
        var head = document.head;
        Array.from(head.children).forEach(child => {
            if (child.id === "removeMe") child.remove()
        })
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
        <div class="footer vhc" style="position:sticky; height:250px; overflow:scroll; background:#112;">
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
                                        <option v-for="item in presets" v-text="item.title" v-bind:value="item.pixels"></option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-100 vhc">
                                <label for="cube" class="toggle-lbl vh-center" @click="createCube()">
                                    <span class="v-center" style="text-transform: uppercase;">Cube</span>
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
                                <label for="apply" class="toggle-lbl vh-center" @click="setPreset()">
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