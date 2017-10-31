  var sliderTooltip = function(event, ui) {
    var curValue = ui.value || sessionStorage.flowrate; // current value (when sliding) or initial value (at start)
    var tooltip = '<div class="tooltip"><div class="tooltip-inner">' + curValue + '</div><div class="tooltip-arrow"></div></div>';

    $('.ui-slider-handle').html(tooltip); //attach tooltip to the slider handle
}


  // Create UI tabs
  $( "#tabs" ).tabs();
  // Create UI control group
$( "#controlgroup" ).controlgroup();
  // Create UI slider
  $( "#slider" ).slider({
    range : 'min',
    min : parseFloat(sessionStorage.flowrate_min),
    max : parseFloat(sessionStorage.flowrate_max),
    step : 0.01,
    value : parseFloat(sessionStorage.flowrate),
    stop : function(event,ui) {
      $("#slider_textbox").val(ui.value);
    sessionStorage.flowrate=ui.value;
    pubFlowrate();
    },
    create: sliderTooltip,
    slide: sliderTooltip
  });

  var initialValue = $("#slider").slider("option", "value");
  $("#slider_textbox").val(initialValue);
  $("#slider_textbox").change(function() {
    var oldVal = $("#slider").slider("option", "value");
    var newVal = $(this).val();
    if (isNaN(newVal) || newVal < 0.73 || newVal > 4) {
      $("#slider_textbox").val(oldVal);
    } else {
      $("#slider").slider("option", "value", newVal);
    sessionStorage.flowrate=newVal;
    $('.ui-slider-handle').html('<div class="tooltip"><div class="tooltip-inner">' + newVal + '</div><div class="tooltip-arrow"></div></div>');
    pubFlowrate();
    }

  });

  // Create UI radiobuttons
  $( "#radioset" ).buttonset();
 
  // Change event on radiobuttons
$(document).ready(function() {
  $("input[name='radio']").on("change", function(event){
    var SelectedButton = true;
    if (this.value == 'true') {
    SelectedButton = true;
    }
    else if (this.value == 'false') {
    SelectedButton = false;
    }
    pubPumpStatus(SelectedButton);

  });
});

// Create pump feedback display


// change dot color
var ChangeDotColor = function(color) {
    $('#DotDisplay').removeClass('dot-red')
                    .removeClass('dot-green')
                    .removeClass('none')
                    .addClass(color);

    if (color=='dot-red') {
      $('#DotDisplay').attr("title", "Pump off or manual mode");
    }

    if (color=='dot-green') {
      $('#DotDisplay').attr("title", "Pump on");
    }

};

$( "#ROS_node_list_display" ).dialog({
	autoOpen: false,
	width: 400,
	buttons: [
		{
			text: "Ok",
			click: function() {
				$( this ).dialog( "close" );
			}
		}
	]
});

// Link to open the dialog
$( "#ROS_node_list_display_button" ).click(function( event ) {
	$( "#ROS_node_list_display" ).dialog( "open" );
	event.preventDefault();
});



//Update GUI depending on sessionStorage values

function GUIupdate() {
  if (sessionStorage.SystemStatus=="manual") {
    document.getElementById('feedback_text').innerHTML = "Pump not powered or knob switched to manual mode";
    $( "#slider" ).slider( "option", "disabled", true );
    $("#slider_textbox").prop("disabled", true);
    ChangeDotColor('dot-red');
  }

  if (sessionStorage.SystemStatus=="auto") {
    document.getElementById("feedback_text").innerHTML='Requested - ' + 'Flowrate: ' + sessionStorage.flowrate + ' L/min   &nbsp;&nbsp;&nbsp; Voltage: ' + sessionStorage.rounded_voltage + ' V   &nbsp;&nbsp;&nbsp;   ADC count: ' + sessionStorage.count_value;

    $( "#slider" ).slider( "option", "disabled", false );
    $("#slider_textbox").prop("disabled", false);
       ChangeDotColor('dot-green');
  }

  if (sessionStorage.toggle_msg_data=="true") {
    $("input[name='radio']").value='true';
    $('#radio_PumpOn').prop('checked', true).button('refresh');
    $('#radio_PumpOff').prop('checked', false).button('refresh');
  }

  if (sessionStorage.toggle_msg_data=="false") {
    $("input[name='radio']").value='false';
    $('#radio_PumpOff').prop('checked', true).button('refresh');
    $('#radio_PumpOn').prop('checked', false).button('refresh');
  }

//$( "input[name='radio']" ).buttonset( "refresh" );

}
