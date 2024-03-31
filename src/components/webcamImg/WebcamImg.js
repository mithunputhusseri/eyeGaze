// Copyright 2023 MediaPipe & Malgorzata Pick
import React, { Fragment, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  FaceMesh,
  FACEMESH_RIGHT_EYE,
  FACEMESH_RIGHT_IRIS,
} from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors } from "@mediapipe/drawing_utils";
import Info from "../../components/info/Info";
import Keyboard from "react-simple-keyboard";
import "./_keyboard.css";
// import InfoIcon from "../../components/infoIcon/InfoIcon";

const WebcamImg = () => {
  // Global settings
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [RightIris0, setRighIris0] = useState("");
  const [RightIris1, setRighIris1] = useState("");

  const [KeyX, setKeyX] = useState(0);
  const [KeyY, setKeyY] = useState(0);
  const [SelectedLetter, setSelectedLetter] = useState("");
  const [keyboardInput, setKeyboardInput] = useState("");
  const KEYBOARD_R1 = ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "`", "{bksp}" ];
  const KEYBOARD_R2 = ["{tab}", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\" ];
  const KEYBOARD_R3 = ["{lock}", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "{enter}" ];
  const KEYBOARD_R4 = ["{shift}", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "{shift}" ];
  const KEYBOARD_R5 = [".com", "@", "{space}" ];
  
  const [grid, setGrid] = useState(Array(5).fill(Array(14).fill(0)));

  const highlightedKey = 'a'; // Replace 'a' with your constant value


  const onKeyPress = (button) => {

    setKeyboardInput((prevInput) => prevInput + button);

    setSelectedLetter(button)
    //setRighIris1(rightIris1/distance)
  };
  const deviceWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

  let width = 256.0;
  let height = 192.0;

  const maxValueRef = useRef(0);
  const minValueRef = useRef(100);

  if (deviceWidth < 670 && deviceWidth >= 510) {
    width = 480.0;
    height = 360.0;
  }
  if (deviceWidth < 510 && deviceWidth >= 390) {
    width = 360.0;
    height = 360.0;
  }
  if (deviceWidth < 390) {
    width = 240.0;
    height = 240.0;
  }

  const videoConstraints = {
    width: width,
    height: height,
    facingMode: "user",
  };

  // Function to calculate distance between two points / pupils
  const getDistance = (p1, p2) => {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    );
  };

  // Loading webcam and setting Face Mesh API when image source changes
  useEffect(() => {
    // Function to run canvas with video and Face Mesh when ready
    const onResults = (results) => {
      // Setting canvas - references and context
      const canvasElement = canvasRef.current;
      canvasElement.width = width;
      canvasElement.height = height;
      const canvasCtx = canvasElement.getContext("2d");
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      // Loading Face Mesh landmarks for iris and getting coordinates for pupils
      if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
        let pupils = {
          left: {
            x:
              (results.multiFaceLandmarks[0][FACEMESH_RIGHT_EYE[0][0]].x),
            y:
              (results.multiFaceLandmarks[0][FACEMESH_RIGHT_EYE[0][0]].y),
            z:
              (results.multiFaceLandmarks[0][FACEMESH_RIGHT_EYE[0][0]].z),
            width: getDistance(
              results.multiFaceLandmarks[0][FACEMESH_RIGHT_EYE[0][0]],
              results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[2][0]]
            ),
          },
          right: {
            x:
              (results.multiFaceLandmarks[0][FACEMESH_RIGHT_EYE[7][0]].x),
            y:
              (results.multiFaceLandmarks[0][FACEMESH_RIGHT_EYE[7][0]].y),
            z:
              (results.multiFaceLandmarks[0][FACEMESH_RIGHT_EYE[7][0]].z),
            width: getDistance(
              results.multiFaceLandmarks[0][FACEMESH_RIGHT_EYE[7][0]],
              results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[0][0]]
            ),
          },
        };

        // Setting variables for calculation disance between pupils
        let distance = getDistance(pupils.left, pupils.right);

        let rightIris0 = pupils.left.width/distance;
        let rightIris1 = pupils.right.width/distance;
        
        setRighIris0((rightIris0).toFixed(4))
        setRighIris1((rightIris1).toFixed(4))

        if (rightIris0 > 0.4) {
          setKeyX((prevX) => (prevX + 1 > 12 ? 0 : prevX + 1));

          setSelectedLetter(KEYBOARD_R1[KeyX]);
        }
        // Drawing Face Mesh results of pupils on canvas
        canvasCtx.fillStyle = "#4379b8";
        // Left
        canvasCtx.fillRect(
          results.multiFaceLandmarks[0][FACEMESH_RIGHT_EYE[0][0]].x * width - 2,
          results.multiFaceLandmarks[0][FACEMESH_RIGHT_EYE[0][0]].y * height -2,
          4,
          4
        );
        canvasCtx.fillRect(
          results.multiFaceLandmarks[0][FACEMESH_RIGHT_EYE[7][0]].x * width - 2,
          results.multiFaceLandmarks[0][FACEMESH_RIGHT_EYE[7][0]].y * height -2,
          4,
          4
        );

        canvasCtx.fillRect(
          results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[0][0]].x * width - 2,
          results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[0][0]].y * height -2,
          4,
          4
        );
        canvasCtx.fillRect(
          results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[2][0]].x * width - 2,
          results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[2][0]].y * height -2,
          4,
          4
        );


      }
      canvasCtx.restore();
    };

    // Starting new Face Mesh
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    faceMesh.onResults(onResults);

    // Starting new camera
    const videoElement = webcamRef.current;
    if (
      imgSrc === null &&
      typeof videoElement !== "undefined" &&
      videoElement !== null
    ) {
      const camera = new Camera(videoElement.video, {
        onFrame: async () => {
          await faceMesh.send({ image: videoElement.video });
        },
        width: width,
        height: height,
      });
      camera.start();
      document.querySelector(".container-img").style.display = "none";
    }
    return () => {};
  }, [imgSrc, height, width, deviceWidth,KeyX]);


  // Function for hiding container with introduction and showing container with info
  const showInfo = () => {
    document.querySelector("#card-1").style.display = "none";
    document.querySelector("#card-2").style.display = "flex";
    document.querySelector(".container-display").style.display = "none";
    document.querySelector(".container-img").style.display = "none";
  };

  // Function for hiding container with info and showing results with video
  const openApp = () => {
    document.querySelector("#card-1").style.display = "none";
    document.querySelector(".container-display").style.display = "flex";
  };


  // Function to reset image source and showing back video section
  const resetPhoto = () => {
    setImgSrc(null);
    document.querySelector(".container-display").style.display = "flex";
  };

  // DOM elements which shows depending on what's happening in app
  return (
    <Fragment>
      <div className="container-app">
        <div className="container-card" id="card-1">
          <picture>
            <source
              srcSet={process.env.PUBLIC_URL + "/images/eye-scanner-64.png"}
              media="(max-width: 390px)"
            />
            <source
              srcSet={process.env.PUBLIC_URL + "/images/eye-scanner-96.png"}
              media="(max-width: 670px)"
            />
            <img
              src={process.env.PUBLIC_URL + "/images/eye-scanner-128.png"}
              alt="eye scanner"
            />
          </picture>
          <p>
            You can measure your PD here with this digital test, click the
            button to read instruction.
          </p>
          <button
            id="show-info-btn"
            onClick={(ev) => {
              openApp();
              ev.preventDefault();
            }}
          >
            Start
          </button>
        </div>
        <div className="container-display" style={{ display: "none" }}>
          <div className="container-video">
            <Webcam
              ref={webcamRef}
              videoConstraints={videoConstraints}
              width={width}
              height={height}
              audio={false}
              imageSmoothing={true}
              screenshotFormat="image/jpeg"
              id="input-video"
              className="result"
              style={{
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                display: "none",
              }}
            />{" "}
            <canvas
              ref={canvasRef}
              id="output-canvas"
              className="result"
              style={{
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: width,
                height: height,
              }}
            ></canvas>
            <div className="values">
              <p>{"left : " + KeyX}</p>
              <p>{"Letter : " + SelectedLetter}</p>
              <p>{"right : " + KeyX}</p>
            </div>
          </div>
            <div className="virtual-keyboard" style={{ width: "100%", height:"50px",  }}>
            <Keyboard
            onChange={(input) => setKeyboardInput(input)}
            onKeyPress={(button) => onKeyPress(button)}
            layout={{
              default: [
                "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                "{tab} q w e r t y u i o p [ ] \\",
                "{lock} a s d f g h j k l ; ' {enter}",
                "{shift} z x c v b n m , . / {shift}",
                ".com @ {space}"
              ],
              shift: [
                "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
                "{tab} Q W E R T Y U I O P { } |",
                '{lock} A S D F G H J K L : " {enter}',
                "{shift} Z X C V B N M < > ? {shift}",
                ".com @ {space}"
              ]
            }}
            buttonTheme={[
              {
                class: "hg-red",
                buttons: SelectedLetter
              }
              ]}
            />
          </div>
        </div>
        <div className="container-img">
          <img src={imgSrc} className="result" id="photo" alt="screenshot" />
          <div className="values">
            <button
              id="retake-btn"
              onClick={(ev) => {
                resetPhoto();
                ev.preventDefault();
              }}
            >
              Retake
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default WebcamImg;
