const ROWS = 32;
const COLS = 32;
var mouse_down = false;

function createMatrix(r, c, c1, c2) {
    var matrix = document.getElementById('matrix');
    var scale = 255 / r;

    for (var i = 0; i < r; i++) {
        var row = createElement('div', {
            'class': 'row'
        }, null, matrix, false);
        for (var j = 0; j < c; j++) {
            if (j === 32) {
                break;
            }

            var id = 'c' + i + 'r' + j;

            var red = 00;
            var blue = 00;
            var green = 00;

            background = `rgb(${red},${green},${blue})`;

            var el = createElement('div', {
                    'style': `width:20px;height:20px;background:${background};border-radius:2px;margin:1px;float:left;`,
                    'id': id,
                    'onmouseover': 'setSelectedPixel(this);'
                },
                null,
                row,
                false
            );
        }
    }
}

function setSelectedPixel(self) {
    if (!mouse_down) { return; }

    self.style.opacity = 0.5;
    selectedPixel.push(self);
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

function clear() {
    var node = document.getElementById("matrix");
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }

    createMatrix(COLS,ROWS);
}


document.body.onmousedown = function() {
    mouse_down = true;
}

document.body.onmouseup = function() {
    mouse_down = false;
}

createMatrix(COLS, ROWS);
