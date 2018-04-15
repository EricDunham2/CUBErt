package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"strconv"
        "image/color"
	"time"
	"flag"
	"github.com/gobuffalo/packr"
	"github.com/gorilla/mux"
	"github.com/mcuadros/go-rpi-rgb-led-matrix"
	//"io/ioutil"
)

 var (
	rows                     = flag.Int("led-rows", 32, "number of rows supported")
	cols                     = flag.Int("led-cols", 32, "number of columns supported")
	parallel                 = flag.Int("led-parallel", 1, "number of daisy-chained panels")
	chain                    = flag.Int("led-chain", 1, "number of displays daisy-chained")
	brightness               = flag.Int("brightness", 100, "brightness (0-100)")
	hardware_mapping         = flag.String("led-gpio-mapping", "adafruit-hat-pwm", "Name of GPIO mapping used.")
	show_refresh             = flag.Bool("led-show-refresh", false, "Show refresh rate.")
	inverse_colors           = flag.Bool("led-inverse", false, "Switch if your matrix has inverse colors on.")
	disable_hardware_pulsing = flag.Bool("led-no-hardware-pulse", false, "Don't use hardware pin-pulse generation.")
)

type MatrixPanel struct {
	id       string
	name     string
	sequence uint
	//matrix   [][]Pixel
}

var matrix rgbmatrix.Matrix = init_matrix()
var canvas *rgbmatrix.Canvas = rgbmatrix.NewCanvas(matrix)

func init_matrix()(rgbmatrix.Matrix){
	config := &rgbmatrix.DefaultConfig
	config.Rows = *rows
	config.Cols = *cols
	config.Parallel = *parallel
	config.ChainLength = *chain
	config.Brightness = *brightness
	config.HardwareMapping = *hardware_mapping
	config.ShowRefreshRate = *show_refresh
	config.InverseColors = *inverse_colors
	config.DisableHardwarePulsing = *disable_hardware_pulsing

	m, _ := rgbmatrix.NewRGBLedMatrix(config)	
	return m
}

func main() {

	//Init Endpoints
	defer canvas.Close()
	router := mux.NewRouter()

	init_routes(router)

	//Serve at 8080
	http.ListenAndServe(":5000", router)
}

func init_routes(router *mux.Router) {
	assets := packr.NewBox("./static")
	templates := packr.NewBox("./templates")

	i_template := templates.String("/index.html")

	index := template.Must(template.New("index").Parse(i_template)) //template.ParseFiles(i_template))

	//Serve static resources
	router.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(assets)))
	router.HandleFunc("/create", save_matrix).Methods("POST")
	router.HandleFunc("/apply", apply_matrix).Methods("POST")
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		log_request(r)
		index.Execute(w, nil)
	})
}

func ft(t time.Time) string {
	output := fmt.Sprintf("%d:%d:%d",
		t.Hour(),
		t.Minute(),
		t.Second())

	return output
}

func log_request(request *http.Request) {
	fmt.Println("[" + ft(time.Now()) + "] " + request.RemoteAddr + " " + request.Referer())
}

func apply_matrix(w http.ResponseWriter, r *http.Request) {
	var dat []interface{}
	log_request(r)
	pixels := make(map[uint64]map[uint64]color.Color)

	_ = json.NewDecoder(r.Body).Decode(&dat)

	fmt.Println(dat)

	for _, ele := range dat {
		pxl := ele.(map[string]interface{})

		x, _ := strconv.ParseUint(pxl["x"].(string), 10,8)
		y, _ := strconv.ParseUint(pxl["y"].(string), 10,8)

		rgb := pxl["color"].(map[string]interface{})
		if pixels[x] == nil { pixels[x] = make(map[uint64]color.Color) }
		//pixels[pxl["x"].(string)] = make(map[string]color.Color)


		r, _ := strconv.ParseUint(rgb["r"].(string), 10,8)
		g, _ := strconv.ParseUint(rgb["g"].(string), 10,8)
		b, _ := strconv.ParseUint(rgb["b"].(string), 10,8)


		pixels[x][y] = color.RGBA{R:uint8(r),G:uint8(g),B:uint8(b),A:255}
		//fmt.Printf("x", x, "y", y,"color",  pixels[x][y],"\t")

		//fmt.Println(pixels[pxl["x"].(string)][pxl["y"].(string)])
	}
	set_pixels(pixels)
}

func save_matrix(w http.ResponseWriter, r *http.Request) {
	var dat map[string]interface{}
	log_request(r)

	_ = json.NewDecoder(r.Body).Decode(&dat)
}

func fatal(err error) {
	if err != nil {
		panic(err)
	}
}

func set_pixels(pixels map[uint64]map[uint64]color.Color) {
	bounds := canvas.Bounds()
	for x := bounds.Min.X; x < bounds.Max.X; x++ {
		for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
			var pixel_color = pixels[uint64(x)][uint64(y)]
			canvas.Set(x,y, pixel_color) //color.RGBA{255, 0, 0, 255})
		}
	}
	canvas.Render()
	time.Sleep(10)
}

/*func new_matrix()(RGBLedMatrix) {
	config = init_matrix_config()
	m, _ := rgbmatrix.NewRGBLedMatrix(&config)

	return m
}

func new_canvas(matrix RGBLedMatrix)(Canvas) {
	return rgbmatrix.NewCanvas(matrix)
}*/

func render() {
	canvas.Render()
}

/*func init_matrix_config()(HardwareConfig){
	config := &rgbmatrix.DefaultConfig
	config.Rows = *rows
	config.Cols = *cols
	config.Parallel = *parallel
	config.ChainLength = *chain
	config.Brightness = *brightness
	config.HardwareMapping = *hardware_mapping
	config.ShowRefreshRate = *show_refresh
	config.InverseColors = *inverse_colors
	config.DisableHardwarePulsing = *disable_hardware_pulsing
}

func init_canvas(matrix RGBLedMatrix)(Canvas) {
	return  rgbmatrix.NewCanvas(matrix)
}
*/
