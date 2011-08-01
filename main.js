(function() {
var cursorDown = false;

function downEvent(x,y) {
    if(cursorDown) return; cursorDown = true;
    console.log("downEvent", x, y);
}

function upEvent(x,y) {
    if(!cursorDown) return; cursorDown = false;
    console.log("upEvent", x, y);
}

function moveEvent(x,y) {
    if(!cursorDown) return;
    console.log("moveEvent", x, y);
}

var namesize = Math.round($(window).width() / 8);
function zoomout(name) {
    $('#map').css('top', 0)
             .css('left', 0)
             .css('width', $(window).width())
             .css('height', $(window).height());
    $('#cityname').text(name)
                  .css('top', ($(window).height()-$('#cityname').height())/2);
}

function init() {
    $('body').html('<img src="denmark.jpg" id=map><div id=cityname></div>');
    $('#map').css('position', 'fixed')
             .css('z-index', -1);
    $('#cityname').css('position', 'fixed')
                  .css('color', '#ffffff')
                  .css('font-size', namesize)
                  .css('text-align', 'center')
                  .css('font-family', 'sans-serif')
                  .css('left', namesize/2)
                  .css('width', $(window).width() - namesize)
                  .css('text-shadow', '0 0 .2ex black');
}

function main() {
    init();
    registerEvents();
    zoomout('Et-eller-andet Bynavn');
}

function registerEvents() {
    function xyWrapper(fn) {
        return function(e) {
            var clientY, clientx;
            if (e.originalEvent.touches) {
                clientY = e.originalEvent.touches[0].clientY;
                clientX = e.originalEvent.touches[0].clientX;
            } else {
                clientY = e.clientY;
                clientX = e.clientX;
            }
            return fn(clientX, clientY);
        }
    }

    if ('ontouchstart' in document.documentElement) {
        $('body').bind('touchstart', xyWrapper(downEvent));
    } else {
        $('body').bind('mousedown', xyWrapper(downEvent));
    }

    if ('ontouchend' in document.documentElement) {
        $('body').bind('touchend', xyWrapper(upEvent));
    } else {
        $('body').bind('mouseup', xyWrapper(upEvent));
        $('body').bind('mouseout', xyWrapper(upEvent));
    }

    if ('ontouchmove' in document.documentElement) {
        $('body').bind('touchmove', xyWrapper(moveEvent));
    } else {
        $('body').bind('mousemove', xyWrapper(moveEvent));
    }
}

if(window.PhoneGap && window.PhoneGap.device) {
    document.addEventListener("deviceready", function() { $(main); }, false);
} else {
    $(main);
}

})();
