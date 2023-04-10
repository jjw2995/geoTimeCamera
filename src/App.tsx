import { useEffect, useState } from "react";
import { useRef } from "react";
import { CanvasHTMLAttributes } from "react";

const getGeoQueryURL = (lat, lon) => {
	return `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
};

async function getGeo() {
	const { coords, timestamp }: GeolocationPosition = await new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject);
	});

	const a = await (await fetch(getGeoQueryURL(coords.latitude, coords.longitude))).json();

	// 	address: { city, road, state, country },
	// } = await (await fetch(getGeoQueryURL(coords.latitude, coords.longitude))).json();
	// console.log({ city, road, state, country });
	// console.log(timestamp);

	// // window.bigdatacloud_reverse_geocode

	// return { city, road, state, country };
	return { state: a.principalSubdivision, city: a.city, country: a.countryName };

	// a
}

/**
 *
 * getCameraVideoStream
 *
 *
 */

function useUserMedia(requestedMedia) {
	const [mediaStream, setMediaStream] = useState<MediaStream>(null);

	useEffect(() => {
		async function enableStream() {
			try {
				const stream = await navigator.mediaDevices.getUserMedia(requestedMedia);
				setMediaStream(stream);
			} catch (error) {
				//
			}
		}
		if (!mediaStream) {
			enableStream();
		} else {
			return function cleanup() {
				mediaStream.getTracks().forEach((track) => {
					track.stop();
				});
			};
		}
	}, [mediaStream, requestedMedia]);

	return mediaStream;
}

const CAPTURE_OPTIONS = {
	video: true,
	// video: { facingMode: "environment" },
	audio: false,
};

function App() {
	const [geo, setGeo] = useState<{ city: string; state: string; country: string }>();
	const [width, height] = [window.screen.width, window.screen.height];

	console.log(width, height);

	const mediaStream = useUserMedia(CAPTURE_OPTIONS);
	console.log(mediaStream);

	const videoRef = useRef<HTMLVideoElement>(null);
	const c1 = useRef<HTMLCanvasElement>(null);
	const c2 = useRef<HTMLCanvasElement>(null);

	function updateFrameC1() {
		if (c1.current && videoRef.current) {
			c1.current.getContext("2d").drawImage(videoRef.current, 0, 0);
		}
		requestAnimationFrame(updateFrameC1);
	}

	function takePicture() {
		if (c2.current && videoRef.current) {
			c2.current.getContext("2d").drawImage(videoRef.current, 0, 0);
			// c2.current.
		}
	}

	if (mediaStream && videoRef.current) {
		videoRef.current.srcObject = mediaStream;
		updateFrameC1();
	}

	async function updateGeo() {
		setGeo(await getGeo());
	}

	useEffect(() => {
		updateGeo();
		const a = setInterval(async () => {
			updateGeo();
		}, 30000);
		return () => clearInterval(a);
	}, []);

	return (
		<div>
			{mediaStream ? (
				<video autoPlay ref={videoRef} width={width} height={height}></video>
			) : (
				<div>grant camera permission</div>
			)}
			<canvas id="canvas" ref={c1}></canvas>
			<button
				onClick={() => {
					// takePicture();
					console.log(videoRef.current);
					const a: HTMLVideoElement = videoRef.current;
					c2.current.getContext("2d").drawImage(a, 0, 0);
				}}
			>
				take photo
			</button>
			<canvas
				ref={c2}
				onClick={() => {
					// go to gallery
				}}
			></canvas>

			{geo ? (
				<div>
					{geo.city}, {geo.state}, {geo.country}
				</div>
			) : null}
		</div>
	);
}

export default App;
