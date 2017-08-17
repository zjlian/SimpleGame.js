let Cloud = (function() {
    function cloud() {
        PhysicsEntity.call(this);
        this.type = 0;
        this.width = 0;
        this.height = 0;
        this.vy = 2;
        this.ay = 0.2;

        this.type = 0;

        //this.physicsType = DYNAMIC;
        this.blur = true;
        this.updateBounds();
    }
    inheritPrototype(cloud, PhysicsEntity);

    cloud.prototype.updateBounds = function() {
        this.width = this.images[this.type].width;
        this.height = this.images[this.type].height;
        this.halfWidth = this.width * 0.5;
        this.halfHeight = this.height * 0.5;
    }
    cloud.prototype.images = (function() {
        let img = [];
        for(let i = 0; i < 6; i++) {
            img[i] = new Image();
        }
        img[0].src = 'images/cloud_3.png';
        img[1].src = 'images/cloud_4.png';
        img[2].src = 'images/cloud_5.png';
        img[3].src = 'images/cloud_3.png';
        img[4].src = 'images/cloud_1.png';
        img[5].src = 'images/cloud_2.png';

        return img;
    })();
    cloud.prototype.randomData = function() {
        this.ay = 0.2 + getRandomNumber(1, 4);
        this.vy = 2;
        this.type = Math.floor(getRandomNumber(0, 6));
        this.updateBounds();
        this.x = Math.floor(getRandomNumber(-this.width * .8, game.canvas.width * .8));
        this.y = Math.floor(getRandomNumber(-this.height, -game.canvas.height / 2));
        
    }

    return cloud;
})();