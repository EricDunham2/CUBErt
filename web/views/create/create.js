Vue.component('create', {
    data: function () {
        return {
            loading: false,
            mouseState: false,
            selectedColor: "#FFF",
            selectedColor2: "#FFF",
            selectedColor3: "#FFF",
            selectedColor4: "#FFF",
            selectedBrushSize: 3,
            gradiBrush: false,
            biliGradient: false,
            circularGradient: false,
            uploadedImage: null,
            gradientMode: "rgb",
            selectedPanel: null,
            ledService: new LedService(),
	    cubertService: new CubertService(),
            settings: {
                rows: 32,
                cols: 32,
            },
	    rowOffset: 0,
            panels: [],
        }
    },
    methods: {
        deletePanel() {
            this.panels.splice(this.selectedPanelIndex, 1);
            
	    this.selectedPanelIndex = 0;
        },
        setPixelMobile(e, panel, index) {
            e.preventDefault();

            this.mouseDown(panel, index);

            if (!e || !e.touches[0]) {
                return;
            }

            var target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
            if (!target || !target.classList.contains("pixel")) {
                return;
            }

            let pixel = panel[parseInt(target.getAttribute("x")) - (this.settings.rows * index)][parseInt(target.getAttribute("y"))];

            //var pixel = this.pixels[]

            this.setColor(pixel);
            //this.mouseUp();
        },
        mouseDown(panel, index) {
            this.mouseState = true;
            this.selectedPanel = panel;
            this.selectedPanelIndex = index
        },
        gradientCalculator(pos, color1, color2, domain) {
            var calcGradient = chroma.scale([color1, color2]).domain([0, domain]).mode(this.gradientMode);
            var val = calcGradient(pos);

            return val._rgb;
        },
        biliGradientCalculator(x, y) {
            var domain = Object.keys(this.selectedPanel).length - 1;

            var calcGradientX1 = chroma.scale([this.selectedColor, this.selectedColor2]).domain([0, domain]).mode(this.gradientMode.toLowerCase());
            var calcGradientX2 = chroma.scale([this.selectedColor4, this.selectedColor3]).domain([0, domain]).mode(this.gradientMode.toLowerCase());

            var x1 = calcGradientX1(x);
            var x2 = calcGradientX2(x);

            var calcGradientY = chroma.scale([x1, x2]).domain([0, domain]).mode(this.gradientMode.toLowerCase());

            return calcGradientY(y)._rgb;
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
        fileUploaded(event) {
            var file = event.target.files[0];
            var fileReader = new FileReader();
            var vm = this;

            fileReader.onload = function (e) {
                vm.imagePaint(e.target.result);
            }

            fileReader.readAsDataURL(event.target.files[0]);

            this.uploadedImage = file.name;
        },
        toggleGradient() {
            this.biliGradient = false;
            this.gradiBrush = !this.gradiBrush;
            setTimeout(function () {
                custom_input();
            }, 50);
        },
        toggleBiLiGradient() {
            this.gradiBrush = false;
            this.biliGradient = !this.biliGradient;

            setTimeout(function () {
                custom_input();
            }, 50);
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
            this.cubertService.stopTransition().then(ledApply);

            function ledApply() {
                var self = vm;
                vm.ledService.apply(payload).then(handle);

                function handle(response) {
                    self.loading = false;
                    console.log(response);
                }
            }
        },
        imagePaint(uri) {
            var i = new Image();
            var vm = this;

            i.onload = function () {
                var canvas = document.createElement('canvas');

                canvas.height = i.height * (vm.settings.cols / i.height);
                canvas.width = i.width * (vm.settings.rows / i.width);

                var ctx = canvas.getContext('2d');
                ctx.drawImage(i, 0, 0, canvas.width, canvas.height);

                Object.keys(vm.selectedPanel).forEach(rows => {
                    var row = vm.selectedPanel[rows];
                    Object.keys(row).forEach(col => {
                        var pixel = row[col];
                        var color = ctx.getImageData((pixel.x - (vm.settings.rows * pixel.panel)), pixel.y, 1, 1).data;

                        pixel.setColor(color[0], color[1], color[2]);
                    });
                });

                vm.$forceUpdate();
            }

            i.src = uri;
        },
        createMatrix() {
            var panelNum = this.panels.length;
            var pixels = {};

            for (var i = 0; i < this.settings.rows; ++i) {
                pixels[i] = {};
                for (var j = 0; j < this.settings.cols; ++j) {
                    pixels[i][j] = new Pixel(i + this.rowOffset, j, 0, 0, 0, panelNum);
                }
            }

            this.rowOffset += this.settings.rows;

            this.panels.push(pixels);
            this.$forceUpdate();

            return panelNum;
        },
        textPaint(text, x, y, color) {
            var canvas = document.createElement('canvas');

            canvas.height = vm.settings.cols;
            canvas.width = vm.settings.rows;

            var ctx = canvas.getContext('2d');
            ctx.font = "30px Arial";
            ctx.fillText(text, x, y);

            if (Array.isArray(color)) {
                color.forEach(c => {
                    gradient.addColorStop(Object.keys(c)[0], c[Object.keys(c)[0]])
                });

                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = color;
            }

            Object.keys(vm.selectedPanel).forEach(rows => {
                var row = vm.selectedPanel[rows];
                Object.keys(row).forEach(col => {
                    var pixel = row[col];
                    var color = ctx.getImageData((pixel.x - (this.settings.rows * pixel.panel)), pixel.y, 1, 1).data;

                    pixel.setColor(color[0], color[1], color[2]);
                });
            });

            vm.$forceUpdate();
        },
        setColor(pixel) {
            if (!this.mouseState) {
                return;
            }

            var rgb = chroma(this.selectedColor).rgb();

            pixel.setColor(rgb[0], rgb[1], rgb[2]);

            if (this.selectedBrushSize > 1) {
                var centerX = pixel.x - (this.settings.rows * pixel.panel);
                var centerY = pixel.y;
                var brushRadius = (this.selectedBrushSize - 1) / 2;
                var halfway = this.settings.rows / 2;

                for (var i = 0; i <= brushRadius; i++) {
                    var pixels = this.panels[pixel.panel];

                    //pixels[centerX - i] && pixels[centerX - i][centerY] ? pixels[centerX - i][centerY].setColor(rgb[0], rgb[1], rgb[2]) : null;
                    //pixels[centerX + i] && pixels[centerX + i][centerY] ? pixels[centerX + i][centerY].setColor(rgb[0], rgb[1], rgb[2]) : null;

                    for (var j = 0; j <= brushRadius; j++) {
                        if (pixels[centerX + i]) {
                            if (pixels[centerX + i][centerY + j]) {
                                if (this.gradiBrush) {
                                    if (this.circularGradient) {
                                        var pos = (centerX + i > halfway) ? halfway - ((centerX + i) - halfway) : (centerX + i);
                                        rgb = this.gradientCalculator(pos, this.selectedColor, this.selectedColor2, halfway);
                                    } else if (this.biliGradient) {
                                        rgb = this.biliGradientCalculator(centerX + i, centerY + j, this.settings.rows);
                                    } else {
                                        rgb = this.gradientCalculator(centerX + i, this.selectedColor, this.selectedColor2, this.settings.rows);
                                    }
                                }
                                pixels[centerX + i][centerY + j].setColor(Math.round(rgb[0]), Math.round(rgb[1]), Math.round(rgb[2]));
                            }
                            if (pixels[centerX + i][centerY - j]) {
                                if (this.gradiBrush) {
                                    if (this.circularGradient) {
                                        var pos = (centerX + i > halfway) ? halfway - ((centerX + i) - halfway) : (centerX + i);
                                        rgb = this.gradientCalculator(pos, this.selectedColor, this.selectedColor2, halfway);
                                    } else if (this.biliGradient) {
                                        rgb = this.biliGradientCalculator(centerX + i, centerY - j, this.settings.rows);
                                    } else {
                                        rgb = this.gradientCalculator(centerX + i, this.selectedColor, this.selectedColor2, this.settings.rows);
                                    }
                                }
                                pixels[centerX + i][centerY - j].setColor(Math.round(rgb[0]), Math.round(rgb[1]), Math.round(rgb[2]));
                            }
                        }
                        if (pixels[centerX - i]) {
                            if (pixels[centerX - i][centerY + j]) {
                                if (this.gradiBrush) {
                                    if (this.circularGradient) {
                                        var pos = (centerX - i > halfway) ? halfway - ((centerX - i) - halfway) : (centerX - i);
                                        rgb = this.gradientCalculator(pos, this.selectedColor, this.selectedColor2, halfway);
                                    }  else if (this.biliGradient) {
                                        rgb = this.biliGradientCalculator(centerX - i, centerY + j, this.settings.rows);
                                    } else {
                                        rgb = this.gradientCalculator(centerX - i, this.selectedColor, this.selectedColor2, this.settings.rows);
                                    }
                                }
                                pixels[centerX - i][centerY + j].setColor(Math.round(rgb[0]), Math.round(rgb[1]), Math.round(rgb[2]));
                            }

                            if (pixels[centerX - i][centerY - j]) {
                                if (this.gradiBrush) {
                                    if (this.circularGradient) {
                                        var pos = (centerX - i > halfway) ? halfway - ((centerX - i) - halfway) : (centerX - i);
                                        rgb = this.gradientCalculator(pos, this.selectedColor, this.selectedColor2, halfway);
                                    } else if (this.biliGradient) {
                                        rgb = this.biliGradientCalculator(centerX - i, centerY - j, this.settings.rows);
                                    } else {
                                        rgb = this.gradientCalculator(centerX - i, this.selectedColor, this.selectedColor2, this.settings.rows);
                                    }
                                }
                                pixels[centerX - i][centerY - j].setColor(Math.round(rgb[0]), Math.round(rgb[1]), Math.round(rgb[2]));
                            }
                        }
                    }
                }
            }
            this.$forceUpdate();
        }
    },
    mounted() {
        custom_input();
    },
    beforeMount() {
        this.createMatrix();
        this.selectedPanel = this.panels[0];
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
            <div class="panel col-70" style="display:flex; flex:wrap; height: calc(100% - 290px); overflow: inherit;">
                <div class="panel-header tc"></div>
                <div class="panel-content hc">
                    <div class="matrix"
                        style="margin-top:10px; margin-left: 40px !important; -webkit-transform: rotate(90deg); transform: rotate(90deg);"
                        v-for="(panel, index) in panels" @mousedown="mouseDown(panel, index)" @mouseup="mouseUp()"
                        @touchmove="setPixelMobile($event, panel, index)" @mouseleave="mouseUp()">
                        <div class="row hc col-100" v-for="row in panel">
                            <div class="pixel" v-for="pixel in row" @mouseenter="setColor(pixel)" v-bind:style="pixel.style"
                                v-bind:x="pixel.x" v-bind:y="pixel.y"></div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <div class="footer vhc" style="position:fixed; height:250px; overflow-y:scroll; background:#112;">
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
                                <label for="brush" id="panel-label" class="dyn-input-label">Brush Size</label>
                                <input type="text" placeholder="1-7" id="panel-input" name="brush" class="dyn-input"
                                    v-model="selectedBrushSize">
                            </div>
                            <div class="input-group">
                                <label for="gradientMode" id="panel-label" class="dyn-input-label">Gradient Mode</label>
                                <input type="text" placeholder="hsl, rgb, hsv" id="panel-input" name="gradientMode" class="dyn-input"
                                    v-model="gradientMode">
                            </div>
                            <div class="input-group">
                                <label for="color" id="panel-label" class="dyn-input-label"
                                    v-bind:style="{ color:selectedColor }">Color 1<span
                                        v-if="gradiBrush">Start</span></label>
                                <input type="text" placeholder="#FFFFFF" id="panel-input" name="color" class="dyn-input"
                                    v-model="selectedColor">
                            </div>
                            <div class="input-group" v-if="gradiBrush || biliGradient">
                                <label for="color2" id="panel-label" class="dyn-input-label"
                                    v-bind:style="{ color:selectedColor2 }">Color 2</label>
                                <input type="text" placeholder="#FFFFFF" id="panel-input" name="color2" class="dyn-input"
                                    v-model="selectedColor2">
                            </div>
                            <div class="input-group" v-if="biliGradient">
                                <label for="color3" id="panel-label" class="dyn-input-label"
                                    v-bind:style="{ color:selectedColor3 }">Color 3</label>
                                <input type="text" placeholder="#FFFFFF" id="panel-input" name="color3" class="dyn-input"
                                    v-model="selectedColor3">
                            </div>
                            <div class="input-group" v-if="biliGradient">
                                <label for="color4" id="panel-label" class="dyn-input-label"
                                    v-bind:style="{ color:selectedColor4 }">Color 4</label>
                                <input type="text" placeholder="#FFFFFF" id="panel-input" name="color4" class="dyn-input"
                                    v-model="selectedColor4">
                            </div>
                            <div class="input-group vhc" v-if="gradiBrush">
                                <div style="font-size:13px;" class="checkbox-label">Circular Gradient</div>
                                <label class="switch" for="cg-checkbox">
                                    <input type="checkbox" id="cg-checkbox" v-model="circularGradient" />
                                    <div class="slider round"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="panel col-100">
                        <div class="panel-header tc">Effects</div>
                        <div class="panel-content vhc">
                            <div class="input-group vhc">
                                <div style="font-size:13px;" class="checkbox-label">Linear Gradient</div>
                                <label class="switch" for="g-checkbox">
                                    <input type="checkbox" id="g-checkbox" @change="toggleGradient()" />
                                    <div class="slider round"></div>
                                </label>
                            </div>
                            <div class="input-group vhc">
                                <div style="font-size:13px;" class="checkbox-label">BiLinear Gradient</div>
                                <label class="switch" for="g-checkbox">
                                    <input type="checkbox" id="g-checkbox" @change="toggleBiLiGradient()" />
                                    <div class="slider round"></div>
                                </label>
                            </div>
                            <div class="input-group">
                                <div class="vhc">
                                    <input type="file" name="file" id="file" accept="image/*" class="inputfile"
                                        v-on:change="fileUploaded($event)" />
                                    <label for="file">
                                        <i style="padding: 2px 5px; cursor: pointer;"
                                            class="material-icons icon-xs">cloud_upload</i>
                                        <span v-if="!uploadedImage">Choose a file</span>
                                        <span v-if="uploadedImage" v-text="uploadedImage"
                                            style="max-width:150px; overflow: hidden;"></span>
                                    </label>
                                </div>
                            </div>
                            <!--<div class="btn-group col-100">
                                    <label for="rotate" class="toggle-lbl vh-center" @click="toggleRotate()"><span class="v-center" style="text-transform: uppercase;">Rotate</span></label>
                                </div>-->
                        </div>
                    </div>
                    <div class="panel col-100">
                        <div class="panel-header tc">Actions</div>
                        <div class="panel-content vhc">
                            <div class="btn-group col-100">
                                <label for="new" class="toggle-lbl vh-center" @click="createMatrix()">
                                    <span class="v-center" style="text-transform: uppercase;">New</span>
                                </label>
                                <label for="delete" class="toggle-lbl vh-center" @click="deletePanel()">
                                    <span class="v-center" style="text-transform: uppercase;">Delete</span>
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


            /*var vm = this;

            var color1 = chroma.random();
            var color2 = chroma.random();
            var color3 = chroma.random();
            var color4 = chroma.random();

            var panel = 0; //this.createMatrix();

            //Create the base gradient
            this.cubeGradient(color1, color2, color3, color4, panel);

            setInterval(function () {
                //Instead of calculating the cube gradient again
                //Shift all the pixels on the outside edge (counter)clockwise
                //And calculate the linear gradient between each column
                var currPanel = vm.panels[panel];
                var count = 31;
                var offset = 0;

                for (var h = 0; h < count; h++) {
                    for (var i = offset; i < count; i++) {
                        currPanel[offset][i] = currPanel[offset][i + 1]; //(0,y+1)
                        currPanel[i][count] = currPanel[i + 1][count]; //(x+1, 31)

                        currPanel[count][count - i] = currPanel[count][count - (i + 1)]; //(31, y+1)
                        currPanel[count - i][offset] = currPanel[count - (i + 1)][offset]; //(x+1, 0)
                    }

                    count--;
                    offset++;
                }


                /*currPanel[0][31] = currPanel[0][i + 1]; //(0,y+1)
                currPanel[i][31] = currPanel[i + 1][31]; //(x+1, 31)

                currPanel[31][i] = currPanel[31][i + 1]; //(31, y+1)
                currPanel[i][0] = currPanel[i + 1][0]; //(x+1, 0)

                //currPanel[0][0] = currPanel[1][0];
                //currPanel[0][31] = currPanel[1][31];

            }, 500);*/
