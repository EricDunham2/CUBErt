Vue.component('transition', {
    data: function() {
        return {
            loading: false,
            interval: 20,
            presets: [],
            startPreset: null,
            endPreset: null,
            steps: 180,
            gradientMode: "rgb",
            cubertService: new CubertService(),
            ledService: new LedService(),
        }
    },
    methods: {
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
        createTransition() {
            var payload = [];
            var vm = this;

            var steps = parseInt(vm.steps);
            var stepInterval = parseInt(vm.interval);

            if (!isInteger(steps) || !isInteger(interval)) {
                console.log("Either the steps or the interval set is not a number");
                return;
            }

            var colors = []
            colors.concat(vm.startPreset);
            colors.concat(vm.endPreset);

            payload.push(colors.split(","));
            payload.push(this.gradientMode.toLowerCase());
            payload.push(parseInt(steps));
            payload.push(parseInt(this.interval));

            this.loading = true;

            if (!colors || !this.gradientMode || !parseInt(steps) || !parseInt(stepInterval)) {
                return;
            }

            this.cubertService.stopTransition().then(setTransition);

            function setTransition() {
                var self = vm;
                vm.cubertService.setTransition(payload).then(handle);

                function handle(response) {
                    self.loading = false;
                    console.log(response);
                }
            }
        },
    },
    mounted() {
        custom_input();
        this.getPresets();
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
        <div class="footer vhc" style="position:fixed; height:250px; overflow-y:scroll; background:#112;">
            <div class="vhc col-100">
                <div style="height:230px; position:relative; top: 20px;" class="col-100">
                    <div class="panel col-100">
                        <div class="panel-header tc">Properties</div>
                        <div class="panel-content vhc">
                            <div class="input-group">
                                <label for="gradientMode" id="panel-label" class="dyn-input-label">Gradient Mode</span></label>
                                <input type="text" id="panel-input" name="gradientMode" class="dyn-input"
                                    v-model="gradientMode">
                            </div>

                            <div class="input-group">
                                <label for="interval" id="panel-label" class="dyn-input-label">Transistion Interval </span></label>
                                <input type="text" id="panel-input" name="interval" class="dyn-input"
                                    v-model="interval">
                            </div>

                            <div class="input-group">
                                <label for="steps" id="panel-label" class="dyn-input-label">Steps </span></label>
                                <input type="text" id="panel-input" name="steps" class="dyn-input"
                                    v-model="steps">
                            </div>
                        </div>
                    </div>

                    <div class="panel col-100">
                        <div class="panel-header tc">Properties</div>
                        <div class="panel-content vhc">
                            <div class="input-group">
                                <select v-on:change="applyPreset()" v-model="startPreset">
                                    <option value="null">None</option>
                                    <option v-for="item in presets" v-text="item.title" v-bind:value="item"></option>
                                </select>
                            </div>

                            <div class="input-group">
                                <select v-on:change="applyPreset()" v-model="endPreset">
                                    <option value="null">None</option>
                                    <option v-for="item in presets" v-text="item.title" v-bind:value="item"></option>
                                </select>
                            </div>
                        </div>
                    </div

                    <div class="panel col-100">
                        <div class="panel-header tc">Actions</div>
                        <div class="panel-content vhc">
                            <div class="btn-group col-100">
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