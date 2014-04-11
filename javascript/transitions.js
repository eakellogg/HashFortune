
// send a friend request
function send_friend_request( user_name , friend )
{
	var message = {};
	message.user_name = user_name;
	message.friend    = friend;
	message.drop = false;
	socket.emit( 'make_friend_request' , message);f
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
	message.challengeID = challengeID;
	socket.emit( 'tag_page_request' , message); 
}

// buy a hashtag
function buy_hash( user_name , tag_name , challengeID, amount )
{
	var message = {};
	message.user_name = user_name;
	message.tag_name = tag_name;
	message.challengeID = challengeID;
	message.amount = amount;
	socket.emit( 'buy_hash' , message); 
}


// sell a hashtag
function sell_hash( user_name , tag_name , challengeID, amount )
{
	var message = {};
	message.user_name = user_name;
	message.tag_name = tag_name;
	message.challengeID = challengeID;
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
