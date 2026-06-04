const needle = document.getElementById("needle");
const headingReadout = document.getElementById("headingReadout");
const cardinalReadout = document.getElementById("cardinalReadout");
const permissionBtn = document.getElementById("permissionBtn");
const statusText = document.getElementById("statusText");
const labelN = document.getElementById("labelN");
const labelNE = document.getElementById("labelNE");
const labelE = document.getElementById("labelE");
const labelSE = document.getElementById("labelSE");
const labelS = document.getElementById("labelS");
const labelSW = document.getElementById("labelSW");
const labelW = document.getElementById("labelW");
const labelNW = document.getElementById("labelNW");
const tipReadoutAnswer = document.getElementById("tipReadoutAnswer");
const tipGpsAnswer = document.getElementById("tipGpsAnswer");
const langMrBtn = document.getElementById("langMr");
const langEnBtn = document.getElementById("langEn");

const translations = {
  mr: {
    eyebrow: "होकायंत्र",
    domain: "hokayantra.com",
    title: "दिशादर्शक",
    subtext: "तुमच्या ब्राउझरमधील थेट चुंबकीय दिशा. सेन्सर असलेल्या मोबाईलवर उत्तम.",
    tipsTitle: "सूचना",
    tip1: "अधिक अचूक वाचनासाठी फोन सपाट धरा.",
    tip2: "चुंबक किंवा धातूच्या वस्तूं पासून थोडे दूर रहा.",
    tip3: "दिशा अस्थिर असल्यास फोन 8 आकारात हलवा.",
    tipReadQ: "दिशादर्शक कसा वाचायचा?",
    tipReadPrefix: "सध्याचे वाचन:",
    tipGpsPrefix: "सध्याचे GPS:",
    latitude: "अक्षांश",
    longitude: "रेखांश",
    elevation: "उंची",
    elevationUnit: "मीटर",
    valueUnavailable: "उपलब्ध नाही",
    btnEnable: "दिशादर्शक सुरू करा",
    btnEnabled: "दिशादर्शक सुरू आहे",
    btnDesktop: "डेस्कटॉप मोड (Arrow Keys)",
    statusWaiting: "सेन्सर परवानगीची प्रतीक्षा.",
    statusUnavailable: "या डिव्हाइस/ब्राउझरमध्ये दिशेचा डेटा उपलब्ध नाही.",
    statusActive: "दिशादर्शक सुरू आहे.",
    statusListening: "ओरिएंटेशन डेटा ऐकला जात आहे (absolute प्राधान्य)...",
    statusDesktop: "डेस्कटॉप मोड: Arrow keys ◄ ► किंवा drag वापरा.",
    statusNoSensor: "डिव्हाइस ओरिएंटेशन उपलब्ध नाही. डेस्कटॉप मोड वापरतो.",
    statusDenied: "परवानगी नाकारली. दिशादर्शक सुरू होऊ शकत नाही.",
    statusPermissionFail: "परवानगी विनंती अयशस्वी. पुन्हा प्रयत्न करा.",
    statusDesktopHint: "डेस्कटॉप मोडसाठी 'दिशादर्शक सुरू करा' क्लिक करा.",
    gpsPending: "GPS मिळवत आहे...",
    gpsNotSupported: "या ब्राउझरमध्ये GPS उपलब्ध नाही.",
    gpsPermissionDenied: "स्थान परवानगी नाकारली.",
    gpsPositionUnavailable: "स्थान माहिती उपलब्ध नाही.",
    gpsTimeout: "GPS ला वेळ लागला. पुन्हा प्रयत्न करा.",
    gpsError: "GPS त्रुटी."
  },
  en: {
    eyebrow: "Hokayantra",
    domain: "hokayantra.com",
    title: "Compass",
    subtext: "Live magnetic heading in your browser. Best on mobile devices with sensor support.",
    tipsTitle: "Tips",
    tip1: "Hold your device flat for better readings.",
    tip2: "Move away from magnets or metal objects for accuracy.",
    tip3: "If heading is unstable, move in a figure-eight motion to calibrate.",
    tipReadQ: "How to read compass?",
    tipReadPrefix: "Current readout:",
    tipGpsPrefix: "Current GPS:",
    latitude: "Latitude",
    longitude: "Longitude",
    elevation: "Elevation",
    elevationUnit: "m",
    valueUnavailable: "N/A",
    btnEnable: "Enable Compass",
    btnEnabled: "Compass Enabled",
    btnDesktop: "Desktop Mode (Use Arrow Keys)",
    statusWaiting: "Waiting for sensor access.",
    statusUnavailable: "Heading data unavailable on this device/browser.",
    statusActive: "Compass is active.",
    statusListening: "Listening for orientation data (absolute preferred)...",
    statusDesktop: "Desktop mode: Press arrow keys ◄ ► or drag to rotate.",
    statusNoSensor: "Device orientation not available. Using desktop mode.",
    statusDenied: "Permission denied. Compass cannot start.",
    statusPermissionFail: "Permission request failed. Try again.",
    statusDesktopHint: "Click 'Enable Compass' to use desktop mode.",
    gpsPending: "Fetching GPS...",
    gpsNotSupported: "GPS is not available in this browser.",
    gpsPermissionDenied: "Location permission denied.",
    gpsPositionUnavailable: "Position unavailable.",
    gpsTimeout: "GPS timed out. Try again.",
    gpsError: "GPS error."
  }
};

const labelTranslations = {
  mr: {
    n: "उत्तर",
    ne: "ईशान्य",
    e: "पूर्व",
    se: "आग्नेय",
    s: "दक्षिण",
    sw: "नैऋत्य",
    w: "पश्चिम",
    nw: "वायव्य"
  },
  en: {
    n: "N",
    ne: "NE",
    e: "E",
    se: "SE",
    s: "S",
    sw: "SW",
    w: "W",
    nw: "NW"
  }
};

let active = false;
let currentHeading = 0;
let virtualHeading = 0; // Tracks heading without wrapping at 360 to avoid jump
let lastAbsoluteReadingAt = 0;
let headingOffset = 0;
let resumeCorrectionPending = false;
let headingBeforeHide = 0;
let currentLanguage = "mr";
let permissionBtnState = "enable";
let currentStatusKey = "statusWaiting";
let currentStatusType = "";
let gpsCoords = null;
let gpsErrorKey = null;

function normalizeHeading(value) {
  return ((value % 360) + 360) % 360;
}

function shortestAngleDelta(next, prev) {
  return ((next - prev + 540) % 360) - 180;
}

function getText(key) {
  return translations[currentLanguage][key] || "";
}

function getCardinal(deg) {
  const dirs = currentLanguage === "mr"
    ? ["उत्तर", "ईशान्य", "पूर्व", "आग्नेय", "दक्षिण", "नैऋत्य", "पश्चिम", "वायव्य"]
    : ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(deg / 45) % 8;
  return dirs[idx];
}

function formatHeadingNumber(value) {
  const rounded = Math.round(value);
  return currentLanguage === "mr"
    ? rounded.toLocaleString("mr-IN-u-nu-deva")
    : rounded.toString();
}

function formatCoordinate(value) {
  const abs = Math.abs(value);
  return currentLanguage === "mr"
    ? abs.toLocaleString("mr-IN-u-nu-deva", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : abs.toFixed(2);
}

function formatElevation(value) {
  return currentLanguage === "mr"
    ? value.toLocaleString("mr-IN-u-nu-deva", { maximumFractionDigits: 1 })
    : value.toFixed(1);
}

function updateTipReadoutAnswer() {
  tipReadoutAnswer.textContent = `${getText("tipReadPrefix")} ${formatHeadingNumber(currentHeading)}° ${getCardinal(currentHeading)}`;
}

function updateGpsTipAnswer() {
  const unavailable = getText("valueUnavailable");

  if (!navigator.geolocation) {
    tipGpsAnswer.textContent = `${getText("latitude")}: ${unavailable}, ${getText("longitude")}: ${unavailable}, ${getText("elevation")}: ${unavailable} (${getText("gpsNotSupported")})`;
    return;
  }

  if (gpsCoords) {
    const latHem = currentLanguage === "mr" ? (gpsCoords.lat >= 0 ? "उ" : "द") : (gpsCoords.lat >= 0 ? "N" : "S");
    const lonHem = currentLanguage === "mr" ? (gpsCoords.lon >= 0 ? "पू" : "प") : (gpsCoords.lon >= 0 ? "E" : "W");
    const hasElevation = typeof gpsCoords.elevation === "number";
    const elevationText = hasElevation
      ? `${formatElevation(gpsCoords.elevation)} ${getText("elevationUnit")}`
      : unavailable;

    tipGpsAnswer.textContent = `${getText("latitude")}: ${formatCoordinate(gpsCoords.lat)}° ${latHem}, ${getText("longitude")}: ${formatCoordinate(gpsCoords.lon)}° ${lonHem}, ${getText("elevation")}: ${elevationText}`;
    return;
  }

  tipGpsAnswer.textContent = `${getText("latitude")}: ${unavailable}, ${getText("longitude")}: ${unavailable}, ${getText("elevation")}: ${unavailable} (${getText(gpsErrorKey || "gpsPending")})`;
}

function startGpsTracking() {
  if (!navigator.geolocation) {
    updateGpsTipAnswer();
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      gpsCoords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        elevation: position.coords.altitude
      };
      gpsErrorKey = null;
      updateGpsTipAnswer();
    },
    (error) => {
      gpsCoords = null;

      if (error.code === error.PERMISSION_DENIED) {
        gpsErrorKey = "gpsPermissionDenied";
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        gpsErrorKey = "gpsPositionUnavailable";
      } else if (error.code === error.TIMEOUT) {
        gpsErrorKey = "gpsTimeout";
      } else {
        gpsErrorKey = "gpsError";
      }

      updateGpsTipAnswer();
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 20000
    }
  );
}

function getRingLabelSet(lang) {
  return labelTranslations[lang];
}

function syncPermissionButtonVisibility() {
  const shouldHide = active && currentStatusType !== "err";
  permissionBtn.hidden = shouldHide;
}

function setPermissionButtonState(state) {
  permissionBtnState = state;

  if (permissionBtnState === "enabled") {
    permissionBtn.textContent = getText("btnEnabled");
    return;
  }

  if (permissionBtnState === "desktop") {
    permissionBtn.textContent = getText("btnDesktop");
    return;
  }

  permissionBtn.textContent = getText("btnEnable");
}

function setStatus(key, type = "") {
  currentStatusKey = key;
  currentStatusType = type;
  statusText.textContent = getText(key);
  statusText.classList.remove("ok", "warn", "err");

  if (type) {
    statusText.classList.add(type);
  }

  syncPermissionButtonVisibility();
}

function applyLanguage(lang) {
  currentLanguage = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[currentLanguage][key]) {
      el.textContent = translations[currentLanguage][key];
    }
  });

  const labelSet = getRingLabelSet(currentLanguage);
  labelN.textContent = labelSet.n;
  labelNE.textContent = labelSet.ne;
  labelE.textContent = labelSet.e;
  labelSE.textContent = labelSet.se;
  labelS.textContent = labelSet.s;
  labelSW.textContent = labelSet.sw;
  labelW.textContent = labelSet.w;
  labelNW.textContent = labelSet.nw;

  langMrBtn.classList.toggle("active", lang === "mr");
  langEnBtn.classList.toggle("active", lang === "en");

  setPermissionButtonState(permissionBtnState);
  setStatus(currentStatusKey, statusText.classList.contains("ok") ? "ok" : statusText.classList.contains("err") ? "err" : statusText.classList.contains("warn") ? "warn" : "");
  headingReadout.textContent = `${formatHeadingNumber(currentHeading)}\u00b0`;
  const cardinalText = getCardinal(currentHeading);
  cardinalReadout.textContent = cardinalText;
  updateTipReadoutAnswer();  updateGpsTipAnswer();}

function updateCompass(deg) {
  const normalizedDeg = normalizeHeading(deg);
  const delta = normalizedDeg - normalizeHeading(virtualHeading);
  
  // Detect crossover: if delta is large, adjust for shortest path
  if (delta > 180) {
    virtualHeading -= 360;
  } else if (delta < -180) {
    virtualHeading += 360;
  }
  
  virtualHeading += delta;
  currentHeading = normalizedDeg;
  const display = formatHeadingNumber(currentHeading);

  // A compass heading is clockwise from north. To keep red tip pointing to
  // world north relative to the phone, rotate opposite the heading.
  needle.style.transform = `rotate(${-virtualHeading}deg)`;
  headingReadout.textContent = `${display}\u00b0`;
  const cardinalText = getCardinal(currentHeading);
  cardinalReadout.textContent = cardinalText;
  updateTipReadoutAnswer();  updateGpsTipAnswer();}

function extractHeading(event) {
  // iOS Safari provides a true heading in webkitCompassHeading.
  if (typeof event.webkitCompassHeading === "number") {
    return {
      heading: normalizeHeading(event.webkitCompassHeading),
      source: "webkit"
    };
  }

  // For other browsers, derive heading from alpha value when available.
  if (typeof event.alpha === "number") {
    return {
      heading: normalizeHeading(360 - event.alpha),
      source: "alpha"
    };
  }

  return null;
}

function onOrientation(event) {
  const reading = extractHeading(event);

  if (reading === null) {
    setStatus("statusUnavailable", "warn");
    return;
  }

  const absoluteReading =
    reading.source === "webkit" ||
    event.absolute === true ||
    event.type === "deviceorientationabsolute";

  if (absoluteReading) {
    lastAbsoluteReadingAt = Date.now();
  } else {
    // Some Android browsers fire both absolute and relative events.
    // Ignore relative updates shortly after an absolute reading.
    const recentlyGotAbsolute = Date.now() - lastAbsoluteReadingAt < 2000;
    if (recentlyGotAbsolute) {
      return;
    }
  }

  let heading = normalizeHeading(reading.heading + headingOffset);

  if (resumeCorrectionPending && active) {
    const jump = Math.abs(shortestAngleDelta(heading, headingBeforeHide));

    // Some devices reset heading reference after unlock.
    // If first resumed sample jumps too far, re-anchor to pre-lock heading.
    if (jump > 60) {
      headingOffset = normalizeHeading(headingBeforeHide - reading.heading);
      heading = normalizeHeading(reading.heading + headingOffset);
    }

    resumeCorrectionPending = false;
  }

  if (!active) {
    active = true;
    setStatus("statusActive", "ok");
  }

  updateCompass(heading);
}

function enableCompassListener() {
  window.addEventListener("deviceorientationabsolute", onOrientation, true);
  window.addEventListener("deviceorientation", onOrientation, true);
  setStatus("statusListening", "warn");
}

function enableDesktopFallback() {
  // Desktop testing mode: use arrow keys or mouse to control heading
  let testHeading = 0;
  active = true;
  syncPermissionButtonVisibility();
  permissionBtn.disabled = true;
  setPermissionButtonState("desktop");
  setStatus("statusDesktop", "ok");

  const handleKeyboard = (e) => {
    if (e.key === "ArrowRight" || e.key === "d") {
      testHeading = normalizeHeading(testHeading + 5);
      updateCompass(testHeading);
    } else if (e.key === "ArrowLeft" || e.key === "a") {
      testHeading = normalizeHeading(testHeading - 5);
      updateCompass(testHeading);
    }
  };

  const compass = document.querySelector(".compass");
  let isDragging = false;
  let startX = 0;
  let startHeading = 0;

  compass.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startHeading = testHeading;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    testHeading = normalizeHeading(startHeading + deltaX * 0.5);
    updateCompass(testHeading);
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  window.addEventListener("keydown", handleKeyboard);
}

async function requestPermissionIfNeeded() {
  const hasDeviceOrientation = typeof DeviceOrientationEvent !== "undefined";

  if (!hasDeviceOrientation) {
    // Fallback: enable desktop mode for testing
    setStatus("statusNoSensor", "warn");
    enableDesktopFallback();
    return;
  }

  const needsPermission = typeof DeviceOrientationEvent.requestPermission === "function";

  if (!needsPermission) {
    enableCompassListener();
    permissionBtn.disabled = true;
    setPermissionButtonState("enabled");
    return;
  }

  try {
    const result = await DeviceOrientationEvent.requestPermission();

    if (result === "granted") {
      enableCompassListener();
      permissionBtn.disabled = true;
      setPermissionButtonState("enabled");
      return;
    }

    setStatus("statusDenied", "err");
  } catch (error) {
    setStatus("statusPermissionFail", "err");
    console.error(error);
  }
}

permissionBtn.addEventListener("click", requestPermissionIfNeeded);
langMrBtn.addEventListener("click", () => applyLanguage("mr"));
langEnBtn.addEventListener("click", () => applyLanguage("en"));

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    headingBeforeHide = currentHeading;
    return;
  }

  resumeCorrectionPending = true;
});

// Attempt auto-start for browsers that do not require a permission prompt.
if (
  typeof DeviceOrientationEvent !== "undefined" &&
  typeof DeviceOrientationEvent.requestPermission !== "function"
) {
  requestPermissionIfNeeded();
} else if (typeof DeviceOrientationEvent === "undefined") {
  // On desktop without sensor support, show a hint
  setStatus("statusDesktopHint", "warn");
}

applyLanguage("mr");
setPermissionButtonState("enable");
updateCompass(0);
startGpsTracking();
