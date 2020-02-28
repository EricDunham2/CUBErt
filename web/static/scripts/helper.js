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

  
$(function () {
  custom_input();
});

function custom_input() {
  $(".input-group input").focus(function () {
      $(this).parent(".input-group").each(function () {
          $("label", this).css({
              "font-size": "13px",
              //"color": "#b7bdd1"
          })
      })
  }).blur(function () {
      if ($(this).val() === "") {

          $(this).css({ 
              "background": "#111",
          })

          $(this).parent(".input-group").each(function () {
              $("label", this).css({
                  "font-size": "15px",
              })
          });
      } else {
          $(this).css({ 
              "box-shadow": "none",
              "background": "#112",
          })

          /*$(this).parent(".input-group").each(function() {
              $("label", this).css({
                  "color": "#CC14AB"
              })
          })*/
      }
  });

  if ($(".input-group input").val() !== "") {
      $(".input-group input").focus();
      $(".input-group input").blur();
  }
}

function toastr(message, type, timeout) {
  var body = document.getElementsByTagName("body")[0];

  var t = document.createElement("div");
  t.setAttribute("class", `toast ${type} vhc tc`);
  t.innerHTML = message;

  body.appendChild(t);

  setTimeout(function () {
      removeToast(t);
  }, timeout)
}


function removeToast(el) {
  return new Promise((resolve, reject) => {
      var body = document.getElementsByTagName("body")[0];
      var inter = setInterval(function () {
          var opa = parseFloat(getComputedStyle(el).opacity)
          el.style.opacity = opa - 0.05;

          if (opa <= 0) {
              clearInterval(inter);
              body.removeChild(el);
              resolve(true);
          }
      }, 100);
  });
}

function fadeOut(el) {
  return new Promise((resolve, reject) => {
      var inter = setInterval(function () {
          var opa = parseFloat(getComputedStyle(el).opacity)
          el.style.opacity = opa - 0.05;

          if (opa <= 0) {
              clearInterval(inter);
              el.style.display = "none";
              resolve(true);
              //body.removeChild(el);
          }
      }, 100);
  });
}

function fadeIn(el) {
  //var body = document.getElementsByTagName("body")[0];
  return new Promise((resolve, reject) => {
      var inter = setInterval(function () {
          var opa = parseFloat(getComputedStyle(el).opacity)
          el.style.opacity = opa + 0.1;

          if (opa >= 1) {
              clearInterval(inter);
              el.style.display = "initial";
              toastr("The endpoint specified could not be found.")
              resolve(true);
              //body.removeChild(el);
          }
      }, 100);
  });
}