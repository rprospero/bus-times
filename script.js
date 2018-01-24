times = []

if(localStorage.getItem("timetable")) {
    times = localStorage.getItem("timetable")
}
fetch("temp.json").then(function(response) {
    response.json().then(function(json) {
	result = []
	json.forEach(x =>
		     result = result.concat(makeStops(x.bus, x.times)));
	result.sort((x, y) => x.time - y.time);
	times = result;
	localStorage.setItem("timetable", times)
    });
});

function makeStops(bus, ts) {
    tset = []
    ts.forEach(t => {
	ts = t.split(":");
	h = Number(ts[0]);
	m = Number(ts[1]);
	d = new Date;
	d.setHours(h);
	d.setMinutes(m);
	d.setSeconds(0);
	tset.push({"bus": bus, "time":d});
    });
    return tset;
};

function pad(x) {
    if(x>=10) return x;
    return "0" + x
};


function makeEntry(stop, time) {
    minutes = Math.round((stop.time-time)/60000);
    hours = Math.floor(minutes/60);
    minutes -= 60*hours;
    return {"bus":stop.bus, "hours":hours,
	    "minutes":minutes, "time":stop.time};
}

function localTime(time) {
    return time.getHours() + ":" + pad(time.getMinutes());
}

function displayEntry(entry){
    result = "\n<tr>";
    result += "<td>" + entry.bus + "</td>";
    result += "<td>" + localTime(entry.time) + "</td>";
    result += "<td>" + entry.hours + "</td>";
    result += "<td>" + entry.minutes + "</td>";
    result += "</td>";
    return result;
}

function listToTable(xs) {
    result = "";
    xs.forEach(x => result += displayEntry(x));
    return result;
};

function tableCompare(xs, ys) {
    if(xs.length != ys.length) return false;
    for(var i=0;i<xs.length;i++) {
	if(xs[i].bus != ys[i].bus) return false;
	if(xs[i].time != ys[i].time) return false;
	if(xs[i].hours != ys[i].hours) return false;
	if(xs[i].minutes != ys[i].minutes) return false;
    }
    return true
}

var options = document.querySelector('#options');
// Rx.Observable.fromEvent(button, 'click')
tables = Rx.Observable.interval(1000)
    .map(() => new Date)
    // .map(x => x.toLocaleTimeString())
    .map(x => times.filter(y => x < y.time).map(q => makeEntry(q, x)))
    .distinctUntilChanged(tableCompare);

tables.subscribe(x => options.innerHTML = listToTable(x));

Notification.requestPermission();
tables.map(x => x[0])
    .distinctUntilChanged((x, y) => x.time == y.time)
    .subscribe(x => new Notification("Next " + x.bus + " is leaving at "+localTime(x.time)));

if("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
	.then(function(registration) {
	    console.log("Registration successful, scope is:", registration.scope);})
	.catch(function(error) {
	    console.log("Service worker registration failed, error:", error);
	});
}
