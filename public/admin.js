
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
			var shootTheShowLink = $('.js-shoot-the-show');
			var takePhotoBtn = $('.js-btn-take-photo');
			var downloadBtn = $('.js-btn-download');
			var cancelBtn = $('.js-btn-cancel');
			
			
			// Event listeners
			field.on("change",   $.proxy(this, "onFieldChanged"));
			sendButton.on('click',  $.proxy(this, "callServer"));
			textBox.on('keyup', $.proxy(this, "onTextEdited"));
			$(document).on('keyup', $.proxy(this, "callServer"));
			
			// Menu (tab) options
			takePhotoLink.on('click', $.proxy(this, "showShootPhoto"));
			shareContentLink.on('click', $.proxy(this, "showShareContent"));
			shootTheShowLink.on('click', $.proxy(this, "showShootTheShow"));
			
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
			this.updateTab(e);
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
		
		this.showShootTheShow = function(e) {
			this.updateTab(e);
			$('.contentShare').fadeOut(500, function(){$('.js-btn-take-photo').fadeIn(500);});
			
			// Shift to video player
			$('#content').html('<video width="530" height="305" controls autoplay></video><canvas style="display: none;" width="640" height="360"></canvas>');
			
			var video = $('video')[0];
			video.src = "video/berzerk.mp4";
			
						
			
		};
		
		this.showShareContent = function(e) {
			var tab = $('.tab');
			var link = $(e.currentTarget);
			var content = $('#content');
			
			tab.find('.selected').removeClass('selected');
			link.parent().addClass('selected');
			
			$('.btnControls').find('button').fadeOut(500, function(){$('.contentShare').fadeIn(500);});
			
			var field = $('#field');
			var contentCode = field.val();
			(contentCode.indexOf('iframe') != -1) ? content.html(contentCode) : content.html(this.generateHTML(contentCode));
			
		};

		this.updateTab = function(e) {
			var tab = $('.tab');
			var link = $(e.currentTarget);
			tab.find('.selected').removeClass('selected');
			link.parent().addClass('selected');
		};
		
		this.shootPhoto = function(e) {
			var downloadBtn = $('.js-btn-download');
			var cancelBtn = $('.js-btn-cancel');
			var canvas = $('canvas')[0];
			var context = canvas.getContext('2d');
			var video = $('video')[0];
			var content = $('#content');
			
			context.drawImage(video,0,0);
			var imageData = canvas.toDataURL('image/png', 1);
			
			$('video').hide();
			content.find('img').remove();
			content.append(this.generateHTML(imageData));
			//$('canvas').show();
			
			// Download related
			downloadBtn.show();
			this.downloadImageData = imageData;//.replace(/^data:image\/.{3,4};base64,/, 'data:text/css');
			
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
			// To RESTful PHP
			this.request("http://95.138.185.202:80/nodejs-show/UploadHandler.php", {data: imageData});
			
			// To Node server
			this.socket.emit('imageDataShare', {content: imageData});
		};
			
		this.request = function(url, data, method) {
				// Check parameters
                if (method == undefined) {
                         method = "POST";
                }
                
                // Load file
                $.ajax({
                        url: url,
                        type: method,
                        dataType: 'json',
                        data: data,
                        success: jQuery.proxy (this, "onDataReceived"),
                        error: jQuery.proxy (this, "onErrorDataReceived")
                });

                // Parse json response
                //return jQuery.parseJSON(myJson.responseText); 
        };
       
        
		
        /** Ajax success callback
         *  
         * @param        response                Object                 Response data object
         */
        this.onDataReceived = function(response) {
			this.imageUrl = response.data.url;
			console.log(response);
		};
		
		this.onErrorDataReceived =  function( response) {
			console.log("Error: ", response);
		};
		
		
		this.renderTwitterButton = function() {
			return '<a data-target="https://twitter.com/intent/tweet?url=&text=" class="catwalk-action-share-this-btn" style="display: block; float:right; cursor:pointer;margin-right: 5px;">' +
			'<img src="images/catwalk/catwalk-share-this-btn.png" /></a>';
		
		};
		
		this.shareOnTwitter = function(e) {
					
			//_gaq.push(['_trackEvent', 'Share/Customise', 'twitter']);
			var target = $(e.currentTarget);
			
			var left = (screen.width/2)-(600/2);
			var top = (screen.height/2)-(400/2);
			newwindow = window.open(target.data('target'),'name',"height=400,width=600,top=" + top + ",left=" + left);
			if (window.focus) {newwindow.focus()}
			return false;
		};
                
		this.initialize(options);
	
	}
	
	var settings = {serverAddress: "http://www.e-ardi.com:3700"};
	var myAdmin = new admin(settings);
	

 
});
