$(function() {
	
	var DialogController = function()
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
				balls			: canvasApp.numberOfBalls,
				gravity			: canvasApp.ballSettings.gravity,
				restitution		: canvasApp.ballSettings.restitution,
				friction		: canvasApp.ballSettings.friction,
				elasticity		: canvasApp.ballSettings.elasticity,
				bandLength		: canvasApp.ballSettings.bandLength,
				debug			: canvasApp.debug,
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
			
			var response = canvasApp.changeSetting(setting, value);
			
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
		setTimeout(this.init, 500); // Prevent running before canvasApp
	};
	
	window.dialogCtrl = new DialogController();
	
});