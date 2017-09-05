# RoboticSystemGUI

Guideline for flow rate control of the pump2pictor using ROS and arduino

Installations needed:
- rosserial installed to communicate with Arduino
- rosbridge installed to communicate with html website (local port 9090)
- LAMP installed to create web server (not necessary if only used locally. Needed if control is done remotely)

Launch:
roslaunch rosbridge_server rosbridge_websocket.launch
rosrun rosserial_python serial_node.py _port:=/dev/ttyACM0 _baud:=9600
**Depend on the port, could be different than ttyACM0


****Arduino side, rosserial will start the communication with program in Arduino and create the topics:
- publisher: str_msg to topic pump_com (gives info about flow rate, relay status...)
- Subscriber: flowrate_msg (receives flowrate value) to topic Flow_rate_value
- Subscriber: toggle_msg (receives relay value) to topic Switch_pump_off

****html side, a webpage sends the command to Arduino via rosbridge. Commands done on javascript, see ros_javascript.html file:
- a javascript function starts connection with rosbridge
- topics /Flow_rate_value and /Switch_pump_off are created
- initialise variables to 0
- does the job to get values
