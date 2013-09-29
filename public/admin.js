
$(document).ready(function() {
	
	var admin = function(options) {
		
		this.initialize =  function(options) {
			this.serverAddress = (options.serverAddress != undefined) ? options.serverAddress : 'http://192.168.1.86:3700';
			this.socket = io.connect(this.serverAddress);
			
			this.bindEvents();
		}
		
		
		this.bindEvents = function() {
			var sendButton = $("#send");
			sendButton.on('click',  $.proxy(this, "callServer"));
			$(document).on('keyup', $.proxy(this, "callServer"));
 
		}
		
		
	/**
	 * Sends messages to the server
	 */
	this.callServer = function(e) {
		if ( e.type == "keyup" && e.keyCode != 13)
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
			
        
	} 
		
		this.generateHTML = function (data) {
		
			var html = ''; 
			
			html = "<img src='" + data + "' style='width: 100%; position: relative;' />";
			return html;
		}
		
		this.initialize(options);
	
	}
	
	var options = {};
	var myAdmin = new admin(options);
	
	
	// name.on('change', bindPrivateMessageListener);
	
	
	
	// function bindPrivateMessageListener(e) {
		// if (!name.attr('disabled')) {
				// name.attr('disabled', true);
				// saveName(name.val());
		// }
		
		// socket.on(name.val(), function (data) {
			// if (data.message) {
				// var newMessage = data;
				// messages.push(newMessage);
				// saveToStorage(messages);
				
				// // Output messages, scroll down, make notification sound
				// content.append(makeHTMLMessages(newMessage));
				// content.mCustomScrollbar("update");
				// content.mCustomScrollbar("scrollTo",$('.mCSB_container').height() + 200);
				// //content.scrollTop(content.height());
				// $.playSound('http://www.e-ardi.com/assets/notification-base.mp3');
				
			// } else {
				// console.log("There is a problem:", data);
			// }
		// });
	// }
 
});
