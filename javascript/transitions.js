/* This file contains the functions that allow the client to message the server.
 * These functions are called from homepage.html
 */

// send a friend request
function send_friend_request( user_name , friend )
{
	var message = {};
	message.user_name = user_name;
	message.friend    = friend;
	message.drop = false;
	socket.emit( 'make_friend_request' , message);
}

// remove a friend
function remove_friend( user_name , friend )
{
	var message = {};
	message.user_name = user_name;
	message.friend    = friend;
	message.drop = true;
	socket.emit( 'make_friend_request' , message);
}

// switch to the tag page
function switch_to_tag( user_name , tag_name , challengeID )
{
	var message = {};
	message.user_name = user_name;
	message.tag_name = tag_name;
	message.challenge_id = challengeID;
	socket.emit( 'tag_page_request' , message); 
}

// buy a hashtag
function buy_hash( user_name , tag_name , challengeID, amount )
{
	var message = {};
	message.user_name = user_name;
	message.tag_name = tag_name;
	message.challenge_id = challengeID;
	message.amount = amount;
	socket.emit( 'buy_hash' , message); 
}


// sell a hashtag
function sell_hash( user_name , tag_name , challengeID, amount )
{
	var message = {};
	message.user_name = user_name;
	message.tag_name = tag_name;
	message.challenge_id = challengeID;
	message.amount = amount;
	socket.emit( 'sell_hash' , message); 
}

//search by username
function search_by_username( user_name , portfolio_name )
{
 	var message = {};
 	message.user_name = user_name;
 	message.portfolio_name = portfolio_name;
 	socket.emit( 'search_username' , message);
}

//search by email
function search_by_email( user_name , search_email )
{
 	var message = {};
 	message.user_name = user_name;
 	message.search_email = search_email;
 	socket.emit( 'search_user_email' , message);
}

//accept a friend request
function acceptFriend( user_name, friend_name ) {
	var message = {};
 	message.user_name = user_name;
 	message.friend_name = friend_name;
 	socket.emit( 'accept_friend' , message);
}

//decline a friend request
function declineFriend( user_name, friend_name ) {
	var message = {};
 	message.user_name = user_name;
 	message.friend_name = friend_name;
 	socket.emit( 'decline_friend' , message);
}

//update and fill the challenge toolbar
function updateChallenges( user_name, current_challenge_ID ) {		//ChallengesTODO I'm not sure if this is ever actually used... make sure this works, call it in the appropriate places 
	var message = {};
	message.user_name = user_name;
	message.purse = current_challenge_ID;
	socket.emit( 'challenges_request' , message );
}
 
//accept the challenge
function acceptChallenge( user_name, challenge_ID, accept_challenge ) {
	var message = {};
	message.user_name = user_name;
	message.challenge_id = challenge_ID;
	message.accept = accept_challenge;
	socket.emit( 'accept_challenge' , message );
	socket.emit( 'challenges_request', message );
}