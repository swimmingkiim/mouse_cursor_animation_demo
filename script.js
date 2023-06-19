const backgroundCanvas = document.querySelector('#background');
const backgroundCtx = backgroundCanvas.getContext('2d');
const backgroundCanvasWidth = window.innerWidth;
const backgroundCanvasHeight = window.innerHeight;

let currentMouseX = null;
let currentMouseY = null;

let mouseCircleRadius = 200;
let mouseCirclePath = new Path2D();

const dashWidth = 20;
const dashGap = 5;
const dashThickness = 15;

const colCount = Math.floor(window.innerHeight / (dashWidth + dashGap));
const rowCount = Math.floor(window.innerWidth / (dashWidth + dashGap));
const totalDashCount = colCount * rowCount;

const animationAngleGap = 3;
const animationTimeGap = 5;

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
        this.prevAngle = 0;
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
    }

    toRadians(degree) {
        return degree * (Math.PI / 180);
    }

    getRelativeAngle(x2, y2) {
        let angle;
        const {x: x1, y: y1} = this.centerPosition;
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

    initDirection() {
        const center = this.centerPosition;
        const targetAngle = this.getRelativeAngle(this.originX2, this.originY2);
        this.x1 = center.x + this.radius * Math.cos(this.toRadians(targetAngle));
        this.y1 = center.y + this.radius * Math.sin(this.toRadians(targetAngle));
        this.x2 = center.x + this.radius * Math.cos(this.toRadians(targetAngle + 180));
        this.y2 = center.y + this.radius * Math.sin(this.toRadians(targetAngle + 180));
        this.drawDash();

        this.prevAngle = targetAngle;
    }

    resetDirection() {
        const center = this.centerPosition;
        const targetAngle = this.getRelativeAngle(this.originX2, this.originY2);
        if (this.prevAngle === targetAngle) {
            this.drawDash();
            return;
        }
        let angle;
        if (Math.abs(this.prevAngle, targetAngle) <= animationAngleGap) {
            angle = targetAngle;
        } else if (this.prevAngle < targetAngle) {
            angle = this.prevAngle + animationAngleGap;
        } else {
            angle = this.prevAngle - animationAngleGap;
        }
        this.x1 = center.x + this.radius * Math.cos(this.toRadians(angle));
        this.y1 = center.y + this.radius * Math.sin(this.toRadians(angle));
        this.x2 = center.x + this.radius * Math.cos(this.toRadians(angle + 180));
        this.y2 = center.y + this.radius * Math.sin(this.toRadians(angle + 180));
        this.drawDash();

        this.prevAngle = angle;
        setTimeout(this.resetDirection.bind(this), animationTimeGap);
    }

    updateDirection() {
        const center = this.centerPosition;
        const targetAngle = this.getRelativeAngle(currentMouseX, currentMouseY);
        if (this.prevAngle === targetAngle) {
            return;
        }
        let angle;
        if (Math.abs(this.prevAngle, targetAngle) <= animationAngleGap) {
            angle = targetAngle;
        } else if (this.prevAngle < targetAngle) {
            angle = this.prevAngle + animationAngleGap;
        } else {
            angle = this.prevAngle - animationAngleGap;
        }
        this.x1 = center.x + this.radius * Math.cos(this.toRadians(angle));
        this.y1 = center.y + this.radius * Math.sin(this.toRadians(angle));
        this.x2 = center.x + this.radius * Math.cos(this.toRadians(angle + 180));
        this.y2 = center.y + this.radius * Math.sin(this.toRadians(angle + 180));
        this.drawDash();

        this.prevAngle = angle;
        setTimeout(this.updateDirection.bind(this), animationTimeGap);
    }
    

    drawDash() {
        const eraseArea = new Path2D();
        const center = this.centerPosition;
        eraseArea.arc(center.x, center.y, this.width / 2 + 1, 0, 2 * Math.PI, false);
        backgroundCtx.fillStyle = 'black';
        backgroundCtx.fill(eraseArea);

        this.dashPath = new Path2D();
        this.dashPath.moveTo(this.x1, this.y1);
        this.dashPath.lineTo(this.x2, this.y2);
        this.dashPath.lineWidth = dashThickness;
        backgroundCtx.strokeStyle = 'white';
        backgroundCtx.stroke(this.dashPath);
    }
}

const dashes = Array(totalDashCount).fill(0).map((_, idx) => {
    const colNum = Math.floor(idx / rowCount);
    const rowNum = idx % rowCount;
    return new DashShape(rowNum * (dashWidth + dashGap), colNum * (dashWidth + dashGap));
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
    window.requestAnimationFrame(updateDashes);
}

function updateCursorCircle() {
    mouseCirclePath = new Path2D();
    backgroundCtx.beginPath();
    mouseCirclePath.arc(currentMouseX, currentMouseY, mouseCircleRadius, 0, 2 * Math.PI, false);
}

function addMouseEventListener() {
    backgroundCanvas.addEventListener('mousemove', function(evt) {
        currentMouseX = evt.clientX;
        currentMouseY = evt.clientY;

        initBackgroundGraphic();
        updateCursorCircle();
    });
    backgroundCanvas.addEventListener('mouseleave', function(evt) {
        currentMouseX = null;
        currentMouseY = null;

        initBackgroundGraphic();
        mouseCirclePath = new Path2D();
    });
}

function addTouchListener() {
    backgroundCanvas.addEventListener('touchmove', function(evt) {
        currentMouseX = evt.clientX;
        currentMouseY = evt.clientY;

        initBackgroundGraphic();
        updateCursorCircle();
    });
    backgroundCanvas.addEventListener('touchend', function(evt) {
        currentMouseX = null;
        currentMouseY = null;

        initBackgroundGraphic();
        mouseCirclePath = new Path2D();
    });
    backgroundCanvas.addEventListener('touchcancel', function(evt) {
        currentMouseX = null;
        currentMouseY = null;

        initBackgroundGraphic();
        mouseCirclePath = new Path2D();
    });
}


function main() {
    initBackgroundGraphic();
    addMouseEventListener();
    window.requestAnimationFrame(updateDashes);
}

main();
