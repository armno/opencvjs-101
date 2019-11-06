import * as cv from './lib/opencv';

const imgElement: HTMLImageElement = document.getElementById('imgSrc');
const inputElement = document.getElementById('fileInput');

inputElement.addEventListener(
	'change',
	e => {
		imgElement.src = URL.createObjectURL(e.target['files'][0]);
	},
	false
);

imgElement.onload = function() {
	let mat = cv.imread(imgElement);
	cv.imshow('outputCanvas', mat);
	mat.delete();
};
