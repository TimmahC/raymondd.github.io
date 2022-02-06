import {EnemySpawner} from './js/enemy.js';

const WIDTH = 1000
const HEIGHT = 1000
const MOVE_SPEED = 250
const KNIFE_SPEED = 500


const game = new Phaser.Game({
    type: Phaser.AUTO,
    backgroundColor: '#196F3D',
    physics: {
        default: 'arcade',
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        width: WIDTH,
        height: HEIGHT
    }
});

const GameState = {
    SETUP: 'SETUP',
    RUNNING: 'RUNNING',
    DONE: 'DONE',
};


var char;
var knives = []
var knife_count = 10
var score = 0
var gameState = GameState.SETUP;
var keys;
var knifeSpeedX;
var knifeSpeedY;
var scoreText;
var enemySpawner

function preload() {
    enemySpawner = new EnemySpawner(this);
    enemySpawner.preload(this.load);
    
    this.load.image('knife', 'assets/ball.png');
    this.load.image('chowder', 'assets/henry.png');
    this.load.image('thumb', 'assets/thumbs_down.png');
}

function create() {
    // Setup scoreboard
    scoreText = this.add.text(20, 0, 'SCORE: 0', { fontSize: '32px', fill: '#FFF' });

    // Setup char
    char = this.physics.add.image(400, 300, 'chowder');
    char.setScale(.5)
    this.cameras.main.startFollow(char);

    // Register keys
    keys = this.input.keyboard.addKeys("W,A,S,D,R");

    // Setup knives
    this.time.addEvent({
        delay: 600,
        callback: function () {
            var knife = this.physics.add.image(char.x, char.y, 'knife')
            knife.setScale(.02)
            knife.setVelocityX(knifeSpeedX)
            knife.setVelocityY(knifeSpeedY)

            knives.push(knife)
            if (knives.length > 5) knives.shift().destroy()


            for (const e of enemySpawner.active)
                this.physics.add.overlap(e, knife, knifeHitsBall, null, this);
        },
        callbackScope: this,
        loop: true,
    });
    // Set initial knife speed
    knifeSpeedX = KNIFE_SPEED
    knifeSpeedY = 0

    // Setup enemies
    this.time.addEvent({
        delay: 400,
        callback: function () {

            var isKelley = Math.random() < 0.95

            const spawn =  enemySpawner.spawn(char)

            enemySpawner.active.add(spawn)

            for (const knife of knives)
                this.physics.add.overlap(spawn, knife, knifeHitsBall, null, this)
    
            this.physics.add.overlap(spawn, char, function () {
                char.destroy()
                gameState = GameState.DONE
            }, null, this);
        },
        callbackScope: this,
        loop: true,
    });

    gameState = GameState.RUNNING;
}

function update() {
    if (keys.R.isDown) {
        this.scene.restart()
    }

    if (gameState == GameState.DONE) {
        const deadText = this.add.text(100, 100, 'U DIED BRO. HAPPENS.', { fontSize: '32px', fill: '#FFF' });
        const thumb = this.physics.add.image(500, 500, 'thumb')
        thumb.setScale(5)
        reset()
        return
    }

    if (keys.A.isDown) {
        char.setVelocityX(-MOVE_SPEED)
        knifeSpeedX = -KNIFE_SPEED
    } else if (keys.D.isDown) {
        knifeSpeedX = KNIFE_SPEED
        char.setVelocityX(MOVE_SPEED)
    } else {
        char.setVelocityX(0)
        if (keys.W.isDown || keys.S.isDown)
            knifeSpeedX = 0
    }

    if (keys.W.isDown) {
        knifeSpeedY = -KNIFE_SPEED
        char.setVelocityY(-MOVE_SPEED)
    } else if (keys.S.isDown) {
        knifeSpeedY = KNIFE_SPEED
        char.setVelocityY(MOVE_SPEED)
    } else {
        char.setVelocityY(0)
        if (keys.A.isDown || keys.D.isDown)
            knifeSpeedY = 0
    }

    enemySpawner.updateAll(char)

    for (const k of knives) {
        k.angle += 20;
    }
}

function knifeHitsBall(e, knife) {
    enemySpawner.despawn(e)
    score += 1
    scoreText.setText("SCORE: " + score)
}

function reset() {
    knives.forEach(i => i.destroy())
    enemySpawner.despawnAll()
    char.destroy()
}