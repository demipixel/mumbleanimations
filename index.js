var mumble = require('mumble'),
    fs = require('fs');
 
var options = {
    key: fs.readFileSync( 'mumble.pem' ),
    cert: fs.readFileSync( 'mumble.pem' )
};

var client = null;
var server = null;

var animations = [];


mumble.connect('107.191.51.136:64738', options, function ( error, c ) {
    if( error ) { throw new Error( error ); }

    client = c;

    client.authenticate('DemiBot');
    client.on( 'initialized', onInit );
    client.on('error', function(e) {
        console.log('Error',e);
    });
});

var onInit = function(c) {
  server = c;
  console.log( 'Connection initialized');
  //console.log(Object.keys(c.channels).map(i => i+': '+c.channels[i].name));

  animations.push(new ChannelAnimation(1, 'Lethal Voltage', LethalAnimation, 75));
  animations.push(new ChannelAnimation(4, 'DOU', DOUAnimation, 50));
  animations.push(new ChannelAnimation(5, 'Iron Kiddos', IronKiddosAnimation, 500));

  for (var a = 0; a < animations.length; a++) {
    animations[a].startAnimation();
  }
};

var setNameForChannel = (channelId, name) => {
  client.connection.sendMessage('ChannelState', {
    channel_id: channelId,
    name: name
  });
}

process.on('SIGINT', function() {
  for (var a = 0; a < animations.length; a++) {
    animations[a].stopAnimation();
    animations[a].reset();
  }
  setTimeout(() => process.exit(), 200);
});

function LethalAnimation() {
  var animatedText = ' NOT-MAYBE-SORTA-PROBABLY DEAD ';
  var flashLength = 10;
  var flashCount = 4;
  var animationLength = animatedText.length + 2*flashLength*flashCount;
  var miniCount = this.count % animationLength;
  var mid = '';

  if (miniCount < animatedText.length) {
    mid = animatedText.slice(miniCount, animatedText.length) + animatedText.slice(0, miniCount);
  } else if ((miniCount - animatedText.length) % (flashLength * 2) < flashLength) {
    mid = animatedText;
  } else {
    mid = '';
  }

  return this.name + ' |' + mid;
}

/*function ChessAnimation() {
  var number = 84;
  var moveLength = 15;
  var restTime = 50;
  var animationLength = moveLength*2 + restTime;
  var miniCount = this.count % animationLength;

  if (miniCount < moveLength) {
    number = Math.floor(83/moveLength * miniCount + 1);
  } else if (miniCount >= moveLength + restTime) {
    number = Math.floor(83/moveLength * (moveLength*2 - (miniCount - restTime)) + 1)
  }

  //console.log('Chess Champs ' + number);
  return 'Chess Champs ' + number;
}*/

function IronKiddosAnimation() {
  var names = ['Plastic','Plastic','Plastic','Plastic','Plastic','Iron','Steel','Silver','Gold','Plat'];
  var miniCount = this.count % names.length;

  return names[miniCount] + ' Kiddos'
}

function DOUAnimation() {
  var text = 'and 9Xps   ';
  var after = '';
  var animationLength = (1000*60*10)/this.speed;
  var miniCount = this.count % animationLength;

  if (miniCount < text.length) {
    after = text.slice(0, miniCount);
  } else if (miniCount < text.length*2) {
    after = text.slice(0, text.length*2 - miniCount)
  }

  return 'DOU ' + after;
}

function ChannelAnimation(id, name, animation, speed) {
  this.id = id;
  this.interval = null;
  this.name = name;
  this.animation = animation;
  this.speed = speed;
  this.count = 0;
  this.last = '';
}

ChannelAnimation.prototype.startAnimation = function() {
  this.interval = setInterval(() => {
    var text = this.animation.call(this);
    if (text && text != this.last) {
      setNameForChannel(this.id, text);
      this.last = text;
    }
    this.count++;
  }, this.speed);
}

ChannelAnimation.prototype.stopAnimation = function() {
  clearInterval(this.interval);
  this.interval = null;
  this.last = '';
}

ChannelAnimation.prototype.reset = function() {
  setNameForChannel(this.id, this.name);
}