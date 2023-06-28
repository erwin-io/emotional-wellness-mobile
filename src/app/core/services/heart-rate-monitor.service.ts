import { Injectable } from '@angular/core';

export class HeartRateMonitorConfiguration {
	videoElement;
	samplingCanvas;
	graphCanvas;
	graphColor;
	graphWidth;
	onBpmChange;
}

@Injectable({
  providedIn: 'root'
})
export class HeartRateMonitorService {


  
	// Size of sampling image
	IMAGE_WIDTH = 30;
	IMAGE_HEIGHT = 30;

	// Array of measured samples
	SAMPLE_BUFFER = [];

	// Max 5 seconds of samples (at 60 samples per second)
	// Measurement isn't dependant on frame rate but the visual speed of the graph is
	MAX_SAMPLES = 60 * 5;

	// How long to wait in milliseconds for the camera image to stabilize before starting measurement
	START_DELAY = 1500;

	// Callback for reporting the measured heart rate
	ON_BPM_CHANGE;

	// The <video> element for streaming the camera feed into
	VIDEO_ELEMENT;

	// Canvas element for sampling image data from the video stream
	SAMPLING_CANVAS;

	// Sampling canvas 2d context
	SAMPLING_CONTEXT;

	// Canvas element for the graph
	GRAPH_CANVAS;

	// Graph canvas 2d context
	GRAPH_CONTEXT;

	// Color of the graph line
	GRAPH_COLOR;

	// Width of the graph line
	GRAPH_WIDTH;

	// Whether to print debug messages
	DEBUG = false;

	// Video stream object
	VIDEO_STREAM;

	MONITORING = false;

  bpmLogs = []

  constructor() { }

	// Debug logging
	private log(...args) {
		if (this.DEBUG) {
			console.log(...args);
			document.querySelector("#debug-log").innerHTML += args + "<br />";
		}
	}

	// Get an average brightness reading
	private averageBrightness = (canvas, context) => {
		// 1d array of r, g, b, a pixel data values
		const pixelData = context.getImageData(
			0,
			0,
			canvas.width,
			canvas.height
		).data;
		let sum = 0;

		// Only use the red and green channels as that combination gives the best readings
		for (let i = 0; i < pixelData.length; i += 4) {
			sum = sum + pixelData[i] + pixelData[i + 1];
		}

		// Since we only process two channels out of four we scale the data length to half
		const avg = sum / (pixelData.length * 0.5);

		// Scale to 0 ... 1
		return avg / 255;
	};

	initialize(configuration: HeartRateMonitorConfiguration) {
		this.VIDEO_ELEMENT = configuration.videoElement;
		this.SAMPLING_CANVAS = configuration.samplingCanvas;
		this.GRAPH_CANVAS = configuration.graphCanvas;
		this.GRAPH_COLOR = configuration.graphColor;
		this.GRAPH_WIDTH = configuration.graphWidth;
		this.ON_BPM_CHANGE = configuration.onBpmChange;
		this.SAMPLING_CONTEXT = this.SAMPLING_CANVAS.getContext("2d");
		this.GRAPH_CONTEXT = this.GRAPH_CANVAS.getContext("2d");

		if (!navigator.mediaDevices) {
			// TODO: use something nicer than an alert
			alert(
				"Sorry, your browser doesn't support camera access which is required by this app."
			);
			return false;
		}

		// Setup event listeners
		window.addEventListener("resize", this.handleResize);

		// Set the canvas size to its element size
		this.handleResize();
	}

	private handleResize = () => {
		this.log(
			"handleResize",
			this.GRAPH_CANVAS.clientWidth,
			this.GRAPH_CANVAS.clientHeight
		);
		this.GRAPH_CANVAS.width = this.GRAPH_CANVAS.clientWidth;
		this.GRAPH_CANVAS.height = this.GRAPH_CANVAS.clientHeight;
	};

	toggleMonitoring() {
		this.MONITORING ? this.stopMonitoring() : this.startMonitoring();
	};

	private getCamera = async () => {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const cameras = devices.filter(
			(device) => device.kind === "videoinput"
		);
		return cameras[cameras.length - 1];
	};

	private startMonitoring = async () => {
		this.stopMonitoring();
		this.bpmLogs = [];
		this.resetBuffer();
		this.handleResize();
		this.setBpmDisplay("");

		const camera = await this.getCamera();
		this.VIDEO_STREAM = await this.startCameraStream(camera);

		if (!this.VIDEO_STREAM) {
			throw Error("Unable to start video stream");
		}

		try {
			this.setTorchStatus(this.VIDEO_STREAM, true);
		} catch (e) {
			alert("Error:" + e);
		}

		this.SAMPLING_CANVAS.width = this.IMAGE_WIDTH;
		this.SAMPLING_CANVAS.height = this.IMAGE_HEIGHT;
		this.VIDEO_ELEMENT.srcObject = this.VIDEO_STREAM;
		this.VIDEO_ELEMENT.play();
		this.MONITORING = true;

		// Waiting helps stabilaze the camera image before taking samples
		this.log("Waiting before starting mainloop...");
		setTimeout(async () => {
			this.log("Starting mainloop...");
			this.monitorLoop();
		}, this.START_DELAY);
	};

	private async stopMonitoring() {
		this.setTorchStatus(this.VIDEO_STREAM, false);
		this.VIDEO_ELEMENT.pause();
		this.VIDEO_ELEMENT.srcObject = null;
		this.MONITORING = false;
	};

	monitorLoop() {
		this.processFrame();
		if (this.MONITORING) {
			window.requestAnimationFrame(this.monitorLoop);
		}
	};

	private resetBuffer() {
		this.SAMPLE_BUFFER.length = 0;
	};

	private async startCameraStream(camera) {
		// At this point the browser asks for permission
		let stream;
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: {
					deviceId: camera.deviceId,
					facingMode: ["user", "environment"],
					width: { ideal: this.IMAGE_WIDTH },
					height: { ideal: this.IMAGE_HEIGHT },
				},
			});
		} catch (error) {
			alert("Failed to access camera!\nError: " + error.message);
			return;
		}

		return stream;
	};

	private async setTorchStatus(stream, status) {
		// Try to enable flashlight
		try {
			const track = stream.getVideoTracks()[0];
			await track.applyConstraints({
				advanced: [{ torch: status }],
			});
		} catch (error) {
			alert("Starting torch failed.\nError: " + error.message);
		}
	};

	private setBpmDisplay(bpm) {
    this.bpmLogs.push(bpm);
		this.ON_BPM_CHANGE(bpm);
	};

	private processFrame() {
		// Draw the current video frame onto the canvas
		this.SAMPLING_CONTEXT.drawImage(
			this.VIDEO_ELEMENT,
			0,
			0,
			this.IMAGE_WIDTH,
			this.IMAGE_HEIGHT
		);

		// Get a sample from the canvas pixels
		const value = this.averageBrightness(this.SAMPLING_CANVAS, this.SAMPLING_CONTEXT);
		const time = Date.now();

		this.SAMPLE_BUFFER.push({ value, time });
		if (this.SAMPLE_BUFFER.length > this.MAX_SAMPLES) {
			this.SAMPLE_BUFFER.shift();
		}

		const dataStats = this.analyzeData(this.SAMPLE_BUFFER);
		const bpm = this.calculateBpm(dataStats.crossings);

		// TODO: Store BPM values in array and display moving average
		if (bpm) {
			this.setBpmDisplay(Math.round(bpm));
		}
		this.drawGraph(dataStats);
	};

	private analyzeData(samples) {
		// Get the mean average value of the samples
		const average =
			samples.map((sample) => sample.value).reduce((a, c) => a + c) /
			samples.length;

		// Find the lowest and highest sample values in the data
		// Used for both calculating bpm and fitting the graph in the canvas
		let min = samples[0].value;
		let max = samples[0].value;
		samples.forEach((sample) => {
			if (sample.value > max) {
				max = sample.value;
			}
			if (sample.value < min) {
				min = sample.value;
			}
		});

		// The range of the change in values
		// For a good measurement it should be between  ~ 0.002 - 0.02
		const range = max - min;

		const crossings =this.getAverageCrossings(samples, average);
		return {
			average,
			min,
			max,
			range,
			crossings,
		};
	};

	private getAverageCrossings(samples, average) {
		// Get each sample at points where the graph has crossed below the average level
		// These are visible as the rising edges that pass the midpoint of the graph
		const crossingsSamples = [];
		let previousSample = samples[0]; // Avoid if statement in loop

		samples.forEach(function (currentSample) {
			// Check if next sample has gone below average.
			if (
				currentSample.value < average &&
				previousSample.value > average
			) {
				crossingsSamples.push(currentSample);
			}

			previousSample = currentSample;
		});

		return crossingsSamples;
	};

	private calculateBpm(samples) {
		if (samples.length < 2) {
			return;
		}

		const averageInterval =
			(samples[samples.length - 1].time - samples[0].time) /
			(samples.length - 1);
		return 60000 / averageInterval;
	}

	private drawGraph(dataStats) {
		// Scaling of sample window to the graph width
		const xScaling = this.GRAPH_CANVAS.width / this.MAX_SAMPLES;

		// Set offset based on number of samples, so the graph runs from the right edge to the left
		const xOffset = (this.MAX_SAMPLES - this.SAMPLE_BUFFER.length) * xScaling;

		this.GRAPH_CONTEXT.lineWidth = this.GRAPH_WIDTH;
		this.GRAPH_CONTEXT.strokeStyle = this.GRAPH_COLOR;
		this.GRAPH_CONTEXT.lineCap = "round";
		this.GRAPH_CONTEXT.lineJoin = "round";

		this.GRAPH_CONTEXT.clearRect(0, 0, this.GRAPH_CANVAS.width, this.GRAPH_CANVAS.height);
		this.GRAPH_CONTEXT.beginPath();

		// Avoid drawing too close to the graph edges due to the line thickness getting cut off
		const maxHeight = this.GRAPH_CANVAS.height - this.GRAPH_CONTEXT.lineWidth * 2;
		let previousY = 0;
		this.SAMPLE_BUFFER.forEach((sample, i) => {
			const x = xScaling * i + xOffset;

			let y = this.GRAPH_CONTEXT.lineWidth;

			if (sample.value !== 0) {
				y =
					(maxHeight * (sample.value - dataStats.min)) /
						(dataStats.max - dataStats.min) +
            this.GRAPH_CONTEXT.lineWidth;
			}

			if (y != previousY) {
				this.GRAPH_CONTEXT.lineTo(x, y);
			}

			previousY = y;
		});

		this.GRAPH_CONTEXT.stroke();
	}

}
