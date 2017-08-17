let Fighter = (function() {
    function fighter() {
        PhysicsEntity.call(this);

        this.width = 84;
        this.height = 82;
        this.x = 250;
        this.y = 600;
        this.vx = 8;
        this.vy = 4;

        this.physicsType = null;
        this.fireCD = false;
        this.updateBounds();
    }
    inheritPrototype(fighter, PhysicsEntity);

    fighter.prototype.images = (function() {
        return imageFromPath('images/player.png');
    })();

    fighter.prototype.moveLeft = function() {
        this.x -= (this.vx > 0) ? this.vx : -this.vx;
    };
    fighter.prototype.moveRight = function() {
        this.x += (this.vx > 0) ? this.vx : -this.vx;
    };
    fighter.prototype.moveBefore = function() {
        this.y -= (this.vy > 0) ? this.vy : -this.vy;
    };
    fighter.prototype.moveAfter = function() {
        this.y += (this.vy > 0) ? this.vy : -this.vy;
    };

    fighter.prototype.fire = function() {
        let b = new Bullet();
        this.fireCD = !this.fireCD;
        b.x = this.fireCD ? this.getLeft() : this.getRight() - b.width;
        b.y = this.getBottom() - b.height * 1.8;

        return b;
    };

    return fighter;
})();