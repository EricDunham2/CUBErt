package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"time"

	"github.com/gobuffalo/packr"
	"github.com/gorilla/mux"
	//"io/ioutil"
)

//"log"

type color struct {
	r uint
	g uint
	b uint
	a uint
}

type pixel struct {
	x    uint
	y    uint
	rgba color
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

	/*if t == nil {
		return ""
	}*/
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
	var dat map[string]interface{}

	log_request(r)

	//_ = json.NewDecoder(r.Body).Decode(&dat)
	fmt.Println(dat)
}

func save_matrix(w http.ResponseWriter, r *http.Request) {
	var dat map[string]interface{}
	log_request(r)

	_ = json.NewDecoder(r.Body).Decode(&dat)
	fmt.Println(dat)
}
