
var express = require('express');
var basicAuth = express.basicAuth;
var auth      = function(req, res, next) {
  // Obviously this is not best practice (user info should be normaly in db, at least this is outside web root)
  basicAuth(function(user, pass, callback) {
    callback(null, user === 'admin' && pass === '1amadm1n');
  })(req, res, next);

};


var show = function(options) {
	
	this.pageData = {};
	
	this.init = function(options) {
		this.setConfig();
	
		// Setup web socket
		this.setSocketIO();
	};
	
	this.setConfig = function() {
		// Initial app config
		this.setExpress();
		//this.setDB();
		
		this.setRedis();	
		
		// Defines routes
		this.setRoutes();	
		
		
		
	};
	
	this.setExpress = function(){
		this.express = require("express");
		this.app = this.express();
		this.port = 3700;
		
		// Set view (template engine) to jade
		this.app.set('views', __dirname + '/tpl');
		this.app.set('view engine', "jade");
		this.app.engine('jade', require('jade').__express);
		
		// web root
		this.app.use(this.express.static(__dirname + '/public'));
		
	};
	
	
	this.setRoutes = function() {
		/* this.app.get('/users', this.checkAuth, function (req, res) {
			res.send(JSON.stringify(dbUsers));
		}); */

		this.app.get('/', function (req, res) {
			res.render("show");
		});
		
		
		this.app.get('/admin', auth, function (req, res) {
			res.render("admin");
		});
		
	
	};
	
	
	this.checkAuth = function() {
		

		
		// var basicAuthMessage = 'Restricted area, please identify';
		// var users		= [		
								// {name: "admin", pass: "1amadm1n"}, 
								
		// ];                  
		
		// return basicAuth = express.basicAuth(function(username, password) {
		  // for (var index in users) {
			// if (username === users[index].name && password === users[index].pass)
				// return true;
		  // }
		  
		  // return false;
		// }, basicAuthMessage);
	}
	
	
	this.setSocketIO = function() {
		// App listening (Socket listening to app (express.js) port  
		this.io = require('socket.io').listen(this.app.listen(this.port));
		
		var that = this;
		
		this.io.sockets.on('connection', function (socket) {
			that.getDataFromCache(socket);
		});
	};
	
	
	this.setRedis = function() {
		  this.redis = require("redis");
		  this.redisClient = this.redis.createClient();
		  this.redisClient.on("error", function (err) {
			console.log("Redis Error" + err);
		  });
	}
	
	this.getDataFromCache = function(socket) {
		if (this.redisClient == undefined)
			return;
		
		var that = this;	
		var socket = socket;
		
		this.redisClient.get("show_content", function(err, reply) {
		// reply is null when the key is missing
			if (reply != null)
				that.pageData.content = reply;
			
			that.redisClient.get("show_title", function(err, reply) {
				// reply is null when the key is missing
				if (reply != null)
					that.pageData.title = reply;
				
				// All data is received now we set socket.io connection events
				that.setSocketEvents(socket);
			});	
			
			
		});
		
	}
	
	this.setSocketEvents = function(socket) {
		
		var that = this;
		
		
		// Set initial content for clients and admin
		
		if (this.pageData.content != undefined) {
			
			this.io.sockets.emit('newContent', {content: this.pageData.content});
			this.io.sockets.emit('adminContent', {content: this.pageData.content});
		
		}		
		
		if (this.pageData.title != undefined) {	
			this.io.sockets.emit('textBoxUpdate', {content: this.pageData.title});
			this.io.sockets.emit('adminTextBoxUpdate', {content: this.pageData.title});
		}
		
		
		// Page content changed (update client-side)
		socket.on('adminChangedContent', function (data) {
			console.log("Server received new content data", data);
			if (data.content !== undefined) {
				that.redisClient.set("show_content", data.content);
				that.io.sockets.emit('newContent', data);
			}
		});
		
		// Textbox changed (update client-side)
		socket.on('textBoxChanged', function(data) {
			console.log("Server received new textbox data", data);
			if (data.content !== undefined) {
				that.redisClient.set("show_title", data.content);
				that.io.sockets.emit('textBoxUpdate', data);
			}
			
		});
		
		// Image share content
		socket.on('imageDataShare', function (data) {
			console.log("Server received image data", data);
			if (data.content !== undefined) {
				
				var imageData = data.content;
				imageData.replace(/^data:image\/[^]{3,4};base64,/, '');
				
				require("fs").writeFile( that.uniqid() + ".png", imageData, 'base64', function(err) {
				  console.log(err);
				});
				
				that.io.sockets.emit('clientImageShare', data);
			}
		});
	}
	
	this.uniqid = function (length) {
		var length = (length == undefined) ? 13 : length;
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < length - 1; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}
	
	this.run = function(options) {
		this.init(options);
	};
	
}

var myShow = new show();
myShow.run();


