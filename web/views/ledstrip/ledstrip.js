Vue.component('ledstrip', {
    data: function () {
        return {
            loading: false,
            mouseState: false,
            circularGradient: false,
            gradient: false,
            gradientMode: "rgb",
            ledService: new LedService(),
            cubertService: new CubertService(),
            numberOfLeds: 180,
            selectedColors: [],
            settings: {
                widthPerLed: 0,
            },
	    rowOffset: 0,
            panels: [],
        }
    },
    methods: {
        setLedCanvasSize() {
           generateGradient();
        },
        generateGradient() {
            var calcGradient = chroma.scale(this.selectedColors).domain([0, this.numberOfLeds]).mode(this.gradientMode.toLowerCase());

            if(this.circularGradient) {
                calcGradient = chroma.scale(this.selectedColors).domain([0, Math.floor(this.numberOfLeds / 2)]).mode(this.gradientMode.toLowerCase());
            }

            const canvas = document.querySelector('#strip');

            if (!canvas.getContext) {
                return;
            }

            var height= canvas.height;
            var width = document.getElementById("strip").width;

            const ctx = canvas.getContext('2d');
            this.settings.widthPerLed = Math.floor(width / parseInt(this.numberOfLeds));

            for(i = 0; i < this.numberOfLeds; i++) {

                if (this.circularGradient) {
                    var center = Math.floor(this.numberOfLeds / 2);
                    var pos = (i <= center) ? i : center - (i - center);

                    console.log(`Pos:${pos}, Hex: ${calcGradient(pos).hex()}`);

                    ctx.fillStyle = calcGradient(pos).hex();
                } else {
                    ctx.fillStyle = calcGradient(i).hex();
                }

                ctx.fillRect(i * this.settings.widthPerLed, 0, (i + 1) * this.settings.widthPerLed, height)
            }

            ctx.stroke()
        },
        toggleGradient() {
            this.gradient = !this.gradient;

            if (!this.gradient) {
                this.circularGradient = false;
            }

            setTimeout(function () {
                custom_input();
            }, 50);
        },
        toggleCircularGradient() {
            this.circularGradient = !this.circularGradient;

            setTimeout(function () {
                custom_input();
            }, 50);
        },
        addColor(){
            this.selectedColors.push("#000000");
            custom_input();
        },
        removeColor(){
            this.selectedColors.pop();
        },
        mouseDown(panel, index) {
            this.mouseState = true;
            this.selectedPanel = panel;
            this.selectedPanelIndex = index
        },
        resizeCanvas() {
            var canvs = document.getElementById("strip");
            canvs.width = window.innerWidth * .7;

        },
        mouseUp() {
            this.mouseState = false;
        },
        clear() {
            Object.keys(this.selectedPanel).forEach(row => {
                var cols = this.selectedPanel[row];
                Object.keys(cols).forEach(col => {
                    this.selectedPanel[row][col].setColor(0, 0, 0);
                });
            });

            this.$forceUpdate();
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
            var payload = this.bundle(true);

            this.loading = true;

            function ledApply() {
                var self = vm;
                vm.ledService.apply(payload).then(handle);

                function handle(response) {
                    self.loading = false;
                    console.log(response);
                }
            }
        },
    },
    mounted() {
        custom_input();
        this.resizeCanvas();

        this.selectedColors.push("#000000");
        this.selectedColors.push("#000000");
    },
    beforeMount() {
    },
    template: `
<div class="flex-container col-100 vhc">

    <!--Loading Animation Begin-->
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

    <!--Loading Animation End-->

        <div class="l1 vhc" id="particles-js" style="position:absolute; top: 0; width: 100vw; height: 100vh;" />
        <template>
            <div onresize="resizeCanvas()" class="panel col-70" style="display:flex; flex:wrap; height: calc(100% - 290px); overflow: inherit;">
                <div class="panel-header tc"></div>
                <div class="panel-content hc">
                    <canvas id="strip" height="40"></canvas>
                </div>
            </div>
        </template>
        <div class="footer vhc" style="position:fixed; height:250px; overflow-y:scroll; background:#112;">
            <div class="vhc col-100">
                <div style="height:230px; position:relative; top: 20px;" class="col-100">
                    <div class="panel col-100">

                        <div class="panel-header tc">Properties</div>

                        <div class="panel-content vhc">
                            <div class="input-group vhc">
                                <div style="font-size:13px;" class="checkbox-label">Gradient</div>
                                <label class="switch" for="bg-checkbox">
                                    <input type="checkbox" id="bg-checkbox" @change="toggleGradient()" />
                                    <div class="slider round"></div>
                                </label>
                            </div>
                            

                            <div class="input-group vhc" v-if="gradient">
                                <div style="font-size:13px;" class="checkbox-label">Circular Gradient</div>
                                <label class="switch" for="circularGradient">
                                    <input type="checkbox" id="circularGradient" @change="toggleCircularGradient()" />
                                    <div class="slider round"></div>
                                </label>
                            </div>

                            <div class="input-group" v-if="gradient">
                                <label for="gradientMode" id="panel-label" class="dyn-input-label">Gradient Mode</span></label>
                                <input type="text" id="panel-input" name="gradientMode" class="dyn-input"
                                    v-model="gradientMode">
                            </div>
                        </div>

                        <div class="panel-content vhc">
                            <div class="input-group">
                                <label for="leds" id="panel-label" class="dyn-input-label">Number of Leds</span></label>
                                <input type="text" id="panel-input" name="leds" class="dyn-input"
                                    v-model="numberOfLeds">
                            </div>
                        </div>

                        <div class="panel-content vhc">
                            <div class="input-group" v-if="gradient" v-for="(color, index) in selectedColors">
                                <label for="leds" id="panel-label" class="dyn-input-label"></span></label>
                                <input type="text" id="panel-input" name="leds" class="dyn-input"
                                    v-model="selectedColors[index]" v-on:change="generateGradient()" v-bind:style="{ color:selectedColors[index] }">
                            </div>
                        </div>
                    </div>
                    <div class="panel col-100">
                        <div class="panel-header tc">Actions</div>
                        <div class="panel-content vhc">
                            <div class="btn-group col-100">
                                <label for="save" class="toggle-lbl vh-center" v-if="gradient" @click="addColor()">
                                    <span class="v-center" style="text-transform: uppercase;">Add Color</span>
                                </label>
                                <label for="save" class="toggle-lbl vh-center" v-if="gradient" @click="removeColor()">
                                    <span class="v-center" style="text-transform: uppercase;">Remove Color</span>
                                </label>
                                <label for="save" class="toggle-lbl vh-center" @click="setPreset()">
                                    <span class="v-center" style="text-transform: uppercase;">Save</span>
                                </label>
                                <label for="clear" class="toggle-lbl vh-center" @click="clear()">
                                    <span class="v-center" style="text-transform: uppercase;">Clear</span>
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

