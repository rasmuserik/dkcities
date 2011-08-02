(function() {

// # Game data

// image name
var map = 'denmark.jpg'
// size of image 
var norm = [1920, 960]
// locations to quiz
xlocations = [
    ['København', 1143, 894],
    ['Køge', 1057, 997],
    ['Odense', 597, 1116],
    ['Ålborg', 488, 392],
    ['Århus', 561, 760],
    ['Herning', 250, 850],
    ['Skagen', 629, 62],
    ['Vejle', 403, 1013]
];
var zoomfactor = 10;
var scoretitle = "Byer: ";

// normalise location position
(function() {
    for(var i = 0; i < locations.length; ++i) {
        locations[i][1] /= norm[0];
        locations[i][2] /= norm[1];
    }
})()

// # var decls
var quizvalue = 0;
var cursorDown = false;
var zoomedin = false;
var prevx, prevy;
var imposx, imposy;
var mapDom;
var imwidth, imheight, viewwidth, viewheight;
var logosz;
var clickx, clicky, clicktime;
var namesize = Math.round($(window).width() / 8);
var textsize = Math.round(namesize / 3);
var count = 1;
// # Location management

function shuffle() {
    var t, result = [];
    while(locations.length > 0) {
        i = Math.floor(Math.random() * locations.length);
        result.push(locations[i]);
        locations[i] = locations[locations.length - 1];
        locations.pop();
    }
    locations = result;
    console.log(locations);
}

// score management

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
        zoomin(x, y);
    } else {
        prevx = x;
        prevy = y;
        //zoomout("blah");
    }
}

function newCity(name, ok) {
    function slidein() {
        $('#cityname')
            .text(name)
            .css('color', 'white')
            .css('left', viewwidth)
            .animate({ left: 0 }); 
    }

    if(ok) {
        $('#cityname')
            .animate({
                top: Math.round(viewheight/2 - namesize),
                left: - viewwidth,
                'font-size': namesize,
                'width': viewwidth
            }, slidein);
    } else {
        $('#cityname')
            .animate({
                top: Math.round(viewheight/2 - namesize),
                left: viewwidth,
                'font-size': namesize,
                'width': viewwidth
            }, slidein);
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
        var result = nearest(
            (prevx-imposx)/imwidth,
            (prevy-imposy)/imheight);

        ok = result === quizvalue;

        count += ok ? 1 : -1;
        if(count > locations.length) {
            count = locations.length;
        }

        var newquiz = Math.floor(Math.random() * count);
        while(ok && newquiz === quizvalue && count >= 2) {
            newquiz = Math.floor(Math.random() * count);
        }

        $("#score").text(scoretitle + count);
        quizvalue = newquiz;

        $('#cityname').css('color', ok ? '#44aa44' : '#cc3333');
        
        zoomout(function() { newCity(locations[quizvalue][0], ok)});
    }
    console.log("upEvent " +  clickduration + ", " + movement);
}

var locationimgs;

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
    locationimgs = $("#locations")[0].children;
    for(var i = 0; i < count; ++i) {
        locationimgs[i].style.left = (0|(locations[i][1] * imwidth + imposx - .5 * logosz)) + "px";
        locationimgs[i].style.top = (0|(locations[i][2] * imheight + imposy- .5 * logosz)) + "px";
    }
}

function animate(fn) {
    $('#map').animate({ 
        left: imposx, 
        top: imposy, 
        width: imwidth, 
        height: imheight
    }, fn);
    for(var i = 0; i < count; ++i) {
        $("#loc" + i)
            .attr("src", 'location.png')
            .css('z-index', -1)
            .css("position", 'fixed')
            .animate({
                'width': logosz,
                'height': logosz,
                "left": locations[i][1] * imwidth + imposx - .5 * logosz,
                "top": locations[i][2] * imheight + imposy- .5 * logosz
            });
    }
    $("#loc" + i).css("left", viewwidth);
}

function nearest(x, y) {
    var dist = 100;
    var result;
    for(var i = 0; i < count; ++i) {
        var loc = locations[i];
        var dist2 = (loc[1] - x)*(loc[1] - x) + (loc[2] - y)*(loc[2] - y);
        if(dist2 < dist) {
            result = i;
            dist = dist2;
        }
    }
    return result;
}

function zoomin(x, y) {
    imposy =  Math.round(viewheight / 2 - zoomfactor * y);
    imposx = Math.round(viewwidth / 2 - zoomfactor * x);
    imwidth = zoomfactor * viewwidth;
    imheight = zoomfactor * viewheight;
    imbounds();
    logosz = Math.round(viewwidth/10);
    animate( function() { zoomedin = true });
    $('#cityname').animate({
        top: 0,
        'font-size': textsize,
    }); 
}

function zoomout(fn) {

    viewwidth = $(window).width();
    viewheight = $(window).height();
    imposy =  0;
    imposx = 0;
    imwidth = viewwidth;
    imheight = viewheight;
    logosz = Math.round(viewwidth/zoomfactor/10);

    animate(function() { zoomedin = false; });
    $('#cityname').animate({
        top: Math.round(viewheight/2 - namesize),
        'font-size': namesize,
        'width': $(window).width() - namesize
    }, fn); 
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
    shuffle();
    $('body').html('<img src="denmark.jpg" id=map><div id="cityname"></div><div id="score"></div><div id="locations"></div>');
    var locstr = '';
    for(var i = 0; i < locations.length; ++i) {
        locstr += '<image id="loc' + i + '">'
    }
    $('#locations').html(locstr);
    $('#map').css('position', 'fixed')
             .css('user-select', 'none')
             .css('z-index', -2)
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
