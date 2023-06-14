const backgroundCanvas = document.querySelector('#background');
const backgroundCtx = backgroundCanvas.getContext('2d');
const backgroundCanvasWidth = window.innerWidth;
const backgroundCanvasHeight = window.innerHeight;

let currentMouseX = 0;
let currentMouseY = 0;
let mouseCircleRadius = 200;
let mouseCirclePath = new Path2D();
const dashWidth = 20;
const colCount = 90;
const rowCount = colCount;
const totalDashCount = colCount * rowCount;

class DashShape {
    constructor(x1, y1) {
        this.width = dashWidth;
        this.originX1 = x1;
        this.originY1 = y1;
        this.originX2 = x1 + this.width / Math.SQRT2;
        this.originY2 = y1 + this.width / Math.SQRT2;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x1 + this.width / Math.SQRT2;
        this.y2 = y1 + this.width / Math.SQRT2;
        this.dashPath = new Path2D();
        this.isActive = false;
    }

    get centerPosition() {
        return {
            x: Math.abs(this.originX1, this.originX2),
            y: Math.abs(this.originY1, this.originY2),
        };
    }

    get radius() {
        return this.width / 2;
    }

    updateIsActive() {
        const center = this.centerPosition;
        this.isActive = backgroundCtx.isPointInPath(mouseCirclePath, center.x, center.y);
        if (this.isActive) {
            this.updateDirection();
        } else {
            this.resetDirection();
        }
        this.drawDash();
    }

    toRadians(degree) {
        return degree * (Math.PI / 180);
    }

    get relativeAngleToMouse() {
        let angle;
        const {x: x1, y: y1} = this.centerPosition;
        const x2 = currentMouseX;
        const y2 = currentMouseY;
        if(y1 == y2) {
            if(x2<x1) {
                angle = -90;
            } else {
                angle = 90;
            }
        } else if(x1==x2 && y2>y1) {
            angle = 180;
        } else {
            const rad = Math.atan((x2-x1)/(y1-y2));
            angle = rad * 180 / Math.PI;
            
            if(y2>y1 && x2>x1) {
                angle = 180 + angle;
            } else if(y2>y1 && x2<x1) {
                angle = -180 + angle;
            }
        }
        return angle + 90;
    }

    resetDirection() {
        this.x1 = this.originX1;
        this.y1 = this.originY1;
        this.x2 = this.originX2;
        this.y2 = this.originY2;
    }

    updateDirection() {
        const center = this.centerPosition;
        const direction = this.relativeAngleToMouse;
        console.log(direction);
        this.x1 = center.x + this.radius * Math.cos(this.toRadians(direction));
        this.y1 = center.y + this.radius * Math.sin(this.toRadians(direction));
        this.x2 = center.x + this.radius * Math.cos(this.toRadians(direction + 180));
        this.y2 = center.y + this.radius * Math.sin(this.toRadians(direction + 180));
    }
    

    drawDash() {
        this.dashPath = new Path2D();
        this.dashPath.moveTo(this.x1, this.y1);
        this.dashPath.lineTo(this.x2, this.y2);
        this.dashPath.lineWidth = 3;
        backgroundCtx.strokeStyle = 'white';
        backgroundCtx.stroke(this.dashPath);
    }
}

const dashes = Array(totalDashCount).fill(0).map((_, idx) => {
    const colNum = parseInt(idx / colCount);
    const rowNum = idx % rowCount;
    const colGap = backgroundCanvasHeight / (colCount + 2);
    const rowGap = backgroundCanvasWidth /  (rowCount + 2);
    console.log(colNum * colGap, rowNum * rowGap);
    return new DashShape(rowNum * rowGap, colNum * colGap);
});

function initBackgroundGraphic() {
    backgroundCanvas.setAttribute('width', backgroundCanvasWidth);
    backgroundCanvas.setAttribute('height', backgroundCanvasHeight);
    backgroundCtx.clearRect(0,0,backgroundCanvasWidth, backgroundCanvasHeight); 

    backgroundCtx.beginPath();
    backgroundCtx.rect(0, 0, backgroundCanvasWidth, backgroundCanvasHeight);
    backgroundCtx.fillStyle = 'black';
    backgroundCtx.fill();
}

function updateDashes() {
    for (let index = 0; index < dashes.length; index++) {
        const dash = dashes[index];
        dash.updateIsActive(); 
    }
}

function updateCursorCircle() {
    mouseCirclePath = new Path2D();
    backgroundCtx.beginPath();
    mouseCirclePath.arc(currentMouseX, currentMouseY, mouseCircleRadius, 0, 2 * Math.PI, false);
    backgroundCtx.fillStyle = 'transparent';
    backgroundCtx.fill(mouseCirclePath);
}

function addMouseMoveListener() {
    backgroundCanvas.addEventListener('mousemove', function(evt) {
        currentMouseX = evt.clientX;
        currentMouseY = evt.clientY;

        initBackgroundGraphic();
        updateCursorCircle();
        updateDashes();
    });
}


function main() {
    initBackgroundGraphic();
    addMouseMoveListener();
    updateDashes();
}

main();
