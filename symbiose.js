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

    if (gamedatas.scoring_mode == 2)
    {
    for( var player_id in gamedatas.players )   
        {
                             
            var player_board_div = $('player_board_'+player_id);
            dojo.place( this.format_block('jstpl_scorepad', {id: player_id} ), player_board_div );

            
            for (var i=1; i<=8; i++)
            {
                if (gamedatas.players[player_id]['score' + i] >= 0) {
                    document.getElementById('score' + i + '_' + player_id).innerHTML = gamedatas.players[player_id]['score' + i];
                }

            }
            
            
            
        }
    }

    if ((gamedatas.scoring_mode == 1)&&(gamedatas.end == 1))
        {
        for( var player_id in gamedatas.players )   
            {
                                 
                var player_board_div = $('player_board_'+player_id);
                dojo.place( this.format_block('jstpl_scorepad', {id: player_id} ), player_board_div );
    
                
                for (var i=1; i<=8; i++)
                {
                    if (gamedatas.players[player_id]['score' + i] >= 0) {
                        document.getElementById('score' + i + '_' + player_id).innerHTML = gamedatas.players[player_id]['score' + i];
                    }
    
                }
                
                
                
            }
        }



    this.createBoard();


    for( var card in gamedatas.cards )   
        {
            var card = gamedatas.cards[card];

            this.addCard(card.id, card.type, card.location, card.location_arg, card.visible);
        }

    
    

    // Setup game notifications to handle (see "setupNotifications" method below)
    this.setupNotifications();

        

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

    //dojo.query(".selectable").removeClass("selectable");
    //dojo.query(".selected").removeClass("selected");
    
    
    
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
                dojo.query("#"+this.args.selected[sid]).addClass("selected");
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

    dojo.query(".selectable").removeClass("selectable");
    dojo.query(".selected").removeClass("selected");
    
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
    
    if ((this.gamedatas.nbre_players == 2)&&(this.gamedatas.game_mode == 2))
    {
        parent.className = "board2_1";

            const Playercards0 = document.createElement("div");
            Playercards0.id = "player_cards_0";
            Playercards0.className = "player_cards";
            Playercards0.innerHTML = 
                                `
                                <div class="nameplayer" style="color: #${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].color}; left: 0px; top: 0px; border: 1px solid #${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].color};">${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].name}</div>
                                <div id="cardposition_1_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 0px; top: 30px;"></div>
                                <div id="cardposition_2_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 160px; top: 30px;"></div>
                                <div id="cardposition_3_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 320px; top: 30px;"></div>
                                <div id="cardposition_4_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 480px; top: 30px;"></div>
        
                                <div id="cardposition_5_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 0px; top: 265px;"></div>
                                <div id="cardposition_6_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 160px; top: 265px;"></div>
                                <div id="cardposition_7_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 320px; top: 265px;"></div>
                                <div id="cardposition_8_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 480px; top: 265px;"></div>
                                `;
        
            parent.appendChild(Playercards0);
    
                     
            
    
            const Playercards2_name = document.createElement("div");
            const Playercards2 = document.createElement("div");
            Playercards2.id = "player_cards_2";
            Playercards2.className = "player_cards_mini";
            Playercards2_name.innerHTML = 
                                `
                                <div class="nameplayer_mini_2_2" style="color: #${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].color}; border: 1px solid #${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].color};">${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].name}</div>
                                `;
            Playercards2.innerHTML = 
                                `
                                <div id="cardposition_1_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 0px; top: 0px;"></div>
                                <div id="cardposition_2_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 110px; top: 0px;"></div>
                                <div id="cardposition_3_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 220px; top: 0px;"></div>
                                <div id="cardposition_4_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 330px; top: 0px;"></div>
        
                                <div id="cardposition_5_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 0px; top: 160px;"></div>
                                <div id="cardposition_6_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 110px; top: 160px;"></div>
                                <div id="cardposition_7_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 220px; top: 160px;"></div>
                                <div id="cardposition_8_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 330px; top: 160px;"></div>
                                `;
        
            parent.appendChild(Playercards2_name);
            parent.appendChild(Playercards2);


                
            dojo.query("#player_cards_0").addClass("position_0_2_1");
            dojo.query("#player_cards_2").addClass("position_2_2");
            


            const River = document.createElement("div");
            River.id = "river";
            River.className = "river2_2";

            River.innerHTML = 
                            `<div id="river_1" class="card_position" style="left: 10px; top: 10px;"></div>
                            <div id="river_2" class="card_position" style="left: 170px; top: 10px;"></div>
                            <div id="river_3" class="card_position" style="left: 330px; top: 10px;"></div>
                            <div id="river_4" class="card_position" style="left: 490px; top: 10px;"></div>`;

            parent.appendChild(River);
    }

    if ((this.gamedatas.nbre_players == 2)&&(this.gamedatas.game_mode == 1))
        {
            parent.className = "board2";
    
            var current_id = this.getCurrentPlayerId();
            var ordre = this.gamedatas.players[current_id].no;

            
            if (ordre == 1)
            {

                const Playercards0 = document.createElement("div");
                Playercards0.id = "player_cards_0";
                Playercards0.className = "player_cards";
                Playercards0.innerHTML = 
                                    `
                                    <div class="nameplayer" style="color: #${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].color}; left: 0px; top: 0px; border: 1px solid #${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].color};">${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].name}</div>
                                    <div id="cardposition_1_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 0px; top: 30px;"></div>
                                    <div id="cardposition_2_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 160px; top: 30px;"></div>
                                    <div id="cardposition_3_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 320px; top: 30px;"></div>
                                    <div id="cardposition_4_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 480px; top: 30px;"></div>
            
                                    <div id="cardposition_5_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 0px; top: 265px;"></div>
                                    <div id="cardposition_6_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 160px; top: 265px;"></div>
                                    <div id="cardposition_7_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 320px; top: 265px;"></div>
                                    <div id="cardposition_8_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 480px; top: 265px;"></div>
                                    `;
            
                parent.appendChild(Playercards0);
        
                              
                
        
                const Playercards2_name = document.createElement("div");
                const Playercards2 = document.createElement("div");
                Playercards2.id = "player_cards_2";
                Playercards2.className = "player_cards_mini";
                Playercards2_name.innerHTML = 
                                    `
                                    <div class="nameplayer_mini_2_2_duel" style="color: #${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].color}; border: 1px solid #${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].color};">${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].name}</div>
                                    `;
                Playercards2.innerHTML = 
                                    `
                                    <div id="cardposition_1_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 0px; top: 0px;"></div>
                                    <div id="cardposition_2_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 110px; top: 0px;"></div>
                                    <div id="cardposition_3_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 220px; top: 0px;"></div>
                                    <div id="cardposition_4_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 330px; top: 0px;"></div>
            
                                    <div id="cardposition_5_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 0px; top: 160px;"></div>
                                    <div id="cardposition_6_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 110px; top: 160px;"></div>
                                    <div id="cardposition_7_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 220px; top: 160px;"></div>
                                    <div id="cardposition_8_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 330px; top: 160px;"></div>
                                    `;
            
                parent.appendChild(Playercards2_name);
                parent.appendChild(Playercards2);
    
    
                    
                dojo.query("#player_cards_0").addClass("position_0_2");
                dojo.query("#player_cards_2").addClass("position_2_2_duel");
                
    
    
                const River = document.createElement("div");
                River.id = "river";
                River.className = "river2_3";
    
                River.innerHTML = 
                `<div id="river_1" class="card_position_mini" style="left: 10px; top: 10px;"></div>
                <div id="river_2" class="card_position_mini" style="left: 120px; top: 10px;"></div>
                <div id="river_3" class="card_position_mini" style="left: 230px; top: 10px;"></div>
                <div id="river_4" class="card_position_mini" style="left: 340px; top: 10px;"></div>
                <div id="river_5" class="card_position_mini" style="left: 10px; top: 170px;"></div>
                <div id="river_6" class="card_position_mini" style="left: 120px; top: 170px;"></div>
                <div id="river_7" class="card_position_mini" style="left: 230px; top: 170px;"></div>
                <div id="river_8" class="card_position_mini" style="left: 340px; top: 170px;"></div>`;

                parent.appendChild(River);

            }


            if (ordre == 2)
                {
                    
    
                    const Playercards0 = document.createElement("div");
                    Playercards0.id = "player_cards_0";
                    Playercards0.className = "player_cards";
                    Playercards0.innerHTML = 
                                        `
                                        <div class="nameplayer" style="color: #${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].color}; left: 0px; top: 0px; border: 1px solid #${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].color};">${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].name}</div>
                                        <div id="cardposition_1_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 0px; top: 30px;"></div>
                                        <div id="cardposition_2_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 160px; top: 30px;"></div>
                                        <div id="cardposition_3_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 320px; top: 30px;"></div>
                                        <div id="cardposition_4_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 480px; top: 30px;"></div>
                
                                        <div id="cardposition_5_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 0px; top: 265px;"></div>
                                        <div id="cardposition_6_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 160px; top: 265px;"></div>
                                        <div id="cardposition_7_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 320px; top: 265px;"></div>
                                        <div id="cardposition_8_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 480px; top: 265px;"></div>
                                        `;
                
                    parent.appendChild(Playercards0);
            
                    
                    
                    
            
                    const Playercards2_name = document.createElement("div");
                    const Playercards2 = document.createElement("div");
                    Playercards2.id = "player_cards_2";
                    Playercards2.className = "player_cards_mini";
                    Playercards2_name.innerHTML = 
                                        `
                                        <div class="nameplayer_mini_2_2_duel_2" style="color: #${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].color}; border: 1px solid #${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].color};">${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].name}</div>
                                        `;
                    Playercards2.innerHTML = 
                                        `
                                        <div id="cardposition_1_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 0px; top: 0px;"></div>
                                        <div id="cardposition_2_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 110px; top: 0px;"></div>
                                        <div id="cardposition_3_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 220px; top: 0px;"></div>
                                        <div id="cardposition_4_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 330px; top: 0px;"></div>
                
                                        <div id="cardposition_5_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 0px; top: 160px;"></div>
                                        <div id="cardposition_6_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 110px; top: 160px;"></div>
                                        <div id="cardposition_7_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 220px; top: 160px;"></div>
                                        <div id="cardposition_8_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 330px; top: 160px;"></div>
                                        `;
                
                    parent.appendChild(Playercards2_name);
                    parent.appendChild(Playercards2);
        
        
                        
                    dojo.query("#player_cards_0").addClass("position_0_2");
                    dojo.query("#player_cards_2").addClass("position_2_2_duel_2");
                    
        
        
                    const River = document.createElement("div");
                    River.id = "river";
                    River.className = "river2_4";
        
                    River.innerHTML = 
                    `<div id="river_1" class="card_position_mini" style="left: 10px; top: 10px;"></div>
                    <div id="river_2" class="card_position_mini" style="left: 120px; top: 10px;"></div>
                    <div id="river_3" class="card_position_mini" style="left: 230px; top: 10px;"></div>
                    <div id="river_4" class="card_position_mini" style="left: 340px; top: 10px;"></div>
                    <div id="river_5" class="card_position_mini" style="left: 10px; top: 170px;"></div>
                    <div id="river_6" class="card_position_mini" style="left: 120px; top: 170px;"></div>
                    <div id="river_7" class="card_position_mini" style="left: 230px; top: 170px;"></div>
                    <div id="river_8" class="card_position_mini" style="left: 340px; top: 170px;"></div>`;
    
                    parent.appendChild(River);
    
                }


        }


    if (this.gamedatas.nbre_players == 3)
    {
        parent.className = "board3";

        const Playercards0 = document.createElement("div");
        Playercards0.id = "player_cards_0";
        Playercards0.className = "player_cards";
        Playercards0.innerHTML = 
                            `
                            <div class="nameplayer" style="color: #${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].color}; left: 0px; top: 0px; border: 1px solid #${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].color};">${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].name}</div>
                            <div id="cardposition_1_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 0px; top: 30px;"></div>
                            <div id="cardposition_2_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 160px; top: 30px;"></div>
                            <div id="cardposition_3_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 320px; top: 30px;"></div>
                            <div id="cardposition_4_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 480px; top: 30px;"></div>
    
                            <div id="cardposition_5_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 0px; top: 265px;"></div>
                            <div id="cardposition_6_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 160px; top: 265px;"></div>
                            <div id="cardposition_7_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 320px; top: 265px;"></div>
                            <div id="cardposition_8_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 480px; top: 265px;"></div>
                            `;
    
        parent.appendChild(Playercards0);

        const Playercards1_name = document.createElement("div");
        const Playercards1 = document.createElement("div");
        
        Playercards1.id = "player_cards_1";
        Playercards1.className = "player_cards_mini";
        Playercards1_name.innerHTML = 
                            `
                            <div class="nameplayer_mini_1_3" style="color: #${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].color}; border: 1px solid #${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].color};">${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].name}</div>
                            `;
        Playercards1.innerHTML = 
                            `
                            <div id="cardposition_1_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 0px; top: 0px;"></div>
                            <div id="cardposition_2_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 110px; top: 0px;"></div>
                            <div id="cardposition_3_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 220px; top: 0px;"></div>
                            <div id="cardposition_4_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 330px; top: 0px;"></div>
    
                            <div id="cardposition_5_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 0px; top: 160px;"></div>
                            <div id="cardposition_6_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 110px; top: 160px;"></div>
                            <div id="cardposition_7_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 220px; top: 160px;"></div>
                            <div id="cardposition_8_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 330px; top: 160px;"></div>
                            `;
    
        parent.appendChild(Playercards1_name);
        parent.appendChild(Playercards1);

        const Playercards2_name = document.createElement("div");
        const Playercards2 = document.createElement("div");
        Playercards2.id = "player_cards_3";
        Playercards2.className = "player_cards_mini";
        Playercards2_name.innerHTML = 
                            `
                            <div class="nameplayer_mini_3_3" style="color: #${this.gamedatas.players[this.gamedatas.new_ordre_players[2]].color}; border: 1px solid #${this.gamedatas.players[this.gamedatas.new_ordre_players[2]].color};">${this.gamedatas.players[this.gamedatas.new_ordre_players[2]].name}</div>
                            `;
        Playercards2.innerHTML = 
                            `
                            <div id="cardposition_1_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 0px; top: 0px;"></div>
                            <div id="cardposition_2_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 110px; top: 0px;"></div>
                            <div id="cardposition_3_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 220px; top: 0px;"></div>
                            <div id="cardposition_4_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 330px; top: 0px;"></div>
    
                            <div id="cardposition_5_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 0px; top: 160px;"></div>
                            <div id="cardposition_6_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 110px; top: 160px;"></div>
                            <div id="cardposition_7_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 220px; top: 160px;"></div>
                            <div id="cardposition_8_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 330px; top: 160px;"></div>
                            `;
    
        parent.appendChild(Playercards2_name);
        parent.appendChild(Playercards2);

        dojo.query("#player_cards_0").addClass("position_0_3");
        dojo.query("#player_cards_1").addClass("position_1_3");
        dojo.query("#player_cards_3").addClass("position_3_3");

        const River = document.createElement("div");
        River.id = "river";
        River.className = "river";

        River.innerHTML = 
                            `<div id="river_1" class="card_position" style="left: 10px; top: 10px;"></div>
                            <div id="river_2" class="card_position" style="left: 170px; top: 10px;"></div>
                            <div id="river_3" class="card_position" style="left: 330px; top: 10px;"></div>
                            <div id="river_4" class="card_position" style="left: 490px; top: 10px;"></div>`;

        parent.appendChild(River);
      
            
    }

    if (this.gamedatas.nbre_players == 4)
        {
            parent.className = "board4";

            const Playercards0 = document.createElement("div");
            Playercards0.id = "player_cards_0";
            Playercards0.className = "player_cards";
            Playercards0.innerHTML = 
                                `
                                <div class="nameplayer" style="color: #${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].color}; left: 0px; top: 0px; border: 1px solid #${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].color};">${this.gamedatas.players[this.gamedatas.new_ordre_players[0]].name}</div>
                                <div id="cardposition_1_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 0px; top: 30px;"></div>
                                <div id="cardposition_2_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 160px; top: 30px;"></div>
                                <div id="cardposition_3_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 320px; top: 30px;"></div>
                                <div id="cardposition_4_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 480px; top: 30px;"></div>
        
                                <div id="cardposition_5_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 0px; top: 265px;"></div>
                                <div id="cardposition_6_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 160px; top: 265px;"></div>
                                <div id="cardposition_7_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 320px; top: 265px;"></div>
                                <div id="cardposition_8_${this.gamedatas.new_ordre_players[0]}" class="card_position" style="left: 480px; top: 265px;"></div>
                                `;
        
            parent.appendChild(Playercards0);
    
            const Playercards1_name = document.createElement("div");
            const Playercards1 = document.createElement("div");
            
            Playercards1.id = "player_cards_1";
            Playercards1.className = "player_cards_mini";
            Playercards1_name.innerHTML = 
                                `
                                <div class="nameplayer_mini_1_4" style="color: #${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].color}; border: 1px solid #${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].color};">${this.gamedatas.players[this.gamedatas.new_ordre_players[1]].name}</div>
                                `;
            Playercards1.innerHTML = 
                                `
                                <div id="cardposition_1_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 0px; top: 0px;"></div>
                                <div id="cardposition_2_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 110px; top: 0px;"></div>
                                <div id="cardposition_3_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 220px; top: 0px;"></div>
                                <div id="cardposition_4_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 330px; top: 0px;"></div>
        
                                <div id="cardposition_5_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 0px; top: 160px;"></div>
                                <div id="cardposition_6_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 110px; top: 160px;"></div>
                                <div id="cardposition_7_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 220px; top: 160px;"></div>
                                <div id="cardposition_8_${this.gamedatas.new_ordre_players[1]}" class="card_position_mini" style="left: 330px; top: 160px;"></div>
                                `;
        
            parent.appendChild(Playercards1_name);
            parent.appendChild(Playercards1);
    
            const Playercards2_name = document.createElement("div");
            const Playercards2 = document.createElement("div");
            Playercards2.id = "player_cards_2";
            Playercards2.className = "player_cards_mini";
            Playercards2_name.innerHTML = 
                                `
                                <div class="nameplayer_mini_2_4" style="color: #${this.gamedatas.players[this.gamedatas.new_ordre_players[2]].color}; border: 1px solid #${this.gamedatas.players[this.gamedatas.new_ordre_players[2]].color};">${this.gamedatas.players[this.gamedatas.new_ordre_players[2]].name}</div>
                                `;
            Playercards2.innerHTML = 
                                `
                                <div id="cardposition_1_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 0px; top: 0px;"></div>
                                <div id="cardposition_2_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 110px; top: 0px;"></div>
                                <div id="cardposition_3_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 220px; top: 0px;"></div>
                                <div id="cardposition_4_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 330px; top: 0px;"></div>
        
                                <div id="cardposition_5_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 0px; top: 160px;"></div>
                                <div id="cardposition_6_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 110px; top: 160px;"></div>
                                <div id="cardposition_7_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 220px; top: 160px;"></div>
                                <div id="cardposition_8_${this.gamedatas.new_ordre_players[2]}" class="card_position_mini" style="left: 330px; top: 160px;"></div>
                                `;
        
            parent.appendChild(Playercards2_name);
            parent.appendChild(Playercards2);


            const Playercards3_name = document.createElement("div");
            const Playercards3 = document.createElement("div");
            Playercards3.id = "player_cards_3";
            Playercards3.className = "player_cards_mini";
            Playercards3_name.innerHTML = 
                                `
                                <div class="nameplayer_mini_3_4" style="color: #${this.gamedatas.players[this.gamedatas.new_ordre_players[3]].color}; border: 1px solid #${this.gamedatas.players[this.gamedatas.new_ordre_players[3]].color};">${this.gamedatas.players[this.gamedatas.new_ordre_players[3]].name}</div>
                                `;
            Playercards3.innerHTML = 
                                `
                                <div id="cardposition_1_${this.gamedatas.new_ordre_players[3]}" class="card_position_mini" style="left: 0px; top: 0px;"></div>
                                <div id="cardposition_2_${this.gamedatas.new_ordre_players[3]}" class="card_position_mini" style="left: 110px; top: 0px;"></div>
                                <div id="cardposition_3_${this.gamedatas.new_ordre_players[3]}" class="card_position_mini" style="left: 220px; top: 0px;"></div>
                                <div id="cardposition_4_${this.gamedatas.new_ordre_players[3]}" class="card_position_mini" style="left: 330px; top: 0px;"></div>
        
                                <div id="cardposition_5_${this.gamedatas.new_ordre_players[3]}" class="card_position_mini" style="left: 0px; top: 160px;"></div>
                                <div id="cardposition_6_${this.gamedatas.new_ordre_players[3]}" class="card_position_mini" style="left: 110px; top: 160px;"></div>
                                <div id="cardposition_7_${this.gamedatas.new_ordre_players[3]}" class="card_position_mini" style="left: 220px; top: 160px;"></div>
                                <div id="cardposition_8_${this.gamedatas.new_ordre_players[3]}" class="card_position_mini" style="left: 330px; top: 160px;"></div>
                                `;
        
            parent.appendChild(Playercards3_name);
            parent.appendChild(Playercards3);
    
            dojo.query("#player_cards_0").addClass("position_0_4");
            dojo.query("#player_cards_1").addClass("position_1_4");
            dojo.query("#player_cards_2").addClass("position_2_4");
            dojo.query("#player_cards_3").addClass("position_3_4");


            const River = document.createElement("div");
            River.id = "river";
            River.className = "river2";

            River.innerHTML = 
                            `<div id="river_1" class="card_position" style="left: 10px; top: 10px;"></div>
                            <div id="river_2" class="card_position" style="left: 170px; top: 10px;"></div>
                            <div id="river_3" class="card_position" style="left: 330px; top: 10px;"></div>
                            <div id="river_4" class="card_position" style="left: 490px; top: 10px;"></div>`;

            parent.appendChild(River);
          
                
        }

    

    




    

},

addCard: function( id, type, location, location_arg, visible, rotate=0, scalable=1 )  
{

    if(( visible == 0)||( visible == 2))
    {
        dojo.place( this.format_block( 'jstpl_cardback', {
            id: id,
            
                                
        } ) , location+'_'+location_arg );

        dojo.query("#card_"+id+"_back").connect('onclick', this, 'onSelect' )

        if((visible == 2)&&(location_arg == this.getCurrentPlayerId()))
        {
            
            dojo.query("#card_"+id+"_back").addClass("selected");
        }

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

    dojo.query("#card_"+id).connect('onclick', this, 'onSelect' )

        
    }

    if(rotate == 1)
    {
        dojo.query("#card_"+id).addClass("rotate");
    }

    if(scalable == 1)
    {
        dojo.query("#card_"+id).addClass("scalable"); 
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
    dojo.subscribe( 'switch', this, "notif_switch" );
    dojo.subscribe( 'score', this, "notif_score" );
    dojo.subscribe( 'affichescore', this, "notif_affichescore" );

    
},  

notif_firstcard: function( notif )
{
    
    for( var index in notif.args.cards)
    {
        dojo.query("#card_"+notif.args.cards[index]+"_back").removeClass("selectable");

        if (notif.args.player == this.getCurrentPlayerId())
        {
            dojo.query("#card_"+notif.args.cardid+"_back").addClass("selected");
        }
    }
   
    
},

notif_flip: function( notif )
{
        
    this.addCard(notif.args.cardinfo[0].id, notif.args.cardinfo[0].type, notif.args.cardinfo[0].location, notif.args.cardinfo[0].location_arg, 1, 1, 0);
   
    setTimeout(function() {             // 100ms pour attendre que le DOM soit effectif
    dojo.query("#card_"+notif.args.cardinfo[0].id).addClass("flip");
    dojo.query("#card_"+notif.args.cardinfo[0].id+"_back").addClass("flip");
    
    
    }, 100); 


    setTimeout(function() {             // 1500ms pour laisser le temps que le flip soit fini et laisser le temps avant le scalable
    const card = document.getElementById("card_"+notif.args.cardinfo[0].id+"_back");
    card.remove();

    dojo.query("#card_"+notif.args.cardinfo[0].id).addClass("scalable");
    
    
    }, 1500); 

    
},

notif_switch: function( notif )
{
    
    
    const element = document.getElementById(notif.args.card_river);
    element.style.zIndex = "10";
    const target = document.getElementById(notif.args.position_mare+'_'+notif.args.player_id);
    
    const element2 = document.getElementById(notif.args.card_mare);
    element2.style.zIndex = "10";
    const target2 = document.getElementById('river_'+notif.args.position_river);

    const river = document.getElementById('river');

    if (this.instantaneousMode) {
        // Déplacement immédiat pour le mode instantané
        target.appendChild(element);
        target2.appendChild(element2);
    } 
    
    else 
    {

    const parent_niv1 = element.parentElement.id;
    const parent_niv2 = document.getElementById(parent_niv1);
    const parentId = parent_niv2.parentElement.id;  // = "river"

    const parent2_niv1 = element2.parentElement.id;
    const parent2_niv2 = document.getElementById(parent2_niv1);
    const parent2Id = parent2_niv2.parentElement.id;  // = "player_cards_X"

    const elementRect = element.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const elementRect2 = element2.getBoundingClientRect();
    const targetRect2 = target2.getBoundingClientRect();
    
    const deltaX = targetRect.left - elementRect.left;
    const deltaY = targetRect.top - elementRect.top;

    const deltaX2 = targetRect2.left - elementRect2.left;
    const deltaY2 = targetRect2.top - elementRect2.top;

    if(parent2Id == "player_cards_0")
    {
    
        if (river && river.classList.contains('river2_3'))
        {

            
            const globalContainer = document.getElementById(parentId);
            const globalRect = globalContainer.getBoundingClientRect();

            const angle = -90 * (Math.PI / 180); // Rotation de 90° en radians

            // Position ajustée de element2 par rapport à son conteneur global
            const adjustedX = Math.cos(-angle) * (elementRect.left - globalRect.left) - Math.sin(-angle) * (elementRect.top - globalRect.top);
            const adjustedY = Math.sin(-angle) * (elementRect.left - globalRect.left) + Math.cos(-angle) * (elementRect.top - globalRect.top);

            // Position ajustée de la cible
            const adjustedTargetX = Math.cos(-angle) * (targetRect.left - globalRect.left) - Math.sin(-angle) * (targetRect.top - globalRect.top);
            const adjustedTargetY = Math.sin(-angle) * (targetRect.left - globalRect.left) + Math.cos(-angle) * (targetRect.top - globalRect.top);

            // Calcul du déplacement corrigé
            const deltaX = adjustedTargetX - adjustedX;
            const deltaY = adjustedTargetY - adjustedY;


            element.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(0deg)`;
            element2.style.transform = `translate(${deltaX2}px, ${deltaY2}px) rotate(90deg)`;
            
        }

        else if (river && river.classList.contains('river2_4'))
            {

                
                const globalContainer = document.getElementById(parentId);
                const globalRect = globalContainer.getBoundingClientRect();

                const angle = 90 * (Math.PI / 180); // Rotation de 90° en radians

                // Position ajustée de element2 par rapport à son conteneur global
                const adjustedX = Math.cos(-angle) * (elementRect.left - globalRect.left) - Math.sin(-angle) * (elementRect.top - globalRect.top);
                const adjustedY = Math.sin(-angle) * (elementRect.left - globalRect.left) + Math.cos(-angle) * (elementRect.top - globalRect.top);

                // Position ajustée de la cible
                const adjustedTargetX = Math.cos(-angle) * (targetRect.left - globalRect.left) - Math.sin(-angle) * (targetRect.top - globalRect.top);
                const adjustedTargetY = Math.sin(-angle) * (targetRect.left - globalRect.left) + Math.cos(-angle) * (targetRect.top - globalRect.top);

                // Calcul du déplacement corrigé
                const deltaX = adjustedTargetX - adjustedX;
                const deltaY = adjustedTargetY - adjustedY;


                element.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(0deg)`;
                element2.style.transform = `translate(${deltaX2}px, ${deltaY2}px) rotate(-90deg)`;
        
            }

        else
        {
            const deltaX2 = targetRect2.left - elementRect2.left;
            const deltaY2 = targetRect2.top - elementRect2.top;

            element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            element2.style.transform = `translate(${deltaX2}px, ${deltaY2}px)`;

        }
    
    }

    if(parent2Id == "player_cards_1")
    {
        


            const globalContainer2 = document.getElementById(parent2Id);
            const globalRect2 = globalContainer2.getBoundingClientRect();

            const angle = 90 * (Math.PI / 180); // Rotation de 90° en radians

            // Position ajustée de element2 par rapport à son conteneur global
            const adjustedX2 = Math.cos(-angle) * (elementRect2.left - globalRect2.left) - Math.sin(-angle) * (elementRect2.top - globalRect2.top);
            const adjustedY2 = Math.sin(-angle) * (elementRect2.left - globalRect2.left) + Math.cos(-angle) * (elementRect2.top - globalRect2.top);

            // Position ajustée de la cible
            const adjustedTargetX2 = Math.cos(-angle) * (targetRect2.left - globalRect2.left) - Math.sin(-angle) * (targetRect2.top - globalRect2.top);
            const adjustedTargetY2 = Math.sin(-angle) * (targetRect2.left - globalRect2.left) + Math.cos(-angle) * (targetRect2.top - globalRect2.top);

            // Calcul du déplacement corrigé
            const deltaX2 = adjustedTargetX2 - adjustedX2;
            const deltaY2 = adjustedTargetY2 - adjustedY2;
            

            element.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(90deg)`;
            element2.style.transform = `translate(${deltaX2}px, ${deltaY2}px) rotate(-90deg)`;
       
    }

    if(parent2Id == "player_cards_2")
        {

            if (river && river.classList.contains('river2_3'))
                {   
                    const globalContainer = document.getElementById(parentId);
                    const globalRect = globalContainer.getBoundingClientRect();
        
                    const angle = -90 * (Math.PI / 180); // Rotation de 90° en radians
        
                    // Position ajustée de element2 par rapport à son conteneur global
                    const adjustedX = Math.cos(-angle) * (elementRect.left - globalRect.left) - Math.sin(-angle) * (elementRect.top - globalRect.top);
                    const adjustedY = Math.sin(-angle) * (elementRect.left - globalRect.left) + Math.cos(-angle) * (elementRect.top - globalRect.top);
        
                    // Position ajustée de la cible
                    const adjustedTargetX = Math.cos(-angle) * (targetRect.left - globalRect.left) - Math.sin(-angle) * (targetRect.top - globalRect.top);
                    const adjustedTargetY = Math.sin(-angle) * (targetRect.left - globalRect.left) + Math.cos(-angle) * (targetRect.top - globalRect.top);
        
                    // Calcul du déplacement corrigé
                    const deltaX = adjustedTargetX - adjustedX;
                    const deltaY = adjustedTargetY - adjustedY;
        
                    const globalContainer2 = document.getElementById(parent2Id);
                    const globalRect2 = globalContainer2.getBoundingClientRect();
        
                    const angle2 = 90 * (Math.PI / 180); // Rotation de 90° en radians
        
                    // Position ajustée de element2 par rapport à son conteneur global
                    const adjustedX2 = Math.cos(-angle2) * (elementRect2.left - globalRect2.left) - Math.sin(-angle2) * (elementRect2.top - globalRect2.top);
                    const adjustedY2 = Math.sin(-angle2) * (elementRect2.left - globalRect2.left) + Math.cos(-angle2) * (elementRect2.top - globalRect2.top);
        
                    // Position ajustée de la cible
                    const adjustedTargetX2 = Math.cos(-angle2) * (targetRect2.left - globalRect2.left) - Math.sin(-angle2) * (targetRect2.top - globalRect2.top);
                    const adjustedTargetY2 = Math.sin(-angle2) * (targetRect2.left - globalRect2.left) + Math.cos(-angle2) * (targetRect2.top - globalRect2.top);
        
                    // Calcul du déplacement corrigé
                    const deltaX2 = adjustedTargetX2 - adjustedX2;
                    const deltaY2 = adjustedTargetY2 - adjustedY2;
        
                    element.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(90deg)`;
                    element2.style.transform = `translate(${deltaX2}px, ${deltaY2}px) rotate(-90deg)`;
        
                }
        
                else if (river && river.classList.contains('river2_4'))
                {

                    const globalContainer = document.getElementById(parentId);
                    const globalRect = globalContainer.getBoundingClientRect();
        
                    const angle = 90 * (Math.PI / 180); // Rotation de 90° en radians
        
                    // Position ajustée de element2 par rapport à son conteneur global
                    const adjustedX = Math.cos(-angle) * (elementRect.left - globalRect.left) - Math.sin(-angle) * (elementRect.top - globalRect.top);
                    const adjustedY = Math.sin(-angle) * (elementRect.left - globalRect.left) + Math.cos(-angle) * (elementRect.top - globalRect.top);
        
                    // Position ajustée de la cible
                    const adjustedTargetX = Math.cos(-angle) * (targetRect.left - globalRect.left) - Math.sin(-angle) * (targetRect.top - globalRect.top);
                    const adjustedTargetY = Math.sin(-angle) * (targetRect.left - globalRect.left) + Math.cos(-angle) * (targetRect.top - globalRect.top);
        
                    // Calcul du déplacement corrigé
                    const deltaX = adjustedTargetX - adjustedX;
                    const deltaY = adjustedTargetY - adjustedY;
        
                    const globalContainer2 = document.getElementById(parent2Id);
                    const globalRect2 = globalContainer2.getBoundingClientRect();
        
                    const angle2 = -90 * (Math.PI / 180); // Rotation de 90° en radians
        
                    // Position ajustée de element2 par rapport à son conteneur global
                    const adjustedX2 = Math.cos(-angle2) * (elementRect2.left - globalRect2.left) - Math.sin(-angle2) * (elementRect2.top - globalRect2.top);
                    const adjustedY2 = Math.sin(-angle2) * (elementRect2.left - globalRect2.left) + Math.cos(-angle2) * (elementRect2.top - globalRect2.top);
        
                    // Position ajustée de la cible
                    const adjustedTargetX2 = Math.cos(-angle2) * (targetRect2.left - globalRect2.left) - Math.sin(-angle2) * (targetRect2.top - globalRect2.top);
                    const adjustedTargetY2 = Math.sin(-angle2) * (targetRect2.left - globalRect2.left) + Math.cos(-angle2) * (targetRect2.top - globalRect2.top);
        
                    // Calcul du déplacement corrigé
                    const deltaX2 = adjustedTargetX2 - adjustedX2;
                    const deltaY2 = adjustedTargetY2 - adjustedY2;
        
                    element.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(-90deg)`;
                    element2.style.transform = `translate(${deltaX2}px, ${deltaY2}px) rotate(90deg)`;
        
                }

                else
                {
    
        const globalContainer2 = document.getElementById(parent2Id);
        const globalRect2 = globalContainer2.getBoundingClientRect();
    
        const angle = 180 * (Math.PI / 180); // Rotation de 90° en radians
    
        // Position ajustée de element2 par rapport à son conteneur global
        const adjustedX2 = Math.cos(-angle) * (elementRect2.left - globalRect2.left) - Math.sin(-angle) * (elementRect2.top - globalRect2.top);
        const adjustedY2 = Math.sin(-angle) * (elementRect2.left - globalRect2.left) + Math.cos(-angle) * (elementRect2.top - globalRect2.top);
    
        // Position ajustée de la cible
        const adjustedTargetX2 = Math.cos(-angle) * (targetRect2.left - globalRect2.left) - Math.sin(-angle) * (targetRect2.top - globalRect2.top);
        const adjustedTargetY2 = Math.sin(-angle) * (targetRect2.left - globalRect2.left) + Math.cos(-angle) * (targetRect2.top - globalRect2.top);
    
        // Calcul du déplacement corrigé
        const deltaX2 = adjustedTargetX2 - adjustedX2;
        const deltaY2 = adjustedTargetY2 - adjustedY2;
        
    
        element.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(180deg)`;
        element2.style.transform = `translate(${deltaX2}px, ${deltaY2}px) rotate(-180deg)`;

                }
        }

    if(parent2Id == "player_cards_3")
    {

    const globalContainer2 = document.getElementById(parent2Id);
    const globalRect2 = globalContainer2.getBoundingClientRect();

    const angle = -90 * (Math.PI / 180); // Rotation de 90° en radians

    // Position ajustée de element2 par rapport à son conteneur global
    const adjustedX2 = Math.cos(-angle) * (elementRect2.left - globalRect2.left) - Math.sin(-angle) * (elementRect2.top - globalRect2.top);
    const adjustedY2 = Math.sin(-angle) * (elementRect2.left - globalRect2.left) + Math.cos(-angle) * (elementRect2.top - globalRect2.top);

    // Position ajustée de la cible
    const adjustedTargetX2 = Math.cos(-angle) * (targetRect2.left - globalRect2.left) - Math.sin(-angle) * (targetRect2.top - globalRect2.top);
    const adjustedTargetY2 = Math.sin(-angle) * (targetRect2.left - globalRect2.left) + Math.cos(-angle) * (targetRect2.top - globalRect2.top);

    // Calcul du déplacement corrigé
    const deltaX2 = adjustedTargetX2 - adjustedX2;
    const deltaY2 = adjustedTargetY2 - adjustedY2;
    

    element.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(-90deg)`;
    element2.style.transform = `translate(${deltaX2}px, ${deltaY2}px) rotate(90deg)`;
    }



    

    // Forcer un reflow pour que le navigateur prenne en compte les nouvelles coordonnées
    element.offsetHeight; // Reflow
    element2.offsetHeight; // Reflow


    element.addEventListener('transitionend', () => {
        element.style.transform = ''; // Réinitialise la transformation
        target.appendChild(element);
    }, { once: true });

    element2.addEventListener('transitionend', () => {
        element2.style.transform = ''; // Réinitialise la transformation
        target2.appendChild(element2);
    }, { once: true });

    }
    
    
},

notif_score: function( notif )
{
    if (notif.args.score1 != 'no')
    {
        $('score1_'+notif.args.player_id).innerHTML = notif.args.score1;
    }

    else
    {
        $('score1_'+notif.args.player_id).innerHTML = '';
    }

    if (notif.args.score2 != 'no')
    {
        $('score2_'+notif.args.player_id).innerHTML = notif.args.score2;
    }

    else
    {
        $('score2_'+notif.args.player_id).innerHTML = '';
    }

    if (notif.args.score3 != 'no')
    {
        $('score3_'+notif.args.player_id).innerHTML = notif.args.score3;
    }

    else
    {
        $('score3_'+notif.args.player_id).innerHTML = '';
    }

    if (notif.args.score4 != 'no')
    {
        $('score4_'+notif.args.player_id).innerHTML = notif.args.score4;
    }

    else
    {
        $('score4_'+notif.args.player_id).innerHTML = '';
    }

    if (notif.args.score5 != 'no')
    {
        $('score5_'+notif.args.player_id).innerHTML = notif.args.score5;
    }

    else
    {
        $('score5_'+notif.args.player_id).innerHTML = '';
    }

    if (notif.args.score6 != 'no')
    {
        $('score6_'+notif.args.player_id).innerHTML = notif.args.score6;
    }

    else
    {
        $('score6_'+notif.args.player_id).innerHTML = '';
    }

    if (notif.args.score7 != 'no')
    {
        $('score7_'+notif.args.player_id).innerHTML = notif.args.score7;
    }

    else
    {
        $('score7_'+notif.args.player_id).innerHTML = '';
    }

    if (notif.args.score8 != 'no')
    {
        $('score8_'+notif.args.player_id).innerHTML = notif.args.score8;
    }

    else
    {
        $('score8_'+notif.args.player_id).innerHTML = '';
    }

    this.scoreCtrl[ notif.args.player_id ].toValue( notif.args.scoretotal );
   
},

notif_affichescore: function( notif )
{
    
    for( var player_id in this.gamedatas.players )   
        {
                             
            var player_board_div = $('player_board_'+player_id);
            dojo.place( this.format_block('jstpl_scorepad', {id: player_id} ), player_board_div );
            
            
            
        }

    
},












});             
});
