<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * symbiose implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * Game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 */
declare(strict_types=1);

namespace Bga\Games\symbiose;

require_once(APP_GAMEMODULE_PATH . "module/table/table.game.php");

include('Pending.php'); // ATTENTION

class Game extends \Table
{

    public static $instance = null;  // ATTENTION


    
    public function __construct()
    {
        parent::__construct();

        require 'material.inc.php'; // ATTENTION

        $this->initGameStateLabels([
            
        ]);  
        
        self::$instance = $this; // ATTENTION

        $this->cards = self::getNew("module.common.deck");
        $this->cards->init("cards");

        
    }

    /**
     * Returns the game name.
     *
     * IMPORTANT: Please do not modify.
     */
    protected function getGameName()
    {
        return "symbiose";
    }


/////////////////////////////////////////////////////////////////////////////////  
//       _____                        _____       _ _   _       _ _          _   _             
//      / ____|                      |_   _|     (_) | (_)     | (_)        | | (_)            
//     | |  __  __ _ _ __ ___   ___    | |  _ __  _| |_ _  __ _| |_ ______ _| |_ _  ___  _ __  
//     | | |_ |/ _` | '_ ` _ \ / _ \   | | | '_ \| | __| |/ _` | | |_  / _` | __| |/ _ \| '_ \ 
//     | |__| | (_| | | | | | |  __/  _| |_| | | | | |_| | (_| | | |/ / (_| | |_| | (_) | | | |
//      \_____|\__,_|_| |_| |_|\___| |_____|_| |_|_|\__|_|\__,_|_|_/___\__,_|\__|_|\___/|_| |_|
//                                                                                               
/////////////////////////////////////////////////////////////////////////////////    


protected function setupNewGame($players, $options = [])
{
    // Set the colors of the players with HTML color code. The default below is red/green/blue/orange/brown. The
    // number of colors defined here must correspond to the maximum number of players allowed for the gams.
    $gameinfos = $this->getGameinfos();
    $default_colors = $gameinfos['player_colors'];

    foreach ($players as $player_id => $player) {
        // Now you can access both $player_id and $player array
        $query_values[] = vsprintf("('%s', '%s', '%s', '%s', '%s')", [
            $player_id,
            array_shift($default_colors),
            $player["player_canal"],
            addslashes($player["player_name"]),
            addslashes($player["player_avatar"]),
        ]);
    }

    // Create players based on generic information.
    //
    // NOTE: You can add extra field on player table in the database (see dbmodel.sql) and initialize
    // additional fields directly here.
    static::DbQuery(
        sprintf(
            "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES %s",
            implode(",", $query_values)
        )
    );

    $this->reattributeColorsBasedOnPreferences($players, $gameinfos["player_colors"]);
    $this->reloadPlayersBasicInfos();


    /* init cards */

    for ($i = 1; $i <= 36; $i++) {

        $card[] = array('type' => $i, 'type_arg' => 0, 'nbr' => 1);
    }

    $this->cards->createCards($card, 'deck');

    $this->cards->shuffle('deck');

    /* init cards players*/

    foreach ($players as $player_id => $player) {

        for ($i = 1; $i <= 8; $i++) {

            $this->cards->pickCardForLocation('deck', 'cardposition_'.$i, $player_id);
        }
    }

    /* init cards river*/

    for ($i = 1; $i <= 4; $i++) {

        $this->cards->pickCardForLocation('deck', 'river', $i);
    }

    self::DbQuery("UPDATE cards set card_visible = 1 WHERE card_location = 'river'");

    
    /************ Init Pending *****/

    //$firstplayer = self::getUniqueValueFromDB("SELECT player_id FROM player WHERE player_no=1");
    //$this->addPendingFirst($firstplayer, "Multi");
            
    foreach( $players as $player_id => $player )
    {
        $this->addPendingFirst($player_id, "NormalTurn");
    }

    
}

/////////////////////////////////////////////////////////////////////////////////  
//               _            _ _ _____        _            
//              | |     /\   | | |  __ \      | |           
//     __ _  ___| |_   /  \  | | | |  | | __ _| |_ __ _ ___ 
//    / _` |/ _ \ __| / /\ \ | | | |  | |/ _` | __/ _` / __|
//   | (_| |  __/ |_ / ____ \| | | |__| | (_| | || (_| \__ \
//    \__, |\___|\__/_/    \_\_|_|_____/ \__,_|\__\__,_|___/
//     __/ |                                                
//    |___/                                                 
/////////////////////////////////////////////////////////////////////////////////  

protected function getAllDatas()
{
$result = [];


$current_player_id = (int) $this->getCurrentPlayerId();

$result["players"] = self::getCollectionFromDB( "SELECT player_id id, player_name name, player_no no, player_score score FROM player" );
$result['cards'] = self::getObjectListFromDB( "SELECT card_id id, card_type type, card_type_arg type_arg, card_location location, card_location_arg location_arg, card_visible visible FROM cards WHERE card_location != 'deck'");
$result["new_ordre_players"] = $this->getPlayerRelativePositions();



return $result;
}


/////////////////////////////////////////////////////////////////////////////////  
//     _____                      _____                                   _             
//    / ____|                    |  __ \                                 (_)            
//   | |  __  __ _ _ __ ___   ___| |__) | __ ___   __ _ _ __ ___  ___ ___ _  ___  _ __  
//   | | |_ |/ _` | '_ ` _ \ / _ \  ___/ '__/ _ \ / _` | '__/ _ \/ __/ __| |/ _ \| '_ \ 
//   | |__| | (_| | | | | | |  __/ |   | | | (_) | (_| | | |  __/\__ \__ \ | (_) | | | |
//    \_____|\__,_|_| |_| |_|\___|_|   |_|  \___/ \__, |_|  \___||___/___/_|\___/|_| |_|
//                                                 __/ |                                
//                                                |___/                                 
/////////////////////////////////////////////////////////////////////////////////  

public function getGameProgression()
{
// TODO: compute and return the game progression

return 0;
}


/////////////////////////////////////////////////////////////////////////////////  
//     _    _ _   _ _ _ _            __                  _   _                 
//    | |  | | | (_) (_) |          / _|                | | (_)                
//    | |  | | |_ _| |_| |_ _   _  | |_ _   _ _ __   ___| |_ _  ___  _ __  ___ 
//    | |  | | __| | | | __| | | | |  _| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
//    | |__| | |_| | | | |_| |_| | | | | |_| | | | | (__| |_| | (_) | | | \__ \
//     \____/ \__|_|_|_|\__|\__, | |_|  \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
//                           __/ |                                             
//                          |___/                                              
/////////////////////////////////////////////////////////////////////////////////  

function addPending($player_id, $function, $arg = NULL, $arg2 = NULL, $arg3 = NULL, $arg4 = NULL) {
$sql = "INSERT INTO pending (player_id, function, arg, arg2, arg3, arg4) VALUES (".$player_id.", '".$function."', '".$arg."', '".$arg2."', '".$arg3."', '".$arg4."')";
self::DbQuery( $sql );
}

/*function addPendingTarget($player_id, $function, $target, $arg = NULL, $arg2 = NULL, $arg3 = NULL, $arg4 = NULL) {
$sql = "INSERT INTO pending (player_id, function, target, arg, arg2, arg3, arg4) VALUES (".$player_id.", '".$function."', '".$target."', '".$arg."', '".$arg2."', '".$arg3."', '".$arg4."')";
self::DbQuery( $sql );
}*/

function addPendingFirst($player_id, $function, $arg = NULL, $arg2 = NULL, $arg3 = NULL, $arg4 = NULL) {
$minid = self::getUniqueValueFromDB( "select min(id) from pending")-1;
$sql = "INSERT INTO pending (id, player_id, function, arg, arg2) VALUES (".$minid.",".$player_id.", '".$function."', '".$arg."', '".$arg2."')";
self::DbQuery( $sql );
}

function checkArgs($arg1)
{
    $ret = self::argPlayerTurn();

    if(!in_array($arg1,$ret['selectable']) && !in_array($arg1,$ret['buttons']))
    {
        throw new feException( "Not a valid selection");
    }
    
}


function getPlayerRelativePositions()  // permet de mettre dans view.php les joueurs dans l'ordre de la base de données et de positionner le current player en haut avec les autres joueurs dans l'ordre du tour
    {
        $result = array();
        
        $players = self::loadPlayersBasicInfos();
        $nextPlayer = self::createNextPlayerTable(array_keys($players)); //met joueurs dans l'ordre du tour au niveau de l'affichage à droite
        
        $current_player = self::getCurrentPlayerId();
        
        if(!isset($nextPlayer[$current_player])) {
            // Spectator mode: prend la vue du premier joueur de la liste
            $player_id = $nextPlayer[0];
        }
        else {
            // Normal mode: current player est premier de la liste puis les autres dans l ordre de la base de données player
            $player_id = $current_player;
        }
        $result[] = $player_id;
        
        for($i=1; $i<count($players); $i++) {
            $player_id = $nextPlayer[$player_id];
            $result[] = $player_id;
        }
        return $result;
    }





///////////////////////////////////////////////////////////////////////////////// 
//     _____  _                                    _   _                 
//    |  __ \| |                                  | | (_)                
//    | |__) | | __ _ _   _  ___ _ __    __ _  ___| |_ _  ___  _ __  ___ 
//    |  ___/| |/ _` | | | |/ _ \ '__|  / _` |/ __| __| |/ _ \| '_ \/ __|
//    | |    | | (_| | |_| |  __/ |    | (_| | (__| |_| | (_) | | | \__ \
//    |_|    |_|\__,_|\__, |\___|_|     \__,_|\___|\__|_|\___/|_| |_|___/
//                     __/ |                                             
//                    |___/                                              
/////////////////////////////////////////////////////////////////////////////////


public function actSelect(string $arg1)
{

    if($this->gamestate->state()['name'] == "playerTurnMulti")
    {
        $explode = explode('_', $arg1);
        $player_id = $this->getCurrentPlayerId(); // CURRENT!!! not active
        $name = self::getUniqueValueFromDB("SELECT player_name FROM player WHERE player_id={$player_id}");
        self::DbQuery("UPDATE cards set card_visible = 1 WHERE card_id = '{$explode[1]}'");

        $cards = self::getObjectListFromDB( "SELECT card_id FROM cards WHERE card_location_arg = '{$player_id}'", true );
    
        game::$instance->notifyAllPlayers('firstcard',clienttranslate('${player_name} flips the first card'), array(
            'player_name' => $name, 
            'cards' => $cards,
             
            )
            );

        $cardinfo = self::getObjectListFromDB( "SELECT card_id id, card_type type, card_location location, card_location_arg location_arg FROM cards WHERE card_id = '{$explode[1]}'" );

        game::$instance->notifyAllPlayers('flip','', array(
            
            'cardinfo' => $cardinfo,
                
            )
            );

        $this->giveExtraTime($this->getCurrentPlayerId());
        $this->gamestate->setPlayerNonMultiactive($player_id, 'next'); // desactivation player et redirection vers next quand tous les joueurs seront desactivés
    }



    else
    {

    self::checkArgs($arg1);        
    
    $pending =  self::getObjectFromDB( "SELECT* FROM pending order by id desc limit 1");
    $this->callPending($pending, true, $arg1);
    self::DbQuery("delete from pending where id=".$pending['id']);
    //$this->giveExtraTime(self::getActivePlayerId());
    $this->gamestate->nextState( 'next');

    }
    
}

public function actButton(string $arg1)
{

    self::checkArgs($arg1);       
    
    $pending =  self::getObjectFromDB( "SELECT* FROM pending order by id desc limit 1");
    $this->callPending($pending, true, $arg1);
    self::DbQuery("delete from pending where id=".$pending['id']);
    //$this->giveExtraTime(self::getActivePlayerId());
    $this->gamestate->nextState( 'next');
    
}

///////////////////////////////////////////////////////////////////////////////// 
//     _____                             _        _                                                    _       
//    / ____|                           | |      | |                                                  | |      
//    | |  __  __ _ _ __ ___   ___   ___| |_ __ _| |_ ___    __ _ _ __ __ _ _   _ _ __ ___   ___ _ __ | |_ ___ 
//    | | |_ |/ _` | '_ ` _ \ / _ \ / __| __/ _` | __/ _ \  / _` | '__/ _` | | | | '_ ` _ \ / _ \ '_ \| __/ __|
//    | |__| | (_| | | | | | |  __/ \__ \ || (_| | ||  __/ | (_| | | | (_| | |_| | | | | | |  __/ | | | |_\__ \
//     \_____|\__,_|_| |_| |_|\___| |___/\__\__,_|\__\___|  \__,_|_|  \__, |\__,_|_| |_| |_|\___|_| |_|\__|___/
//                                                                    __/ |                                   
//                                                                   |___/                                    
///////////////////////////////////////////////////////////////////////////////// 


public function argPlayerTurnMulti()
{
    $args = array();

    $players = self::getObjectListFromDB( "SELECT player_id FROM player", true );

    foreach ($players as $player)
    {
        $cards = self::getObjectListFromDB( "SELECT card_id FROM cards WHERE card_location_arg = '{$player}'", true );

        foreach($cards as $card)
        {
            $args['selectable'][$player][] = 'card_'.$card.'_back';
        }
    }
   
    return $args;
}


public function argPlayerTurn()
{
    $pending =  self::getObjectFromDB( "SELECT* FROM pending order by id desc limit 1");
    $arg = $this->callPending($pending, false);

    return $arg;
}


///////////////////////////////////////////////////////////////////////////////// 
//      _____                            _        _                    _   _                 
//     / ____|                          | |      | |                  | | (_)                
//    | |  __  __ _ _ __ ___   ___   ___| |_ __ _| |_ ___    __ _  ___| |_ _  ___  _ __  ___ 
//    | | |_ |/ _` | '_ ` _ \ / _ \ / __| __/ _` | __/ _ \  / _` |/ __| __| |/ _ \| '_ \/ __|
//    | |__| | (_| | | | | | |  __/ \__ \ || (_| | ||  __/ | (_| | (__| |_| | (_) | | | \__ \
//     \_____|\__,_|_| |_| |_|\___| |___/\__\__,_|\__\___|  \__,_|\___|\__|_|\___/|_| |_|___/
//                                                                                       
/////////////////////////////////////////////////////////////////////////////////     


public function callPending($pending, $execute, $arg1 = null, $arg2 = null)
{


    $obj = $this;
    if($pending['player_id'] != null)
    {
        $obj = new Pending($pending['player_id']);
    }
    
    $fname ="";
    if(!$execute)
    {
        $fname .= "arg";
    }
    $fname .= $pending['function'];
    
    $ret = null;
    if(method_exists($obj, $fname))
    {
        $ret = $obj->$fname($pending['arg'], $pending['arg2'], $arg1, $arg2);
    }

return $ret;
}


public function stPending() {

$pending =  self::getObjectFromDB( "SELECT * FROM pending order by id desc limit 1");
if($pending == null)
{
    
    $this->gamestate->nextState( 'end' ); 
}
else
{
   $args = $this->callPending($pending, false);

   ////////////// attention changement car si on donne la main a un autre joueur sans arg l'id de l active player ne change pas 
   if($pending['player_id'] != self::getActivePlayerId())
        {          
           

            //change active player      
            $this->gamestate->changeActivePlayer( $pending['player_id']);    
            $this->gamestate->nextState( 'same' );
        }
          
   else if($args == null || (count($args['selectable']) == 0 && count($args['buttons']) == 0))
   {
       //no args required, execute
       $this->callPending($pending, true);
       self::DbQuery("delete from pending where id=".$pending['id']);
       $this->gamestate->nextState( 'same' );  
   }
   
   else
   {
        
       
       $this->gamestate->nextState( 'player' ); 
   }            
}

}

public function st_MultiPlayerActivation() 
{
    game::$instance->gamestate->setAllPlayersMultiactive();
    //game::$instance->gamestate->nextState('next');
    
}

///////////////////////////////////////////////////////////////////////////////// 
//     _____  ____                                    _      
//    |  __ \|  _ \                                  | |     
//    | |  | | |_) |  _   _ _ __   __ _ _ __ __ _  __| | ___ 
//    | |  | |  _ <  | | | | '_ \ / _` | '__/ _` |/ _` |/ _ \
//    | |__| | |_) | | |_| | |_) | (_| | | | (_| | (_| |  __/
//    |_____/|____/   \__,_| .__/ \__, |_|  \__,_|\__,_|\___|
//                         | |     __/ |                     
//                         |_|    |___/                      
/////////////////////////////////////////////////////////////////////////////////  


public function upgradeTableDb($from_version)
{
      
}




/////////////////////////////////////////////////////////////////////////////////
//    ______               _     _      
//   |___  /              | |   (_)     
//      / / ___  _ __ ___ | |__  _  ___ 
//     / / / _ \| '_ ` _ \| '_ \| |/ _ \
//    / /_| (_) | | | | | | |_) | |  __/
//   /_____\___/|_| |_| |_|_.__/|_|\___|
//                                   
/////////////////////////////////////////////////////////////////////////////////     

protected function zombieTurn(array $state, int $active_player): void
{
    $state_name = $state["name"];

    if ($state["type"] === "activeplayer") {
        switch ($state_name) {
            default:
            {
                $player_id = $this->getActivePlayerId();
                self::DbQuery("delete from pending where player_id = {$player_id}");
                $this->gamestate->nextState("zombiePass");
                break;
            }
        }

        return;
    }

    // Make sure player is in a non-blocking status for role turn.
    if ($state["type"] === "multipleactiveplayer") {
        $this->gamestate->setPlayerNonMultiactive($active_player, '');
        return;
    }

    throw new \feException("Zombie mode not supported at this game state: \"{$state_name}\".");
}
}
