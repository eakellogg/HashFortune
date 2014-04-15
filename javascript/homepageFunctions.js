//Homepage html functions


//<!-- rename the page being viewed -->
function rename_page(new_title) {
    document.getElementById("page_title").innerHTML=new_title;
}
		
//<!-- clear all search bars -->
function clear_searches() {
    document.getElementById("esearch").value= "";
    document.getElementById("hsearch").value= "";
    document.getElementById("usearch").value= "";
    document.getElementById("amount_buy").value= "";
    document.getElementById("amount_sell").value= "";
	document.getElementById("player_num").value= "";
	document.getElementById("time_limit").value= "";
	document.getElementById("wager").value= "";
	document.getElementById("start_time").value= "";
	document.getElementById("name_of_challenge").value= "";
	document.getElementById("friend_a").value= "";
	document.getElementById("friend_b").value= "";
	document.getElementById("friend_c").value= "";
}
		
//<!-- hide all divisions (results in a blank page) -->
function hide_all() {
    document.getElementById("trending").style.display = "none";
    document.getElementById("investments_summary").style.display = "none";
    document.getElementById("leaderboard").style.display = "none";
    document.getElementById("friends").style.display = "none";
    document.getElementById("friend_requests").style.display = "none";
	document.getElementById("friend_button").style.display = "none";
    document.getElementById("challenge_home").style.display = "none";
    document.getElementById("settings").style.display = "none";
    document.getElementById("player_pic").style.display = "none";
    document.getElementById("player_info").style.display = "none";
    document.getElementById("hashtag_search").style.display = "none";
    document.getElementById("username_search").style.display = "none";
    document.getElementById("email_search").style.display = "none";
    document.getElementById("investments_all").style.display = "none";
    document.getElementById("hashtag_investments").style.display = "none";
    document.getElementById("buy_sell_tags").style.display = "none";
    document.getElementById("hashtag_stats").style.display = "none";
    document.getElementById("new_challenge").style.display = "none";
    document.getElementById("user_search_results").style.display = "none";
    document.getElementById("chartdiv").style.display = "none";
	document.getElementById("current_value").innerHTML = 0;
	document.getElementById("my_uninvested_points").innerHTML= 0;
	document.getElementById("current_stock_count").innerHTML = 0; 
	document.getElementById("total_shares").innerHTML = 0;
	document.getElementById("value_per_share").innerHTML = 0;
}


//<!-- show divisions relevant to homepage -->
function show_homepage() {
			
    document.getElementById("trending").style.display = "block";
    document.getElementById("player_info").style.display = "block";
    document.getElementById("investments_summary").style.display = "block";
    document.getElementById("leaderboard").style.display = "block";
    document.getElementById("friends").style.display = "block";
			
	var userObj = { user_name : user_name };
	var investObj = {};
	investObj.user_name = user_name;
	investObj.portfolio_name = user_name;
			
	socket.emit( 'trending_request' , userObj );
	socket.emit( 'leader_request' , userObj  );
	socket.emit( 'my_investments_request' , investObj);
	socket.emit( 'friend_table_request' , investObj);
	socket.emit( 'player_info_request' , inestObj);
	
}

//<!-- switches which "purse" of money the user is using -->
function switch_purse() {			//ChallengeTODO implement this
	//switch which one is highlighted
	//change the cookie
}  

//<!-- show divisions relevant to investments page -->
function show_investments(user_name) {

	document.getElementById("player_info").style.display = "block";
	document.getElementById("investments_summary").style.display = "block";
	document.getElementById("trending").style.display = "block";
	document.getElementById("hashtag_search").style.display = "block"; 
	
	var investObj = {};
	investObj.user_name = user_name;
    investObj.portfolio_name = user_name;
			
    socket.emit( 'my_investments_request' , investObj);
	socket.emit( 'player_info_request' , investObj);
}
	  
//<!-- show divisions relevant to portfolio page -->
function show_portfolio(portfolio_name) {

	document.getElementById("player_pic").style.display = "block";
	document.getElementById("player_info").style.display = "block";
	document.getElementById("investments_summary").style.display = "block";
	document.getElementById("friends").style.display = "block";
	if(user_name != portfolio_name) {
		document.getElementById("friend_button").style.display = "block";
	}
			
    var investObj = {};
    investObj.user_name = user_name;
    investObj.portfolio_name = portfolio_name;

    socket.emit( 'my_investments_request' , investObj);
	socket.emit( 'player_info_request' , investObj);
	socket.emit( 'friend_table_request' , { user_name : user_name } );
	socket.emit( 'friend_button_request', investObj);
}


//<!-- show divisions relevant to challenges page -->
function show_challenge_home() {
    document.getElementById("challenge_home").style.display = "block";
    document.getElementById("new_challenge").style.display="block";
}
	  
//<!-- show divisions relevant to friends page -->
function show_friends_page() {
    document.getElementById("friend_requests").style.display = "block";
    document.getElementById("friends").style.display = "block";
    document.getElementById("username_search").style.display = "block";
    document.getElementById("email_search").style.display = "block";
        
    socket.emit( 'friend_table_request' , { user_name : user_name } );
    socket.emit( 'friend_request_request' , { user_name: user_name } );
}


//<!-- show divisions relevant to settings page -->
function show_settings() {
    document.getElementById("settings").style.display = "block";
}
	  

//<!-- show divisions relevant to specific hashtag page -->
function show_hashtag_page() {

	document.getElementById("hashtag_investments").style.display = "block";
	document.getElementById("hashtag_stats").style.display = "block";
	document.getElementById("chartdiv").style.display = "block";
	//document.getElementById("hashtag_graph").style.display = "block";
	document.getElementById("buy_sell_tags").style.display = "block";
	document.getElementById("hashtag_search").style.display = "block";

				
} 
		
// <!-- show drop down menu of particular hashtag -->
function show_menu(hashtag_name) {
	document.getElementById(hashtag_name).style.display ="block";
}


// <!-- hide drop down menu of particular hashtag -->
function hide_menu(hashtag_name) {
	document.getElementById(hashtag_name).style.display ="none";
}

function change_current_challenge(id) {
	var curr_chal = "challenge" + id;
	if (getCookie("challenge_id") != id) 
	{
		var c = document.getElementsByClassName("pointable_toolbar");
		for (var i = 0; i < c.length; i++ )
		{
			c[i].style.background = "white";
		}
		document.getElementById(curr_chal).style.background = "yellow"; 
		setCookie("challenge_id", id , 1);
	}
	
}

function setupChallenge(name_of_challenge, num_players, time_limit, wager, start_time, friends) {

	now = new Date();
	hour = now.getHours();
	minute = now.getMinutes();
	second = now.getSeconds();
	current_time = hour + ":" + minute + ":" + second;
	
	var start = new Date();
	
	
	if(start_time < current_time) {
		start = new Date(now.getTime() + (24*60*60*1000));
		start.setHours(parseInt(start_time.substring(0,2)),00,00);
	}
	else {
		start = now;
		start.setHours(parseInt(start_time.substring(0,2)),00,00);
	}

	socket.emit( 'challenge_setup_request' , { name_of_challenge : name_of_challenge, num_players : num_players, time_limit : time_limit, wager : wager, start_time : start, friends : friends} );
}
