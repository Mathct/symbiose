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
    
    function argNormalTurn($parg1, $parg2)
    {
        $ret = array();
        $ret["selectable"] = array();
        $ret["selected"] = array();
        $ret['buttons'] = array();
        $ret['title'] = clienttranslate('${actplayer} blabla2');
        $ret['titleyou'] = clienttranslate('${you} blabla1');


        
        $ret['buttons'][]='cancel';
        $ret['buttons'][]='pass';
        
        return $ret;
    }

    function NormalTurn($parg1, $parg2, $varg1, $varg2)
    {
        if($varg1 == "cancel")
        {
            game::$instance->addPending($this->player_id, "NormalTurn");  
        }
        if($varg1 == "pass")
        {
            game::$instance->addPendingFirst($this->player_id, "NormalTurn");  
        }
        
    }
}