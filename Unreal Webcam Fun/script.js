const video = document.querySelector('.player');
// 原始鏡頭的位置
const canvas = document.querySelector('.photo');
// 擷取鏡頭的內容渲染在畫布上，也是特效會呈現的位置
const ctx = canvas.getContext('2d');

const strip = document.querySelector('.strip');
// 產生圖檔的位置
const snap = document.querySelector('.snap');
// 點擊拍照時的音效

function getVideo(){
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    // 取得攝影鏡頭的權限，回傳promise，並調用MediaStream物件
        .then( localMediaStream => {
            
            video.srcObject = localMediaStream;
            // 將物件轉為URL(Chrome支援的新方法)
            video.play();
        })
        .catch(err => {
            console.log(`OH NO !!!`, err);
        })
}

function paintToCanvas(){
    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;
    // 將渲染的畫面大小調整與video一致

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        // drawImage是將畫面擷取下來，初始寬度高度初始分別為0，大小至width, height
        let pixels = ctx.getImageData(0, 0, width, height);
        // 返回一個ImageData，描述canvas區域內的像素數據

        // pixels = redEffect(pixels);

        // pixels = rgbSplit(pixels);

        pixels = greenScreen(pixels);

        ctx.putImageData(pixels, 0, 0);
    }, 16);
    // 每16ms
}
// https://developer.mozilla.org/en-US/docs/Web/API/Navigator

function takePhoto(){
    // played the sound
    snap.play();

    // take the data out of the canvas
    const data = canvas.toDataURL('image/jpeg');
    // 將canvas上的圖片轉為URL
    const link = document.createElement('a')

    link.href = data;

    link.setAttribute('download', 'handsome');
    // 設置下載功能及檔案名稱

    link.innerHTML = `<img src="${data}" alt="Handsome Man"/>`
    // 下方產生按下拍照得圖片

    strip.insertBefore(link, strip.lastChild);
    // insertBefore插入功能，參數分別為資料即位置
}

function redEffect(pixels){
    for(let i = 0; i < pixels.data.length; i+=4){
        pixels.data[i + 0] = pixels.data[i + 0] + 100;
        // red
        pixels.data[i + 1] = pixels.data[i + 1] - 50;
        // green
        pixels.data[i + 2] = pixels.data[i + 2] * 0.5;
        // blue
    }
    return pixels;
}

function rgbSplit(pixels){
    for(let i = 0; i < pixels.data.length; i+=4){
        pixels.data[i - 150] = pixels.data[i + 0];
        // red
        pixels.data[i + 100] = pixels.data[i + 1];
        // green
        pixels.data[i - 150] = pixels.data[i + 2];
        // blue
    }
    return pixels;
}

function greenScreen(pixels){
    const levels = {};

    document.querySelectorAll('.rgb input').forEach((input) => {
        levels[input.name] = input.value;
    });

    for(i = 0; i < pixels.data.length; i = i + 4){
        red = pixels.data[i + 0];
        green = pixels.data[i + 1];
        blue = pixels.data[i + 2];
        alpha = pixels.data[i + 3];

        if(red >= levels.rmin
        && green >= levels.gmin
        && blue >= levels.bmin
        && red <= levels.rmax
        && green <= levels.gmax
        && blue <= levels.bmax){
            pixels.data[i + 3] = 0
        }
    }
    return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);