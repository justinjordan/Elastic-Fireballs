// Create Global Namespace
if (typeof efs == 'undefined')
	{ efs = {}; }

efs.DialogController = function()
{
	var _this = this;
	
	//! Available Settings
	_this.settings = {
		"Balls": {
			get: function()
			{
				return efs.app.settings.numOfBalls;
			},
			set: function(e)
			{
				var value = e.target.value;
				
				value = Number(value);
				if (!isNaN(value) && value > 0 && value.toString().indexOf('.')==-1)
				{
					var add = value > efs.app.balls.length;
					
					for (var i = 0, l = Math.abs(efs.app.balls.length - value); i < l; i++)
					{
						if (add)
							{ efs.app.addBall(); }
						else
							{ efs.app.removeBall(); }
					}
					
					return true;
				}
				
				return false;
			}
		},
		"Gravity": {
			get: function()
			{
				return efs.app.settings.gravity;
			},
			set: function(e)
			{
				var value = e.target.value;
				
				value = parseFloat(value);
				if (!isNaN(value))
				{
					efs.app.settings['gravity'] = value;
					return true;
				}
				
				return false;
			}
		},
		"Restitution": {
			get: function()
			{
				return efs.app.settings.restitution;
			},
			set: function(e)
			{
				var value = e.target.value;
				
				value = parseFloat(value);
				if (!isNaN(value))
				{
					efs.app.settings['restitution'] = value;
					return true;
				}
				
				return false;
			}
		},
		"Surface Friction": {
			get: function()
			{
				return efs.app.settings.friction;
			},
			set: function(e)
			{
				var value = e.target.value;
				
				value = parseFloat(value);
				if (!isNaN(value))
				{
					efs.app.settings['friction'] = value;
					return true;
				}
				
				return false;
			}
		},
		"Air Resistance": {
			get: function()
			{
				return efs.app.settings.airResistance
			},
			set: function(e) {}
		},
		"Elasticity": {
			get: function()
			{
				return efs.app.settings.elasticity;
			},
			set: function(e)
			{
				var value = e.target.value;
				
				value = parseFloat(value);
				if (!isNaN(value))
				{
					efs.app.settings['elasticity'] = value;
					return true;
				}
				
				return false;
			}
		},
		"Band Length": {
			get: function()
			{
				return efs.app.settings.bandLength;
			},
			set: function(e)
			{
				var value = e.target.value;
				
				value = parseFloat(value);
				if (!isNaN(value))
				{
					efs.app.settings['bandLength'] = value;
					return true;
				}
				
				return false;
			}
		},
		"Debug": {
			get: function()
			{
				return efs.app.debug;
			},
			set: function(e)
			{
				var value = e.target.value;
				
				switch (value.toLowerCase())
				{
					case 'on':
					case 'true':
					case 'yes':
					case '1':
						efs.app.debug = true;
						return true;
					break
					
					case 'off':
					case 'false':
					case 'no':
					case '0':
						efs.app.debug = false;
						return true;
					break;
				}
				
				return false;
			}
		},
	};
	
	this.init = function()
	{
		_this.buildSettings();
	};
	
	this.buildSettings = function()
	{
		var list = $('.settings-dialog ul');
		for (var k in _this.settings)
		{
			var setting = _this.settings[k];
			var v = setting.get();
			
			var item = $('<li>');
			item.append(
				$('<div>').addClass('setting-label').text(k)
			);
			
			var input = $('<input>').addClass('setting-input');
			
			if (typeof v == 'boolean')
			{
				input
					.attr('type', 'checkbox')
					.on('click', setting.set);
					
					if (v) input.attr('checked', 'true');
			}
			else
			{
				input
					.attr('type', 'text')
					.val(setting.get())
					.on('keyup', function(e) 
					{
						// Press Enter
						if (e.which == 13) _this.toggleSettings();
					})
					.on('change', setting.set);
			}
			
			item.append(input);
			list.append(item);
		}
	};
	
	this.changeSetting = function(input)
	{
		var setting = input.attr('data-setting');
		var value;
		
		switch (input.attr('type'))
		{
			case 'text':
				value = input.val();
			break;
			
			case 'checkbox':
				value = input.is(':checked') ? 'on' : 'off';
			break;
		}
		
		var response = efs.app.changeSetting(setting, value);
		
		if (response)
		{
			input.attr('data-val', value);
		}
		else
		{
			input.val(input.attr('data-val'));
		}
	};
	
	this.toggleSettings = function()
	{
		var dialog = $('.settings-dialog');
		
		if (dialog.is(':visible'))
		{
			dialog.hide();
		}
		else
		{
			_this.closeAll();
			dialog.show();
		}
	};
	
	this.toggleInfo = function()
	{
		var dialog = $('.info-dialog');
		
		if (dialog.is(':visible'))
		{
			dialog.hide();
		}
		else
		{
			_this.closeAll();
			dialog.show();
		}
	};
	
	this.closeAll = function()
	{
		$('.dialog').hide();
	};
	
	
	// Run init
	var wait = function()
	{
		if (efs.app)
			{ _this.init(); }
		else
			{ setTimeout(wait, 100); }
	};
	setTimeout(wait, 100); // Prevent running before efs.app
};

$(function() {
	
	efs.dialogCtrl = new efs.DialogController();
	
});