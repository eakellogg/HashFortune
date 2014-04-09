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
}
		
//<!-- hide all divisions (results in a blank page) -->
function hide_all() {

    document.getElementById("trending").style.display = "none";
    document.getElementById("investments_summary").style.display = "none";
    document.getElementById("leaderboard").style.display = "none";
    document.getElementById("friends").style.display = "none";
    document.getElementById("friend_requests").style.display = "none";
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
    //document.getElementById("hashtag_graph").style.display = "none";
    document.getElementById("hashtag_stats").style.display = "none";
    document.getElementById("new_challenge").style.display = "none";
    document.getElementById("user_search_results").style.display = "none";
    document.getElementById("chartdiv").style.display = "none";
}


//<!-- show divisions relevant to homepage -->
function show_homepage() {
			
    document.getElementById("trending").style.display = "block";
    document.getElementById("investments_summary").style.display = "block";
    document.getElementById("leaderboard").style.display = "block";
    document.getElementById("friends").style.display = "block";
			
	var userObj = { user_name : user_name };
	var investObj = {};
	investObj.user_name = user_name;
	investObj.portfolio_name = user_name;
			
	socket.emit( "trending_request"        , userObj );
	socket.emit( 'leader_request' , userObj  );
	socket.emit( 'my_investments_request' , investObj);
	socket.emit( 'friend_table_request' , investObj);
}
	  

//<!-- show divisions relevant to investments page -->
function show_investments() {

	document.getElementById("player_info").style.display = "block";
	document.getElementById("trending").style.display = "block";
	document.getElementById("hashtag_search").style.display = "block"; 
			
    socket.emit( 'my_investments_request' , investObj);
	socket.emit( 'player_info_request' , { portfolio_name : user_name , user_name : user_name });
}
	  
//<!-- show divisions relevant to portfolio page -->
function show_portfolio(portfolio_name) {

	document.getElementById("player_pic").style.display = "block";
	document.getElementById("player_info").style.display = "block";
	document.getElementById("investments_summary").style.display = "block";
			
	var userObj = { user_name : user_name };
    var investObj = {};
    investObj.user_name = user_name;
    investObj.portfolio_name = user_name;

    socket.emit( 'my_investments_request' , investObj);
	socket.emit( 'player_info_request' , { portfolio_name : portfolio_name , user_name : user_name });
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
