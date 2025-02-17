{OVERALL_GAME_HEADER}



<div id="board"></div>




<script type="text/javascript">

var jstpl_card='<div id="card_${id}" class="card" style="background-position-x: ${x}%; background-position-y: ${y}%;"></div>';
var jstpl_cardback='<div id="card_${id}_back" class="cardback"></div>';

var jstpl_scorepad = '<div id="player_scorepad_${id}" style="height: 116px; display: flex; align-items: center; flex-direction: column; justify-content: center; z-index: 100; position: relative;">\
<div class="scorepad">\
<div id="score1_${id}" style="position: absolute; display: flex; justify-content: center; align-items: center; left: 15px; top: 18px; height: 35px; width: 35px; font-weight: bold; font-size: 25px; font-style: italic;"></div>\
<div id="score2_${id}" style="position: absolute; display: flex; justify-content: center; align-items: center; left: 68px; top: 18px; height: 35px; width: 35px; font-weight: bold; font-size: 25px; font-style: italic;"></div>\
<div id="score3_${id}" style="position: absolute; display: flex; justify-content: center; align-items: center; left: 122px; top: 18px; height: 35px; width: 35px; font-weight: bold; font-size: 25px; font-style: italic;"></div>\
<div id="score4_${id}" style="position: absolute; display: flex; justify-content: center; align-items: center; left: 175px; top: 18px; height: 35px; width: 35px; font-weight: bold; font-size: 25px; font-style: italic;"></div>\
<div id="score5_${id}" style="position: absolute; display: flex; justify-content: center; align-items: center; left: 15px; top: 68px; height: 35px; width: 35px; font-weight: bold; font-size: 25px; font-style: italic;"></div>\
<div id="score6_${id}" style="position: absolute; display: flex; justify-content: center; align-items: center; left: 68px; top: 68px; height: 35px; width: 35px; font-weight: bold; font-size: 25px; font-style: italic;"></div>\
<div id="score7_${id}" style="position: absolute; display: flex; justify-content: center; align-items: center; left: 122px; top: 68px; height: 35px; width: 35px; font-weight: bold; font-size: 25px; font-style: italic;"></div>\
<div id="score8_${id}" style="position: absolute; display: flex; justify-content: center; align-items: center; left: 175px; top: 68px; height: 35px; width: 35px; font-weight: bold; font-size: 25px; font-style: italic;"></div>\
</div>\
</div>';

var jstpl_team='<div id="team_${id}" class="${class}"></div>';

</script>  

{OVERALL_GAME_FOOTER}