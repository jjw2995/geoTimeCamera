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
const SAVE_DIR = "myapp";

function App() {
	const vRef = useRef<HTMLVideoElement>(null);
	const viewRef = useRef<HTMLCanvasElement>(null);
	const galleryRef = useRef<HTMLCanvasElement>(null);
	const [camInfo, setCamInfo] = useState<{ cams: InputDeviceInfo[]; curCamIndex: number }>();

	const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle>(null);

	function renderViewFinder() {
		const ctx = viewRef.current!.getContext("2d")!;
		function step() {
			if (vRef && vRef.current) {
				ctx.drawImage(vRef.current!, 0, 0);
				requestAnimationFrame(step);
			}
		}
		requestAnimationFrame(step);
	}
	async function takePhoto() {
		galleryRef.current!.getContext("2d")!.drawImage(viewRef.current!, 0, 0);
		console.log(Date.now());

		const blob = await new Promise<Blob>((resolve, reject) => {
			galleryRef.current.toBlob((blob) => {
				resolve(blob);
			}, "image/jpeg");
		});

		console.log(blob);

		let fHandle = await dirHandle.getFileHandle(`${Date.now()}.jpg`, { create: true });
		const writable = await fHandle.createWritable();

		await writable.write(blob);
		await writable.close();
		// .then((fhandle) => {
		// 	fhandle.createWritable().then((w) => {
		// 		w.write(blob).then();
		// 	});
		// });
	}
	function setMediaStreamSrc(src: MediaStream) {
		if (vRef.current && viewRef.current) {
			if (src && vRef.current && viewRef.current) {
				// set vRef,viewRef
				vRef.current.srcObject = src;
				// viewRef.current.getContext("2d")!.drawImage(vRef.current, 0, 0);
				renderViewFinder();
			} else {
				//
			}
		}
	}

	function rotateCamera() {
		setCamInfo((v) => {
			if (v && v.cams) {
				let curCamIndex = (v.curCamIndex + 1) % v.cams.length;
				console.log(v);

				getSetUserMedia({ video: { deviceId: { exact: v.cams[curCamIndex].deviceId } } });
				return { ...v, curCamIndex };
			}
		});
	}

	function gotDevices(curStream: MediaStream) {
		if (!camInfo) {
			navigator.mediaDevices
				.enumerateDevices()
				.then((r) => r.filter((v) => v.kind === "videoinput"))
				.then((r) => {
					setCamInfo((v) => {
						const curDeviceIndex = curStream.getVideoTracks()[0].getSettings().deviceId;
						return {
							cams: r,
							curCamIndex: r.findIndex((v) => v.deviceId === curDeviceIndex),
						};
					});
				});
		}
	}

	//
	function getSetUserMedia(constraints: MediaStreamConstraints = { video: true }) {
		navigator.mediaDevices
			.getUserMedia(constraints)
			.then((r) => {
				setMediaStreamSrc(r);
				gotDevices(r);
			})
			.catch((e: DOMException) => {
				// set vRef, viewRef -> null
				console.log(e);

				setCamInfo(undefined);
				// setStream(undefined);
			})
			.finally(() => {
				// navigator.permissions.query({ name: "camera" }).then((r) => {
				// 	console.log(r);
				// 	r.onchange = (e) => {
				// 		getSetUserMedia();
				// 	};
				// });
			});
	}
	async function testFile() {
		const root = await navigator.storage.getDirectory();
		const handle = await root.getDirectoryHandle(SAVE_DIR, { create: true });
		// handle.
		console.log(handle);

		for await (const [key, value] of handle.entries()) {
			console.log({ key, value });
		}

		// handle.requestPermission({ mode: "readwrite" }).then((r) => {
		// 	console.log(r);
		// });
		handle.getFileHandle("test.txt", { create: true }).then((r) => {
			console.log(r);
			r.createWritable({ keepExistingData: false }).then((r) => {
				// r.write()
			});
			// r.
			r.getFile().then((r) => {
				console.log(r);

				console.log(r.webkitRelativePath);
			});
		});

		// let entries = await a.entries();
		// console.log(a);
		// a.getFileHandle("d.txt", { create: true }).then((r) => {
		// 	r.createWritable({ keepExistingData: false }).then((r) => {
		// 		// r.write({data:})
		// 	});
		// });
		// console.log(entries);
	}

	useEffect(() => {
		getSetUserMedia();
	}, []);

	return (
		<div>
			<button
				onClick={() => {
					// let a	 = new window.FileSystem();
					// navigator.permissions.query({ name: "persistent-storage" }).then((r) => {
					// 	console.log(r);
					// });
					window.showDirectoryPicker({ id: 0, mode: "readwrite", startIn: "pictures" }).then(async (r) => {
						console.log(r);
						for await (const [key, value] of r.entries()) {
							console.log({ key, value });
						}
						setDirHandle(r);
						// r.
					});
					// try {
					// 	testFile();
					// } catch (error) {
					// 	console.log(error);
					// }
				}}
			>
				file
			</button>
			<button
				onClick={async () => {
					for await (const [key, value] of dirHandle.entries()) {
						console.log({ key, value });
					}
					// const a = await dirHandle.getFileHandle("test.txt", { create: true });
					// (await a.getFile()).text();
					// a.createWritable({ keepExistingData: false }).then((r) => {
					// 	r.getWriter().write("asd");
					// 	console.log(r);
					// 	r.close();
					// });
					// viewRef.current.toD
				}}
			>
				save
			</button>
			{camInfo ? (
				<div>
					<div>{JSON.stringify(camInfo.cams[camInfo.curCamIndex])}</div>
					{camInfo.cams.map((e, i) => {
						return <div key={i}>{JSON.stringify(e)}</div>;
					})}
					<br />
					<video autoPlay ref={vRef} width={300} height={300}></video>
					<button
						onClick={() => {
							rotateCamera();
						}}
					>
						rotate
					</button>
					<canvas ref={viewRef} width={300} height={300}></canvas>
					<button
						onClick={() => {
							takePhoto();
						}}
					>
						shoot
					</button>
					<div>
						gallery
						<canvas ref={galleryRef}></canvas>
					</div>
				</div>
			) : (
				<div>allow camera permission & refresh</div>
			)}
		</div>
	);
}

export default App;
