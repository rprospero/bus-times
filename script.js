var button = document.querySelector('button');
// Rx.Observable.fromEvent(button, 'click')
Rx.Observable.interval(100)
    .audit(ev => Rx.Observable.interval(1000))
    .subscribe(x => button.innerHTML = x);
