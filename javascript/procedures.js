
function connectProcedure(message) //TODO 
{

	var userName = getCookie( "user_name" )
	// If you already have logged in let the server know about your new socket
	if( userName )
	{
		var passWord = getCookie( "pass_word");
		socket.emit( "re_establish" , { user_name : userName , pass_word : passWord	} );
		
	var userObj = { user_name : userName , pass_word : passWord	};
	
		if ( firstTime )
		{
			socket.emit( "trending_request"        , { user_name : user_name });
			socket.emit( 'leader_request' ,          { user_name : user_name });
			firstTime = false;
		}
	}
	else
	{
	
		if( window.location.pathname != "/index.html")
			window.location.replace("index.html");
	
	}
	

}


// handle a login
function loginProcedure(message)
{
	setCookie( "user_name" , message.user , 1);
	setCookie( "pass_word" , message.pass , 1);
	
	var loc = message.loc;
	window.location.replace(loc);
}



// update the user info in the appropriate areas on a hashtag page
function tagProcedure(message) 
{
	var total = message.value * message.user_invested;
	document.getElementById("current_value").innerHTML = total;
	document.getElementById("my_uninvested_points").innerHTML= message.available_points;
	document.getElementById("current_stock_count").innerHTML = message.user_invested;
	document.getElementById("total_shares").innerHTML = message.total_invested;
	document.getElementById("value_per_share").innerHTML = message.value;
}


// update the trending hashtags table
function trendingProcedure(message)
{
    var table1 = "<table width=75%; class='center';> <caption>Trending Hashtags</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";
	
	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		table2 = table2 + "<tr><td width=50%>#" + message[x].name + "</td><td>" + message[x].count + "</td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("trending").innerHTML=finaltable;
}

function myInvestmentsProcedure(message) //Changed to have three columns , tagname , #stocks , total value
{
	var table1 = "<table width=75%; class='center';> <caption>Investments</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";
	
	//Required from message
	//message[0].tagname message[0].count 'how many stocks user has'  message[0].value 'how much each stock is worth'
	
	// fill the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		table2 = table2 + "<tr><td width=50%>#" + message[x].tagname + "</td><td>" + message[x].count + "</td>><td>" + 
		(message[x].value * message[x].count) + "</td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("investments_summary").innerHTML=finaltable;
	document.getElementById("investments_all").innerHTML=finaltable;
}

function leaderProcedure(message)
{

	var table1 = "<table width=75%; class='center';> <caption>Leader Board</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";
	
	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		table2 = table2 + "<tr><td width=50%><a onclick=\"rename_page('Portfolio'); hide_all(); " +
		"show_portfolio('" + message[x].username + "');\"> " + message[x].username + " </ a></td><td>" + message[x].TotalValue + 
		"</td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("leaderboard").innerHTML=finaltable;
}
function playerInfoProcedure(message) //TODO might need change here
{
	var table1 = "<table width=75%; class='center';> <caption>" + message.username + "</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";
	
	var uninvested = message.AvailablePoints;
	var total      = message.TotalValue;
	var invested = total - uninvested;
		
		table2 = table2 + "<tr><td width=50%>Uninvested Points </td><td>" +     uninvested + "</td></tr>";
		table2 = table2 + "<tr><td width=50%>Value of owned stocks </td><td>" + invested + "</td></tr>";
		table2 = table2 + "<tr><td width=50%>Net Worth </td><td>" + total + "</td></tr>";
	

	var finaltable = table1 + table2 + table3;
	document.getElementById("player_info").innerHTML=finaltable;
}

function userProcedure(message) 
{
	var table1 = "<table style=border:0px solid black;>";
	var table2 = "";
    var table3 = "</table> <BR> <BR>";
    
    for (var x = 0; x < message.length; x++ )
    {
    	table2 = table2 + "<tr><td>" + message[x] + "</td></tr>";
    	//maybe also add a button to go to their profile
    }
    
    var finaltable = table1 + table2 + table3;
    document.getElementById("user_search_results").innerHTML = finaltable;
}


function friendsProcedure(message) //No change needed here
{
	var table1 = "<table width=75%; class='center';> <caption>Friends</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";

	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		table2 = table2 + "<tr><td width=50%>" + message[x].Friend + "</td><td>" + message[x].TotalValue + "</td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("friends").innerHTML=finaltable;
}

function friendRequestsProcedure(message) //No change needed here
{
	var table1 = "<table width=75%; class='center';> <caption>Friend Requests</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";

	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		table2 = table2 + "<tr><td width=50%>" + message[x].sender + "</td><td width=25%><button type='button' onclick=\"acceptFriend( '"; 
		table2 = table2 + message[x].receiver + "' , '" + message[x].sender + "' );\"> Accept </ button></ td><td width=25%>";
		table2 = table2 + "<button type='button' onclick=\"declineFriend( '" + message[x].receiver + "' , '" + message[x].sender + "' );\"> Decline </ button></ td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("friend_requests").innerHTML=finaltable;
}

// present the user with a warning

function warningProcedure(message)
{
	alert(message.content);
}

function chartProcedure(message){

chartData = message;
var chart = new AmCharts.AmSerialChart();
chart.dataProvider = chartData;
chart.categoryField = "time";


var chartScrollbar = new AmCharts.ChartScrollbar();
chart.addChartScrollbar(chartScrollbar);

var graph = new AmCharts.AmGraph();
graph.valueField = "value"; //This changed to a tags stock value at each time
graph.type = "line";
chart.addGraph(graph);

var categoryAxis = chart.categoryAxis;
categoryAxis.autoGridCount  = true;
categoryAxis.gridPosition = "start";
categoryAxis.labelRotation = 90;

graph.type = "line";
graph.fillAlphas = 0; // or delete this line, as 0 is default
//graph.bullet = "round";
//graph.lineColor = "#8d1cc6"

chart.write('chartdiv');
}
