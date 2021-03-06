/* This file contains functions which recieve a message from the client, perform a query, 
 * and then message the user with the appropriate information.
 */
var fs = require('fs');
var trendingTable;
var topTable;
var leaderBoard;
// create connection to sql database
var mysql = require('mysql');

var db_config = { host : 'hashfortune.com' , user : 'jzerr718_zerr2' , password : 'csGeni01' , database : 'jzerr718_HashFortune' };


var connection;



function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          //
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

// type of exports possible
module.exports = {
	createUser   : createUser,
	VerifyCreate : VerifyCreate,
	VerifyLogin  : VerifyLogin,
	serveTagPage : serveTagPage,
	serveBuyHash : serveBuyHash,
    serveSellHash : serveSellHash,
	serveTrending : serveTrending,
	serveTop : serveTop,
	serveFriends : serveFriends,
	serveFriendRequests : serveFriendRequests,
	serveFriendButton : serveFriendButton,
	serveAcceptFriend : serveAcceptFriend,
	serveDeclineFriend : serveDeclineFriend,
	giveHandler : giveHandler,
	serveMyTrending : serveMyTrending,
	servePlayerInfo : servePlayerInfo,
	serveLeaderBoard : serveLeaderBoard,
	setLeaderBoard : setLeaderBoard,
	setTrendingPage : setTrendingPage,
	setTopPage : setTopPage,
	serveSearchUser : serveSearchUser,
	serveSearchEmail : serveSearchEmail,
	serveLogout  : serveLogout,
	serveChart : serveChart,
	serveFormula : serveFormula,
	serveMakeFriend : serveMakeFriend,
	serveChallenges : serveChallenges,
	serveAcceptChallenge : serveAcceptChallenge,
	serveChallengeSetup : serveChallengeSetup
};

setInterval( setLeaderBoard ,  60 * 1000);
setInterval( setTrendingPage , 60 * 1000);
setInterval( setTopPage , 60 * 1000);


function serveChart( message) 
{
	var socket = this;

	//now getting the historical values from the hashTags table
	connection.query( "SELECT dateTime AS time , price FROM hashTags WHERE name = ? " , [ message.tagname] , function (err , rows )
	{
		if( err )
			throw err;
		
		socket.emit( 'chart_data' , rows );
	});
	
	var username = message.user_name;
	var filename = "./userLogs/" + username + ".txt";
	var output = "Requesting chart for " + message.tagname + " at Time " + new Date() + " \n\n";
	fs.appendFile( filename , output , function ( err ) {
		if( err )
			throw err;
	});
}

function serveLogout( message )
{
	var username = message.user_name;
	socketHandler.removeClient( username );
	
	var convertedCurrentTime = new Date();
	
	/*Not needed in new mechanic but might be interesting data to store? not sure
	connection.query( "UPDATE users SET lastLogout = ? WHERE username = ? " , [ convertedCurrentTime , username] ,
		function ( err , rows )
		{
			if( err )
				throw err;
		}
	);
	*/
	var filename = "./userLogs/" + username + ".txt";
	var output = "loging out  at Time " + new Date() + " \n\n";
    fs.appendFile( filename , output , function ( err ) //The log out time is kinda stored here
	{
		if( err )
			throw err;
	});
}

function serveSearchUser(message)
{

	connection.query( "SELECT username FROM users WHERE username = ? LIMIT 1" , [message.portfolio_name] ,
	function( err, rows)
	{
		if( err )
			throw err;
		if( rows.length == 1 )
			socketHandler.messageUser( message.user_name , 'user_search' , { portfolio_name : message.portfolio_name } );
		else
			socketHandler.messageUser( message.user_name , 'warning' , { content : "That user doesn't exist!" } );
	}); 
}

function serveSearchEmail(message)		//TODO
{
	connection.query( "SELECT username FROM users WHERE email = ? LIMIT 1" , [message.search_email] ,
	function( err, rows)
	{
		if( err )
			throw err;
		if( rows.length == 1 )
			socketHandler.messageUser( message.user_name , 'user_search' , { portfolio_name : rows[0].username } );
		else
			socketHandler.messageUser( message.user_name , 'warning' , { content : "That user doesn't exist!" } );
	}); 
}

function setLeaderBoard()
{
	connection.query( "SELECT username , TotalValue FROM users ORDER BY TotalValue DESC LIMIT 10" , 
	function (err , rows )
	{
		if( err)
			throw err;
		leaderBoard = rows;
	});
}


function setTrendingPage()
{
	connection.query( "SELECT tagname AS name , price FROM Market ORDER BY count DESC LIMIT 10" , 
	function( err , hashtags )
	{
		if(err) {
			throw err;
		}
		
		trendingTable = hashtags;
	});
}

function setTopPage()
{
	connection.query( "SELECT tagname AS name , price FROM Market ORDER BY price DESC LIMIT 10" , 
	function( err , hashtags )
	{
		if(err) {
			throw err;
		}
		
		topTable = hashtags;
	});
}


function giveHandler( handler )
{
	socketHandler = handler;
}

// create a new user account
function createUser( newUser , connection )
{
	// insert new user into the database
	connection.query( "INSERT INTO users ( username , password , email , AvailablePoints) VALUES ( ? , ? , ? , 5000 )" , [ newUser.user_name , newUser.pass_word , newUser.email ] , 
	function( err , blank){
		if( err )  {
			throw err;
		}
	});
	
	var filename = "./userLogs/" + newUser.user_name + ".txt";
	var output = "Creating user at Time " + new Date() + " \n\n";
			fs.appendFile( filename , output , function ( err ) 
			{
				if( err )
					throw err;
			});
}

// verify the creation of a new account
//TODO should more be done to check a new account besides just checking that its unused?
//should check if email is unused
function VerifyCreate(message)
{
	var user = message.user_name;
	var pass = message.pass_word;
	var email = message.user_email;
	
	// search the username
	var clientSocket = this;
	connection.query( 'SELECT username FROM users WHERE username = ? LIMIT 1', [user] , 
	function( err , user_info )
	{
		if(err) {
			throw err;
		}
	
		//The desired user name is unused
		if(  user_info.length == 0 ){			
			var newUser = {};
			newUser.user_name = user;
			newUser.pass_word = pass;
			newUser.email     = email;
			createUser( newUser , connection );
			
			socketHandler.addClient( user , clientSocket );

			var message = {};
			message.cred = "cred";
			message.loc = "homepage.html";
			message.user = user;
			message.pass = pass;
			message.chall = "0";
			socketHandler.messageUser( user, 'login_ok' , message	); //Tell the user to log in with new account
		}
		else {
			socketHandler.messageAnonymous( clientSocket , 'warning' , { content: user + " is already in use. " });
		}
	});
	

}

// verify the login of a user

//TODO nothing changed directly here, but the formula it calls in now different 
function VerifyLogin(message) 
{
	var username = message.user_name;
	var password = message.pass_word;
	var clientSocket = this;

	//TODO THIS WILL BE A PROBLEM IF SOMEONE TRIES TO LOG IN AS YOU
	
	socketHandler.addClient( username , clientSocket);
	// search for the username and password of the user in question
	connection.query( "SELECT username, password FROM `users` WHERE username = ? AND password = ? LIMIT 1", [username, password],
	function(err, user_info) {
		if(err) {
			throw err;
		}

		// no user found from the search
		if(user_info.length == 0) {
			
			socketHandler.messageAnonymous( clientSocket , 'login_fail' , "Incorrect username or password" );	
			socketHandler.removeClient( username );
		}
		
		// if the user does exist
		else {
			if(user_info[0].username == username && user_info[0].password == password) {
				
				var returnmessage = {};
				returnmessage.cred = "cred";
				returnmessage.loc = "homepage.html";
				returnmessage.user = username;
				returnmessage.pass = password;	
				returnmessage.chall = "0";
				socketHandler.messageUser( username, 'login_ok' , returnmessage );
				
				serveFormula(message);
			}
			else
			{
				socketHandler.messageAnonymous( clientSocket , 'login_fail' , "Password incorrect");		//it won't actually get here. if the password was incorrect, then the query result would be empty
			}
		}
	});
	
	var filename = "./userLogs/" + username + ".txt";
	var output = "Logged in " + new Date() + " \n\n";
	fs.appendFile( filename , output , function ( err ) 
	{
		if( err )
			throw err;
	});
	
}


// update the hashtag page for a specific user
//TODO Need user invested 
function serveTagPage(message)
{
	//var output = { available_points : 0 , user_invested : 0 , total_invested : 0 , value : 0 };
	var username = message.user_name;
	var challenge_id = message.challenge_id;
	// search for the uninvested points of the user
	
	var queryString = "";
	var queryArgs = new Array();
	console.log( challenge_id );
	if( challenge_id == 0)
	{
		queryString = "SELECT AvailablePoints FROM users WHERE username = ? ";
		queryArgs.push( username );
	}
	else
	{
		queryString = "SELECT AvailablePoints FROM ChallengePurses WHERE username = ? AND id = ? ";
		queryArgs.push( username );
		queryArgs.push( challenge_id );
	}

	console.log(queryString );
	console.log(queryArgs);
	connection.query( queryString , queryArgs ,  
	function( err , user_info )
	{
		if(err) {
			throw err;
		}
		console.log( user_info );
		// if the user and his/her available points exist
		if( user_info.length > 0 )
		{	
			// create the output with the user's available points incorporated
			 var available_points = user_info[0].AvailablePoints;		//output.avail

			// search for the investment for the user in question
			connection.query( "SELECT shares FROM `Invests` WHERE username = ? AND tagname = ? AND challengeID = ?", [username, message.tag_name, message.challenge_id], 
			function( err , investment_info )
			{
				if(err) {
					throw err;
				}
				var user_invested = 0;	
				// if the investment exists, update the output with the user's current investment	
				if(investment_info.length != 0) {
					user_invested = investment_info[0].shares;		//output.user..
				}
				
				connection.query( "SELECT shares, price FROM `Market` WHERE tagname = ?", [message.tag_name], 
				function( err , market_info )
				{
					if(err) {
						throw err;
					}
					var total_invested = 0;
					var value = 0;
					if(market_info.length != 0) {
						total_invested = market_info[0].shares;		//output.total
						value = market_info[0].price;				//output.value
						console.log( value );
							
					}
					
					var update = {};		//{ available_points : 0 , user_invested : 0 , total_invested : 0 , value : 0 };
					update.available_points = available_points;
					update.user_invested = user_invested;
					update.total_invested = total_invested;
					update.value = value;
					console.log("HEYYYYYY"+update);
					socketHandler.messageUser( username , 'tag_page' , update );	
				});
				
			});	
		}
	});
	
	var filename = "./userLogs/" + username + ".txt";
	var output = "Asked for tag page  " + message.tag_name + " at Time " + new Date() + " \n\n";
	fs.appendFile( filename , output , function ( err ) 
	{
		if( err )
			throw err;
	});
}


// handle a user's buy operation
function serveBuyHash(message)
{
	message.portfolio_name = message.user_name;
	if( message.amount > 0 )
	{
		// search for the uninvested points of the user
		var sqlString = "SELECT newTab.AvailablePoints FROM ";
		sqlString += "(SELECT AvailablePoints, 0 AS challengeID FROM users WHERE username = ? ";
		sqlString +="UNION ALL SELECT AvailablePoints, id AS challengeID FROM ChallengePurses WHERE username = ?) "; 
		sqlString +="newTab WHERE newTab.challengeID = ?";
		connection.query( sqlString ,[message.user_name , message.user_name , message.challenge_id],
		function(err,user_info) {
			if(err) {
				throw err;
			}
			console.log( message.user_name + " " + message.tag_name + " " + message.challenge_id );
			if(user_info.length > 0) {
				//get the value of the shares
				connection.query( "SELECT `shares`, `count` FROM Market WHERE tagname = ?", [message.tag_name],
				function (err, value_info) { 
					if(err) {
						throw err;
					}
					
					var marketBool = true;
					if( value_info.length == 0 )
					{
						value_info[0] = { shares : 0, count : 0};
						marketBool = false;
					}
					
					var shares = parseInt(message.amount) + parseInt(value_info[0].shares);
					var value = 10*(shares) + 10*(value_info[0].count);
					if( message.challenge_id == 0)
						value +=10 * (shares);
					var cost = Math.ceil(value* message.amount);
					var newpoints = user_info[0].AvailablePoints - cost;
					
					// if the new amount would cause amount to go negative - invalid buy
					if(newpoints < 0) {
						var warning = {};
						warning.content = "You do not have the points to make that investment!";
						socketHandler.messageUser(message.user_name, 'warning', warning);
					}
					
					// valid buy operation
					else{
					
						// search for the investment for the user in question
						connection.query( "SELECT `shares` FROM Invests WHERE username = ? AND tagname = ? AND challengeID = ?", [message.user_name, message.tag_name, message.challenge_id], 
						function (err, investment_info) { 
							if(err) {
								throw err;
							}
						
							// if the investment already existed
							if(investment_info.length > 0) {
								var oldamount = investment_info[0].shares;
								var newamount = parseInt(oldamount) + parseInt(message.amount);		  
								connection.query( "UPDATE `Invests` SET shares = ? WHERE username = ? AND tagname = ? AND challengeID = ?", [newamount, message.user_name, message.tag_name, message.challenge_id],
								function(err, blank) {
									if(err) {
										throw err;
									}
								});
							}
						
							// make new investment
							else {
								// insert new investment into the database
								connection.query( "INSERT INTO Invests ( username, tagname, shares, challengeID) VALUES ( ?, ?, ?, ? )" , 
								[message.user_name, message.tag_name, message.amount, message.challenge_id], 
								function( err , blank){
									if( err ) {
										throw err;
									}
								});
								
								/*//Add one to investment count
								connection.query( "UPDATE users SET investCount = (investCount + 1) WHERE username = ? " ,[ message.user_name ] ,
								function ( err , blank )
								{
									if ( err ){
										throw err;
									}
								});*/
							}
								
						});
							
						if(message.challenge_id == 0)
						{
							if(marketBool)
							{
								connection.query( "UPDATE Market SET price = ?, shares = ? WHERE tagname = ?" ,[ value, shares, message.tag_name ] ,
									function ( err , Blank )
									{
										if ( err ){
											throw err;
										}
									});
							}
							else
							{
								connection.query( "INSERT INTO Market ( tagname, price, shares, count) VALUES ( ?, ?, ?, 0 )" ,[  message.tag_name, value, shares ] ,
									function ( err , Blank )
									{
										if ( err ){
											throw err;
										}
									});
							}
								
							// update the user with the post investment point total
							connection.query( "UPDATE `users` SET AvailablePoints = ? WHERE username = ?", [newpoints, message.user_name],
							function(err, blank) {
								if(err) {
									throw err;
								}
								serveFormula(message, serveTagPage);
								serveChallenges(message);
							});
						}
						
						else
						{
							connection.query( "UPDATE `ChallengePurses` SET AvailablePoints = ? WHERE username = ? AND id = ?", [newpoints, message.user_name, message.challenge_id],
							function(err, blank) {
								if(err) {
									throw err;
								}
								serveFormulaChallenge(message);
								serveChallenges(message);
							});
						}
					}
				});
			}	
		});

	}
	else
	{
		socketHandler.messageUser( message.user_name , 'warning' , { content : "You can't buy negative stocks " } );
	}
	
	var filename = "./userLogs/" + message.user_name + ".txt";
	var output = "Bought tag  " + message.tag_name + " For " + message.amount + " with ChallengeID " + message.challenge_id + " at Time " + new Date() + " \n\n";
	fs.appendFile( filename , output , function ( err ) 
	{
		if( err )
			throw err;
	});
}


// handle a user's sell operation
function serveSellHash(message)
{
	message.portfolio_name = message.user_name;
	console.log("HELLO" + message.amount );
	if( message.amount > 0)
	{
		// search for the investment for the user in question			//ChallengeTODO what if in challenge? Does it matter?
	
		connection.query( "SELECT `shares` FROM Invests WHERE username = ? AND tagname = ? AND challengeID = ?", [message.user_name, message.tag_name, message.challenge_id], 
		function (err, investment_info) { 
			if(err) {
				throw err;
			}
			console.log( message.user_name + " " + message.tag_name + " " + message.challenge_id );
			// if the investment exists
			if(investment_info.length > 0) {
			//console.log("DFJDLKFJD");
				var oldamount = investment_info[0].shares;
				var newamount = oldamount - message.amount;

				// if the user has the shares to sell
				if(newamount >= 0) {
					
					// if shares would be left over
					if(newamount > 0) {
						connection.query( "UPDATE `Invests` SET shares = ? WHERE username = ? AND tagname = ? AND challengeID = ?", [newamount, message.user_name, message.tag_name, message.challenge_id],
						function(err, blank) {
							if(err) {
								throw err;
							}
						});
					}
					
					// if selling entire investment
					if(newamount == 0) {
						connection.query( "DELETE FROM `Invests` WHERE username = ? AND tagname = ? AND challengeID = ?", [message.user_name, message.tag_name, message.challenge_id],
						function(err, blank) {
							if(err) {
								throw err;
							}
						});	
						/*connection.query( "UPDATE `users` SET investCount = (investCount -1 ) WHERE username = ?" , [message.user_name],
						function( err , rows )
						{
							if( err )
								throw err;
						});*/
					}
				
					connection.query( "SELECT `price`, `shares`, `count` FROM Market WHERE tagname = ?", [message.tag_name],
					function(err, market) {
						if(err) {
							throw err;
						}
						var added_value = Math.ceil(market[0].price * message.amount);
						if( message.challenge_id == 0 )
						{
							var adjust = 0;
							for( var i =0; i < parseInt(message.amount) -1; i++)
							{
								adjust += 10 * i;
							}
							adjust = Math.floor( adjust / 2 );
							added_value = added_value - adjust;
						}
				
						var shares = parseInt(market[0].shares) - parseInt(message.amount);
						var value = 10 + 10*(shares) + 10*(market[0].count);
						
						// update the user with the post investment point total
						if(message.challenge_id == 0)
						{
							connection.query( "UPDATE `users` SET AvailablePoints = (? + AvailablePoints) WHERE username = ?", [added_value, message.user_name],
							function(err, blank) {
								if(err) {
									throw err;
								}
							});
						
							connection.query( "UPDATE `Market` SET price = ?, shares = ? WHERE tagname = ?", [value, shares, message.tag_name],
							function(err, blank) {
								if(err) {
									throw err;
								}
								serveFormula(message, serveTagPage);
								serveChallenges(message);
							});	
						}
						else
						{
							connection.query( "UPDATE `ChallengePurses` SET AvailablePoints = (? + AvailablePoints) WHERE username = ? AND id = ?", [added_value, message.user_name, message.challenge_id],
							function(err, blank) {
								if(err) {
									throw err;
								}
								serveFormulaChallenge(message);
								serveChallenges(message);
							});
						}
					});
				}

				// if the user does not have the shares to sell
				else {
					var warning = {};
					warning.content = "You do not have that many stocks to sell!";
					socketHandler.messageUser(message.user_name, 'warning', warning);
				}
			}
			
			// user doesn't own that invest - can't sell
			else {
				var warning = {};
				warning.content = "You do not currently have stocks to sell!";
				socketHandler.messageUser(message.user_name, 'warning', warning);
			}
		});
	}
	else
	{
		socketHandler.messageUser( message.user_name , 'warning' , { content : "You can not sell negative stocks" } );
	}
	
	var filename = "./userLogs/" + message.user_name + ".txt";
	var output = "Sold tag  " + message.tag_name + " For " + message.amount + " with ChallengeID " + message.challenge_id + " at Time " + new Date() + " \n\n";
	fs.appendFile( filename , output , function ( err ) 
	{
		if( err )
			throw err;
	});
}

//Give the requester the current trending_table
function serveTrending(message) 
{
	var username = message.user_name;
	socketHandler.messageUser( username , 'trending_table' , trendingTable );
}

//Give the requester the current table of hashtags with the highest stock price
function serveTop(message)
{
	var username = message.user_name;
	console.log("We made it to the server!!!!!!!!");
	socketHandler.messageUser( username , 'top_table' , topTable );
}

// sends a list of the user's current investments
function serveMyTrending(message) {

	console.log(message);
	var portfolio_name = message.portfolio_name;
	if( message.portfolio_name == undefined )
		portfolio_name = message.user_name;
	//console.log( portfolio_name + " HERE I AM " );
	var challenge_id = message.challenge_id;
	if( challenge_id == undefined )
		challenge_id = 0;
	console.log( "id " + challenge_id );
	connection.query( "SELECT  Invests.tagname , Invests.shares, price FROM (SELECT * FROM Invests) AS Invests LEFT JOIN Market on Market.tagname = Invests.tagname WHERE Invests.challengeID = ? AND Invests.username = ? " , [challenge_id , portfolio_name] , 
	function (err , investments ){
		if( err )
			throw err;

		socketHandler.messageUser( message.user_name,  'my_investments_table' , investments );
	});
}


// returns the current time in the appropriate format for the sql database used
function getCurrentTime() {
	var now = new Date();
	now.setHours(now.getHours() - 2);
	now.setMinutes(0);
	now.setSeconds(0);
	return now;
}


function servePlayerInfo(message) {

	var portfolio_name = message.portfolio_name;
	if( portfolio_name == undefined )
		portfolio_name = message.user_name;
	var challenge_id = message.challenge_id;
	if (challenge_id == 0)
	{
		connection.query( "SELECT username , AvailablePoints , TotalValue FROM users WHERE username = ?" ,
		[ portfolio_name ] , 
		function( err , rows ){
			if( err ) {
				throw err;
			}
			socketHandler.messageUser( message.user_name , 'player_info_table' , rows );
		}
		);
	}
	else
	{
		connection.query( "SELECT username , AvailablePoints , TotalValue FROM ChallengePurses WHERE username = ? AND id = ?" ,
		[portfolio_name , challenge_id] ,
		function( err , rows ){
			if( err ) {
				throw err;
			}
			socketHandler.messageUser( message.user_name , 'player_info_table' , rows );

		});
	}
}

function serveFriends(message) {
	var username = message.user_name;
	var portfolio_name = message.portfolio_name;
	if( portfolio_name == undefined )
		portfolio_name = username;
	connection.query( "SELECT sender AS Friend, TotalValue FROM friends inner join users on users.username = friends.sender WHERE accepted = 1 AND receiver = ? UNION ALL SELECT receiver AS Friend, TotalValue FROM friends inner join users on users.username = friends.receiver WHERE accepted = 1 AND sender = ?", [portfolio_name, portfolio_name] ,
	function (err , friends )
	{
		if(err) {
			throw err;
		}
	
		socketHandler.messageUser( username, 'friends_table' , friends );
	});
}

function serveFriendRequests(message) {
	var username = message.user_name;
	connection.query( "SELECT sender, receiver FROM friends WHERE accepted = 0 AND receiver = ?", [username] , 
	function (err , requests )
	{
		if(err) {
			throw err;
		}
		socketHandler.messageUser( username, 'friend_request_table' , requests );
	});
}

function serveFriendButton(message) {
	var username = message.user_name;
	var portfolio_name = message.portfolio_name;
	console.log(message);

	connection.query( "SELECT sender , receiver FROM friends WHERE (sender = ? && receiver = ?) OR ( sender = ? && receiver = ? )", [ username , portfolio_name , portfolio_name , username ] ,
	function ( err , result )
	{
	var answer = {};
		if( err )
			throw err;
		if( result.length == 0 )
			answer.result = true;
		else
			answer.result = false;
		answer.friend = portfolio_name;
	socketHandler.messageUser( username, 'friend_button' , answer );
	});
}

function serveAcceptFriend(message) {
	var username = message.user_name;
	connection.query( "UPDATE `friends` SET accepted = 1 WHERE sender = ? AND receiver = ?", [message.friend_name, message.user_name],
	function(err, blank) {
		if(err) {
			throw err;
		}
		
		serveFriends(message);
		serveFriendRequests(message);
	});
}

function serveDeclineFriend(message) {
	var username = message.user_name;
	connection.query( "DELETE FROM `friends` WHERE sender = ? AND receiver = ?", [message.friend_name, message.user_name],
	function(err, blank) {
		if(err) {
			throw err;
		}
	
		serveFriends(message);
		serveFriendRequests(message);
	});
}

function serveLeaderBoard(message){

	var username = message.user_name;
	socketHandler.messageUser( username , 'leader_board' , leaderBoard );
}


function serveFormula( message, callback1, callback2 )
{
	var username = message.user_name;
	var totalValue = 0;
	
	connection.query( "SELECT SUM(Market.price * Invests.shares) AS sum FROM Invests inner join Market on Market.tagname = Invests.tagname WHERE Invests.username = ? AND challengeID = '0'" , [username] , 
	function (err , investments ){
		if( err ) {
			throw err;
		}
		if( investments.length != 0 ){	
			if( investments[0].sum == null ) {
				investments[0].sum = 0;
			}
		}
		connection.query( "UPDATE users SET TotalValue = ( ? + AvailablePoints ) WHERE username = ? " , [investments[0].sum, username] , 
		function (err , blank ){
			if( err ) {
				throw err;
			}
			if(callback1 != undefined) {
				callback1( message );
			}
			if(callback2 != undefined) {
				callback2( message );
			}
		});
	});
}

function serveFormulaChallenge( message, callback1, callback2 )
{
	var username = message.user_name;
	var id = message.challenge_id;
	var totalValue = 0;
	
	connection.query( "SELECT SUM(Market.price * Invests.shares) AS sum FROM Invests inner join Market on Market.tagname = Invests.tagname WHERE Invests.username = ? AND challengeID = ?" , [username , id] , 
	function (err , investments ){
		if( err ) {
			throw err;
		}
		if( investments.length != 0 ){	
			if( investments[0].sum == null ) {
				investments[0].sum = 0;
			}
		}
		connection.query( "UPDATE ChallengePurses SET TotalValue = ( ? + AvailablePoints ) WHERE username = ? AND id = ?" , [investments[0].sum, username, id] , 
		function (err , blank ){
			if( err ) {
				throw err;
			}
			if(callback1 != undefined) {
				callback1( message );
			}
			if(callback2 != undefined) {
				callback2( message );
			}
		});
	});
}

function serveMakeFriend( message )
{
	console.log("I MADE A FRIEND!");
	
	var username = message.user_name;
	var friend = message.friend;
	var drop = message.drop;
	
	
	if( drop )
	{
		connection.query("DELETE FROM friends  WHERE (sender = ? && receiver = ?) OR ( sender = ? && receiver = ?) " , [ username , friend , friend, username ] ,
		function( err , result )
		{
			if( err )
				throw err;
		});
	}
	else
	{
		connection.query("INSERT INTO friends (sender ,receiver ) VALUES ( ? , ?) " , [ username , friend ] ,
		function( err , result )
		{
			if( err )
				throw err;
				
		});
	}
}

function serveChallenges( message )			
{
	var username = message.user_name;
	connection.query("SELECT startTime, endTime , Challenges.id AS id , playerCount , name , wager , AvailablePoints , TotalValue, status   FROM (Challenges INNER JOIN( SELECT * FROM ChallengePurses WHERE username = ? )AS     ChallengePurses ON Challenges.id = ChallengePurses.id   )" +
	"UNION SELECT 1 AS status , 0 as startTime, 0 AS endTime , 1 AS playerCount , 'Main Account' AS name , 0 AS wager , AvailablePoints , TotalValue , 0 AS id  FROM users  WHERE username = ?" , [username , username] ,  		
	function ( err , challenges )		
	{
		if( err )
			throw err;
			console.log(challenges[challenges.length-1].TotalValue);
		socketHandler.messageUser( username , 'challenges_list' , challenges );
	});

}

function serveAcceptChallenge( message) //ChallengeTODO Message other users?
{
	var condition = message.accept;
	var challengeID = message.challenge_id;
	var username = message.user_name;
	if( condition == 1)
	{
		connection.query(" SELECT AvailablePoints FROM users WHERE username = ? " , [username] ,
		function ( err , points )
		{
				if( err )
					throw err;
				
				connection.query("SELECT wager FROM Challenges WHERE id = ?" , [challengeID],
					function ( err ,rows )
					{
					if( err )
						throw err;
					var wager = rows[0].wager;
				if( points[0].AvailablePoints >= wager )
				{
					connection.query(" UPDATE ChallengePurses SET status = 1 WHERE username = ? AND id = ?" , [username , challengeID] ,
					function( err , rows )
					{
						if( err )
							throw err;
						serveChallenges(message);
					});
				
					connection.query("UPDATE users SET AvailablePoints = ( AvailablePoints - ? ) , TotalValue = ( TotalValue - ? ) WHERE username = ?" , [wager , wager , username ],
					function( err , rows )
					{
						if( err )
							throw err;
							
					});
				}
				else
				{
					socketHandler.messageUser( username , 'warning' , { content : "You can not enter that challenge due to a lack of funds " } );
				}
				});
				
	
	}
	else
	{
		connection.query( "DELETE FROM ChallengePurses WHERE username = ? AND id = ?" , [username , challengeID ],
		function (err , rows )
		{
			if( err)
				throw err;
			serveChallenges(message);
		});
	}
}

function serveChallengeSetup( message )
{
	var name = message.name_of_challenge;
	var num_player = message.num_players;
	var friends = message.friends;
	var wager = message.wager;
	
	var inlist = "( ";
	inlist += "'" +friends[0] + "'" ;
	for( var i =1; i < num_player -1 ; i++)
	{
		inlist += " ,  '" +friends[i] + "'  ";
	}
	inlist += " )";

	var startTime = new Date(message.start_time);
	var endTime = new Date(message.end_time);
	console.log( startTime );
	console.log( endTime );
	
	console.log(inlist);
	console.log(message.user_name);
	connection.query("SELECT AvailablePoints FROM users WHERE username = ? " , [message.user_name] , 
	function ( err , rows )
	{
		if( err )
			throw err;
		if( rows[0].AvailablePoints >= wager )
		{
		connection.query( "INSERT INTO Challenges ( startTime, endTime, playerCount, name, wager ) VALUES (?, ?, ?, ?, ?)" , 
		[startTime, endTime , num_player, name, wager],
		function (err , blank )
		{
			if( err)
				throw err;
				
			connection.query( "INSERT INTO ChallengePurses ( id, username , AvailablePoints , TotalValue , status ) SELECT LAST_INSERT_ID() AS id, username, ? AS AvailablePoints, ? AS TotalValue, 1 AS status FROM users WHERE username = ? UNION SELECT LAST_INSERT_ID() AS id, username, ? AS AvailablePoints, ? AS TotalValue, 0 AS status FROM users WHERE username IN " + inlist , 
			[wager, wager, message.user_name, wager, wager],
			function (err , blank )
				{
					if( err)
						throw err;
					
					serveChallenges( message );
			});
		
		});
		connection.query( "UPDATE users SET AvailablePoints = ( AvailablePoints - ? ) , TotalValue = ( TotalValue - ? ) WHERE username = ? " , [wager ,  wager , message.user_name ] ,
		function( err , rows )
		{
			if( err ) 
				throw err;
		});
		}
		else
		{
			socketHandler.messageUser(message.user_name ,'warning' , {content : "You don't have the points to create that challenge " } );
		}
	});
}






