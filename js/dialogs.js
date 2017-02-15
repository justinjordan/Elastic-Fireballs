// Create Global Namespace
if (typeof efs == 'undefined')
	{ efs = {}; }

efs.DialogController = function()
{
	var _this = this;
	
	this.init = function()
	{
		_this.buildSettings();
	};
	
	this.buildSettings = function()
	{
		//! Available Settings
		_this.settings = {
			balls			: efs.app.settings.numOfBalls,
			gravity			: efs.app.settings.gravity,
			restitution		: efs.app.settings.restitution,
			friction		: efs.app.settings.friction,
			elasticity		: efs.app.settings.elasticity,
			bandLength		: efs.app.settings.bandLength,
			debug			: efs.app.debug,
		};
		
		var list = $('.settings-dialog ul');
		for (var k in _this.settings)
		{
			var v = _this.settings[k];
			var label = k.replace(/\b\w/g, function(l){ return l.toUpperCase() });
			
			var item = $('<li>');
			
			item.append(
				$('<div>').addClass('setting-label').text(label)
			);
			
			var input = $('<input>')
				.addClass('setting-input')
				.attr('data-setting', k);
			
			if (typeof v == 'boolean')
			{
				input
					.attr('type', 'checkbox')
					.on('click', function() {
						_this.changeSetting($(this));
					});
				
				if (v) input.attr('checked', 'true')
			}
			else
			{
				input
					.attr('type', 'text')
					.val(v)
					.on('change', function() {
						_this.changeSetting($(this));
					});
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