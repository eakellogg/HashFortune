
/*
This is the file where you should for now, add different types of messages for the server to be listening to, and 
the function that describes how they should behave
*/


var clientSocketTable = new Array();
var allSockets;
var serverCommands  = require('./../ServerCommands.js');


//This is node js module stuff, its pretty cool, it allows for stuff in this file to be used in other node js scripts
//it provides namespaces, and encapsulation

// type of exports possible
module.exports = {
	listen: listen,
	resetTable: reset,
	messageUser : messageUser,
	giveSockets : set,
	addClient   : addClient,
	removeClient : removeClient,
	messageAnonymous : messageAnonymous
};


function removeClient(username)
{

}
// set the sockets
function set( sockets )
{
	allSockets = sockets;
}


// reset the sockets
function reset()
{
	clientSocketTable = new Array();
}	


// listen on a particular client's socket - handle different types of requests appropriately
function listen( client )
{
	client.emit('welcome' , "You have established an connection");
	client.on('login' , serverCommands.VerifyLogin );
	
	client.on('re_establish' , 
		function( message ) {
		clientSocketTable[ message.user_name ] = this;
		console.log("re-established " + message.user_name );
	});
	client.on('tag_page_request' , serverCommands.serveTagPage );
	client.on('create_login' , serverCommands.VerifyCreate );
	client.on('buy_hash' , serverCommands.serveBuyHash );
	client.on('sell_hash' , serverCommands.serveSellHash );
	client.on('trending_request' , serverCommands.serveTrending );
	client.on('my_investments_request' , serverCommands.serveMyTrending );
	client.on('player_info_request' , serverCommands.servePlayerInfo);
	client.on('friend_table_request' , serverCommands.serveFriends);
	client.on('friend_request_request' , serverCommands.serveFriendRequests);
	client.on('accept_friend' , serverCommands.serveAcceptFriend);
	client.on('decline_friend' , serverCommands.serveDeclineFriend);
	client.on('leader_request' , serverCommands.serveLeaderBoard );
    client.on('search_username' , serverCommands.serveSearchUser );
	client.on('search_user_email' , serverCommands.serveSearchEmail );
	client.on('logout' , serverCommands.serveLogout );
	client.on('chart_request' , serverCommands.serveChart );
}


// give a specific user a particular message
function messageUser( user , type , message )
{
	// if the user is not undefined
	if( clientSocketTable[user] != undefined ) {
		clientSocketTable[ user ].emit( type , message );
		console.log("MESSGE SENT");
	}
	else
	{
		console.log("FDFHDLFJKD");
	}
}


// give everyone a particular message
function messageAnonymous( socket , type , message)
{
	socket.emit( type , message);
}


// add a client 
function addClient( client , socket )
{
	clientSocketTable[ client ] = socket;
	console.log("THIS HAPPEND");
}


