//Homepage html functions


//<!-- rename the page being viewed -->
function rename_page(new_title) {
    document.getElementById("page_title").innerHTML=new_title;
}
		
//<!-- clear all search bars -->
function clear_searches() {
    //document.getElementById("esearch").value= "";
    document.getElementById("hsearch").value= "";
    //document.getElementById("usearch").value= "";
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
    document.getElementById("hashtag_graph").style.display = "none";
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
}
	  
//<!-- show divisions relevant to investments page -->
function show_investments() {
    document.getElementById("player_info").style.display = "block";
    document.getElementById("trending").style.display = "block";
    document.getElementById("hashtag_search").style.display = "block";
    
    socket.emit( 'player_info_request' , { user_name : user_name });
}
	  
//<!-- show divisions relevant to portfolio page -->
function show_portfolio(portfolio_name) {
    document.getElementById("player_pic").style.display = "block";
    document.getElementById("player_info").style.display = "block";
    document.getElementById("investments_all").style.display = "block";
    
    var message = {};
    message.user_name = user_name;
    message.portfolio_name = portfolio_name;
			
    socket.emit( 'player_info_request' , message );
    socket.emit( 'my_investments_request' , message );
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
    document.getElementById("hashtag_graph").style.display = "block";
    document.getElementById("buy_sell_tags").style.display = "block";
    document.getElementById("hashtag_search").style.display = "block";
    document.getElementById("chartdiv").style.display = "block";
}

//<!-- what to do when search for username -->
function username_search_clicked() {
    search_by_email(user_name, document.getElementById('usearch').value);
    clear_searches();
}

function email_search_clicked() {
    search_by_email(user_name, document.getElementById('esearch').value);
    clear_searches();
}

function logout_clicked() {
    setCookie( 'user_name' , '' , 1);
    setCookie('pass_word' , '' , 1 );
    socket.emit( 'logout' , { user_name : user_name } );
    location.href = '/index.html';
}

function buy_clicked() {
    var username = user_name;
	var tag_name = current_tag;
	var challengeID = 0;
	var amount = $('#amount_buy').val();
	buy_hash(username, tag_name, challengeID, amount);
	clear_searches();
}

function sell_clicked() {
    var username = user_name;
	var tag_name = current_tag;
	var challengeID = 0;
	var amount = $('#amount_sell').val();
	sell_hash(username, tag_name, challengeID, amount);
	clear_searches();
}

function hashtag_search_clicked() {
    rename_page('Hashtag Investment');
    current_tag = document.getElementById('hsearch').value;
    document.getElementById('hashtag_name').innerHTML='#'n + current_tag;
    switch_to_tag(user_name, document.getElementById('hsearch').value, 0);
    clear_searches(); hide_all();
    document.getElementById('chartdiv').innerHTML=''
    socket.emit('chart_request' , { tagname : current_tag , user_name : user_name } );show_hashtag_page();
}

//<!-- allows the user to hit enter instead of clicking a button -->e
function enter_click(button,e)
{
    var event = e || window.event;
    var key = event.keyCode;
    
    if (key == 13)
    {
        var btn = document.getElementById(button);
        if (btn != null)
        {
            //If we find the button click it
            btn.click();
            event.preventDefault();
        }
    }
}





