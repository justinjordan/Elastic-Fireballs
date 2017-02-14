$(function() {
	
	var CanvasApp = function()
	{
		var _this = this;
		
		//! DEBUG MODE
		this.debug = false;
		
		// Settings
		this.numberOfBalls	= 2;
		this.ballSettings = {
			gravity			: 0,		// gravitational pull
			restitution		: 0.8,		// energy ratio retained after bounce
			friction		: 0.1,		// speed lost when rolling
			elasticity		: 0.001,	// attraction force constant
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
				dialogCtrl.closeAll();
			});
			_this.stage.on("stagemouseup", function() {
				_this.mouseDown = false;
			});
			
			// Create Balls
			_this.balls = [];
			for (var i = 0; i < _this.numberOfBalls; i++)
			{
				var dir, rad, x, y, xv, yv;
				if (_this.numberOfBalls > 1)
				{
					dir = i * 2 * Math.PI / _this.numberOfBalls + Math.PI/2;
					rad = 100;
					x = _this.stageWidth/2 + rad*Math.sin(dir);
					y = _this.stageHeight/2 + rad*Math.cos(dir);
					//xv = 0;//(_this.numberOfBalls + 3) * Math.sin(dir+Math.PI/2);
					//yv = 0;//(_this.numberOfBalls + 3) * Math.cos(dir+Math.PI/2);
				}
				else
				{
					x = _this.stageWidth/2;
					y = _this.stageHeight/2;
				}
				xv = 4 * Math.random() - 2;
				yv = 4 * Math.random() - 2;
				
				_this.ballSettings.x = x;
				_this.ballSettings.y = y;
				_this.ballSettings.xv = xv;
				_this.ballSettings.yv = yv;
				var ball = new Ball(_this.ballSettings);
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
		
		this.getFPS = function(et)
		{
			if (et)
			{
				if (!_this.fpsArray) _this.fpsArray = [];
				
				var averageSample = 1000; // how many fps values to average
				
				var fps = 1000 / (et!=0 ? et : 1);
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
					var oldPosition = {
						x: ball.x,
						y: ball.y,
					};
					ball.setPosition(mouseX, mouseY);
					ball.testBounds(true);
					
					ball.setVelocity(ball.x - oldPosition.x, ball.y - oldPosition.y);
				}
			}
		};
		
		this.update = function() //! Game Update
		{
			var time = new Date().getTime();
			var et = (this.lastUpdateTime) ? time - _this.lastUpdateTime : 0; // elapsed time
			var dt = et / 16.6; // delta time
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
					ball.applyGravity(dt);
					ball.applyMotion(dt);
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
						
						ball.applyAttraction(attractBall.x, attractBall.y);
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
					"FPS":			_this.getFPS(et),
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
						
						return true; // Success
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
						_this.ballSettings[setting] = value;
						return true;
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
							return true;
						break
						
						case 'off':
						case 'false':
						case 'no':
						case '0':
							_this.debug = false;
							return true;
						break;
					}
				break;
			}
			
			return false;
		};
		
		this.addBall = function()
		{
			_this.ballSettings.x = Math.random() * _this.stageWidth;
			_this.ballSettings.y = Math.random() * _this.stageHeight;
			
			var ball = new Ball(_this.ballSettings);
			_this.stage.addChild(ball.graphic);
			_this.balls.push(ball);
			_this.numberOfBalls++;
		};
		this.removeBall = function()
		{
			if (_this.balls.length > 0)
			{
				var ball = _this.balls.shift();
				_this.stage.removeChild(ball.graphic);
				_this.numberOfBalls--;
			}
		};
		
		// Start app
		this.init();
	};
	
	var Ball = function(settings)
	{
		var _this = this;
		
		this.x = (typeof settings['x'] != 'undefined') ? settings.x : 0;
		this.y = (typeof settings['y'] != 'undefined') ? settings.y : 0;
		this.xv = (typeof settings['xv'] != 'undefined') ? settings.xv : 0;
		this.yv = (typeof settings['yv'] != 'undefined') ? settings.yv : 0;
		this.rad = 20;
		
		this.drag = false;
		
		this.init = function()
		{
			_this.graphic = new createjs.Shape();
			_this.graphic.graphics.beginFill("#0000ff").drawCircle(0, 0, _this.rad);
			_this.graphic.x = _this.x;
			_this.graphic.y = _this.y;
		};
		
		this.applyGravity = function(dt)
		{
			if (_this.y < _this.graphic.stage.canvas.height - _this.rad)
				{ _this.yv += dt * settings.gravity; }
		};
		
		this.applyMotion = function(dt)
		{
			var xv = dt * _this.xv;
			var yv = dt * _this.yv;
			
			_this.setPosition(_this.x + xv, _this.y + yv);
		};
		
		this.applyAttraction = function(x, y)
		{
			var xdiff = _this.x - x;
			var ydiff = _this.y - y;
			var dist = Math.sqrt(xdiff*xdiff + ydiff*ydiff) - settings.bandLength;
			dist = (dist<0) ? 0 : dist;
			var dir = Math.atan2(ydiff, xdiff);
			var k = settings.elasticity;
			var xForce = k * dist * Math.cos(dir);
			var yForce = k * dist * Math.sin(dir);
			
			_this.addVelocity(-xForce, -yForce);
		};
		
		this.testBounds = function(drag)
		{
			var w = _this.graphic.stage.canvas.width;
			var h = _this.graphic.stage.canvas.height;
			
			if (_this.x < _this.rad)
			{
				_this.x = _this.rad;
				if (!drag) _this.xv *= -settings.restitution;
			}
			
			if (_this.x > w - _this.rad)
			{
				_this.x = w - _this.rad;
				if (!drag) _this.xv *= -settings.restitution;
			}
			
			if (_this.y < _this.rad)
			{
				_this.y = _this.rad;
				if (!drag) _this.yv *= -settings.restitution;
				
				// Apply Friction
				if (!drag && _this.xv != 0)
				{
					var k = (_this.xv!=0) ? _this.xv / Math.abs(_this.xv) : 1;
					var force = k * settings.friction;
					if ((_this.xv > 0 && force > _this.xv) || (_this.xv < 0 && force < _this.xv))
						{ force = _this.xv; }
					_this.xv -= force;
				}
			}
			
			if (_this.y > h - _this.rad)
			{
				_this.y = h - _this.rad;
				if (!drag) _this.yv *= -settings.restitution;
				
				// Apply Friction
				if (!drag && _this.xv != 0)
				{
					var k = (_this.xv!=0) ? _this.xv / Math.abs(_this.xv) : 1;
					var force = k * settings.friction;
					if ((_this.xv > 0 && force > _this.xv) || (_this.xv < 0 && force < _this.xv))
						{ force = _this.xv; }
					_this.xv -= force;
				}
			}
			
			_this.setPosition(_this.x, _this.y);
		};
		
		this.mouseHitTest = function()
		{
			var mouse = {
				x: _this.graphic.stage.mouseX,
				y: _this.graphic.stage.mouseY
			};
			
			var xdiff = mouse.x - _this.x;
			var ydiff = mouse.y - _this.y;
			
			if (Math.sqrt(xdiff*xdiff + ydiff*ydiff) <= _this.rad)
			{
				return true;
			}
			
			return false;
		};
		
		this.setPosition = function(x, y)
		{
			_this.x = x;
			_this.y = y;
			_this.graphic.x = x;
			_this.graphic.y = y;
		};
		
		this.setVelocity = function(xv, yv)
		{
			_this.xv = xv;
			_this.yv = yv;
		};
		
		this.addVelocity = function(xv, yv)
		{
			_this.xv += xv;
			_this.yv += yv;
		};
		
		this.startDrag = function()
		{
			_this.drag = true;
			_this.xv = 0;
			_this.yv = 0;
		};
		
		this.stopDrag = function()
		{
			_this.drag = false;
		};
		
		// Init Ball
		this.init();
	};
	
	window.canvasApp = new CanvasApp();
	
});