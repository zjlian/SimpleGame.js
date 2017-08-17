let Enemy = (function() {
    function enemy() {
        PhysicsEntity.call(this);
        this.type = 0;
        this.vy = 2;
        this.ay = .2;
        this.x = Math.floor(getRandomNumber(0, game.canvas.width - 100));

        this.type = 0;
        this.l = 4;

        //this.physicsType = DYNAMIC;
        this.blur = true;
        this.updateBounds();
    }
    inheritPrototype(enemy, PhysicsEntity);

    enemy.prototype.updateBounds = function() {
        this.l = (this.type + 1) * 2;
        this.width = this.images[this.type].width * .6;
        this.height = this.images[this.type].height * .6;
        this.halfWidth = this.width * 0.5;
        this.halfHeight = this.height * 0.5;
    }
    enemy.prototype.images = (function() {
        let img = [];
        for(let i = 0; i < 2; i++) {
            img[i] = new Image();
        }
        img[0].src = 'images/enemy_1.png';
        img[1].src = 'images/enemy_2.png';
        return img;
    })();

    enemy.prototype.randomData = function() {
        //this.ay = 2 + getRandomNumber(2, 4);
        this.vy = 2;
        this.type = Math.floor(getRandomNumber(0, 2));
        this.updateBounds();
        this.x = Math.floor(getRandomNumber(0, game.canvas.width * .8));
        this.y = Math.floor(getRandomNumber(-this.height, -this.height * 2));
    };

    enemy.prototype.wasHit = function() {
        this.width = 0;
        this.height = 0;
    };

    return enemy;
})();