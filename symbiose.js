/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * symbiose implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * symbiose.js
 *
 * symbiose user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter"
],
function (dojo, declare) {
    return declare("bgagame.symbiose", ebg.core.gamegui, {
        constructor: function(){
            console.log('symbiose constructor');
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;

        },
        
        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        
/////////////////////////////////////////////////////////////////////////////////           
//    _____                      _____        _            
//   / ____|                    |  __ \      | |           
//  | |  __  __ _ _ __ ___   ___| |  | | __ _| |_ __ _ ___ 
//  | | |_ |/ _` | '_ ` _ \ / _ \ |  | |/ _` | __/ _` / __|
//  | |__| | (_| | | | | | |  __/ |__| | (_| | || (_| \__ \
//   \_____|\__,_|_| |_| |_|\___|_____/ \__,_|\__\__,_|___/
//                                                        
/////////////////////////////////////////////////////////////////////////////////
        
setup: function( gamedatas )
{
    console.log( "Starting game setup" );

            
    // TODO: Set up your game interface here, according to "gamedatas"

    this.players = gamedatas.players; // A RAJOUTER POUR MOTEUR (UTILITY METHODS)

    this.createBoard();


    for( var card in gamedatas.cards )   
        {
            var card = gamedatas.cards[card];

            this.addCard(card.id, card.type, card.location, card.location_arg, card.visible);
        }

    
    

    // Setup game notifications to handle (see "setupNotifications" method below)
    this.setupNotifications();

    dojo.query(".card").connect('onclick', this, 'onSelect' )
    dojo.query(".cardback").connect('onclick', this, 'onSelect' )
    

    console.log( "Ending game setup" );
},

/////////////////////////////////////////////////////////////////////////////////   
//         _____ _        _            
//        / ____| |      | |           
//       | (___ | |_ __ _| |_ ___  ___ 
//        \___ \| __/ _` | __/ _ \/ __|
//        ____) | || (_| | ||  __/\__ \
//       |_____/ \__\__,_|\__\___||___/
//                                    
/////////////////////////////////////////////////////////////////////////////////    


///////////////////////////////////////////////////
//// Game & client states

// onEnteringState: this method is called each time we are entering into a new game state.
//                  You can use this method to perform some user interface changes at this moment.
//
onEnteringState: function( stateName, args )
{
    console.log( 'Entering state: '+stateName, args );

    dojo.query(".selectable").removeClass("selectable");
    dojo.query(".selected").removeClass("selected");
    
    
    
    switch( stateName )
    {
    
    case 'playerTurn':
        this.args = args.args;
        for( var sid in this.args.selectable)
        {
            if(this.isCurrentPlayerActive())
            {
                dojo.query("#"+this.args.selectable[sid]).addClass("selectable");
            }
        }

        for( var sid in this.args.selected)
        {
            if(this.isCurrentPlayerActive())
            {
                dojo.query("#"+this.args.selectable[sid]).addClass("selected");
            }
        }

          

        if( this.isCurrentPlayerActive() )
        {
            if(args.args.titleyou != null)
            {
                $('pagemaintitletext').innerHTML = this.format_string_recursive((args.args.titleyou).replace('${you}', this.divYou()).replace(/#opponent#/g,args.args.opponent).replace('#nb#',args.args.nb).replace('#nb2#',args.args.nb2).replace('#icon#',args.args.icon).replace('#icon2#',args.args.icon2), args.args);
            }
        } 
            
        else
        {
            if(args.args.title != null)
            {
                $('pagemaintitletext').innerHTML = this.format_string_recursive(_(args.args.title).replace('${actplayer}', this.divActPlayer()).replace('#nb#',args.args.nb).replace('#nb2#',args.args.nb2).replace('#icon#',args.args.icon).replace('#icon2#',args.args.icon2), args.args);  
            }
        }

        
        break;




    case 'playerTurnMulti':
        this.args = args.args;

        if(this.isCurrentPlayerActive())
        {
        for( var sid in this.args['selectable'][this.getCurrentPlayerId()])
            {
                dojo.query("#"+this.args['selectable'][this.getCurrentPlayerId()][sid]).addClass("selectable");
            }

        }
    break;


   
    case 'dummmy':
        break;
    }
},

// onLeavingState: this method is called each time we are leaving a game state.
//                 You can use this method to perform some user interface changes at this moment.
//
onLeavingState: function( stateName )
{
    console.log( 'Leaving state: '+stateName );
    
    switch( stateName )
    {
    
    /* Example:
    
    case 'myGameState':
    
        // Hide the HTML block we are displaying only during this game state
        dojo.style( 'my_html_block_id', 'display', 'none' );
        
        break;
   */
   
   
    case 'dummy':
        break;
    }               
}, 

// onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
//                        action status bar (ie: the HTML links in the status bar).
//        
onUpdateActionButtons: function( stateName, args )
{
    console.log( 'onUpdateActionButtons: '+stateName, args );
              
    if( this.isCurrentPlayerActive() )
        {            
            switch( stateName )
            {

                case "playerTurn":
                    for( var nb in args.buttons )
                     { 
                             
                             if(args.buttons[nb] == "cancel")
                             {
                                this.addActionButton( 'cancel', _("Cancel") ,'onOpButton', null, null, 'red' );
                             }
                             if(args.buttons[nb] == "pass")
                             {
                                this.addActionButton( 'pass', _("Pass") ,'onOpButton', null, null, 'red' );
                             }
                    }
                              
                    
                    break;



            }
        }
},        

/////////////////////////////////////////////////////////////////////////////////         
//   _    _ _   _ _ _ _                          _   _               _     
//  | |  | | | (_) (_) |                        | | | |             | |    
//  | |  | | |_ _| |_| |_ _   _   _ __ ___   ___| |_| |__   ___   __| |___ 
//  | |  | | __| | | | __| | | | | '_ ` _ \ / _ \ __| '_ \ / _ \ / _` / __|
//  | |__| | |_| | | | |_| |_| | | | | | | |  __/ |_| | | | (_) | (_| \__ \
//   \____/ \__|_|_|_|\__|\__, | |_| |_| |_|\___|\__|_| |_|\___/ \__,_|___/
//                         __/ |                                           
//                        |___/                                            
/////////////////////////////////////////////////////////////////////////////////  

divYou : function() {
    
var color = this.players[this.player_id].color;
var color_bg = "";
var you = "<span style=\"font-weight:bold;color:#" + color + ";" + color_bg + "\">" + _("You") + "</span>";
return you;
},

divActPlayer : function() {        	
var color = this.players[this.getActivePlayerId()].color;
var name = this.players[this.getActivePlayerId()].name;
var color_bg = "";
var you = "<span style=\"font-weight:bold;color:#" + color + ";" + color_bg + "\">" + name + "</span>";
return you;
},

format_string_recursive : function(log, args) {
try {
if (log && args && !args.processed) {
    args.processed = true;

    
}
} catch (e) {
console.error(log,args,"Exception thrown", e.stack);
}
return this.inherited(arguments);
},

attachToNewParentNoDestroy: function (mobile_in, new_parent_in, relation, place_position) 
{

const mobile = $(mobile_in);
const new_parent = $(new_parent_in);

var src = dojo.position(mobile);
if (place_position)
    mobile.style.position = place_position;
dojo.place(mobile, new_parent, relation);
mobile.offsetTop;//force re-flow
var tgt = dojo.position(mobile);
var box = dojo.marginBox(mobile);
var cbox = dojo.contentBox(mobile);
var left = box.l + src.x - tgt.x;
var top = box.t + src.y - tgt.y;

mobile.style.position = "absolute";
mobile.style.left = left + "px";
mobile.style.top = top + "px";
box.l += box.w - cbox.w;
box.t += box.h - cbox.h;
mobile.offsetTop;//force re-flow
return box;
},


createBoard: function() {

    const parent = document.getElementById("board");

    const River = document.createElement("div");
    River.id = "river";
    River.className = "river";

    River.innerHTML = 
                    `<div id="river_1" class="cardposition" style="left: 0px; top: 0px;"></div>
                    <div id="river_2" class="cardposition" style="left: 160px; top: 0px;"></div>
                    <div id="river_3" class="cardposition" style="left: 320px; top: 0px;"></div>
                    <div id="river_4" class="cardposition" style="left: 480px; top: 0px;"></div>`;

    parent.appendChild(River);
    
  

    for( var player_id in this.gamedatas.new_ordre_players)   
    {
        var player = this.gamedatas.new_ordre_players[player_id];  // le nouvel ordre
               
        const Playercards = document.createElement("div");
        Playercards.id = "player_cards_"+player_id;
        Playercards.className = "player_cards";

        Playercards.innerHTML = 
                    `
                    <div class="nameplayer" style="color: #${this.gamedatas.players[player].color}; left: 0px; top: 0px; border: 1px solid #${this.gamedatas.players[player].color};">${this.gamedatas.players[player].name}</div>
                    <div id="cardposition_1_${player}" class="cardposition" style="left: 0px; top: 25px;"></div>
                    <div id="cardposition_2_${player}" class="cardposition" style="left: 160px; top: 25px;"></div>
                    <div id="cardposition_3_${player}" class="cardposition" style="left: 320px; top: 25px;"></div>
                    <div id="cardposition_4_${player}" class="cardposition" style="left: 480px; top: 25px;"></div>

                    <div id="cardposition_5_${player}" class="cardposition" style="left: 0px; top: 260px;"></div>
                    <div id="cardposition_6_${player}" class="cardposition" style="left: 160px; top: 260px;"></div>
                    <div id="cardposition_7_${player}" class="cardposition" style="left: 320px; top: 260px;"></div>
                    <div id="cardposition_8_${player}" class="cardposition" style="left: 480px; top: 260px;"></div>
                    `;

    parent.appendChild(Playercards);

    }

},

addCard: function( id, type, location, location_arg, visible )  
{

    if( visible == 0)
    {
        dojo.place( this.format_block( 'jstpl_cardback', {
            id: id,
            
                                
        } ) , location+'_'+location_arg );

    }

    else
    {
        if((type>=1)&&(type <= 6))
            {
                
                dojo.place( this.format_block( 'jstpl_card', {
                    id: id,
                    x: (type-1)*(-100),
                    y: 0,
                    
                                        
                } ) , location+'_'+location_arg );
            }
        if((type>=7)&&(type <= 12))
            {
                
                dojo.place( this.format_block( 'jstpl_card', {
                    id: id,
                    x: (type-7)*(-100),
                    y: -100,
                    
                                        
                } ) , location+'_'+location_arg );
            }

        if((type>=13)&&(type <= 18))
            {
                
                dojo.place( this.format_block( 'jstpl_card', {
                    id: id,
                    x: (type-13)*(-100),
                    y: -200,
                    
                                        
                } ) , location+'_'+location_arg );
            }

            if((type>=19)&&(type <= 24))
                {
                    
                    dojo.place( this.format_block( 'jstpl_card', {
                        id: id,
                        x: (type-19)*(-100),
                        y: -300,
                        
                                            
                    } ) , location+'_'+location_arg );
                }
            if((type>=25)&&(type <= 30))
                {
                    
                    dojo.place( this.format_block( 'jstpl_card', {
                        id: id,
                        x: (type-25)*(-100),
                        y: -400,
                        
                                            
                    } ) , location+'_'+location_arg );
                }
    
            if((type>=31)&&(type <= 36))
                {
                    
                    dojo.place( this.format_block( 'jstpl_card', {
                        id: id,
                        x: (type-31)*(-100),
                        y: -500,
                        
                                            
                    } ) , location+'_'+location_arg );
                }


    }

},



/////////////////////////////////////////////////////////////////////////////////  
//         _____  _                       _                  _   _             
//        |  __ \| |                     ( )                | | (_)            
//        | |__) | | __ _ _   _  ___ _ __|/ ___    __ _  ___| |_ _  ___  _ __  
//        |  ___/| |/ _` | | | |/ _ \ '__| / __|  / _` |/ __| __| |/ _ \| '_ \ 
//        | |    | | (_| | |_| |  __/ |    \__ \ | (_| | (__| |_| | (_) | | | |
//        |_|    |_|\__,_|\__, |\___|_|    |___/  \__,_|\___|\__|_|\___/|_| |_|
//                         __/ |                                               
//                        |___/                                                
/////////////////////////////////////////////////////////////////////////////////  

        
onSelect: function(evt)
{        	 
    // Preventing default browser reaction
     dojo.stopEvent( evt );

    
     
    if( !this.isCurrentPlayerActive() || !(evt.currentTarget.classList.contains('selectable')) )
    {   
        return; 
    }
    
    if(this.isCurrentPlayerActive() && evt.currentTarget.classList.contains('selectable'))
    {
        
        this.bgaPerformAction('actSelect', { arg1: evt.currentTarget.id });
    }

},

onOpButton: function(evt)
{
    
    // Preventing default browser reaction
    dojo.stopEvent( evt );
    
    this.bgaPerformAction('actButton', { arg1: evt.currentTarget.id });
    
    

},


///////////////////////////////////////////////////////////////////////////////// 
//       _   _       _   _  __ _           _   _                 
//      | \ | |     | | (_)/ _(_)         | | (_)                
//      |  \| | ___ | |_ _| |_ _  ___ __ _| |_ _  ___  _ __  ___ 
//      | . ` |/ _ \| __| |  _| |/ __/ _` | __| |/ _ \| '_ \/ __|
//      | |\  | (_) | |_| | | | | (_| (_| | |_| | (_) | | | \__ \
//      |_| \_|\___/ \__|_|_| |_|\___\__,_|\__|_|\___/|_| |_|___/
//                                                                 
/////////////////////////////////////////////////////////////////////////////////  

setupNotifications: function()
{
    console.log( 'notifications subscriptions setup' );
    
    // TODO: here, associate your game notifications with local methods
    
    // Example 1: standard notification handling
    // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
    
    // Example 2: standard notification handling + tell the user interface to wait
    //            during 3 seconds after calling the method in order to let the players
    //            see what is happening in the game.
    // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
    // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
    // 

    dojo.subscribe( 'firstcard', this, "notif_firstcard" );
    dojo.subscribe( 'flip', this, "notif_flip" );
},  

notif_firstcard: function( notif )
{
    
    for( var index in notif.args.cards)
    {
        dojo.query("#card_"+notif.args.cards[index]).removeClass("selectable");
    }
   
    
},

notif_flip: function( notif )
{
    console.warn (notif.args.card);
    
    
},










});             
});
