//var rbServer = new ROSLIB.Ros({
//    url : 'ws://localhost:9090'
//  });

var rbServer={};
var flowrate_msg_Topic={};
var toggle_msg_Topic={};
var listener={};
var flowrate_msg={};
var toggle_msg={};

// This function connects to the rosbridge server running on the local computer on port 9090
function startConnection() {
  rbServer = new ROSLIB.Ros({
    url : 'ws://localhost:9090'
  });

  // This function is called upon the rosbridge connection event
  rbServer.on('connection', function() {
    // Write appropriate message to #websocket_status div when successfully connected to rosbridge
    $("#websocket_status").removeClass();
    $("#websocket_status").addClass('ui-state-checked ui-corner-all');
    $("#websocket_status").html('<p><span class="ui-icon ui-icon-check"  style="float: left; margin-right:.3em;"></span>'+'Connected to websocket server'+'</p>');
CreateTopicsAndMessages();
startListener();
SendStatusRequest();
GUIupdate();
  });

  // This function is called when there is an error attempting to connect to rosbridge
  rbServer.on('error', function(error) {
    // Write appropriate message to #websocket_status div upon error when attempting to connect to rosbridge
    $("#websocket_status").removeClass();
    $("#websocket_status").addClass('ui-state-error ui-corner-all');
    $("#websocket_status").html('<p><span class="ui-icon ui-icon-alert" style="float: left; margin-right:.3em;"></span>'+'Error connecting to websocket server'+'</p>');
  });

  // This function is called when the connection to rosbridge is closed
  rbServer.on('close', function() {
    // Write appropriate message to #websocket_status div upon closing connection to rosbridge
    $("#websocket_status").removeClass();
    $("#websocket_status").addClass('ui-state-error ui-corner-all');
    $("#websocket_status").html('<p><span class="ui-icon ui-icon-info" style="float: left; margin-right:.3em;"></span>'+'Connection to websocket server closed'+'</p>');
    closeROS();
    setInterval(startConnection(),1000);
  });
}

function CreateTopicsAndMessages() {
  // Create topic /Flow_rate_value
  flowrate_msg_Topic = new ROSLIB.Topic({
    ros : rbServer,
    name : '/Flow_rate_value',
    messageType : 'std_msgs/Float32'
  });

  // Create topic /Switch_pump_off
  toggle_msg_Topic = new ROSLIB.Topic({
    ros : rbServer,
    name : '/Switch_pump_off',
    messageType : 'std_msgs/Bool'
  });

  //Subscribe to topic /pump_com
  listener = new ROSLIB.Topic({
    ros : rbServer,
    name : '/pump_com',
    messageType : 'std_msgs/String'
  });

  // Create messages
  flowrate_msg = new ROSLIB.Message({
    data : sessionStorage.flowrate_msg_data
  });
  toggle_msg = new ROSLIB.Message({
    data : sessionStorage.toggle_msg_data
  });
}


function startListener() {
  listener.subscribe(function(message) {
    sessionStorage.listener_message = message.data;


    if (parseFloat(message.data)==sessionStorage.flowrate) {
      document.getElementById("feedback_text").innerHTML='Requested - ' + 'Flowrate: ' + sessionStorage.flowrate + ' L/min   &nbsp;&nbsp;&nbsp; Voltage: ' + sessionStorage.rounded_voltage + ' V   &nbsp;&nbsp;&nbsp;   ADC count: ' + sessionStorage.count_value;

    }

    if (message.data=="on" && sessionStorage.SystemStatus=="auto") {
      document.getElementById("feedback_text").innerHTML= 'Digital switch on - ' + 'Requested - ' + 'Flowrate: ' + sessionStorage.flowrate + ' L/min   &nbsp;&nbsp;&nbsp; Voltage: ' + sessionStorage.rounded_voltage + ' V   &nbsp;&nbsp;&nbsp;   ADC count: ' + sessionStorage.count_value;
       $( "#slider" ).slider( "option", "disabled", false );
       $("#slider_textbox").prop("disabled", false);

    }

    if (message.data=="on" && sessionStorage.SystemStatus=="manual") {
      document.getElementById('feedback_text').innerHTML = "Digital switch on but pump switched off or knob set to manual mode";
       $( "#slider" ).slider( "option", "disabled", true );
       $("#slider_textbox").prop("disabled", true);

    }

    if (message.data=="off") {
      document.getElementById('feedback_text').innerHTML = "Digital switch off";
      $( "#slider" ).slider( "option", "disabled", true );
      $("#slider_textbox").prop("disabled", true);

    }

    if (message.data=="manual") {
      document.getElementById('feedback_text').innerHTML = "Pump not powered or knob switched to manual mode";
      $( "#slider" ).slider( "option", "disabled", true );
      $("#slider_textbox").prop("disabled", true);
      ChangeDotColor('dot-red');

      sessionStorage.SystemStatus="manual";
    }

    if (message.data=="auto" && sessionStorage.toggle_msg_data == "true") {
      document.getElementById("feedback_text").innerHTML='Requested - ' + 'Flowrate: ' + sessionStorage.flowrate + ' L/min   &nbsp;&nbsp;&nbsp; Voltage: ' + sessionStorage.rounded_voltage + ' V   &nbsp;&nbsp;&nbsp;   ADC count: ' + sessionStorage.count_value;

       $( "#slider" ).slider( "option", "disabled", false );
       $("#slider_textbox").prop("disabled", false);
       ChangeDotColor('dot-green');

      sessionStorage.SystemStatus="auto";
    }


    if (message.data=="auto" && sessionStorage.toggle_msg_data == "false") {
      document.getElementById('feedback_text').innerHTML = "Digital switch off";
       $( "#slider" ).slider( "option", "disabled", true );
       $("#slider_textbox").prop("disabled", true);
       ChangeDotColor('dot-green');

      sessionStorage.SystemStatus="auto";
    }
    //  listener.unsubscribe();
  });
}

function SendStatusRequest() {

  if (sessionStorage.toggle_msg_data !== "false") {
    // Turn digital switch on
    toggle_msg.data = true;

    // Publish the message 
    toggle_msg_Topic.publish(toggle_msg);

    sessionStorage.toggle_msg_data = true;
  }

    // Set 99999 as message for Status request
    flowrate_msg.data = 99999;

    // Publish the message 
    flowrate_msg_Topic.publish(flowrate_msg);

}

/* This function:
 - retrieves numeric values from the text boxes
 - assigns these values to the appropriate values in the flowrate_msg
 - publishes the message to the /flowrate_value topic.
 */

//console.log(flowrate_value);
function pubFlowrate() {
    
  // Set the variables value to 0
  var voltage_value = 0.0;
  // get values from text input field
  flowrate_value = parseFloat(sessionStorage.flowrate);

    if (flowrate_value < 0.73) {flowrate_value = 0.73;}
    if (flowrate_value > 4) {flowrate_value = 4;}

    // Set the appropriate values on the message object
    flowrate_msg.data = flowrate_value;

    // Update sessionStorage
    sessionStorage.flowrate_msg_data=flowrate_value;

    // Publish the message 
    flowrate_msg_Topic.publish(flowrate_msg);

    //Calculate variables
    voltage_value = flowrate_value * 2.53 - 1.91;

    if (voltage_value < 0) {voltage_value = 0;}
    sessionStorage.count_value = Math.round(voltage_value *463.86);

    sessionStorage.rounded_voltage = +(Math.round(voltage_value + "e+2")  + "e-2");

    //Update the page
/*
    document.getElementById("feedback_text").innerHTML='Requested - ' + 'Flowrate: ' + sessionStorage.flowrate + ' L/min   &nbsp;&nbsp;&nbsp; Voltage: ' + sessionStorage.rounded_voltage + ' V   &nbsp;&nbsp;&nbsp;   ADC count: ' + sessionStorage.count_value;
*/
}

function pubPumpStatus(status) {
    
 //   Set the appropriate value of message object according to value in text box
    
    var toggle_value = true;

    // get values from pump status buttons


	if (status==true) {
	toggle_value = true;
	//document.getElementById('feedback_text').innerHTML = "Pump switched on";
	}
	else if (status==false) {
		toggle_value = false;
	//document.getElementById('feedback_text').innerHTML = "Pump switched off";
	}


    // Set the appropriate values on the message object
    toggle_msg.data = toggle_value;

    // Update SessionStorage
    sessionStorage.toggle_msg_data=toggle_value;

    // Publish the message 
    toggle_msg_Topic.publish(toggle_msg);
}

function closeROS() {
  if (!jQuery.isEmptyObject(flowrate_msg_Topic)) {
    flowrate_msg_Topic.unadvertise();
  }

  if (!jQuery.isEmptyObject(toggle_msg_Topic)) {
    toggle_msg_Topic.unadvertise();
  }

  if (!jQuery.isEmptyObject(listener)) {
listener.unsubscribe();
  }
}

function getTopics() {
    var topicsClient = new ROSLIB.Service({
    ros : rbServer,
    name : '/rosapi/topics',
    serviceType : 'rosapi/Topics'
    });

    var request = new ROSLIB.ServiceRequest();
    topicsClient.callService(request, function(result) {
      sessionStorage.TopicsList = result.nodes;
      console.log("Getting topics...");
      console.log(result.topics);
    });
};

function getServices() {
    var servicesClient = new ROSLIB.Service({
    ros : rbServer,
    name : '/rosapi/services',
    serviceType : 'rosapi/Services'
    });

    var request = new ROSLIB.ServiceRequest();
    servicesClient.callService(request, function(result) {
      sessionStorage.ServicesList = result.nodes;
      console.log("Getting services...");
      console.log(result.services);
    });
};

function getNodes() {
    var nodesClient = new ROSLIB.Service({
    ros : rbServer,
    name : '/rosapi/nodes',
    serviceType : 'rosapi/Nodes'
    });

    var request = new ROSLIB.ServiceRequest();

    nodesClient.callService(request, function(result) {
    sessionStorage.NodesList = result.nodes;
console.log(Array.isArray(result.nodes));
      console.log("Getting nodes...");
      console.log(result.nodes);
    });
};

function UpdateROS() {

  getNodes();
  
  $("#ROS_node_list_display").html(StringArrayToHTMLDisplay(sessionStorage.NodesList));

  if (sessionStorage.NodesList.indexOf("/serial_node") != -1) {
    $("#Rosserial_status").removeClass();
    $("#Rosserial_status").addClass('ui-state-checked ui-corner-all');
    $("#Rosserial_status").html('<p><span class="ui-icon ui-icon-check"  style="float: left; margin-right:.3em;"></span>'+'Rosserial on'+'</p>');
  }
  else {
    $("#Rosserial_status").removeClass();
    $("#Rosserial_status").addClass('ui-state-error ui-corner-all');
    $("#Rosserial_status").html('<p><span class="ui-icon ui-icon-info" style="float: left; margin-right:.3em;"></span>'+'Rosserial off'+'</p>');
  }

}

function StringArrayToHTMLDisplay(stringarray) {
  array = stringarray.split(",");
  var htmlstring="";
  for (var i = 0, len = array.length; i < len; i++) {
    htmlstring = htmlstring  + '<br>' + array[i];
  }
  return htmlstring;
}
