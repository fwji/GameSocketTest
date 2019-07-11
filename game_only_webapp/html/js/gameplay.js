const timerDisplay = document.querySelector(".timer-display");
var scoreVal = document.getElementById('scoreVal');
var beamText = document.getElementById('beamText');
const countDownTime = 1;
let runningTimer;
var movePanLeft = false;
var movePanRight = false;
var moveTiltUp = false;
var moveTiltDown = false;
var gameStarted = false;
var websocket = null;
var websocket_url = null;
window.addEventListener('keyup', arrowUp);
window.addEventListener('keydown', arrowDown);

startGame();

$("#fireLaser").click(function() {
  /*  if (!beamToggle) {
      beamText.textContent = "BEAM OFF";
      toggleBeamOff();
      beamToggle = true;
    } else {
      beamText.textContent = "BEAM ON";
      toggleBeamOn();
      beamToggle = false;
    }*/
  toggleBeamOff();
  fireLaser();
});

// Mouse action
$("#arrowUp").mousedown(function() {
	moveTiltUp = true;
});
$("#arrowDown").mousedown(function() {
	moveTiltDown = true;
});
$("#arrowLeft").mousedown(function() {
	movePanLeft = true;
});
$("#arrowRight").mousedown(function() {
	movePanRight = true;
});

$("#arrowUp").mouseup(function() {
  tiltShip();
});
$("#arrowDown").mouseup(function() {
  tiltShip();
});
$("#arrowLeft").mouseup(function() {
  panShip();
});
$("#arrowRight").mouseup(function() {
  panShip();
});

$("#stop_button").click(function() {
  stopGame();
});

var scoreMusic = $('#audio-score')[0];
var scoreMusic500 = $('#audio-score500')[0];
var laserSound = $('#audio-laser')[0];
var countdownSound = $('#audio-cd')[0];

function startGame() {
  showGameBoard();
  runTimer();

  // Create EventSource object
  var source = new EventSource(
    'http://localhost:9081/liberty-demo-game/gameapp/game/gamestream');

  source.onmessage = function(e) {
    updateScore(e);
  };
}

function stopGameSuccess() {
  clearInterval(runningTimer);
  sendSocket("stopShip");
  gameStarted = false;
  websocket.close();
  pageRedirect();
}


function stopGameFail() {
  alert("Unable to stop the game due to internal server error");
}
// Keyboard action
function arrowDown(e) {
  e.preventDefault();
  if (e.which == 32) {
    const key = document.querySelector(`.fire-key[data-key="${e.which}"]`);
    key.classList.add('press');
  } else {
    const key = document.querySelector(`.arrow-key[data-key="${e.which}"]`);
    key.classList.add('press');
  }
  if (e.which == 37) {
    //console.log("Keyboard - Moving left!!");
    movePanLeft = true;
  } else if (e.which == 39) {
    //console.log("Keyboard - Moving right!!");
    movePanRight = true;
  } else if (e.which == 38) {
    //console.log("Keyboard - Moving up!!");
	moveTiltUp = true;
  } else if (e.which == 40) {
    //console.log("Keyboard - Moving down!!");
	moveTiltDown = true;
  }
}

function arrowUp(e) {
  e.preventDefault();
  if (e.which == 32) {
    const key = document.querySelector(`.fire-key[data-key="${e.which}"]`);
    key.classList.remove('press');
    //toggleBeamOff();
    /*if (!beamToggle) {
      beamText.textContent = "BEAM OFF";
      toggleBeamOff();
      beamToggle = true;
    } else {
      beamText.textContent = "BEAM ON";
      toggleBeamOn();
      beamToggle = false;
    }*/
  } else {
    const key = document.querySelector(`.arrow-key[data-key="${e.which}"]`);
    key.classList.remove('press');
  }
  console.log("MoveRight=" + movePanRight + " MoveLeft=" + movePanLeft + " MoveUp=" + moveTiltUp + " MoveDown=" + moveTiltDown);
  if (e.which == 37 || e.which == 39) {
	  panShip();
	  //setTimeout(panShip, 250);
  } else if (e.which == 38 || e.which == 40) {
	  tiltShip();
	  //setTimeout(tiltShip, 250);
  } else if (e.which == 32) {
	  laserSound.play();
	  fireLaser();
  }
}

function toggleBeamOn() {
  $('.fire-key').css('background', '#2ecc71').css('box-shadow',
    '-1px 1px 0 #15B358, -2px 2px 0 #15B358, -3px 3px 0 #15B358, -4px 4px 0 #15B358'
  );
  $('.fire-key.press').css('box-shadow',
    '0px 0px 0 #15B358, 0px 0px 0 #15B358, 0px 0px 0 #15B358, -1px 1px 0 #15B358'
  );
  $('.fire-key:active').css('box-shadow',
    '0px 0px 0 #3C93D5, 0px 0px 0 #15B358, 0px 0px 0 #15B358, -1px 1px 0 #15B358'
  );

}

function toggleBeamOff() {
  /*$('.fire-key').css('background', '#e74c3c').css('box-shadow',
    '-1px 1px 0 #CE3323, -2px 2px 0 #CE3323, -3px 3px 0 #CE3323, -4px 4px 0 #CE3323'
  );
  $('.fire-key.press').css('box-shadow',
    '0px 0px 0 #CE3323, 0px 0px 0 #CE3323, 0px 0px 0 #CE3323, -1px 1px 0 #CE3323'
  );
  $('.fire-key:active').css('box-shadow',
    '0px 0px 0 #CE3323, 0px 0px 0 #CE3323, 0px 0px 0 #CE3323, -1px 1px 0 #CE3323'
  );*/
  laserSound.play();
}

function tiltShip() {
  if (moveTiltUp) {
	  console.log("Moving Up...");
	  sendSocket("VU");
	  moveTiltUp = false;
  } 
  else if (moveTiltDown) {
	  console.log("Moving Down...");
	  sendSocket("VD");
	  moveTiltDown = false;
  } else {
	  // Do nothing
  }
}


function panShip() {
  if (movePanLeft) {
	  console.log("Moving Left...");
	  sendSocket("HL");
	  movePanLeft = false;
  } 
  else if (movePanRight) {
	  console.log("Moving Right...");
	  sendSocket("HR");
	  movePanRight = false;
  } else {
	  // Do nothing
  }
}

function updateScore(event) {
  console.log("EVENT DATA: " + event.data);
  var gameevent = JSON.parse(event.data);
  scoreVal.textContent = gameevent.score;
  var score = parseInt(gameevent.score);
  if (score % 500 == 0 && score > 0) {
    scoreMusic500.play();
  } else {
    scoreMusic.play();
  }

}

function displayTime(decSeconds) {
  const minutes = Math.floor(decSeconds / 600);
  const restDecSecs = decSeconds % 600;
  const seconds = Math.floor(restDecSecs / 10);
  const deciSeconds = restDecSecs % 10;

  const displayMins = `${minutes < 10 ? "0" : ""}${minutes}`;
  const displaySecs = `${seconds < 10 ? "0" : ""}${seconds}`;
  const displayDecSecs = `${deciSeconds}`;

  const display = `${displayMins}:${displaySecs}.${displayDecSecs}`;

  timerDisplay.textContent = display;
}

function runTimer() {
  clearInterval(runningTimer);
  let timer = 600;

  // start interval
  runningTimer = setInterval(() => {
    const runTimer = timer--;
    if (runTimer == 100) {
      countdownSound.play();
    }
    // if time is up (reached max of 60 secs) stop timer
    if (runTimer < countDownTime) {
      timer = 600;
    }

    // display timer
    displayTime(timer);
  }, 100);
}


function fireLaser() {
  console.log("FIRE!");
  sendSocket("fireLaser");
}

function showGameBoard() {
  init('localhost:9080/WebSocketLocal/shipsocket');
  gameStarted = true;
  sendSocket("Hello Earthlings!");
  $("#gameShow").show();
}

/***********************************************************
 *********************** WEB SOCKET ************************
 ***********************************************************/
function init(url) {
  console.log("init %o, %s, %s", websocket, url);
  if (websocket != null) {
    websocket.close();
    websocket = null;
  }

  // Set the URL, always reset the use_encoder attribute
  websocket_url = "ws://" + url;
  console.log(".. init %s, %s", url);

}


function sendSocket(payload) {
  console.log("sendSocket %o, %s", websocket, websocket_url);
  if (websocket === null) {
    websocket = new WebSocket(websocket_url);

    websocket.onerror = function(event) {
      console.log('Error: ' + event.data);
    }

    websocket.onopen = function(event) {
      console.log("Connection established!");
      // Start the Space Ship
      
      if (gameStarted)
        sendSocket("startShip");
    }

    websocket.onclose = function(event) {
      websocket = null;
      webSocketConnected = false;
      console.log("Connection closed : " + event.code);
    }

    websocket.onmessage = function(event) {
      console.log("Message" + event.data);
    }
  } else if (payload && gameStarted) {
	console.log("Sending message : ", payload);
    websocket.send(payload);
  }

  console.log(".. sendSocket %o, %s", websocket, websocket_url);
  return websocket;
}
