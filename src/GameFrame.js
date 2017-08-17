
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

    frame.prototype.editMode = function() {
        if(this.paused) return;
        this.togglePaused();
        let that = this;

        this.clearScreen();
        drawGrid(this.context);
        let tmpBlocks = [];

        this.canvas.addEventListener('mousedown', function(e) {
            addBlock(e, tmpBlocks, that.context)
        });

        window.addEventListener('keyup', function(event) {
            if(event.key === 'q') {
                if(!that.paused) return;
                that.canvas.removeEventListener('mousedown',addBlock);
                levelCode =  LZString.compress(JSON.stringify(tmpBlocks));
                that.exitEditMode();
            }
        });
    };
    
    frame.prototype.exitEditMode = function() {
        let that = this;
        this.clearScreen();
        this.togglePaused();
        
        loadLevel(levelCode);
    };

    return frame;
})();