<?php

namespace Bga\Games\Symbiose;   // ATTENTION NOM DU JEU
use APP_GameClass;


class Pending extends APP_GameClass
{
    
    public function __construct($player_id)
    {
        $this->player_id = $player_id;
        $p = self::getObjectFromDB("SELECT * FROM player WHERE player_id = {$player_id}");        
        $this->player_no = $p['player_no'];
        $this->player_id = $p['player_id'];
        $this->player_name = $p['player_name'];
        $this->player_score = $p['player_score'];
        $this->player_color = $p['player_color'];
    }

    function argMulti($parg1, $parg2)
    {
        $ret = array();
        $ret["selectable"] = array();
        $ret["selected"] = array();
        $ret['buttons'] = array();
        $ret['title'] = clienttranslate('${actplayer}');
        $ret['titleyou'] = clienttranslate('${you}');


        
        return $ret;
    }

    function Multi($parg1, $parg2, $varg1, $varg2)
    {
        game::$instance->gamestate->setAllPlayersMultiactive();
        game::$instance->gamestate->nextState( 'multi' );
        
    }
    
    function argNormalTurn($parg1, $parg2)
    {
        $ret = array();
        $ret["selectable"] = array();
        $ret["selected"] = array();
        $ret['buttons'] = array();
        $ret['title'] = clienttranslate('${actplayer} must take an action');
        $ret['titleyou'] = clienttranslate('${you} must choose a river card');

        $cards = self::getObjectListFromDB( "SELECT card_id FROM cards WHERE card_location = 'river'", true );
        $nbre = count(self::getObjectListFromDB( "SELECT card_id FROM cards WHERE card_location_arg = '{$this->player_id}' AND card_visible = 1", true ));

        
        if($nbre < 8)
        {
            foreach ($cards as $card)
            {
                $ret["selectable"][] = 'card_'.$card;
            }
        }
        
               
        return $ret;
    }

    function NormalTurn($parg1, $parg2, $varg1, $varg2)
    {
        if ($varg1 == null)
        {
            if (game::$instance->getGameStateValue('scoring_mode') == 1)  // affichage score
            {
            
            game::$instance->setGameStateValue('end', 1);
            game::$instance->notifyAllPlayers('affichescore','', array(
                )
                );
            
            }
            game::$instance->Score();

            game::$instance->gamestate->nextState( 'end' );
        }
        else
        {
            game::$instance->addPending($this->player_id, "Step2", $varg1);
        }
        
    }


    function argStep2($parg1, $parg2)
    {
        $ret = array();
        $ret["selectable"] = array();
        $ret["selected"] = array();
        $ret['buttons'] = array();
        $ret['title'] = clienttranslate('${actplayer} must take an action');
        $ret['titleyou'] = clienttranslate('${you} must choose a location for the pond');

        $cards_visible = self::getObjectListFromDB( "SELECT card_id FROM cards WHERE card_location_arg = '{$this->player_id}' AND card_visible = 1", true );
        $cards_novisible = self::getObjectListFromDB( "SELECT card_id FROM cards WHERE card_location_arg = '{$this->player_id}' AND card_visible = 0 ", true );

        
        foreach ($cards_visible as $card)
        {
            $ret["selectable"][] = 'card_'.$card;
        }

        foreach ($cards_novisible as $card)
        {
            $ret["selectable"][] = 'card_'.$card.'_back';
        }

        $ret["selected"][] = $parg1;

        $ret['buttons'][]='cancel';


        
               
        return $ret;
    }

    function Step2($parg1, $parg2, $varg1, $varg2)
    {

        if($varg1 == 'cancel')
        {
            game::$instance->addPending($this->player_id, "NormalTurn");
        }

        else
        {
            
            $explode_card_river = explode('_', $parg1);
            $position_card_river = self::getUniqueValueFromDB("SELECT card_location_arg FROM cards WHERE card_id = '{$explode_card_river[1]}'");

            $explode_card_mare = explode('_', $varg1);
            $position_card_mare = self::getUniqueValueFromDB("SELECT card_location FROM cards WHERE card_id = '{$explode_card_mare[1]}'");


            if (str_ends_with($varg1, "back"))
            {
                self::DbQuery("UPDATE cards set card_visible = 1 WHERE card_id = '{$explode_card_mare[1]}'");
                
                $cardinfo = self::getObjectListFromDB( "SELECT card_id id, card_type type, card_location location, card_location_arg location_arg FROM cards WHERE card_id = '{$explode_card_mare[1]}'" );
                game::$instance->notifyAllPlayers('flip','', array(
            
                    'cardinfo' => $cardinfo,
                        
                    )
                    );
                
                game::$instance->notifyAllPlayers( 'simplePause', '', [ 'time' => 1600] ); 

                game::$instance->cards->moveCard($explode_card_river[1], $position_card_mare, $this->player_id );
                game::$instance->cards->moveCard($explode_card_mare[1], 'river', $position_card_river );

                game::$instance->notifyAllPlayers('switch',clienttranslate('${player_name} switches a card with the river'), array(
                    'player_name' => $this->player_name,
                    'player_id' => $this->player_id,
                    'card_river' => 'card_'.$explode_card_river[1],
                    'position_river' => $position_card_river,
                    'card_mare' => 'card_'.$explode_card_mare[1],
                    'position_mare' => $position_card_mare,

                     
                    )
                    );


                if (game::$instance->getGameStateValue('scoring_mode') == 2)
                {
                    game::$instance->Score();
                }

                game::$instance->giveExtraTime($this->player_id);
                game::$instance->addPendingFirst($this->player_id, "NormalTurn");

            }

            else
            {
                game::$instance->cards->moveCard($explode_card_river[1], $position_card_mare, $this->player_id );
                game::$instance->cards->moveCard($explode_card_mare[1], 'river', $position_card_river );

                game::$instance->notifyAllPlayers('switch',clienttranslate('${player_name} switches a card with the river'), array(
                    'player_name' => $this->player_name,
                    'player_id' => $this->player_id,
                    'card_river' => 'card_'.$explode_card_river[1],
                    'position_river' => $position_card_river,
                    'card_mare' => 'card_'.$explode_card_mare[1],
                    'position_mare' => $position_card_mare,

                     
                    )
                    );

                if (game::$instance->getGameStateValue('scoring_mode') == 2)
                {
                    game::$instance->Score();
                }
                
                game::$instance->addPending($this->player_id, "Step3");





            }
        }


        
    }

    function argStep3($parg1, $parg2)
    {
        $ret = array();
        $ret["selectable"] = array();
        $ret["selected"] = array();
        $ret['buttons'] = array();
        $ret['title'] = clienttranslate('${actplayer} must take an action');
        $ret['titleyou'] = clienttranslate('${you} must flip a new card from the pond');

        
        $cards_novisible = self::getObjectListFromDB( "SELECT card_id FROM cards WHERE card_location_arg = '{$this->player_id}' AND card_visible = 0 ", true );

        
       
        foreach ($cards_novisible as $card)
        {
            $ret["selectable"][] = 'card_'.$card.'_back';
        }

        

        
        
               
        return $ret;
    }

    function Step3($parg1, $parg2, $varg1, $varg2)
    {
        $explode_card_mare = explode('_', $varg1);

        self::DbQuery("UPDATE cards set card_visible = 1 WHERE card_id = '{$explode_card_mare[1]}'");

        $cardinfo = self::getObjectListFromDB( "SELECT card_id id, card_type type, card_location location, card_location_arg location_arg FROM cards WHERE card_id = '{$explode_card_mare[1]}'" );
        game::$instance->notifyAllPlayers('flip',clienttranslate('${player_name} reveals a new card of the pond'), array(
            'player_name' => $this->player_name,
            'cardinfo' => $cardinfo,
                
            )
            );
            

        if (game::$instance->getGameStateValue('scoring_mode') == 2)
        {
            game::$instance->Score();
        }

        game::$instance->giveExtraTime($this->player_id);
        game::$instance->addPendingFirst($this->player_id, "NormalTurn");

        
    }


    

}