addEventListener('message',function(e) {
	processMessage(e);
},false);

var id;

function processMessage(e) {
	id = e.data.id;

	addToTime();
}

var time = -1;
function addToTime() {
	time++;
	postMessage({"time":time,"id":id});
	setTimeout(addToTime, 10);
}