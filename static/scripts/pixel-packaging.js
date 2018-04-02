class Matrix_Loadout {
    constructor(name, panels) {
        this.name = name;
        this.panels = panels;
    }
}

/*
 *SEQUENCE_NUMBER (INT) Used to tell what location the panel is if chained
 *NAME (APLHA) Name of the panel used for identification later
 *SNAPSHOT (BLOB?) Preview of the panel
 *PIXELS (ARRAY[PIXELS]) Array of pixels that hold the x,y,rgb for each pixel on the panel
 */

class Panel {
    constructor(name, guid, snapshot, pixels) {
        this.sequence_number = null;
        this.name = name;
	    this.guid = guid;
        this.snapshot = snapshot;
        this.pixels = pixels;
    }
}

class Pixel {
    constructor(x, y, color) {
        this.x = String(x);
        this.y = String(y);
        this.color = color;
    }
}

class Color {
    constructor(r, g, b) {
        this.r = String(r);
        this.g = String(g);
        this.b = String(b);
    }

    static toColor(colorString) {
        colorString = colorString.slice(4, colorString.length - 1).replace(/ /g, '');
        var arr = colorString.split(',');
        return new Color(arr[0], arr[1], arr[2]);
        //Some code to convert RGB string to Color object
    }

    toRGBString() {
        return `rgb(${this.r},${this.g},${this.b})`.replace(' ','');
    }
}

var panels = {};

function save() {
    var current_panel = new Panel('New Panel',uuid4(), null, []);
    
    current_panel.pixels = getPixels();
    current_panel.name = getPanelName();
    getSnapshot().then(handle, handle);

    function handle(result) {
        current_panel.snapshot = result;
        panels[current_panel.name] = current_panel;

        var previews = document.getElementsByClassName('panel-preview')[0];
        var p_html = `
			<div class="matrix-panel" id="${current_panel.guid}">
				<div class="matrix-panel-header">${current_panel.name}</div>
				<div class="matrix-image-container">
					<img src="${current_panel.snapshot}" class="preview-image">
				</div>
			</div>
        `;

        _request('POST','/create',true,JSON.stringify(current_panel));

        createElement('div', { 'class': 'matrix-panel', 'onclick': `loadPanel(\'${current_panel.guid}\')` }, p_html, previews, false);
    }
}

function apply() {
    _request('POST','/apply',true,JSON.stringify(getPixels()));
}

function getSnapshot() {
    return html2canvas(document.getElementById("matrix")).then(canvas => {
        return canvas.toDataURL("image/png");
    });
}

function getPixels() {
    let pixels = [];

    for (var x = 0; x < COLS; x++) {
        for (var y = 0; y < ROWS; y++) {

            let id = `c${x}r${y}`;
            let pixel = document.getElementById(id);
            let color = Color.toColor(pixel.style.background);

            pixels.push(new Pixel(x, y, color));
        }
    }
    return pixels;
}

function getPanelName() {
    let name_input = document.getElementById('name_input');
    return name_input.value;
}

function loadPanel(element) {
    var name = element.id;
    if (!name || !panels[name]) { alert('There is not reference to that panel...'); return; }

    current_panel = panels[name];

    let id = document.getElementById('guid');
    id.value = current_panel.guid;

    let name_input = document.getElementById('name_input');
    name_input.value = current_panel.name;

    current_panel.pixels.forEach(pixel => {
        let id = `c${pixel.x}r${pixel.y}`;
        var matrix_pixel = document.getElementById(id);

        if (!matrix_pixel) { return false; }

        matrix_pixel.style.background = pixel.color.toRGBString();
    });
}

function createElement(type, attrsMap, htmlTemplate, parent, retParent) {
    var el = document.createElement(type);
    var attributes = Object.keys(attrsMap);

    attributes.forEach(attr => {
        el.setAttribute(attr, attrsMap[attr]);
    });

    if (htmlTemplate) {
        el.innerHTML = htmlTemplate;
    }

    if (parent) {
        parent.appendChild(el);
    }

    if (!retParent || !parent) {
        return el;
    } else {
        return retParent;
    }
}

function uuid4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function _request(type,url,async,data) {
    var xhttp = new XMLHttpRequest();

    xhttp.open(type,url,async);

    if (type === 'POST')
        xhttp.setRequestHeader('Content-type','application/json');

    xhttp.send(data);
}



