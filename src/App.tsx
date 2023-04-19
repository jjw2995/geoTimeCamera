import { useEffect, useState } from "react";
import { useRef } from "react";
import { CanvasHTMLAttributes } from "react";

/**
 *
 *
 *
 */

async function getGeo() {
	const getGeoQueryURL = (lat: number, lon: number) => {
		return `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
	};

	try {
		const { coords, timestamp }: GeolocationPosition = await new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject);
		});

		const a = await (await fetch(getGeoQueryURL(coords.latitude, coords.longitude))).json();

		return { state: a.principalSubdivision, city: a.city, country: a.countryName };
	} catch (error) {
		console.log(error);
		return null;
	}
}

/**
 *
 * getCameraVideoStream
 *
 *
 */

function useUserMedia(requestedMedia: MediaStreamConstraints) {
	const [mediaStream, setMediaStream] = useState<MediaStream>();

	console.log(requestedMedia);

	useEffect(() => {
		async function enableStream() {
			try {
				const stream = await navigator.mediaDevices.getUserMedia(requestedMedia);
				setMediaStream(stream);
				console.log(stream);
			} catch (error) {
				console.log(error);
				// enableStream();
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

// function App() {
// 	const [geo, setGeo] = useState<{ city: string; state: string; country: string }>();
// 	const [width, height] = [window.screen.width, window.screen.height];
// 	const [mediaStream, setMediaStream] = useState();
// 	const [isSelfie, setIsSelfie] = useState(true);

// 	// const mediaStream = useUserMedia({
// 	// 	video: { deviceId: undefined },
// 	// 	// video: { facingMode: isSelfie ? "environment" : "user" },
// 	// 	// audio: false,
// 	// });

// 	const videoRef = useRef<HTMLVideoElement>(null);
// 	const c1 = useRef<HTMLCanvasElement>(null);
// 	const c2 = useRef<HTMLCanvasElement>(null);

// 	function flipCamera() {}

// 	function updateFrameC1() {
// 		const ctx = c1.current.getContext("2d");
// 		// ctx?.font = "";
// 		if (c1.current && videoRef.current) {
// 			ctx.drawImage(videoRef.current, 0, 0);
// 			// ctx?.strokeText("test", 0, 0);
// 		}
// 		requestAnimationFrame(updateFrameC1);
// 	}

// 	function takePicture() {
// 		if (c2.current && videoRef.current) {
// 			// c2.current
// 			const ctx = c2.current.getContext("2d");
// 			// ctx.drawImage(videoRef.current, 0, 0);
// 			if (ctx) {
// 				ctx.font = "48px bold solid Calibri";
// 				ctx.strokeStyle = "magenta";
// 				ctx.strokeText("magenta", 20, 100);
// 			}
// 			// c2.current.
// 		}
// 	}
// 	if (mediaStream && videoRef.current) {
// 		videoRef.current.srcObject = mediaStream;
// 		updateFrameC1();
// 	}

// 	async function updateGeo() {
// 		setGeo(await getGeo());
// 	}

// 	useEffect(() => {
// 		navigator.mediaDevices.enumerateDevices().then((r) => {
// 			console.log(r.filter((v) => v.kind === "videoinput"));
// 			// r[1].
// 		});
// 		updateGeo();
// 		const a = setInterval(async () => {
// 			updateGeo();
// 		}, 30000);
// 		return () => clearInterval(a);
// 	}, []);

// 	return (
// 		<div>
// 			{mediaStream ? (
// 				<video autoPlay ref={videoRef} width={width} height={height}></video>
// 			) : (
// 				<div>grant camera permission</div>
// 			)}
// 			<canvas id="canvas" ref={c1}></canvas>
// 			<button
// 				onClick={() => {
// 					takePicture();
// 					// URL.createObjectURL()
// 				}}
// 			>
// 				take photo
// 			</button>
// 			<button
// 				onClick={() => {
// 					setIsSelfie((r) => !r);
// 				}}
// 			>
// 				toggle selfie
// 			</button>
// 			<canvas
// 				ref={c2}
// 				onClick={() => {
// 					// go to gallery
// 				}}
// 			></canvas>

// 			{geo ? (
// 				<div>
// 					{geo.city}, {geo.state}, {geo.country}
// 				</div>
// 			) : null}
// 		</div>
// 	);
// }
const SAVE_DIR = "GeoTimeCam";

function useFileSystem() {
	const [dirHandle, setSaveDirHandle] = useState<FileSystemDirectoryHandle>(null);

	async function initDirHandle() {
		if (!dirHandle) {
			const rootDir = await window.showDirectoryPicker({ id: 0, mode: "readwrite", startIn: "pictures" });

			const saveDir = await rootDir.getDirectoryHandle(SAVE_DIR, { create: true });
			setSaveDirHandle(saveDir);
			return saveDir;
		}
		return dirHandle;
	}
	async function saveImage(blob: Blob) {
		const handle = await initDirHandle();
		const fHandle = await handle.getFileHandle(`${Date.now()}.jpg`, { create: true });
		const writable = await fHandle.createWritable();

		await writable.write(blob);
		await writable.close();
		return fHandle;
	}
	// async function getImages(): FileSystemFileHandle[] {
	// 	// dirHandle.entries()
	// }
	async function removeImage(imageHandle: FileSystemFileHandle) {}
	// async function (){}
	return { dirHandle, saveImage };
}

function useCamera() {
	/**
	 * grabCamera
	 * return feed
	 */
	const [camInfos, setCamInfos] = useState<InputDeviceInfo[]>();
	const [curStream, setCurStream] = useState<MediaStream>();

	function getNextCamera() {
		if (curStream) {
			const curCamIndex = camInfos.findIndex(
				(cam) => cam.deviceId === curStream.getVideoTracks()[0].getSettings().deviceId
			);
			const nextCamIndex = (curCamIndex + 1) % camInfos.length;
			setStream({ video: { deviceId: camInfos[nextCamIndex].deviceId } });
		}
	}

	function setCameraInfos(curStream: MediaStream) {
		navigator.mediaDevices
			.enumerateDevices()
			.then((r) => r.filter((v) => v.kind === "videoinput"))
			.then((r) => {
				setCamInfos(r);
			});
	}

	function setStream(constraints: MediaStreamConstraints = { video: true }) {
		return navigator.mediaDevices
			.getUserMedia(constraints)
			.then((r) => {
				if (!camInfos) {
					setCameraInfos(r);
				}
				setCurStream(r);
			})
			.catch((e: DOMException) => {
				setCamInfos(undefined);
			});
	}

	useEffect(() => {
		setStream();
	}, []);

	return { camInfos, curStream, getNextCamera };
}

function App() {
	const hiddenVideoRef = useRef<HTMLVideoElement>(null);
	const viewFinderRef = useRef<HTMLCanvasElement>(null);
	const galleryRef = useRef<HTMLCanvasElement>(null);
	const { dirHandle, saveImage } = useFileSystem();
	const { camInfos, curStream, getNextCamera } = useCamera();

	async function takePhoto() {
		galleryRef.current!.getContext("2d")!.drawImage(viewFinderRef.current!, 0, 0);
		// console.log(Date.now());

		const blob = await new Promise<Blob>((resolve) => {
			galleryRef.current.toBlob((blob) => {
				resolve(blob);
			}, "image/webp");
		});

		await saveImage(blob);
	}
	function setStreamSrc(src: MediaStream) {
		if (hiddenVideoRef.current && viewFinderRef.current) {
			hiddenVideoRef.current.srcObject = src;
			renderViewFinder();
		}
	}

	function renderViewFinder() {
		const ctx = viewFinderRef.current!.getContext("2d")!;
		function step() {
			ctx.drawImage(hiddenVideoRef.current!, 0, 0);
			requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	useEffect(() => {
		// viewFinderRef.current.
		if (curStream) {
			setStreamSrc(curStream);
		}
	}, [curStream]);

	//

	return (
		<div>
			{/* {dirHandle ? (
				<div>note: I have access to directory you chose</div>
			) : (
				<div>note: I need directory access</div>
			)} */}
			{camInfos && <div>{JSON.stringify(camInfos)}</div>}
			<br />
			{curStream && <div>{JSON.stringify(curStream.id)}</div>}
			<br />
			{curStream && (
				<div>
					<br />
					<video autoPlay ref={hiddenVideoRef} width={300} height={300}></video>
					<button
						onClick={() => {
							getNextCamera();
						}}
					>
						rotate
					</button>
					<canvas ref={viewFinderRef}></canvas>
					<button
						onClick={async () => {
							await takePhoto();
						}}
					>
						shoot
					</button>
					<div>
						gallery
						<canvas ref={galleryRef}></canvas>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
