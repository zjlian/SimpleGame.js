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

