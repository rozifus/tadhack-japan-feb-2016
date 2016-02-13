var Camera = module.exports = function() {
	
	// Connect to ROS.
	this.ros = new ROSLIB.Ros({
		url : 'ws://192.168.0.6:9090'
	});

	// Create the main viewer.
	// this.viewer = new ROS3D.Viewer({
	// 	divID : 'viewer',
	// 	width : 800,
	// 	height : 600,
	// 	antialias : true
	// });

	// Setup a client to listen to TFs.
	this.tfClient = new ROSLIB.TFClient({
		ros : this.ros,
		angularThres : 0.01,
		transThres : 0.01,
		rate : 5.0,
		fixedFrame : '/realsense_frame'
	});

	// setup DepthCloud stream
	this.depthCloud = new ROS3D.DepthCloud({
		url : 'http://192.168.0.6:8080/stream?topic=/depthcloud_encoded&type=vp8'
		// f : 525.0
	});
	this.depthCloud.startStream();

	// Create Kinect scene node
	this.scene_object = new ROS3D.SceneNode({
		frameID : '/camera_color_optical_frame',
		tfClient : this.tfClient,
		object : this.depthCloud
	});

	// viewer.scene.add(kinectNode);
}