cv.onRuntimeInitialized = () => {
	console.log('opencv ready');
	const loading = new Loader();
	loading.init();
	loading.hide();

	// playVideo();

	const video = document.querySelector('#input');
	const capture = new cv.VideoCapture(video);

	// take the first frame of the video
	const frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
	capture.read(frame);

	// location of the tracking window
	// Rect(left, top, width, height)
	let trackWindow = new cv.Rect(40, 130, 80, 60);

	// setup the ROI for tracking
	const roi = frame.roi(trackWindow);
	const hsvRoi = new cv.Mat();
	cv.cvtColor(roi, hsvRoi, cv.COLOR_RGBA2RGB);
	cv.cvtColor(hsvRoi, hsvRoi, cv.COLOR_RGB2HSV);

	const mask = new cv.Mat();
	const lowScalar = new cv.Scalar(30, 30, 0);
	const highScalar = new cv.Scalar(180, 180, 180);

	const low = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), lowScalar);
	const high = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), highScalar);

	cv.inRange(hsvRoi, low, high, mask);

	const roiHist = new cv.Mat();
	const hsvRoiVec = new cv.MatVector();
	hsvRoiVec.push_back(hsvRoi);

	cv.calcHist(hsvRoiVec, [0], mask, roiHist, [180], [0, 180]);
	cv.normalize(roiHist, roiHist, 0, 255, cv.NORM_MINMAX);

	// delete unused mats
	roi.delete();
	hsvRoi.delete();
	mask.delete();
	low.delete();
	high.delete();
	hsvRoiVec.delete();

	// set up the termination criteria, either 10 iterations or move by at least 1 pt
	const termCrit = new cv.TermCriteria(
		cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT,
		10,
		1
	);
	const hsv = new cv.Mat(video.height, video.width, cv.CV_8UC3);
	const dst = new cv.Mat();
	const hsvVec = new cv.MatVector();
	hsvVec.push_back(hsv);

	function render() {
		capture.read(frame);
		cv.cvtColor(frame, hsv, cv.COLOR_RGBA2RGB);
		cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
		cv.calcBackProject(hsvVec, [0], roiHist, dst, [0, 180], 1);

		// apply the meanshift to get the new location
		// and it also returnsnumber of iterations meanShift took to converge,
		// which is useless in this demo ... 🤔
		[, trackWindow] = cv.meanShift(dst, trackWindow, termCrit);

		// draw it on image
		const [x, y, w, h] = [
			trackWindow.x,
			trackWindow.y,
			trackWindow.width,
			trackWindow.height
		];
		cv.rectangle(
			frame,
			new cv.Point(x, y),
			new cv.Point(x + w, y + h),
			[255, 255, 255, 255],
			2
		);

		cv.imshow('output', frame);

		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);

	playVideo();
};

function Loader() {
	this.init = init;
	this.hide = hide;
	this.show = show;

	function init() {
		this.element = document.querySelector('#loading-overlay');
	}
	function hide() {
		this.element.classList.add('hidden');
	}
	function show() {
		this.element.classList.remove('hidden');
	}
}

function playVideo() {
	const video = document.querySelector('#input');
	video.play();
}
