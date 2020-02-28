Vue.component('settings', {
    data: function () {
        return {
            saving: false,
            loading: false,
            settings: {
                rows: null,
                cols: null,
                parallel: null,
                chained: null,
                brightness: null,
                hardware_mapping: null,
                show_refresh: null,
                inverse_colors: null,
                disable_hardware_pulsing: null
            }
        }
    },
    methods: {
        _getSettings: function () {
            this.loading = true;
            axios
                .get("/getSettings")
                .then(this._setSettings)
        },
        _setSettings: function (result) {
            try {
                console.log(result.data)

                if (!result || !result.data) {
                    return;
                }

                this.settings = result.data;

                $(function () {
                    custom_input();
                });
            } catch (err) {
                console.log(err);
            } finally {
                this.loading = false;
            }
        },
        saveConfig: function () {
            //Find a better way to force int
            this.saving = true;

            this.settings.rows = parseInt(this.settings.rows)
            this.settings.cols = parseInt(this.settings.cols)
            this.settings.parallel = parseInt(this.settings.parallel)
            this.settings.chained = parseInt(this.settings.chained)
            this.settings.brightness = parseInt(this.settings.brightness)
            this.settings.show_refresh = this.settings.show_refresh.toString().toLowerCase() == 'true'
            this.settings.inverse_colors = this.settings.inverse_colors.toString().toLowerCase() == 'true'
            this.settings.disable_hardware_pulsing = this.settings.disable_hardware_pulsing.toString().toLowerCase() == 'true'

            axios
                .post('/setSettings', JSON.stringify(this.settings))
                .then(this.settingsConfirmation);
        },
        settingsConfirmation: function(result) {
            try {
                if (!result || result.status !== 200) {
                    toastr("Something happened while saving, please try again...", "error", 1000);
                    return;
                }

                toastr("Save successful", "success", 1000);
            } catch(err) {
                console.log(err)
            } finally {
                this.saving = false;
            }
        }
    },
    mounted() {
        this._getSettings();
        custom_input();
    },
    template: `
        <div class="flex-container col-100 hc no-touch-top" style="background: #112;">
            <div class="panel-content vhc" v-if="saving || loading" style="height:110vh; position:fixed; top: 0px !important;">
                <div>
                    <div class="row clearfix">
                        <div class="square one"></div> 
                        <div class="square two"></div>
                        <div class="square three"></div>
                    </div>

                    <div class="row clearfix">
                        <div class="square eight"></div> 
                        <div class="square nine"></div>
                        <div class="square four"></div>
                    </div>

                    <div class="row clearfix">
                        <div class="square seven"></div> 
                        <div class="square six"></div>
                        <div class="square five"></div>
                    </div>
                </div>
            </div>
            <div class="panel col-80 no-touch-top" style="vertical-align: top;">
                <div class="panel-header">Matrix Settings</div>
                <div class="panel-content vhc">
                    <div class="input-group col-30">
                        <label for="rows" id="panel-label" class="dyn-input-label">Rows</label>
                        <input placeholder="1-128" type="number" id="panel-input" name="rows" class="dyn-input" v-model="settings.rows">
                    </div>
                    <div class="input-group col-30">
                        <label for="cols" id="panel-label" class="dyn-input-label">Cols</label> 
                        <input type="number" placeholder="1-128" id="panel-input" name="cols" class="dyn-input" v-model="settings.cols">
                    </div>
                    <div class="input-group col-30">
                        <label for="parallel" id="panel-label" class="dyn-input-label">Parallel</label> 
                        <input type="number" placeholder="1-12" id="panel-input" name="parallel" class="dyn-input" v-model="settings.parallel">
                    </div>
                    <div class="input-group col-30">
                        <label for="chained" id="panel-label" class="dyn-input-label">Chained</label> 
                        <input type="number" placeholder="1-12" id="panel-input" name="chained" class="dyn-input" v-model="settings.chained">
                    </div>
                    <div class="input-group col-30">
                        <label for="brightness" id="panel-label" class="dyn-input-label">Brightness</label> 
                        <input type="number" placeholder="1-100" max="100" min="0" id="panel-input" name="brightness" class="dyn-input" v-model="settings.brightness">
                    </div>
                    <div class="input-group col-30">
                        <label for="hardware_mapping" id="panel-label" class="dyn-input-label">Hardware Mapping</label> 
                        <input type="text" placeholder="pwm" id="panel-input" name="hardware_mapping" class="dyn-input" v-model="settings.hardware_mapping">
                    </div>
                    <div class="input-group col-30">
                        <label for="show_refresh" id="panel-label" class="dyn-input-label">Show Refresh</label> 
                        <input type="text" placeholder="true/false" id="panel-input" name="show_refresh" class="dyn-input" v-model="settings.show_refresh">
                    </div>
                    <div class="input-group col-30">
                        <label for="inverse_colors" id="panel-label" class="dyn-input-label">Inverse Colors</label> 
                        <input type="text" placeholder="true/false" id="panel-input" name="inverse_colors" class="dyn-input" v-model="settings.inverse_colors">
                    </div>
                    <div class="input-group col-30">
                        <label for="disable_hardware_pulsing" id="panel-label" class="dyn-input-label">Hardware Pulsing</label> 
                        <input type="text" placeholder="true/false" id="panel-input" name="disable_hardware_pulsing" class="dyn-input" v-model="settings.disable_hardware_pulsing">
                    </div>
                </div>
            </div>
            <div class="panel col-100 no-touch-top">
                <div class="input-group">
                    <label for="save" class="toggle-lbl vh-center" style="width:100%; margin:0;" v-on:click="saveConfig()"><span class="v-center" style="text-transform: uppercase;">Save</span></label>
                </div>
            </div>
        </div>
    `
});
