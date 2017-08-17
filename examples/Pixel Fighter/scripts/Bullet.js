let Bullet = (function() {
    function bullet() {
        PhysicsEntity.call(this);

        this.width = 24 * 0.6;
        this.height = 80 * 0.6;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 4;
        this.ay = -128;

        //this.physicsType = DYNAMIC;
        this.blur = true;
        this.updateBounds();
    }
    inheritPrototype(bullet, PhysicsEntity);

    bullet.prototype.images = (function() {
        return imageFromPath('images/bullet.png');
    })();


    return bullet;
})();