x32homeTimes = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:32", "16:02", "16:31", "17:04", "17:28", "17:49", "18:06", "19:15", "19:23", "19:58", "21:10"];

homeTimes98 = ["07:04", "07:40", "08:04", "08:41", "09:09", "09:39", "10:09", "10:39", "11:09", "11:39", "12:15", "12:45", "13:15", "13:45", "14:15", "14:45", "15:15", "15:40", "16:12", "16:40", "17:15", "17:43", "18:18", "18:46"];

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

times = makeStops("X32", x32homeTimes).concat(makeStops("98", homeTimes98));
times.sort((x, y) => x.time - y.time);

function makeEntry(stop, time) {
    minutes = Math.round((stop.time-time)/60000);
    hours = Math.floor(minutes/60);
    minutes -= 60*hours;
    result = "\n<tr>";
    result += "<td>" + stop.bus + "</td>";
    result += "<td>" + stop.time + "</td>";
    result += "<td>" + hours + "</td>";
    result += "<td>" + minutes + "</td>";
    result += "</td>";
    return result;
}

function listToTable(xs) {
    d = new Date
    result = "";
    xs.forEach(x => result += makeEntry(x, d));
    return result;
};

var options = document.querySelector('#options');
// Rx.Observable.fromEvent(button, 'click')
Rx.Observable.interval(100)
    .audit(ev => Rx.Observable.interval(1000))
    .map(() => new Date)
    // .map(x => x.toLocaleTimeString())
    .map(x => times.filter(y => x < y.time))
    .subscribe(x => options.innerHTML = listToTable(x));
