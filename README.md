# geoTimeCamera

### simple PWA for watermarking picture with geolocation and time

### downsides

navigator.permissions.query does not reliably work for camera

-   User has to refresh after giving camera permission: cannot attach event listener to update render
-   user needs to confirm which folder init save directory on every cold start, limitation of web app though seems like RFC is in for letting devs

<!-- ## Stopping Development

learned that android chrome does not have support for file system API, hence  -->
