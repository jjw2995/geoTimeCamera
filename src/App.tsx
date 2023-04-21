import { useEffect, useState } from "react";
import { useRef } from "react";

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

const SAVE_DIR = "GeoTimeCam";

function useFileSystem() {
	const [dirHandle, setSaveDirHandle] = useState<FileSystemDirectoryHandle>(null);

	async function initDirHandle() {
		if (!dirHandle) {
			const rootDir = await window.showDirectoryPicker({ id: 0, mode: "readwrite" });

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
			setStream(camInfos[nextCamIndex].deviceId);
			// setStream({ video: { deviceId: camInfos[nextCamIndex].deviceId } });
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

	function setStream(deviceId?: ConstrainDOMString) {
		let constraints: MediaStreamConstraints = {
			video: { frameRate: 60, width: { ideal: 4096 }, height: { ideal: 2160 }, deviceId: deviceId },
		};
		console.log(constraints);

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

import { fileOpen, directoryOpen, fileSave, supported } from "browser-fs-access";

function App() {
	const hiddenVideoRef = useRef<HTMLVideoElement>(null);
	const viewFinderRef = useRef<HTMLCanvasElement>(null);
	const galleryRef = useRef<HTMLCanvasElement>(null);
	const { dirHandle, saveImage } = useFileSystem();
	const { camInfos, curStream, getNextCamera } = useCamera();
	console.log(window.screen);

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
			console.log(src.getVideoTracks()[0].getSettings());

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
			hiddenVideoRef.current.setAttribute;
			// hiddenVideoRef.current.height()
		}
	}, [curStream]);

	const { height, width } = window.screen;
	//1440 1920
	const [yes, setYes] = useState(false);
	useEffect(() => {
		// if ("showDirectoryPicker" in window) {
		// 	setYes(true);
		// }
		directoryOpen().then((r) => {
			console.log(r);
		});
	}, []);

	return (
		<div>
			{/* {yes ? <div>showDirectoryPicker in window</div> : <div>showDirectoryPicker NOT in window</div>} */}
			{/* {dirHandle ? (
				<div>note: I have access to directory you chose</div>
			) : (
				<div>note: I need directory access</div>
			)} */}
			{curStream && (
				<div>
					<div className="bg-slate-300">
						{JSON.stringify(curStream.getVideoTracks()[0].getSettings().aspectRatio)}
					</div>
					<div>{JSON.stringify(curStream.getVideoTracks()[0].getSettings().width)}</div>
					<div>{JSON.stringify(curStream.getVideoTracks()[0].getSettings().height)}</div>
					<br />
					<video className="bg-slate-300" autoPlay ref={hiddenVideoRef} width={width}></video>
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
