//Hash Server


//If you want to run your own server 10002 is the port, 
// taskkill /F /PID $processID to kill just one node.exe

var fs     = require('fs'); //Allows file service activities
var server = require('http').createServer( handler ); //This creates a http server

var url = require('url');
var path = require('path');




var io = require('socket.io').listen(server); 
io.set('log level' , 0); //THIS IS HOW YOU TURN OFF DEBUG
server.listen(10001);

var socketHandler = require('./javascript/socketHandler.js');

//This is what the server does when a client makes their initial http request.
function handler( request , response ){


var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

  var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript",
    '.php':  "text/php"
   
  };
	
  path.exists(filename, function(exists) {
 
	  if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
		}

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      var headers = {};
      var contentType = contentTypesByExtension[path.extname(filename)];
      if (contentType) headers["Content-Type"] = contentType;
	if( contentType!= ".php")
	{
      	response.writeHead(200, headers);
	}
      response.write(file, "binary");
      response.end();
    });
  });
  
  
}


var DS = require('./ServerCommands.js');
DS.setTrendingPage();
DS.setLeaderBoard();
socketHandler.giveSockets(io.sockets);
var formula = require('./javascript/formula.js');
DS.giveHandler( socketHandler);

formula.set( DS);
io.sockets.on( 'connection' , socketHandler.listen );











	