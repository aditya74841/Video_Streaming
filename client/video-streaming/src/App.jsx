// import "./App.css";
// import VideoPlayer from "./VideoPlayer";
// import { useRef } from "react";

// function App() {
//   const playerRef = useRef(null);
//   const videoLink =
//     "http://localhost:4000/uploads/course/f55c45ba-d5b0-461c-bef2-a39da3177dbf/index.m3u8";
//   const videoPlayerOptions = {
//     controls: true,
//     responsive: true,
//     fluid: true,
//     sources: [
//       {
//         src: videoLink,
//         type: "application/x-mpegURL",
//       },
//     ],
//   };
//   const handlePlayerReady = (player) => {
//     playerRef.current = player;

//     // You can handle player events here, for example:
//     player.on("waiting", () => {
//       videojs.log("player is waiting");
//     });

//     player.on("dispose", () => {
//       videojs.log("player will dispose");
//     });
//   };
//   return (
//     <>
//       <div>
//         <h1>Video player</h1>
//       </div>

//       <VideoPlayer options={videoPlayerOptions} onReady={handlePlayerReady} />
//     </>
//   );
// }

// export default App;

import React from "react";
import VideoPlayer from "./VideoPlayer";

const App = () => {
  const videoJsOptions = {
    // autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: "http://localhost:4000/uploads/course/4f2b0ff5-0174-4c8f-aaac-e307672d6467/index.m3u8", // Your HLS stream URL
        type: "application/x-mpegURL",
      },
    ],
  };

  return (
    <div>
      <h1>My Video Player</h1>
      <VideoPlayer options={videoJsOptions} />
    </div>
  );
};

export default App;
