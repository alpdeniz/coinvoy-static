var setFrameHeight = function(height) {
	document.getElementById("paymentFrame").style.height = height;
}

function listener(event){
  // if ( event.origin !== "http://javascript.info" )
  //   return
  	switch(event.data) {
  		case "hide":
  			//
  			break;
  		case "close":
  			//
  			break;
  		case "approved":
  			//
  			break;
  		case "cancelled":
  			//
  			break;
  		default:
  			if(event.data.indexOf(":") > 0) {
  				var h = event.data.split(":")[1];
  				setFrameHeight(h);
  			}
  			break
  	}
}
// IFRAME MESSAGES
if (window.addEventListener){
	addEventListener("message", listener, false)
} else {
	attachEvent("onmessage", listener)
}