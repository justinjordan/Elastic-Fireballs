// Create Global Namespace
if (typeof efs == 'undefined')
	{ efs = {}; }

efs.App = function()
{
	var _this = this;
	
	//! DEBUG MODE
	this.debug = false;
	
	// Global Settings
	this.settings = {
		numOfBalls		: 2,		// Number of balls to create on initialization
		gravity			: 1,		// gravitational pull
		restitution		: 0.8,		// energy ratio retained after bounce
		friction		: 0.1,		// speed lost when rolling
		airResistance	: "Doesn't work.",
		elasticity		: 50,		// attraction force constant
		bandLength		: 100,		// Distance before elasticity kicks in
	};
	
	// Set Variables
	this.mouseDown = false;
	this.mousePos = {
		x: undefined,
		y: undefined
	};
	this.stageWidth		= $('#app-canvas').width();
	this.stageHeight	= $('#app-canvas').height();
	
	this.init = function()
	{
		// Create Stage
		_this.stage = new createjs.Stage("app-canvas");
		_this.stage.canvas.width = this.stageWidth;
		_this.stage.canvas.height = this.stageHeight;
		
		// Create Background Container
		_this.background = new createjs.Container();
		_this.stage.addChild(_this.background);
		
		// Watch for Resize
		window.addEventListener('resize', function()
		{
			this.stageWidth		= $('#app-canvas').width();
			this.stageHeight	= $('#app-canvas').height();
			
			_this.stage.canvas.width = this.stageWidth;
			_this.stage.canvas.height = this.stageHeight;
		});
		
		// Watch Mouse Events
		_this.stage.on("stagemousedown", function() {
			_this.mouseDown = true;
			efs.dialogCtrl.closeAll();
		});
		_this.stage.on("stagemouseup", function() {
			_this.mouseDown = false;
		});
		
		// Create Balls
		_this.balls = [];
		for (var i = 0; i < _this.settings.numOfBalls; i++)
		{
			var dir, rad, x, y, xv, yv;
			if (_this.settings.numOfBalls > 1)
			{
				dir = i * 2 * Math.PI / _this.settings.numOfBalls + Math.PI/2;
				rad = 100;
				x = _this.stageWidth/2 + rad*Math.sin(dir);
				y = _this.stageHeight/2 + rad*Math.cos(dir);
			}
			else
			{
				x = _this.stageWidth/2;
				y = _this.stageHeight/2;
			}
			xv = 4 * Math.random() - 2;
			yv = 4 * Math.random() - 2;
			
			var ball = new efs.Ball(_this.settings, x, y, xv, yv);
			_this.balls.push(ball);
			_this.stage.addChild(ball.graphic);
		}
		
		// Setup mousemove listener
		_this.stage.addEventListener('stagemousemove', _this.mouseMove);
		
		// Create Debug Text
		_this.debugText = new createjs.Text("", "12px Arial", "#00ff00");
		_this.debugText.x = 20;
		_this.debugText.y = 30;
		_this.debugText.textBaseline = "alphabetic";
		_this.stage.addChild(_this.debugText);
		
		// Start Loop
		_this.loop();
	};
	
	this.loop = function()
	{
		_this.update();
		window.setTimeout(_this.loop, 0);
	};
	
	this.getFPS = function(dt)
	{
		if (dt)
		{
			if (!_this.fpsArray) _this.fpsArray = [];
			
			var averageSample = 1000; // how many fps values to average
			
			// Calculate FPS
			var fps = 1 / (dt!=0 ? dt : 1);
			_this.fpsArray.push(fps);
			if (_this.fpsArray.length > averageSample) _this.fpsArray.shift();
			
			if (_this.fpsArray.length > 0)
			{
				var average = 0;
				for (var i = 0; i < _this.fpsArray.length; i++)
					{ average += _this.fpsArray[i]; }
				average /= _this.fpsArray.length;
				
				return Math.round(average);
			}
		}
		
		return '---';
	};
	
	this.mouseMove = function(e)
	{
		for (var i = 0; i < _this.balls.length; i++)
		{
			var ball = _this.balls[i];
			if (ball.drag)
			{
				var mouseX = e.stageX;
				var mouseY = e.stageY;
				
				// Apply new position and velocity
				var old = {
					x: ball.x,
					y: ball.y,
				};
				
				// Update Position
				ball.setPosition(mouseX, mouseY);
				ball.testBounds(true);
				
				// Update Velocity
				if (_this.dt > 0)
				ball.setVelocity((ball.x - old.x) / _this.dt, (ball.y - old.y) / _this.dt);
			}
		}
	};
	
	this.update = function() //! Game Update
	{
		var time = new Date().getTime();
		_this.dt = (this.lastUpdateTime) ? (time - _this.lastUpdateTime) / 1000 : 0; // delta time
		_this.lastUpdateTime = time;
		
		// Apply Ball Motion
		for (var i = 0; i < _this.balls.length; i++)
		{
			var ball = _this.balls[i];
		
			// Catch & Release Ball
			if (!_this.mouseDown) // Release
			{
				ball.stopDrag();
				_this.dragging = false;
			}
			else if (!ball.drag) // Catch
			{
				if (!_this.dragging && ball.mouseHitTest())
				{
					ball.startDrag();
					_this.dragging = true;
				}
			}
			
			//! Update Ball
			if (!ball.drag)
			{
				ball.applyGravity(_this.dt/2); // Apply half gravity before motion
				ball.applyMotion(_this.dt);
				ball.applyGravity(_this.dt/2); // Apply rest of gravity
				ball.testBounds();
			}
		}
		
		// Extra Physics for multiple balls
		if (_this.balls.length > 1)
		{
			// Apply Attraction
			for (var i = 0; i < _this.balls.length; i++)
			{
				var ball = _this.balls[i]; // ball to apply force to
				if (ball.drag) { continue; } // no attraction if being dragged
				
				for (var j = 0; j < _this.balls.length; j++)
				{
					if (j==i) { continue; } // don't attract to self
					
					var attractBall = _this.balls[j];
					
					ball.applyAttraction(_this.dt, attractBall.x, attractBall.y);
				}
			}
		
			// Draw Connecting Lines
			var lines = new createjs.Shape();
			lines.graphics.beginStroke('#444444');
			for (var i = 0; i < _this.balls.length; i++)
			for (var j = i; j < _this.balls.length; j++)
			{
				var ball = _this.balls[i];
				var tether = _this.balls[j];
				
				lines.graphics.moveTo(ball.x, ball.y);
				lines.graphics.lineTo(tether.x, tether.y);
			}
			lines.graphics.endStroke();
			_this.background.removeAllChildren();
			_this.background.addChild(lines);
		}
		else if (_this.background.children.length > 0)
		{
			// Clear in case there's only one ball
			_this.background.removeAllChildren();
		}
		
		// Update Stage
		_this.stage.update();
		
		// Show Debug Info
		if (_this.debug)
		{
			//! DEBUG DATA
			var debugLines = {
				"FPS":			_this.getFPS(_this.dt),
				"mouseDown":	_this.mouseDown,
			};
			
			_this.debugText.text = '';
			for (var k in debugLines)
			{
				var v = debugLines[k];
				_this.debugText.text += k + ':  ' + v + '\n';
			}
		}
		else if (_this.debugText)
		{
			_this.debugText.text = '';
		}
	};
	
	this.changeSetting = function(setting, value)
	{
		var success = false;
		
		switch (setting)
		{
			case 'balls':
				value = Number(value);
				if (!isNaN(value) && value > 0 && value.toString().indexOf('.')==-1)
				{
					var add = value > _this.balls.length;
					
					for (var i = 0, l = Math.abs(_this.balls.length - value); i < l; i++)
					{
						if (add)
							{ _this.addBall(); }
						else
							{ _this.removeBall(); }
					}
					
					success = true;
				}
			break;
			
			case 'gravity':
			case 'restitution':
			case 'friction':
			case 'elasticity':
			case 'bandLength':
				value = parseFloat(value);
				if (!isNaN(value))
				{
					_this.settings[setting] = value;
					success = true;
				}
			break;
			
			case 'debug':
				switch (value.toLowerCase())
				{
					case 'on':
					case 'true':
					case 'yes':
					case '1':
						_this.debug = true;
						success = true;
					break
					
					case 'off':
					case 'false':
					case 'no':
					case '0':
						_this.debug = false;
						success = true;
					break;
				}
			break;
		}
		
		if (_this.debug)
		{
			console.log('New Settings:', _this.settings);
		}
		
		return success;
	};
	
	this.addBall = function(amount) // returns void
	{
		amount = (amount) ? amount : 1; // defaults as 1
		
		for (var i = 0; i < amount; i++)
		{
			var x = Math.random() * _this.stageWidth;
			var y = Math.random() * _this.stageHeight;
			
			var ball = new efs.Ball(_this.settings, x, y);
			
			_this.stage.addChild(ball.graphic);
			_this.balls.push(ball);
			_this.settings.numOfBalls++;
		}
	};
	this.removeBall = function(amount) // returns void
	{
		amount = (amount) ? amount : 1; // defaults as 1
		
		for (var i = 0; i < amount && _this.balls.length > 0; i++)
		{
			var ball = _this.balls.shift();
			_this.stage.removeChild(ball.graphic);
			_this.settings.numOfBalls--;
		}
		
	};
	
	// Start app
	this.init();
};

$(function() {
	
	efs.app = new efs.App();
	
});