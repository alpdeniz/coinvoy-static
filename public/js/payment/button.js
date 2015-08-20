var coinvoyButton = {
  //object vars
  hash: "",
  paymentFrame: false,
  paymentDim: false,
  wrapper: false,
  callback: false,
  invoiceID: false,
  iframe: false,

  init : function(hash, success, cancel) {
    //set callbacks
    this.success = success;
    this.cancel = cancel;

    if(!this.wrapper) {
      // init wrapper
      wrapper = document.createElement('div');
      wrapper.id = "coinvoy-wrapper";
      document.body.appendChild(wrapper);
      this.wrapper = wrapper;
    }
    if(!this.results) {
      // init results box
      results = document.getElementById('coinvoy-button-wrapper');
      this.results = results;
    }
    
    // init selection box
    this.hash = hash;
    var $this = this;

    function listener(event){
      // if ( event.origin !== "http://javascript.info" )
      //   return
        switch(event.data) {
          case "hide":
            $this.hide();
            break;
          case "close":
            $this.close();
            break;
          case "approved":
            if($this.success) {
              $this.success();
            } else {
              $this.results.style.color = "green";
              $this.results.innerHTML = "Payment successfully received.<br>Thank you!";
            }
            setTimeout(function(){
              $this.close();  
            },2000);
            break;
          case "cancelled":
            if($this.cancel) {
              $this.cancel();
            } else {
              $this.results.style.color = "red";
              $this.results.innerHTML = "Transaction cancelled";
            }
            setTimeout(function(){
              $this.close();
          },2000);
            break;
          default:
            if(event.data.indexOf(":") > 0) {
              var h = event.data.split(":")[1];
              $this.setFrameHeight(h);
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
  },

  start : function() {
    if(document.getElementById('payment-frame')) {
      this.show();
      return;
    }

    if(!this.paymentDim) {
      var $this = this;
      var dim = document.createElement('div');
      dim.id = "payment-dim";
      dim.onclick = function() {
        this.hide();
      }
      this.wrapper.appendChild(dim);
      this.paymentDim = dim;
    }
    this.paymentDim.style.display = "block";

    var frame = document.createElement('div');
    frame.id = "payment-frame";
    var iframe = document.createElement('iframe');
    iframe.id = "payment-iframe";
    iframe.style.width = "482px";
    iframe.style.height = "0px";
    iframe.style.marginTop = "3px";
    iframe.style.borderRadius = "8px";
    //iframe.style.display = "none";
    iframe.src = "https://coinvoy.net/button/" + this.hash;
    iframe.frameBorder = "0";
    iframe.scrolling = "no";
    this.iframe = iframe;
    frame.appendChild(iframe);
    //save class elements
    this.paymentFrame = frame;
    this.wrapper.appendChild(frame);
  },

  hide : function() {
    paymentFrame = document.getElementById('payment-frame');
    paymentFrame.style.display = "none";
    this.paymentDim.style.display = "none";
  },

  show : function(i) {
    paymentFrame = document.getElementById('payment-frame');
    this.paymentDim.style.display = "block";
    paymentFrame.style.display = "block";
  },

  close : function() {
    paymentFrame = document.getElementById('payment-frame');
    paymentFrame.remove();
    this.paymentDim.style.display = "none";
  },

  setFrameHeight: function(height) {
    this.iframe.style.height = height;
  }
  
}