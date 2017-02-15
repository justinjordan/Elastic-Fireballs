// Create Global Namespace
if (typeof efs == 'undefined')
	{ efs = {}; }

efs.Ball = function(settings, x, y, xv, yv)
{
	var _this = this;
	
	this.x = (x) ? x : 0;
	this.y = (y) ? y : 0;
	this.xv = (xv) ? xv : 0;
	this.yv = (yv) ? yv : 0;
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
		{
			var v = efs.Physics.gravity(dt, settings.gravity, {x: _this.xv, y: _this.yv}, 0); // (dt, G, v, d)
			_this.xv = v.x;
			_this.yv = v.y;
		}
	};
	
	this.applyMotion = function(dt)
	{
		var xv = dt * _this.xv;
		var yv = dt * _this.yv;
		
		_this.setPosition(_this.x + xv, _this.y + yv);
	};
	
	this.applyAttraction = function(dt, x, y)
	{
		var v = efs.Physics.attraction(dt, settings.elasticity, _this.x, _this.y, x, y, settings.bandLength);
		
		_this.addVelocity(v.x, v.y);
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