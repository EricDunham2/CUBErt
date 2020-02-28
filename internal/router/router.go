package router

import (
	"../logger"
	"../file"
	"github.com/gobuffalo/packr"
	"github.com/gorilla/mux"
	"io/ioutil"
	"encoding/json"
	"html/template"
	"net/http"
	"../leds"
)

var router *mux.Router

func addResources() {
	resources := packr.NewBox("../../web/static")
	templates := packr.NewBox("../../web/views")

	router.PathPrefix("/static").Handler(http.StripPrefix("/static/", http.FileServer(resources)))
	router.PathPrefix("/templates").Handler(http.StripPrefix("/templates/", http.FileServer(templates)))
}

func addEndpoints() {
	router.HandleFunc("/getSettings", getSettings).Methods("GET")
	router.HandleFunc("/setSettings", setSettings).Methods("POST")
	router.HandleFunc("/setLeds", setLeds).Methods("POST")
	router.HandleFunc("/getLogs", getLogs).Methods("GET")
	router.HandleFunc("/getPresets", getPresets).Methods("GET")
	router.HandleFunc("/setPreset", setPreset).Methods("POST")
	router.HandleFunc("/off", off).Methods("GET")
	router.HandleFunc("/on", on).Methods("GET")
	//router.HandleFunc("/setTransistion", setTransistion).Methods("POST")
}

func addViews() {
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl := []string{"./../web/index.html"}
		i, err := template.New("").ParseFiles(tmpl...)

		if err != nil {
			logger.Log(err.Error())
			return
		}

		logger.Log("Redirecting to Home...")
		i.ExecuteTemplate(w, "indexHTML", "")
	})
}

func StartServer(port string) {
	router = mux.NewRouter()

	addResources()
	addEndpoints()
	addViews()

	canvas := leds.New()
	leds.Load()
	leds.LoadSettings()

	defer canvas.Close()

	http.ListenAndServe(port, router)
}

func getSettings(w http.ResponseWriter, r *http.Request) {
	settings := leds.GetSettings()

	dat, _ := json.Marshal(*settings)

	w.Header().Set("Content-Type", "application/json")
	w.Write(dat)
}

func setSettings(w http.ResponseWriter, r *http.Request) {
	body, _ := ioutil.ReadAll(r.Body)

	exists := file.Exists("settings")

	if exists == true {
		err := file.Remove("settings")

		if err != nil {
			logger.Log(err.Error())
			logger.Log("Error removing file...")
		}
	}

	file.Create(string(body), "settings")

	leds.Delete()
	leds.New()
}

func setLeds(w http.ResponseWriter, r *http.Request) {
	var pixels []leds.Pixel

	body, _ := ioutil.ReadAll(r.Body)
	json.Unmarshal(body, &pixels)

	leds.Save(pixels)
	leds.Apply(pixels)
}

func getLogs(w http.ResponseWriter, r *http.Request) {
	logs := logger.GetLogs()
	re, _ := json.Marshal(logs)

	w.Header().Set("Content-Type", "application/json")
	w.Write(re)
}

func getPresets(w http.ResponseWriter, r *http.Request) {
	var dat []byte = file.Read("configs")

	w.Header().Set("Content-Type", "application/json")
	w.Write(dat)
}

//This is inefficent and needs work
func setPreset(w http.ResponseWriter, r *http.Request) {
	body, _ := ioutil.ReadAll(r.Body)
	var data leds.Favorite

	json.Unmarshal(body, &data)

	var favorites []leds.Favorite
	cfg := file.Read("configs")

	json.Unmarshal(cfg, &favorites)

	favorites = append(favorites, data)

	fileDat, err := json.Marshal(favorites)

	if err != nil {
		logger.Log(err.Error())
		return
	}

	file.Create(string(fileDat), "configs")
}

func off(w http.ResponseWriter, r *http.Request) {
	leds.Delete()
}

func on(w http.ResponseWriter, r *http.Request) {
	leds.New()
}