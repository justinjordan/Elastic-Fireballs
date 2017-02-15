// Create Global Namespace
if (typeof efs == 'undefined')
	{ efs = {}; }

/*
	dt	= Delta Time
	G	= Gravitational Constant
	v	= Velocity Object { x, y }
	d	= Direction in radians
*/

efs.Physics = {
	gravity: function(dt, gravity, v, d)
	{
		d = (d) ? d : 0;
		
		var G = 10000;
		
		return {
			x: dt * gravity * G * Math.sin(d) + v.x,
			y: dt * gravity * G * Math.cos(d) + v.y,
		};
	},
	attraction: function(dt, k, x1, y1, x2, y2, range)
	{
		var xdiff = x2 - x1;
		var ydiff = y2 - y1;
		var dist = Math.sqrt(xdiff*xdiff + ydiff*ydiff) - range;
		dist = (dist<0) ? 0 : dist;
		var dir = Math.atan2(ydiff, xdiff);
		var xForce = dt * k * dist * Math.cos(dir);
		var yForce = dt * k * dist * Math.sin(dir);
		
		return {
			x: xForce,
			y: yForce,
		};
	}
};