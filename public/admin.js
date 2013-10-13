
$(document).ready(function() {
	
	var admin = function(options) {
		
		this.isAdminContentSet;
		
		this.isAdminTextBoxSet;
		
		this.initialize =  function(options) {
			this.isAdminContentSet = false;
			this.isAdminTextBoxSet = false;
			this.serverAddress = (options.serverAddress != undefined) ? options.serverAddress : 'http://192.168.1.86:3700';
			this.socket = io.connect(this.serverAddress);
			//this.socket.emit('getAdminContent');
			
			this.bindEvents();
		}
		
		
		this.bindEvents = function() {
			var that = this;
			var sendButton = $("#send");
			var textBox = $('#pageText');
			var field = $('#field');
			var takePhotoLink = $('.js-take-photo-link');
			var shareContentLink = $('.js-share-content-link');
			var takePhotoBtn = $('.js-btn-take-photo');
			var downloadBtn = $('.js-btn-download');
			var cancelBtn = $('.js-btn-cancel');
			
			
			// Event listeners
			field.on("change",   $.proxy(this, "onFieldChanged"));
			sendButton.on('click',  $.proxy(this, "callServer"));
			textBox.on('keyup', $.proxy(this, "onTextEdited"));
			$(document).on('keyup', $.proxy(this, "callServer"));
			takePhotoLink.on('click', $.proxy(this, "showShootPhoto"));
			shareContentLink.on('click', $.proxy(this, "showShareContent"));
			takePhotoBtn.on('click', $.proxy(this, "shootPhoto"));
			downloadBtn.on('click', $.proxy(this, "downloadPhoto"));
			cancelBtn.on('click', $.proxy(this, "cancelShoot"));
			
			// Server event listeners (for initial data setting)
			this.socket.on('adminContent', function (data) {
				if (this.isAdminContentSet)
					return;
				
				if (data.content != undefined) {
					var contentCode = data.content;
					var content = $("#content");
					var field = $('#field');
					field.val(contentCode);
					
					(contentCode.indexOf('iframe') != -1) ? content.html(contentCode) : content.html(that.generateHTML(contentCode));
					this.isAdminContentSet = true;
			
				} else {
					console.log("There is a problem:", data);
				}
			});
			
			this.socket.on('adminTextBoxUpdate', function(data) {
				if (this.isAdminTextBoxSet)
					return;
					
				if (data.content == undefined)
					return;
				
				var textBoxNewValue = data.content;
				var textBox = $('#pageText');
				
				// Update value
				textBox.val(textBoxNewValue);
				this.isAdminTextBoxSet = true;				
					
			});
		
		}
		
		this.onFieldChanged = function(e) {
			var sendButton = $("#send");
			sendButton.removeAttr("disabled");
		}
		
		/**
		 * Sends messages to the server
		 *
		 * @param 	e		JS event object 
		 */
		this.callServer = function(e) {
			if ( e.type == "keyup" && e.keyCode != 13)
				return;
			
			var sendButton = $("#send");
			
			if (sendButton.attr("disabled"))
				return;
			
			var field = $('#field');
			var contentCode = field.val();
			
			if (contentCode == "")
				return;
			
			// Update content
			var content = $("#content");
			(contentCode.indexOf('iframe') != -1) ? content.html(contentCode) : content.html(this.generateHTML(contentCode));
			
			
			
			var message = { content: contentCode};
			this.socket.emit('adminChangedContent', message);
			field.focus();
			sendButton.attr("disabled", true);
		} 
		
		
		/**
		 * Sends messages to the server
		 *
		 * @param 	e		JS event object 
		 */
		this.onTextEdited = function(e) {
			var textBox = $('#pageText');
			var message = { content: textBox.val()};
			this.socket.emit('textBoxChanged', message);
			
		}
			
		this.generateHTML = function (data) {
		
			var html = ''; 
			
			html = "<img src='" + data + "' style='width: 100%; position: relative;' />";
			return html;
		}
		
		this.showShootPhoto = function(e) {
			var tab = $('.tab');
			var link = $(e.currentTarget);
			tab.find('.selected').removeClass('selected');
			link.parent().addClass('selected');
			$('.contentShare').fadeOut(500, function(){$('.js-btn-take-photo').fadeIn(500);});
			
			// Shift to video player
			$('#content').html('<video width="530" height="397" autoplay></video><canvas style="display: none;" width="630" height="483"></canvas>');
			
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
			navigator.getUserMedia({video: true}, function(stream) {
				var video = $('video')[0];
				video.src = window.URL.createObjectURL(stream);
				localMediaStream = stream;
			});
			
			
		}
		
		this.showShareContent = function(e) {
			var tab = $('.tab');
			var link = $(e.currentTarget);
			var content = $('#content');
			
			tab.find('.selected').removeClass('selected');
			link.parent().addClass('selected');
			
			$('.btnControls').find('button').fadeOut(500, function(){$('.contentShare').fadeIn(500);});
			
			var field = $('#field');
			var contentCode = field.val();
			(contentCode.indexOf('iframe') != -1) ? content.html(contentCode) : content.html(that.generateHTML(contentCode));
			
		}

		
		this.shootPhoto = function(e) {
			var downloadBtn = $('.js-btn-download');
			var cancelBtn = $('.js-btn-cancel');
			var canvas = $('canvas')[0];
			var context = canvas.getContext('2d');
			var video = $('video')[0];
			var content = $('#content');
			
			context.drawImage(video,0,0);
			var imageData = canvas.toDataURL('image/webp', 1);
			
			$('video').hide();
			content.find('img').remove();
			content.append(this.generateHTML(imageData));
			//$('canvas').show();
			
			// Download related
			downloadBtn.show();
			this.downloadImageData = imageData.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
			
			// Show cancel button
			cancelBtn.show();
			
			
			// Send image data to server to be shared
			this.sendImage(imageData);
		}
		
		this.downloadPhoto = function(e) {
			if (this.downloadImageData == undefined)
				return;
			document.location = this.downloadImageData;	
		}
		
		this.cancelShoot = function(e) {
			$(e.currentTarget).hide();
			var downloadBtn = $('.js-btn-download');
			var content = $('#content');
			
			// DOM manipulatiion
			content.find('img').remove();
			$('video').show();
			downloadBtn.hide();
		}
		
		
		this.sendImage = function(imageData) {
			this.socket.emit('imageDataShare', {content: imageData});
		}
			
		this.initialize(options);
	
	}
	
	var settings = {serverAddress: "http://www.e-ardi.com:3700"};
	var myAdmin = new admin(settings);
	

 
});
