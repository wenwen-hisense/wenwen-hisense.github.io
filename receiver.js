var namespace = "urn:x-cast:com.petermajor.justpete";

var initialAbove = 0;
var initialBelow = 1000;


var started = false;
var players = {};
var target = 0;
var above = initialAbove;
var below = initialBelow;

function onChannelOpened(event)
{
    console.log("onChannelOpened. Total number of channels: " + window.castReceiverManager.getSenders().length);

    start();
}

function onChannelClosed(event)
{
    console.log("onChannelClosed. Total number of channels: " + window.castReceiverManager.getSenders().length);
    if (window.castReceiverManager.getSenders().length == 0) {
        window.close();
    }
}

function onMessage(event)
{
    var message = event.data;
    var senderId = event.senderId;
    console.log('onMessage ' + JSON.stringify(event.data));

    if (message.command == 'join') {
        onJoin(senderId, message);
    }
    else if (message.command == 'guess') {
        onGuess(senderId, message);
    } else {
        console.log('Invalid message command: ' + message.command);
    }
}

function onJoin(senderId, message)
{
    players[senderId] = message.name;
    console.log('join - senderId: ' + senderId);
}

function onGuess(senderId, message)
{
    if (!started)
        return;

    var number = message.value;
    console.log('guess - senderId: ' + senderId + ', number: ' + number);

	if ((number < target) && (number > above)) 
	{
		above = number;
		setAboveText(number);
	}
	else if ((number > target) && (number < below)) 
	{
		below = number;
		setBelowText(number);
	}
	else if (number === target)
	{
		win(senderId);
	}
}

function start()
{
    if (started)
    	return;

    started = true;

    target = Math.floor(Math.random() * below);
    console.log("THE number is: " + target);

    above = initialAbove;
    below = initialBelow;
    setAboveText(above);
    setBelowText(below);
    
	$( "#guess-content" ).removeClass('hidden')
}

function win(senderId)
{
    console.log('win - senderId: ' + senderId );

    started = false;

    var player = players[senderId];
    if (!player)
    	player =  'Mystery player';

	$( "#winner-name" ).text(player);

	$( "#guess-content" )
		.addClass('animated zoomOut')
		.one('webkitAnimationEnd', function() {
			$(this).addClass('hidden').removeClass('animated zoomOut');

			$( "#win-content" )
				.removeClass('hidden')
				.addClass('animated zoomIn')
				.one('webkitAnimationEnd', function() {
					$(this).removeClass('animated zoomIn');

					setTimeout(function() {
						$( "#win-content" ).addClass('hidden');
						start();
					}, 5000);
				});
		});

}

function onLoad()
{
    console.log("document loaded");

    cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);

    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();

    window.castReceiverManager.onSenderConnected = onChannelOpened;
    window.castReceiverManager.onSenderDisconnected = onChannelClosed;

    window.customMessageBus = window.castReceiverManager.getCastMessageBus(namespace, cast.receiver.CastMessageBus.MessageType.JSON);
    window.customMessageBus.onMessage = onMessage;

    window.castReceiverManager.start();

    console.log("cast started");
}

function setAboveText(v)
{
	$( "#above" )
		.text(v)
		.addClass('animated flash')
		.one('webkitAnimationEnd', function() {
			$(this).removeClass('animated flash') });
}

function setBelowText(v)
{
	$( "#below" )
		.text(v)
		.addClass('animated flash')
		.one('webkitAnimationEnd', function() {
			$(this).removeClass('animated flash') });
}

window.addEventListener("load", onLoad);
