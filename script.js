const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ضبط الحجم (مهم جدًا)
canvas.width = 640;
canvas.height = 480;

// إعداد MediaPipe
const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});

// دالة عد الأصابع
function countFingers(lm) {
  let count = 0;

  // الإبهام (يمين/يسار)
  if (lm[4].x < lm[3].x) count++;

  // باقي الأصابع
  if (lm[8].y < lm[6].y) count++;
  if (lm[12].y < lm[10].y) count++;
  if (lm[16].y < lm[14].y) count++;
  if (lm[20].y < lm[18].y) count++;

  return count;
}

// رسم اليد
hands.onResults(results => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (!results.multiHandLandmarks) return;

  for (const lm of results.multiHandLandmarks) {

    // رسم النقاط
    for (let p of lm) {
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 6, 0, Math.PI * 2);
      ctx.fillStyle = "lime";
      ctx.fill();
    }

    // رسم الخطوط الصحيحة لليد
    const connections = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[17,18],[18,19],[19,20],
      [0,17]
    ];

    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2;

    for (let [a,b] of connections) {
      ctx.beginPath();
      ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
      ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
      ctx.stroke();
    }

    // حساب الأصابع
    const fingers = countFingers(lm);
    console.log("Fingers:", fingers);

    // تنفيذ أوامر حسب الحركة
    if (fingers === 1) {
      document.body.style.background = "green";
    }
    else if (fingers === 2) {
      document.body.style.background = "blue";
    }
    else if (fingers === 5) {
      document.body.style.background = "red";
    }
    else {
      document.body.style.background = "#111";
    }
  }
});

// تشغيل الكاميرا وربطها
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();
