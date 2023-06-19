currentScreen = "intro";
let introMode = 0;
let mainScreenMode = 0;
let endingMode = 0;
let takePhotoPageMode = 0;

let firstImage,
  storyImage1,
  storyImage2,
  storyImage3,
  storyImage4,
  storyImage5,
  filterImage,
  foxImage,
  roomImage1,
  roomImage2,
  endingImage,
  noticeImage,
  QRImage,
  homeIcon,
  bgm1,
  bgm2,
  shutterSound,
  startImage;

let intro = true;
let mainScreen = false;
let selectFilterPage = false;
let takePhotoPage = false;
let selectPhotoPage = false;
let ending = false;
let mode = 0;
let capturedImage = null;
let selectPhotoCanvas;
let selectPhotoContext;
let capture;
let tracker;
let facemesh;
let video;
let predictions = [];
let faceNodes = [
  9,
  336,
  296,
  334,
  293,
  300,
  383,
  372,
  345,
  352,
  411,
  427,
  436,
  410,
  287,
  273,
  335,
  406,
  313,
  18,
  83,
  182,
  106,
  43,
  57,
  186,
  216,
  207,
  187,
  123,
  116,
  143,
  156,
  70,
  63,
  105,
  66,
  107,
];
let img_taol;
let w = 640,
  h = 480;

let drawFaceMouseClicked = false;
let url;
let photoCheck = false;
let modelReadyComplete = false;

//Firebase & QR Code
let storage;
let qrImg;
let qr;
let forQRurl;
let tagDiv;
let firebaseUploaded = false;

function preload() {
  firstImage = loadImage("assets/firstt.png");
  storyImage1 = loadImage("assets/story1.png");
  storyImage2 = loadImage("assets/story2.png");
  storyImage3 = loadImage("assets/story3.png");
  storyImage4 = loadImage("assets/story4.png");
  storyImage5 = loadImage("assets/story5.png");
  startImage = loadImage("assets/start.png");
  foxImage = loadImage("assets/fox.png");
  filterImage = loadImage("assets/filter.png");
  roomImage1 = loadImage("assets/room1.png");
  roomImage2 = loadImage("assets/room2.png");
  noticeImage = loadImage("assets/notice.png");
  endingImage = loadImage("assets/ending.png");
  QRImage = loadImage("assets/qr.png");
  AP = loadImage("assets/appleapple.png");
  hat = loadImage("assets/applehat.png");
  suit = loadImage("assets/applesuit.png");
  img_taol = loadImage("assets/filter1.png");
  homeIcon = loadImage("assets/homebutton.png");
  photoTaken = loadImage("assets/takenn.png");
  nextStep = loadImage("assets/nextlevel.png");
  photoAgain = loadImage("assets/takeaa.png");
  shutterSound = loadSound("assets/cameraShutter.mp3");
  bgm1 = loadSound("assets/music1.mp3");
  bgm2 = loadSound("assets/music2.mp3");
}

function setup() {
  createCanvas(800, 800);
  imageMode(CENTER);
  selectPhotoCanvas = createCanvas(800, 800);
  selectPhotoContext = selectPhotoCanvas.drawingContext;
  capture = createCapture(
    {
      audio: false,
      video: {
        width: 640,
        height: 480,
      },
    },
    function () {
      console.log("capture ready.");
    }
  );
  capture.elt.setAttribute("playsinline", "");
  capture.hide();
  tracker = new clm.tracker();
  tracker.init();
  tracker.start(capture.elt);
  facemesh = ml5.facemesh(capture, modelReady);

  facemesh.on("predict", (results) => {
    predictions = results;
  });

  var config = {
    apiKey: "AIzaSyCmRqcBrII0dh7rHMFz94qnGSA2DkFQXS8",
    authDomain: "ict-qr.firebaseapp.com",
    projectId: "ict-qr",
    storageBucket: "ict-qr.appspot.com",
    messagingSenderId: "992452170776",
    appId: "1:992452170776:web:8d6ba6354703bb6d1ddf6d",
    measurementId: "G-L04YZDLQW1",
    storageURL: "gs://ict-qr.appspot.com/",
  };

  firebase.initializeApp(config);

  storage = firebase.storage();

  tagDiv = createDiv();
  tagDiv.id("tagDiv")
  // tagDiv.position(285, 400); //

  textAlign(CENTER, CENTER);
  fill(255);
  text("LOADING...", width / 2, height / 2);
}

function modelReady() {
  console.log("Model ready!");
  modelReadyComplete = true;
}

function draw() {
  if (modelReadyComplete) {
    if (currentScreen === "intro") {
      drawIntro();
    } else if (currentScreen === "mainScreen") {
      drawMainScreen();
    } else if (currentScreen === "ending") {
      drawEnding();
    } else if (currentScreen === "takePhotoPage") {
      if (!photoCheck) {
        drawTakePhotoPage();
      }
    }
    image(homeIcon, 785, 15, 30, 30);
  }
}

function keyPressed() {
  console.log(currentScreen, photoCheck, mainScreenMode);
  if (keyCode === 32) {
    if (currentScreen === "intro") {
      introMode = (introMode + 1) % 6;
      bgm2.stop();
      bgm1.loop();
      if (introMode === 0) {
        currentScreen = "mainScreen";
        bgm1.stop();
        bgm2.loop();
      }
    } else if (currentScreen === "mainScreen") {
      if (mainScreenMode !== 4) {
        mainScreenMode = (mainScreenMode + 1) % 8;
        if (mainScreenMode === 0) {
          currentScreen = "ending";
          endingMode = 0;
        }
      }
    } else if (currentScreen === "ending") {
      // endingMode = (endingMode + 1) % 2;
      if (endingMode === 0 && !firebaseUploaded) {
        uploadImageToFirebase();
      }
      //   else if (endingMode === 1) {
      //   tagDiv.html("");
      //   currentScreen = "intro";
      //   endingMode = 0;
      // }
    } else if (photoCheck && currentScreen === "takePhotoPage") {
      console.log(currentScreen, photoCheck);
      takePhotoPageMode = (takePhotoPageMode + 1) % 2;
      // if (takePhotoPageMode === 0) {
      //   currentScreen = "mainScreen";
      //   mainScreenMode = 6;
      // }
      currentScreen = "mainScreen";
      mainScreenMode = 6;
      photoCheck = false;
    }
    console.log(currentScreen, photoCheck, mainScreenMode);
  }
  if (keyCode === BACKSPACE || keyCode === DELETE) {
    if (photoCheck && currentScreen === "takePhotoPage") {
      photoCheck = false;
    }
  }
}

function mousePressed() {
  console.log(mouseX, mouseY);
  console.log(currentScreen, photoCheck, endingMode);
  if (currentScreen === "mainScreen" && mainScreenMode === 4) {
    if (mouseX > 60 && mouseX < 360 && mouseY > 60 && mouseY < 360) {
      mainScreenMode = 5;
      currentScreen = "takePhotoPage";
      mode = 0;
    } else if (mouseX > 440 && mouseX < 740 && mouseY > 440 && mouseY < 740) {
      mainScreenMode = 5;
      currentScreen = "takePhotoPage";
      mode = 1;
    }
  } else if (currentScreen === "takePhotoPage" && !photoCheck) {
    // 캔버스 캡처하기
    shutterSound.play();
    selectPhotoCanvas.elt.toBlob(function (blob) {
      url = URL.createObjectURL(blob);
      capturedImage = loadImage(url);
      console.log("saved");
    });
    fill(255);
    noStroke();
    textSize(25);
    //text("촬영된 사진을 확인하세요", width / 2, height / 2 - 200);
    image(photoAgain, width / 2 - 200, height / 2 + 300 ,280,70);
    image(photoTaken, width / 2 , height / 2 -250, 280, 70);
    image(nextStep, width /2+200, height /2 + 300, 280, 70 );
    photoCheck = true;
    firebaseUploaded = false;
  }
}

function mouseClicked() {
  drawFaceMouseClicked = true;
  if (mouseX > 770 && mouseX < 800 && mouseY > 0 && mouseY < 30) {
    reset();
  }
}

function reset() {
  currentScreen = "intro";
  introMode = 0;
  mainScreenMode = 0;
  endingMode = 0;
  takePhotoPageMode = 0;
  intro = true;
  mainScreen = false;
  selectFilterPage = false;
  takePhotoPage = false;
  selectPhotoPage = false;
  ending = false;
  mode = 0;
  capturedImage = null;
  drawFaceMouseClicked = false;

  firebaseUploaded = false;
  tagDiv.html("");
  drawFaceMouseClicked = false;
  photoCheck = false;

  bgm1.stop();
  bgm2.stop();

  console.log("home");
}

function drawTakePhotoPage() {
  switch (mode) {
    case 0:
      drawFace();
      // if (drawFaceMouseClicked) {
      //   drawFace();
      //   drawFaceMouseClicked = false;
      // }
      break;
    case 1:
      image(capture, width / 2, height / 2, (height * 8) / 6, height);

      capture.loadPixels();
      for (x = 80; x < capture.width - 80; x = x + 5) {
        for (y = 0; y < capture.height; y = y + 5) {
          index = (floor(x) + floor(y) * capture.width) * 4;
          var pixelRed = capture.pixels[index];
          var pixelBlue = capture.pixels[index + 1];
          var pixelGreen = capture.pixels[index + 2];
          var pixelAlpha = capture.pixels[index + 3];
          strokeWeight(8 * Math.random());
          stroke(
            pixelRed - 13,
            pixelBlue + 15,
            pixelGreen - 5,
            pixelAlpha / (5 * Math.random())
          );
          let sx = map(x, 80, 560, 0, width);
          let sy = map(y, 0, 480, 0, height);
          line(sx + Math.random() * 5, sy, sx + 10, sy + 10 * Math.random());
        }
      }

      for (let i = 0; i < predictions.length; i += 1) {
        const keypoints = predictions[i].scaledMesh;
        let faceXYs = [];

        for (let faceNode of faceNodes) {
          faceXYs.push(keypoints[faceNode]);
        }

        if (faceXYs) {
          let [cx, cy] = centerXY(faceXYs);
          let r = distXYs(cx, cy, faceXYs);

          let rApple = r / 20;

          let sx = map(cx, 80, capture.width - 80, 0, width);
          let sy = map(cy, 0, capture.height, 0, height);

          image(AP, sx, sy, 80 * rApple, 100 * rApple);
          image(hat, sx, 0.4 * sy, 100 * rApple, 80 * rApple);
          image(suit, sx, sy + 450, 300 * rApple, 230 * rApple);
        }
      }
      break;
  }

  //   if (takePhotoPageMode === 0 && keyIsPressed && keyCode === 32) {
  //     currentScreen = "mainScreen";
  //     mainScreenMode = 6;
  //   } else if (takePhotoPageMode === 1 && keyIsPressed && keyCode === 32) {
  //     currentScreen = "mainScreen";
  //     mainScreenMode = 6;
  //   }
}

function drawIntro() {
  background(0);
  // 인트로 모드에 따라 이미지 표시
  if (introMode === 0) {
    image(firstImage, width / 2, height / 2, width, height);
  } else if (introMode === 1) {
    image(storyImage1, width / 2, height / 2, width, height);
  } else if (introMode === 2) {
    image(storyImage2, width / 2, height / 2, width, height);
  } else if (introMode === 3) {
    image(storyImage3, width / 2, height / 2, width, height);
  } else if (introMode === 4) {
    image(storyImage4, width / 2, height / 2, width, height);
  } else if (introMode === 5) {
    image(storyImage5, width / 2, height / 2, width, height);
  }
}

function drawMainScreen() {
  if (mainScreenMode === 0) {
    image(startImage, width / 2, height / 2, width, height);
  } else if (mainScreenMode === 1) {
    image(foxImage, width / 2, height / 2, width, height);
  } else if (mainScreenMode === 2) {
    image(roomImage1, width / 2, height / 2, width, height);
  } else if (mainScreenMode === 3) {
    image(noticeImage, width / 2, height / 2, width, height);
  } else if (mainScreenMode === 4) {
    drawSelectFilterPage();
  } else if (mainScreenMode === 6) {
    if (capturedImage) {
      image(capturedImage, width / 2, 330, 90, 135);
    image(roomImage2, width / 2, height / 2, width, height);
    }
  }
}

function drawEnding() {
  if (endingMode === 0) {
    if (capturedImage) {
      image(capturedImage, width / 2, height / 2 - 50, 450, 450);
      image(endingImage, width / 2, height / 2, width, height);
    }
  } else if (endingMode === 1) {
    background(0);
    image(QRImage, width / 2, height / 2, width, height);
  }
}

function uploadImageToFirebase() {
  if (!firebaseUploaded) {
    firebaseUploaded = true;
    let img = createGraphics(width, height);
    img.imageMode(CENTER);
    img.image(capturedImage, width / 2, height / 2 - 50, 400, 400);
    img.image(endingImage, width / 2, height / 2, width, height);

    let storageRef = storage.ref();
    let filesRef = storageRef.child(
      "images/" +
        year() +
        month() +
        day() +
        hour() +
        minute() +
        second() +
        ".jpg"
    );

    img.loadPixels();
    let convertdata = img.canvas.toDataURL();
    //convertdata.save('photo','png');

    const uploadStart = filesRef.putString(convertdata, "data_url");
    uploadStart.then((uploadTaskSnapshot) => {
      uploadTaskSnapshot.ref.getDownloadURL().then((url) => {
        console.log(url);
        forQRurl = url;
        qr = qrcode(0, "L");
        qr.addData(forQRurl);
        qr.make();
        qrImg = qr.createImgTag(5, 20, "qr code");
        endingMode = 1;
        tagDiv.html(qrImg);
      });
    });
  }
}

function drawSelectFilterPage() {
  background(0);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Select Filter Page", width / 2, height / 2);
  image(filterImage, width / 2, height / 2, width, height);
}

function drawFace() {
  imageMode(CORNER);
  image(img_taol, 0, 0, width, height + 80);
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;
    let faceXYs = [];

    for (let faceNode of faceNodes) {
      faceXYs.push(keypoints[faceNode]);
    }

    if (faceXYs) {
      let [cx, cy] = centerXY(faceXYs);
      let r = distXYs(cx, cy, faceXYs);
      let faceR = r * 1.8;
      let fw = 100;
      let fh = 100;

      let maskImage = createGraphics(fw, fh);
      maskImage.fill(255);
      maskImage.stroke(255);
      maskImage.circle(fw / 2, fh / 2, fw);
      let videoLayer = createGraphics(fw, fh);
      videoLayer.image(
        capture.get(cx - faceR / 2, cy - faceR / 2, faceR, faceR),
        0,
        0,
        100,
        100
      );
      let img_video = getHighContrastImage(videoLayer.get());
      img_video.mask(maskImage);

      let faceLayer = createGraphics(fw, fh);
      faceLayer.image(img_video, 0, 0);
      faceLayer.noFill();
      faceLayer.stroke(255, 50);

      for (let i = 0; i < 10; i++) {
        faceLayer.strokeWeight(i + 2);
        faceLayer.circle(fw / 2, fh / 2, faceR - i);
      }

      blend(
        faceLayer,
        0,
        0,
        fw,
        fh,
        400 - fw / 2,
        320 - fh / 2,
        fw,
        fh,
        MULTIPLY
      );
    }
  }
  imageMode(CENTER);
}

function centerXY(xys) {
  let xSum = 0;
  let ySum = 0;
  for (let xy of xys) {
    let [x, y] = xy;
    xSum += x;
    ySum += y;
  }
  return [xSum / xys.length, ySum / xys.length];
}

function distXYs(cx, cy, xys) {
  let dMax = 0;
  for (let xy of xys) {
    let [x, y] = xy;
    let d = dist(cx, cy, x, y);
    dMax = max(d, dMax);
  }
  return dMax;
}

function getHighContrastImage(img) {
  let hcImg = createImage(img.width, img.height);
  img.loadPixels();
  hcImg.loadPixels();

  for (let x = 0; x < img.width; x += 1) {
    for (let y = 0; y < img.height; y += 1) {
      let idx = (img.width * y + x) * 4;
      let contrast = 100;
      let factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      if (x === 0 && y === 0) {
        print(factor);
      }
      let r = img.pixels[idx];
      let g = img.pixels[idx + 1];
      let b = img.pixels[idx + 2];
      let threshold = 20;
      let nR = constrain(factor * (r - threshold) + threshold, 0, 255);
      let nG = constrain(factor * (g - threshold) + threshold, 0, 255);
      let nB = constrain(factor * (b - threshold) + threshold, 0, 255);
      let nC = color(nR, nG, nB);
      hcImg.set(x, y, nC);
    }
  }
  hcImg.updatePixels();
  return hcImg;
}
