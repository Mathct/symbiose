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

            "scoring_mode" => 100,
            "game_mode" => 101,

            "end" => 10,
            
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

    $nbreplayers = count(self::getObjectListFromDB( "SELECT player_id FROM player", true ));

    if ($nbreplayers >=3)
    {

    for ($i = 1; $i <= 4; $i++) {

        $this->cards->pickCardForLocation('deck', 'river', $i);
    }

    self::DbQuery("UPDATE cards set card_visible = 1 WHERE card_location = 'river'");
    }

    if ($nbreplayers == 2)

    {
        if( $this->gamestate->table_globals[101] == 2)
        {
            for ($i = 1; $i <= 4; $i++) {

                $this->cards->pickCardForLocation('deck', 'river', $i);
            }
        
            self::DbQuery("UPDATE cards set card_visible = 1 WHERE card_location = 'river'");
        }

        if( $this->gamestate->table_globals[101] == 1)
        {
            for ($i = 1; $i <= 8; $i++) {

                $this->cards->pickCardForLocation('deck', 'river', $i);
            }

                  
            self::DbQuery("UPDATE cards set card_visible = 1 WHERE card_location = 'river' AND card_location_arg = 1");
            self::DbQuery("UPDATE cards set card_visible = 1 WHERE card_location = 'river' AND card_location_arg = 2");
            self::DbQuery("UPDATE cards set card_visible = 1 WHERE card_location = 'river' AND card_location_arg = 3");
            self::DbQuery("UPDATE cards set card_visible = 1 WHERE card_location = 'river' AND card_location_arg = 4");
        }
    }

    
    //init global ///

    game::$instance->setGameStateValue('end', 0);


    /************ Init Pending *****/
         
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

$result["players"] = self::getCollectionFromDB( "SELECT player_id id, player_name name, player_no no, player_score score, score1 score1, score2 score2, score3 score3, score4 score4, score5 score5, score6 score6, score7 score7, score8 score8 FROM player" );
$result['cards'] = self::getObjectListFromDB( "SELECT card_id id, card_type type, card_type_arg type_arg, card_location location, card_location_arg location_arg, card_visible visible FROM cards WHERE card_location != 'deck'");
$result["new_ordre_players"] = $this->getPlayerRelativePositions();

$result["nbre_players"] = count($result["players"]);

$result["scoring_mode"] = $this->gamestate->table_globals[100];

if($result["nbre_players"] == 2)
{
$result["game_mode"] = $this->gamestate->table_globals[101];
}

$result["end"] = game::$instance->getGameStateValue('end');



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


    function Score()  
    {

        
        if ((game::$instance->getGameStateValue('scoring_mode') == 2)||(game::$instance->getGameStateValue('end') == 1))
        {
            $listcard = array();
            $nbresigne = array();
            $listplayers = self::getObjectListFromDB( "SELECT player_id FROM player", true );

            foreach ($listplayers as $player)
            {
                $listcard[$player] = self::getObjectListFromDB( "SELECT card_type FROM cards WHERE card_location_arg = '{$player}' AND card_visible = 1 ", true );

                $gr = 0;
                $es = 0;
                $po = 0;
                $li = 0;
                $r = 0;
                $v = 0;
                $o = 0;
                $b = 0;

                foreach ($listcard[$player] as $type)
                {
                    $animal = $this->_cards[$type]['animal'];
                    $saison = $this->_cards[$type]['saison'];

                    if ( $animal == 1)
                    {
                        $gr++;
                    }

                    if ( $animal == 2)
                    {
                        $es++;
                    }

                    if ( $animal == 3)
                    {
                        $po++;
                    }

                    if ( $animal == 4)
                    {
                        $li++;
                    }

                    if ( $saison == 1)
                    {
                        $r++;
                    }

                    if ( $saison == 2)
                    {
                        $v++;
                    }

                    if ( $saison == 3)
                    {
                        $o++;
                    }

                    if ( $saison == 4)
                    {
                        $b++;
                    }


                }


                $nbresigne[$player] = [$gr, $es, $po, $li, $r, $v, $o, $b];
    

            }

            
            foreach ($listplayers as $player)
            {
                $nextplayer = game::$instance->getPlayerAfter( $player );
                $beforeplayer = game::$instance->getPlayerBefore( $player );

                $score1 = 'no';
                $score2 = 'no';
                $score3 = 'no';
                $score4 = 'no';
                $score5 = 'no';
                $score6 = 'no';
                $score7 = 'no';
                $score8 = 'no';

                foreach ($listcard[$player] as $type)
                {
                    $position = self::getUniqueValueFromDB("SELECT card_location FROM cards WHERE card_type = '{$type}'");
                    $scoretype = $this->_cards[$type]['scoretype'];
                    $score = $this->_cards[$type]['score'];

                    if ($position == 'cardposition_1')
                    {
                        if($scoretype == 0)
                        {
                            $score1 = $score;
                        }

                        else
                        {
                            $score1 = $nbresigne[$nextplayer][$scoretype-1] * $score;
                        }

                        if ($score1 >=0)
                        {
                            self::DbQuery( "UPDATE player set score1 = '{$score1}'  WHERE player_id = '{$player}'" );
                        }


                    }

                    if ($position == 'cardposition_2')
                    {

                        if($scoretype == 0)
                        {
                            $score2 = $score;
                        }

                        else
                        {
                            $score2 = $nbresigne[$player][$scoretype-1] * $score;
                        }

                        if ($score2 >=0)
                        {
                            self::DbQuery( "UPDATE player set score2 = '{$score2}'  WHERE player_id = '{$player}'" );
                        }



                    }

                    if ($position == 'cardposition_3')
                    {

                        if($scoretype == 0)
                        {
                            $score3 = $score;
                        }

                        else
                        {
                            $score3 = $nbresigne[$player][$scoretype-1] * $score;
                        }

                        if ($score3 >=0)
                        {
                            self::DbQuery( "UPDATE player set score3 = '{$score3}'  WHERE player_id = '{$player}'" );
                        }


                    }

                    if ($position == 'cardposition_4')
                    {

                        if($scoretype == 0)
                        {
                            $score4 = $score;
                        }

                        else
                        {
                            $score4 = $nbresigne[$beforeplayer][$scoretype-1] * $score;
                        }

                        if ($score4 >=0)
                        {
                            self::DbQuery( "UPDATE player set score4 = '{$score4}'  WHERE player_id = '{$player}'" );
                        }


                    }

                    if ($position == 'cardposition_5')
                    {

                        if($scoretype == 0)
                        {
                            $score5 = $score;
                        }

                        else
                        {
                            $score5 = $nbresigne[$nextplayer][$scoretype-1] * $score;
                        }

                        if ($score5 >=0)
                        {
                            self::DbQuery( "UPDATE player set score5 = '{$score5}'  WHERE player_id = '{$player}'" );
                        }


                        

                    }

                    if ($position == 'cardposition_6')
                    {
                        if($scoretype == 0)
                        {
                            $score6 = $score;
                        }

                        else
                        {
                            $score6= $nbresigne[$player][$scoretype-1] * $score;
                        }

                        if ($score6 >=0)
                        {
                            self::DbQuery( "UPDATE player set score6 = '{$score6}'  WHERE player_id = '{$player}'" );
                        }



                        
                    }

                    if ($position == 'cardposition_7')
                    {
                        if($scoretype == 0)
                        {
                            $score7 = $score;
                        }

                        else
                        {
                            $score7 = $nbresigne[$player][$scoretype-1] * $score;
                        }

                        if ($score7 >=0)
                        {
                            self::DbQuery( "UPDATE player set score7 = '{$score7}'  WHERE player_id = '{$player}'" );
                        }



                    }

                    if ($position == 'cardposition_8')
                    {

                        if($scoretype == 0)
                        {
                            $score8 = $score;
                        }

                        else
                        {
                            $score8 = $nbresigne[$beforeplayer][$scoretype-1] * $score;
                        }

                        if ($score8 >=0)
                        {
                            self::DbQuery( "UPDATE player set score8 = '{$score8}'  WHERE player_id = '{$player}'" );
                        }



                    }

                }

                $scoretotal = 0;

                if (self::getUniqueValueFromDB("SELECT score1 FROM player WHERE player_id={$player}") >=0 )
                {
                    $scoretotal = $scoretotal + self::getUniqueValueFromDB("SELECT score1 FROM player WHERE player_id={$player}");
                }

                if (self::getUniqueValueFromDB("SELECT score2 FROM player WHERE player_id={$player}") >=0 )
                {
                    $scoretotal = $scoretotal + self::getUniqueValueFromDB("SELECT score2 FROM player WHERE player_id={$player}");
                }

                if (self::getUniqueValueFromDB("SELECT score3 FROM player WHERE player_id={$player}") >=0 )
                {
                    $scoretotal = $scoretotal + self::getUniqueValueFromDB("SELECT score3 FROM player WHERE player_id={$player}");
                }

                if (self::getUniqueValueFromDB("SELECT score4 FROM player WHERE player_id={$player}") >=0 )
                {
                    $scoretotal = $scoretotal + self::getUniqueValueFromDB("SELECT score4 FROM player WHERE player_id={$player}");
                }

                if (self::getUniqueValueFromDB("SELECT score5 FROM player WHERE player_id={$player}") >=0 )
                {
                    $scoretotal = $scoretotal + self::getUniqueValueFromDB("SELECT score5 FROM player WHERE player_id={$player}");
                }

                if (self::getUniqueValueFromDB("SELECT score6 FROM player WHERE player_id={$player}") >=0 )
                {
                    $scoretotal = $scoretotal + self::getUniqueValueFromDB("SELECT score6 FROM player WHERE player_id={$player}");
                }

                if (self::getUniqueValueFromDB("SELECT score7 FROM player WHERE player_id={$player}") >=0 )
                {
                    $scoretotal = $scoretotal + self::getUniqueValueFromDB("SELECT score7 FROM player WHERE player_id={$player}");
                }

                if (self::getUniqueValueFromDB("SELECT score8 FROM player WHERE player_id={$player}") >=0 )
                {
                    $scoretotal = $scoretotal + self::getUniqueValueFromDB("SELECT score8 FROM player WHERE player_id={$player}");
                }

                self::DbQuery( "UPDATE player set player_score = '{$scoretotal}'  WHERE player_id = '{$player}'" );



                game::$instance->notifyAllPlayers('score','', array(
            
                    'player_id' => $player,
                    'score1' => $score1,
                    'score2' => $score2,
                    'score3' => $score3,
                    'score4' => $score4,
                    'score5' => $score5,
                    'score6' => $score6,
                    'score7' => $score7,
                    'score8' => $score8,
                    'scoretotal' => $scoretotal,

                        
                    )
                    );

            
            }



        }
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
        game::$instance->Score();
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
