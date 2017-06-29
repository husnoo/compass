function radians(deg) {
    return deg * Math.PI / 180;
}

function degrees(rad) {
    return rad * 180 / Math.PI;
}

function mod(n, m) {
        return ((n % m) + m) % m;
}

function calculate_hour_angle(d) {
    /* From wiki: the solar hour angle is an expression of time, expressed in angular measurement, usually degrees, from solar noon. At solar noon the hour angle is 0.000 degree, with the time before solar noon expressed as negative degrees, and the local time after solar noon expressed as positive degrees. For example, at 10:30 AM local apparent time the hour angle is -22.5° (15° per hour times 1.5 hours before noon). */
    var midday = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12,0,0);
    var diff_ms = d - midday;
    var diff_h = diff_ms / (60 * 60 * 1e3);
    return diff_h * 15;
}

function calculate_declination(d) {
    /* delta_sun = -23.44deg * cos( (360deg/365days) + (N+10) ) */
    var start_of_year = new Date(d.getFullYear(), 1, 1, 0,0,0);
    var diff_ms = d - start_of_year;
    var diff_days = diff_ms / (60 * 60 * 1e3 * 24);
    return -1 * degrees(Math.asin(0.39779*Math.cos(radians(0.98565 * (diff_days+10) + 1.914 * Math.sin(radians(0.98565*(diff_days-2)))))))
}

function calculate_zenith_angle(latitude, declination, hour_angle) {
    /*
      cos theta_s = sin alpha_s
                  = sin lat * sin delta + cos lat * cos delta * cos h
    */
    var term1 = Math.sin(radians(latitude)) * Math.sin(radians(declination));
    var term2 = Math.cos(radians(latitude)) * Math.cos(radians(declination)) * Math.cos(radians(hour_angle));    
    return degrees(Math.acos(term1 + term2));
}

function calculate_elevation(d, lat) {
    var hour_angle = calculate_hour_angle(d);
    var sun_declination = calculate_declination(d);
    var zenith_angle = calculate_zenith_angle(lat, sun_declination, hour_angle);
    return 90 - zenith_angle;
} 

function calculate_azimuth(d, lat) {
    /*
      sin phi_s = (-sin h cos delta)/ sin theta_s
      cos phi_s = (sin delta - cos theta_s sin Phi) / (sin theta_s * cos Phi)
     */
    var hour_angle = calculate_hour_angle(d);
    var sun_declination = calculate_declination(d);
    var zenith_angle = calculate_zenith_angle(lat, sun_declination, hour_angle);
    var term2a = Math.sin(radians(sun_declination)) - Math.cos(radians(zenith_angle)) * Math.sin(radians(lat));
    var term2b = Math.sin(radians(zenith_angle)) * Math.cos(radians(lat));
    var cosphis = term2a/term2b;
    var ang = degrees(Math.acos(cosphis));
    if (hour_angle<0) {
	azim = ang;
    } else {
	azim = 360-ang;
    }
    return azim;
}

function draw_hand(ctx, pos, length, width) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0,0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
}


function draw_compass(azimuth) {
    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var radius = Math.min(canvas.width, canvas.height) / 2;	
    var ctx = canvas.getContext("2d");
    ctx.translate(canvas.width/2, canvas.height/2)

    // draw face
    ctx.beginPath();
    ctx.arc(0, 0, 0.95*radius, 0, 2*Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    grad = ctx.createRadialGradient(0,0,radius*0.90, 0,0,radius*0.95);
    grad.addColorStop(0.5, 'white');
    grad.addColorStop(1, '#333');
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius*0.1;
    ctx.stroke();

    // draw north
    ctx.fillStyle = '#ccc';
    ctx.strokeStyle = "#333";
    draw_hand(ctx, 0, 0.85*radius, 30);
    
    // draw sun
    ctx.fillStyle = '#ccc';
    ctx.strokeStyle = "#FF8c00";
    draw_hand(ctx, radians(azim), 0.85*radius, 30);
}


function update_compass() {
    var now = new Date();
    var lat = 50 + 43/60;
    var azim = calculate_azimuth(now, lat);
    draw_compass(azim);
    //console.log(now, azim);
}


function setup() {
    //$("#msg").html("ready...");
    update_compass();
    function update_regularly() {
	update_compass();
	setTimeout(update_regularly, 5000);
    }
    setTimeout(update_regularly, 5000);
}

