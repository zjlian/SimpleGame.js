//helper function
let log = console.log.bind(console);

function imageFromPath(path) {
    let image = new Image();
    image.src = path;
    return image;
}

function objectClone(o) {
    function F(){}
    F.prototype = o;
    return new F();
}
function inheritPrototype(subType, superType) {
    let prototype = objectClone(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
}

function getTimeNow() {
    return +new Date();
}

// let levelCode = '';
// function loadLevel(levelCode) {
//     game.barriers.splice(4, game.barriers.length -  4);
//     let blocks = [];
//     let jsonStr = LZString.decompress(levelCode);
//     let arr = JSON.parse(jsonStr);

//     arr.map(function(b) {
//         let block = new Block();
//         block.width = b.width;
//         block.height = b.height;
//         block.halfWidth = b.halfWidth;
//         block.halfHeight = b.halfHeight;
//         block.x = b.x;
//         block.y = b.y;
//         block.type = b.type;
//         block.l = b.l;
//         block.restitution = b.restitution;

//         game.barriers.push(block);
//     });
// }

// //GameFrame 编辑模式函数用
// function drawGrid(ct) {
//     for(let i = 0; i < 16; i++) {
//         ct.strokeStyle = '#333'
//         ct.beginPath();
//         ct.moveTo(0, 32 * i);
//         ct.lineTo(960, 32 * i);
//         ct.stroke();

//         ct.beginPath();
//         ct.moveTo(64 * i, 0);
//         ct.lineTo(64 * i, 32*15);
//         ct.stroke();
//     }
// }
// function hasBlock(blocks, x, y) {
//     for(let i = 0; i < blocks.length; i++) {
//         if(blocks[i].x === x * 64 && blocks[i].y === y * 32) {
//             return i;
//         }
//     }
//     return -1;
// }
// function addBlock(event, blocks, ct) {
//     let e = event;
//     let curX = Math.floor(e.offsetX / 64),
//         curY = Math.floor(e.offsetY / 32);
//     let status = hasBlock(blocks, curX, curY);
//     if(status !== -1) {
//         let tmpBlock = blocks[status];
//         tmpBlock.levelUp();
//         ct.fillStyle = '#eacd76';
//         ct.fillRect(tmpBlock.x, tmpBlock.y, 64, 32);
//     } else {
//         let tmpBlock = new Block();
//         tmpBlock.x = curX * 64;
//         tmpBlock.y = curY * 32;
//         blocks.push(tmpBlock);
//         ct.fillStyle = '#4b5cc4';
//         ct.fillRect(tmpBlock.x, tmpBlock.y, 64, 32);
//     }
// }
//三种参数格式，
//两个数值，返回两个数之间的随机数
//一个参数， 返回0到参数之间的随机数
//没有参数，返回0到1之间的随机数
function getRandomNumber(lo, hi) {
    if(typeof lo === 'number' && typeof hi === 'number') {
        return Math.random() * (hi - lo) + lo;
    } else if(typeof lo === 'number') {
        return Math.random() * lo;
    } else {
        return Math.random();
    }
}
//物理引擎用，传入碰撞检测处理对象的实例，移动的物理PhysicsEntity对象实例，作为障碍的PhysicsEntity实例
function collisionHanding(collision, moving, block) {
    if(collision.collideRect(moving, block)) {
        collision.resolveElastic(moving, block);
        block.wasHit(); 
    }
}

/*--===================================--*/
//@Physics Engine
//最低速度
const STICKY_THRESHOLD = 0.0004;
//引力
const GRAVITY_Y =  4;
const GRAVITY_X =  0;
//常量，标记物体是否受引力影响
const KINEMATIC = 'kinematic'; //不受
const DYNAMIC   = 'dynamic';

//矩形 物理实体
let PhysicsEntity = (function() {
    function physicsEntity() {
        this.width = 0;
        this.height = 0;
        this.halfWidth = this.width * 0.5;
        this.halfHeight = this.height * 0.5;

        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy =  0;
        //加速度
        this.ax = 0;
        this.ay = 0;

        //弹力
        this.restitution = 1;
        this.physicsType = KINEMATIC;
        //是否会与无视刚体的碰撞
        this.blur = false;
    }
    physicsEntity.prototype.updateBounds = function() {
        this.halfWidth = this.width * 0.5;
        this.halfHeight = this.height * 0.5;
    };
    //返回矩形中点所在的x轴坐标
    physicsEntity.prototype.getMidX = function() {
        return this.halfWidth + this.x;
    };
    //返回矩形中点所在的y轴坐标
    physicsEntity.prototype.getMidY = function() {
        return this.halfHeight + this.y;
    };
    //获取矩形边界的坐标
    physicsEntity.prototype.getTop = function() {
        return this.y;
    };
    physicsEntity.prototype.getLeft = function() {
        return this.x;
    };
    physicsEntity.prototype.getRight = function() {
        return this.x + this.width;
    };
    physicsEntity.prototype.getBottom = function() {
        return this.y + this.height;
    };

    physicsEntity.prototype.wasHit = function() { };

    return physicsEntity;
})();

//碰撞检测和处理
let CollisionDetector = (function() {
    function cd() { }

    cd.prototype.collideRect = function(collider, collidee) {
        var l1 = collider.getLeft();
        var t1 = collider.getTop();
        var r1 = collider.getRight();
        var b1 = collider.getBottom();

        var l2 = collidee.getLeft();
        var t2 = collidee.getTop();
        var r2 = collidee.getRight();
        var b2 = collidee.getBottom();

        //判断俩个矩形的四条边是否超过彼此对边的坐标
        //例如 矩形1 的底边坐标 小于 矩形2 的上边，那么这两个矩形肯定没重合
        //其余判断同理
        if(b1 < t2 || t1 > b2 || r1 < l2 || l1 > r2) {
            return false;
        }
        //上面的判断不符合 俩个矩形就发生了碰撞
        return true;
    };

    cd.prototype.resolveElastic = function(moving, entity) {
        let pMidX = moving.getMidX();
        let pMidY = moving.getMidY();
        let aMidX = entity.getMidX();
        let aMidY = entity.getMidY();
        //获取 碰撞物 与 被撞物 之间重合的量
        let dx = (aMidX - pMidX) / entity.halfWidth;
        let dy = (aMidY - pMidY) / entity.halfHeight;

        let absDX = Math.abs(dx);
        let absDY = Math.abs(dy);

        //当重叠量相减小于0.1时，那么两个对象的两个角发生了碰撞
        if(Math.abs(absDX - absDY) < 0.03) {
            //从x轴靠近
            if(dx < 0) {
                moving.x = entity.getRight();
            } else {
                moving.x = entity.getLeft() - moving.width;
            }
            //从y轴靠近
            if(dy < 0) {
                moving.y = entity.getBottom();
            } else {
                moving.y = entity.getTop() - moving.height;
            }
            //随机朝一个方向进行反转
            if(Math.random() < 0.5) {
                moving.vx = -moving.vx * entity.restitution;
                //如果速度低于阀值，直接设置为0
                if(Math.abs(moving.vx) < STICKY_THRESHOLD) {
                    moving.vx = 0;
                }
            } else {
                 moving.vy = -moving.vy * entity.restitution;
                //如果速度低于阀值，直接设置为0
                if(Math.abs(moving.vy) < STICKY_THRESHOLD) {
                    moving.vy = 0;
                }
            }
        //碰撞物 从侧面接近 被撞物
        } else if(absDX > absDY) {
            if(dx < 0) {
                moving.x = entity.getRight();
            } else {
                moving.x = entity.getLeft() - moving.width;
            }
            moving.vx = -moving.vx * entity.restitution;
            if(Math.abs(moving.vx) < STICKY_THRESHOLD) {
                moving.vx = 0;
            }
        } else {
            if(dy < 0) {
                moving.y = entity.getBottom();
            } else {
                moving.y = entity.getTop() - moving.height;
            }
            moving.vy = -moving.vy * entity.restitution;
            if(Math.abs(moving.vy) < STICKY_THRESHOLD) {
                moving.vy = 0;
            }
        }
    };

    return cd;
})();

let Engine = (function() {
    function engine(that) {
        this.game = that;
        this.collision = new CollisionDetector();
        this.entities = that.modules;
        this.barriers = that.barriers;
        this.pixelsPerMeter = that.pixelsPerMeter;
    }

    engine.prototype.step = function(time) {
        let that = this;
        let lastTime = this.game.lastTime;

        let elapsed = time - lastTime;
        elapsed = elapsed / 1000;

        let gx = GRAVITY_X * elapsed;
        let gy = GRAVITY_Y * elapsed;

        this.entities.forEach(function(val, key) {
            val.map(function(entity) {
                switch (entity.physicsType) {
                    case DYNAMIC:
                        entity.vx += entity.ax * elapsed + gx;
                        entity.vy += entity.ay * elapsed + gy;
                        entity.x  += entity.vx * elapsed * that.pixelsPerMeter;
                        entity.y  += entity.vy * elapsed * that.pixelsPerMeter;
                        break;
                    case KINEMATIC:
                        entity.vx += entity.ax * elapsed;
                        entity.vy += entity.ay * elapsed;
                        entity.x  += entity.vx * elapsed * that.pixelsPerMeter;
                        entity.y  += entity.vy * elapsed * that.pixelsPerMeter;
                        break;
                }
            })
        });
        // this.barriers.map(function(block) {
        //     block.vx += block.ax * elapsed;
        //     block.vy += block.ay * elapsed;
        //     block.x  += block.vx * elapsed * that.pixelsPerMeter;
        //     block.y  += block.vy * elapsed * that.pixelsPerMeter;
        // });

        //碰撞检测处理，仅检查game.module与game.barrier之间的碰撞
        //同类有需要自行在game.update中调用实现
        this.barriers.map(function(block) {
            that.entities.forEach(function(moving) {
                moving.map(function(m) {
                    if(!m.blur) {
                        collisionHanding(that.collision, m, block);
                    }
                });
            });
        });

        this.game.lastTime = time;
    }
    return engine;
})();

/*--===================================================--*/
//@Game Frame
let GameFrame = (function () {
    let lestTime;
    function frame(canvasID) {
        let that = this;
        this.canvas = document.getElementById(canvasID);
        this.context = this.canvas.getContext('2d');
        this.pixelsPerMeter = this.canvas.width / 10;
        
        this.keydowns = [];
        this.actions = [];

        //status
        this.FPS = 0;
        this.startTime=0;           //当前游戏开始的时间
        this.lastTime=0;            //上一次requestAnimationFrame()调用的时间
        this.gameTime=0;            //游戏经过的时间
        this.paused = false;
        this.startedPauseAt = 0;    //调用暂停时的时间
 
        this.modules = new Map();   //储存可动的对象
        this.barriers = [];         //储存不可动的障碍对象

        this.collision = new CollisionDetector();
        this.engine = new Engine(this);
        
        window.addEventListener('keydown', function(event) {
            that.keydowns[event.key] = true;
        });

        window.addEventListener('keyup', function(event) {
            that.keydowns[event.key] = false;
        });
        
        this.loop = function (time) {
            let that = this;
            if(that.paused) {
                setTimeout(()=>{
                    window.requestAnimationFrame(function(time) {
                        that.loop(time);
                        that.lastTime = time;
                    }) ; 
                },100);
            } else {
                let keys = Object.keys(that.actions);
                for(let i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    if(that.keydowns[key]) {
                        //调用与被按下按键注册绑定的函数
                        that.actions[key]();
                    }
                }
                that.tick(time);
                that.engine.step(time);
                
                that.update();
                that.clearScreen();
                that.draw();
    
                that.updateFrameRate(time);
    
                that.lastTime = time;
                window.requestAnimationFrame(function(time) {
                    that.loop(time);
                });
            }
        }
        
        this.timers = window.requestAnimationFrame(function(time) {
            that.startTime = getTimeNow();
            that.loop(time);
        });
        this.createEdge();
    }
    
    frame.prototype.tick = function(time) {
        this.updateFrameRate(time);
        this.gameTime = getTimeNow() - this.startTime;
    };
    frame.prototype.updateFrameRate = function(time) {
        if(this.lastTime === 0) {
            this.FPS = 60;
        } else {
            this.FPS = 1000 / (time - this.lastTime);
        }

        this.context.fillStyle = '#222';
        this.context.fillText(this.FPS.toFixed() + ' FPS', 10, 20);
    };

    frame.prototype.togglePaused = function() {
        let now = getTimeNow();
        this.paused = !this.paused;
        if(this.paused) {
            this.startedPauseAt = now;
        } else {
            this.startTime = this.startTime + now - this.startedPauseAt;
        }
    };

    //按下时按键行为注册
    frame.prototype.registerAction = function(key, callback) {
        this.actions[key] = callback;
    };

    frame.prototype.addModule = function(string, module) {
        if(!this.modules.has(string)) {
            this.modules.set(string, new Array());
        }
        this.modules.get(string).push(module);
    };
    frame.prototype.getModule = function(string) {
        return this.modules.get(string);
    };
    frame.prototype.removeModule = function(string) {
        this.modules.delete(string);
    }

    //update()和draw()需要自己覆盖定义逻辑
    frame.prototype.update = function() {};
    frame.prototype.draw = function() {
        this.modules.forEach((val, key) => {
            val.map((v) => {
                this.drawModule(v);
            });
        });
        this.barriers.map(b => {
            if(b.images !== undefined) {
                this.drawModule(b);
            }
        });
    };
    //arkanoid.prototype.run = function() {}

    frame.prototype.drawModule = function(module) {
        let img;
        if(module.images.length) {
            img = module.images[module.type];
        } else {
            img = module.images;
        }
        this.context.drawImage(img, module.x, module.y, module.width, module.height);
    };
    frame.prototype.clearScreen = function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    //这个函数要改进
    frame.prototype.createEdge = function() {
        let topEdge = new PhysicsEntity();
        let rightEdge = new PhysicsEntity();
        let bottomEdge = new PhysicsEntity();
        let leftEdge = new PhysicsEntity();

        topEdge.width = this.canvas.width + 100;
        topEdge.height = 200;
        topEdge.x = -50;
        topEdge.y = -topEdge.height;

        rightEdge.width = 200;
        rightEdge.height = this.canvas.height + 100;
        rightEdge.x = this.canvas.width;
        rightEdge.y = -50;

        bottomEdge.width = this.canvas.width + 100;
        bottomEdge.height = 200;
        bottomEdge.x = -50;
        bottomEdge.y = this.canvas.height;

        leftEdge.width = 200;
        leftEdge.height = this.canvas.height + 100;
        leftEdge.x = -leftEdge.width;
        leftEdge.y = -50;

        topEdge.updateBounds();
        rightEdge.updateBounds();
        bottomEdge.updateBounds();
        leftEdge.updateBounds();
        
        this.barriers.push(topEdge, rightEdge, bottomEdge, leftEdge);
    };

    // frame.prototype.editMode = function() {
    //     if(this.paused) return;
    //     this.togglePaused();
    //     let that = this;

    //     this.clearScreen();
    //     drawGrid(this.context);
    //     let tmpBlocks = [];

    //     this.canvas.addEventListener('mousedown', function(e) {
    //         addBlock(e, tmpBlocks, that.context)
    //     });

    //     window.addEventListener('keyup', function(event) {
    //         if(event.key === 'q') {
    //             if(!that.paused) return;
    //             that.canvas.removeEventListener('mousedown',addBlock);
    //             levelCode =  LZString.compress(JSON.stringify(tmpBlocks));
    //             that.exitEditMode();
    //         }
    //     });
    // };
    // frame.prototype.exitEditMode = function() {
    //     let that = this;
    //     this.clearScreen();
    //     this.togglePaused();
        
    //     loadLevel(levelCode);
    // };
    return frame;
})();

/*--================================================--*/
//@Scenes
let Scenes = (function() {
    function scenes(frame, callback) {
        this.frame = frame;

        callback(this.frame);
    }
    scenes.prototype.update = function() {
        //this.frame 获取到游戏框架
        //this.frame.collision  获取框架的碰撞检测程序
    };
    scenes.prototype.apply = function() {
        this.frame.update = this.update;
    };

    return scenes;
})();
