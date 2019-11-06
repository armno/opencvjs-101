const videoElement = document.querySelector('#input');
async function run() {
	// capture video
	const stream = await navigator.mediaDevices.getUserMedia({
		video: true,
		audio: false
	});

	videoElement.srcObject = stream;
	videoElement.play();
}

cv.onRuntimeInitialized = () => {
	console.log('opencv is ready');
	run();

	const canvasFrame = document.querySelector('#output');
	const ctx = canvasFrame.getContext('2d');
	const source = new cv.Mat(
		videoElement.height,
		videoElement.width,
		cv.CV_8UC4
	);
	const dest = new cv.Mat(videoElement.height, videoElement.width, cv.CV_8UC1);
	const cap = new cv.VideoCapture(videoElement);

	function processVideo() {
		cap.read(source);
		cv.cvtColor(source, dest, cv.COLOR_RGBA2GRAY);
		cv.imshow('output', dest);
		requestAnimationFrame(processVideo);
	}

	requestAnimationFrame(processVideo);
};
