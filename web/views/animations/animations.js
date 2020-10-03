Vue.component('animations', {
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

    },
    mounted() {
        custom_input();
    },
    beforeMount() {
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
            <div class="panel col-100">
            <div class="col-100">
            <div class="input-group">
                <select v-on:change="applyPreset()" v-model="selectedPreset">
                    <option value="null">None</option>
                    <option v-for="item in presets" v-text="item.title" v-bind:value="item"></option>
                </select>
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
