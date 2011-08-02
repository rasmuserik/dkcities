(function() {
var cursorDown = false;
var zoomedin = false;
var zoomfactor = 5;
var prevx, prevy;
var imposx, imposy;
var mapDom;
var imwidth, imheight, viewwidth, viewheight;
var clickx, clicky, clicktime;
var namesize = Math.round($(window).width() / 8);
var textsize = Math.round(namesize / 4);

function imbounds() {
    if(imposx > 0) { imposx = 0; }
    if(imposy > 0) { imposy = 0; }
    if(imposx < viewwidth - imwidth) { imposx = viewwidth - imwidth; }
    if(imposy < viewheight- imheight) { imposy = viewheight- imheight; }
}

function downEvent(x,y) {
    if(cursorDown) return; cursorDown = true;
    console.log("downEvent " +  x + ", " + y);
    viewwidth = $(window).width();
    viewheight = $(window).height();
    namesize = Math.round($(window).width() / 8);
    clickx = x;
    clicky = y;
    clicktime = (new Date()).getTime();

    if(!zoomedin) {
        imposy =  Math.round(viewheight / 2 - zoomfactor * y);
        imposx = Math.round(viewwidth / 2 - zoomfactor * x);
        imwidth = zoomfactor * viewwidth;
        imheight = zoomfactor * viewheight;
        imbounds();
        $('#map').animate({ 
            top: imposy,
            left: imposx,
            width: imwidth,
            height: imheight
        }, function() { zoomedin = true });
        //$('#cityname').text(name).animate({ opacity: 0 });
        $('#cityname').animate({
            top: 0,
            'font-size': textsize,
        }); 
    } else {
        prevx = x;
        prevy = y;
        //zoomout("blah");
    }
}

function upEvent(x,y) {
    if(!cursorDown) return; cursorDown = false;
    if(!zoomedin) return;

    var clickduration = (new Date()).getTime()  - clicktime;
    var dx = prevx - clickx;
    var dy = prevy - clicky;
    var movement = Math.sqrt(dx*dx + dy*dy);


    // single click
    if(clickduration < 500 && movement < viewwidth / 10) {
        zoomout("København");
    }

    console.log("upEvent " +  clickduration + ", " + movement);
}

function moveEvent(x,y) {
    if(!cursorDown) return;
    console.log("moveEvent " +  x + ", " + y);
    if(!zoomedin) return;

    imposx += x - prevx;
    imposy += y - prevy;
    prevx = x; prevy = y;
    imbounds();
    mapDom.style.top = imposy + 'px';
    mapDom.style.left = imposx + 'px';
}


function zoomout(name) {

    viewwidth = $(window).width();
    viewheight = $(window).height();
    $('#map').animate({ 
        top: 0, 
        left: 0, 
        width: $(window).width(), 
        height: $(window).height() 
    }, function() { zoomedin = false; });
    $('#cityname').text(name).animate({
        top: Math.round(($(window).height()-$('#cityname').height())/2),
        'font-size': namesize,
        'width': $(window).width() - namesize
    }); 
    $('#score').css('position', 'fixed')
                  .css('color', '#ffffff')
                  .css('font-size', textsize)
                  .css('text-align', 'center')
                  .css('font-family', 'sans-serif')
                  .css('top', viewheight - textsize)
                  .css('left', 0)
                  .css('width', viewwidth)
                  .css('text-shadow', '0 0 .2ex black');


    /*console.log("width" + $(window).width());
    $('#map')
        .css('height', $(window).height())
        .css('width', $(window).width())
        .css('top', 0)
        .css('left', 0);
    zoomedin = false;
    $('#cityname').text(name).animate({
        top: Math.round(($(window).height()-$('#cityname').height())/2),
        opacity: 1,
        'width': $(window).width() - namesize
    }); */
}

function init() {
    $('body').html('<img src="dk.jpg" id=map><div id="cityname"></div><div id="score">Score: 5</div>');
    $('#map').css('position', 'fixed')
             .css('user-select', 'none')
             .css('z-index', -1)
             .css('top', $(window).height()/2)
             .css('left', $(window).width()/2)
             .css('width', 0)
             .css('height', 0)
             ;
    mapDom = $('#map')[0];
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
            if (e.originalEvent.touches && e.originalEvent.touches[0]) {
                clientY = e.originalEvent.touches[0].clientY;
                clientX = e.originalEvent.touches[0].clientX;
            } else {
                clientY = e.clientY;
                clientX = e.clientX;
            }
            fn(clientX, clientY);
            return false;
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
