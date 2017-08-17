let game = new GameFrame('idCanvas');
let player = {};
let clouds = [];
let bullets = [];
let enemys = [];

const cloudAmount = 8;
const bulletLimit = 512;
let bulletCount = 0;

let mainScenes = new Scenes(game, function(game) {
    for(let i = 0; i < cloudAmount; i++) {
        let c = new Cloud();
        c.randomData();
        game.addModule('cloud', c);
    }
    game.addModule('player', new Fighter());

    player = game.getModule('player')[0];
    clouds = game.getModule('cloud');

    game.addModule('bullet', player.fire());
    bullets = game.getModule('bullet');

    game.addModule('enemy', new Enemy());
    enemys = game.getModule('enemy');
    
    game.registerAction('ArrowLeft', function() {
        player.moveLeft();
    });
    game.registerAction('ArrowRight', function() {
        player.moveRight();
    });
    game.registerAction('ArrowUp', function() {
        player.moveBefore();
    });
    game.registerAction('ArrowDown', function() {
        player.moveAfter();
    });

    window.setInterval(function() {
        if(bulletCount > bulletLimit) return;
        game.addModule('bullet', player.fire());
        bulletCount++;
    }, 128);

    window.setInterval(function() {
        let count = Math.floor(getRandomNumber(0, 5));
        while(count-- > 0) {
            let e = new Enemy();
            e.randomData();
            game.addModule('enemy', e);
        }
    }, 1024);
});

mainScenes.update = function() {
    clouds.map(function(c) {
        if(c.getTop() > game.canvas.height) {
            c.randomData();
        }
    });

    // bullets.map(function(val, key, arr) {
    //     if(val.y < 10) {
    //         arr.splice(key, 1);
    //         --bulletCount;
    //     }
    // });
    enemys.map(function(val, key, arr) {
        if(val.y > game.canvas.height) {
            arr.splice(key, 1);
        }
    });
    enemys.map(function(eval, ekey, earr) {
        bullets.map(function(bval, bkey, barr) {
            if(bval.y < 10) {
                barr.splice(bkey, 1);
                --bulletCount;
            }
            if(game.collision.collideRect(eval, bval)) {
                barr.splice(bkey, 1);
                --eval.l;
                if(eval.l < 1) {
                    earr.splice(ekey, 1);
                }
                --bulletCount;
            }
        });
    });

};

mainScenes.apply();