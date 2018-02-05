"use strict";

var timesObservable = Rx.Observable.fromPromise(fetch("temp.json"))
    .switchMap(response => Rx.Observable.fromPromise(response.json()))
    .map(json => {
    	var result = [];
    	json.forEach(x => result = result.concat(makeStops(x)));
    	result.sort((x,y) => x.time - y.time);
	return result;
    });

function makeStops(x) {
    var bus = x.bus;
    var ts = x.times;
    var toward = x.toward;
    var tset = [];
    ts.forEach(t => {
	var time = t.split(":");
	var h = Number(time[0]);
	var m = Number(time[1]);
	var d = new Date();
	d.setHours(h);
	d.setMinutes(m);
	d.setSeconds(0);
	tset.push({"bus": bus, "toward":toward, "time":d});
    });
    return tset;
}

function pad(x) {
    if(x>=10) return x;
    return "0" + x;
}


function makeEntry(stop, time) {
    var minutes = Math.round((stop.time-time)/60000);
    var hours = Math.floor(minutes/60);
    minutes -= 60*hours;
    return {"bus":stop.bus, "hours":hours,
	    "minutes":minutes, "time":stop.time,
	    "toward":stop.toward};
}

function localTime(time) {
    return time.getHours() + ":" + pad(time.getMinutes());
}

function displayEntry(entry){
    var result = "\n<tr>";
    result += "<td>" + entry.bus + "</td>";
    result += "<td>" + localTime(entry.time) + "</td>";
    result += "<td>" + entry.hours + "</td>";
    result += "<td>" + entry.minutes + "</td>";
    result += "</td>";
    return result;
}

function listToTable(xs) {
    var result = "";
    xs.forEach(x => result += displayEntry(x));
    return result;
}

function tableCompare(xs, ys) {
    if(xs.length != ys.length) return false;
    for(var i=0;i<xs.length;i++) {
	if(xs[i].bus != ys[i].bus) return false;
	if(xs[i].time != ys[i].time) return false;
	if(xs[i].hours != ys[i].hours) return false;
	if(xs[i].minutes != ys[i].minutes) return false;
    }
    return true;
}

//myloc is the observable which holds the user's current location
var loc = document.querySelector("#loc");
var myloc = Rx.Observable.fromEvent(loc, "change")
    .map(x => x.target.value)
    .startWith(document.getElementById("loc").value);

var options = document.querySelector('#options');

var times = Rx.Observable.interval(1000)
    .map(() => new Date());

var tables = Rx.Observable.combineLatest(times, timesObservable)
    .map(lst => {
	var x = lst[0];
	var ts = lst[1];
	return ts.filter(y => x < y.time).map(q => makeEntry(q, x));})
    .distinctUntilChanged(tableCompare);

var localTimes = Rx.Observable.combineLatest(tables, myloc)
    .map(args => args[0].filter(y => y.toward == args[1]));

localTimes.subscribe(x => options.innerHTML = listToTable(x));

Notification.requestPermission();
tables.map(x => x[0])
    .distinctUntilChanged((x, y) => x.time == y.time)
    .subscribe(x => navigator.serviceWorker.ready.then(
	function(registration) {
	    registration.showNotification("Next " + x.bus + " is leaving at "+localTime(x.time));}));

if("serviceWorker" in navigator) {
    navigator.serviceWorker.register("serviceworker.js")
	.then(function(registration) {
	    console.log("Registration successful, scope is:", registration.scope);})
	.catch(function(error) {
	    console.log("Service worker registration failed, error:", error);
	});
}
