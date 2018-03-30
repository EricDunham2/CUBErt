package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"image/color"
	"net/http"
	"time"
	//"flag"

	"github.com/gobuffalo/packr"
	"github.com/gorilla/mux"
	//"github.com/mcuadros/go-rpi-rgb-led-matrix"
	//"io/ioutil"
)

//"log"

type pixel struct {
	x    uint
	y    uint
	rgba color.RGBA
}

type matrix_panel struct {
	id       string
	name     string
	sequence uint
	matrix   [][]pixel
}

func main() {

	//Init Endpoints
	router := mux.NewRouter()

	init_routes(router)
	//matrix := init_matrix()

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
	var pixels []pixel

	_ = json.NewDecoder(r.Body).Decode(&dat)

	for _, ele := range dat {
		pxl := ele.(map[string]interface{})
		rgb := pxl["color"].(map[string]uint8)

		c := color.RGBA{R: rgb["r"], G: rgb["g"], B: rgb["b"], A: rgb["a"]}
		p := pixel{x: pxl["x"].(uint), y: pxl["y"].(uint), rgba: c}

		pixels = append(pixels, p)
	}

	fmt.Println(pixels)
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

/*
var (
	rows                     = flag.Int("led-rows", 32, "number of rows supported")
	cols                     = flag.Int("led-cols", 32, "number of columns supported")
	parallel                 = flag.Int("led-parallel", 1, "number of daisy-chained panels")
	chain                    = flag.Int("led-chain", 2, "number of displays daisy-chained")
	brightness               = flag.Int("brightness", 100, "brightness (0-100)")
	hardware_mapping         = flag.String("led-gpio-mapping", "regular", "Name of GPIO mapping used.")
	show_refresh             = flag.Bool("led-show-refresh", false, "Show refresh rate.")
	inverse_colors           = flag.Bool("led-inverse", false, "Switch if your matrix has inverse colors on.")
	disable_hardware_pulsing = flag.Bool("led-no-hardware-pulse", false, "Don't use hardware pin-pulse generation.")
)

func init_matrix()(matrix *RGBLedMatrix) {
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

	m, err := rgbmatrix.NewRGBLedMatrix(config)

	fatal(err)

	return m
}

func init_canvas(matrix RGBLedMatrix)(Canvas) {
	return  rgbmatrix.NewCanvas(matrix)
}

func set_colors(canvas &Canvas) {
	bounds := canvas.Bounds()

	for x := bounds.Min.X; x < bounds.Max.X; x++ {
		for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
			color := color.RGBA{}
			fmt.Println("[%s,%s] %s",x,y,color.RGBA())
			c.Set(x,y,color)
		}
	}
	c.Render()
}

func render() {

}*/
