export { EnemySpawner, Roffles, Enemy }


class EnemySpawner {
    constructor(game) {
        this.game = game
        this.active = new Set()
    }

    preload() {
        this.game.load.image('kelley', 'assets/kelley.png');
        this.game.load.image('roffles', 'assets/roffles.png');
    }

    spawn(char) {
        var roll = Math.random() * 100
        var spawn
        if (roll < 20) {
            spawn = new Roffles(char, this.game)
        } else {
            spawn = new Kelley(char, this.game)
        }

        this.active.add(spawn)
        return spawn.sprite;
    }

    updateAll(char) {
        this.active.forEach(e => e.update(char))
    }

    despawn(entity) {
        this.active.delete(entity)
        entity.destroy()
    }

    despawnAll() {
        this.active.forEach(function (e) { if (e.active) e.destroy() })
        this.active.clear()
    }
}

class Enemy {
    constructor(name, speed, spin, scale, char, game) {
        var dist = 600
        var spawnX = char.x + ((dist + (Math.random() * dist)) * (Math.random() < 0.5 ? -1 : 1))
        var spawnY = char.y + ((dist + (Math.random() * dist)) * (Math.random() < 0.5 ? -1 : 1))
        this.speed = speed
        this.spin = spin

        this.sprite = game.physics.add.image(spawnX, spawnY, name)
        this.sprite.setScale(scale)
    }

    update(char) {
        if (this.sprite.active) {
            this.sprite.setVelocityX(this.sprite.x < char.x ? this.speed : -this.speed)
            this.sprite.setVelocityY(this.sprite.y < char.y ? this.speed : -this.speed)
            this.sprite.angle += this.spin;
        }
    }
}

class Roffles extends Enemy {
    constructor(char, game) {
        super('roffles', 50, 5, 1, char, game);
    }
}


class Kelley extends Enemy {
    constructor(char, game) {
        super('kelley', 100, 5, .2, char, game);
    }
}