let $ = e => document.querySelector(e);
let $$ = e => document.querySelectorAll(e);
let container = $('.container')
let game;


$('.startButton').addEventListener('click', e => {
    $('.startText').style.display = 'none'
    $('.score').style.display = 'unset'
    $('.level-text').style.display = 'unset'
    game = new Game()
    game.start();
})
$('.restartButton').addEventListener('click', e => {
    $('.winText').style.display = 'none'
    $('.score').style.display = 'unset'
    $('.level-text').style.display = 'unset'
    game = new Game()
    game.start();
})

function getRandomNum(min, max) {
    return min + Math.round(Math.random() * (max - min))
}

const SIZE = 20;
const TANK_SIZE = 14
const direction = ['up', 'down', 'left', 'right']

class Game {
    constructor() {
        this.player = null;
        this.walls = [];
        this.width = 600;
        this.height = 400;
        this.enemy = []
        this.level = 1;
        this.score = 0;
        this.interval = null;
        this.space = []
    }

    makeMap() {
        let mapIndex = getRandomNum(0, data.length - 1)
        mapIndex=0;
        data[mapIndex].forEach((row, index1) => {
            row.forEach((tag, index2) => {
                if (tag === 1) {
                    let wall = new Cell(index2 * SIZE, index1 * SIZE, tag);
                    wall.el.classList.add('wall')
                    this.walls.push(wall)
                } else if (tag === 0) {
                    this.space.push(new Cell(index2 * SIZE, index1 * SIZE, tag))
                }
            })
        })

    }

    borderListen(role) {
        if (role.toward === "up") {
            return role.y > 0
        }
        if (role.toward === "down") {
            return role.y + role.height < this.height
        }
        if (role.toward === "left") {
            return role.x > 0
        }
        if (role.toward === "right") {
            return role.x + role.width < this.width
        }
    }

    isCollision(role1, role2) {
        let leftBorder1 = role1.x;
        let leftBorder2 = role2.x;
        let rightBorder1 = role1.x + role1.width;
        let rightBorder2 = role2.x + role2.width;
        let maxLeftBorder = Math.max(leftBorder1, leftBorder2)
        let minRightBorder = Math.min(rightBorder1, rightBorder2)

        let topBorder1 = role1.y;
        let topBorder2 = role2.y;
        let bottomBorder1 = role1.y + role1.height;
        let bottomBorder2 = role2.y + role2.height;
        let minBottomBorder = Math.min(bottomBorder1, bottomBorder2)
        let maxTopBorder = Math.max(topBorder1, topBorder2)

        return minRightBorder > maxLeftBorder && minBottomBorder > maxTopBorder
    }

    render() {
        //分数
        $('.score').innerText = this.score;
        $('.level').innerText = this.level;
        //玩家移动和方向旋转
        switch (this.player.toward) {
            case "up":
                this.player.el.style.rotate = "0deg";
                if (this.borderListen(this.player) && this.player.move) {
                    this.player.y--;
                }
                break;
            case "down":
                this.player.el.style.rotate = "180deg";
                if (this.borderListen(this.player) && this.player.move) {
                    this.player.y++;
                }
                break;
            case "left":
                this.player.el.style.rotate = "-90deg";
                if (this.borderListen(this.player) && this.player.move) {
                    this.player.x--;
                }
                break;
            case "right":
                this.player.el.style.rotate = "90deg";
                if (this.borderListen(this.player) && this.player.move) {
                    this.player.x++;
                }
                break;
        }
        this.enemy.forEach(e => {
            switch (e.toward) {
                case "up":
                    e.el.style.rotate = "0deg";
                    break;
                case "down":
                    e.el.style.rotate = "180deg";
                    break;
                case "left":
                    e.el.style.rotate = "-90deg";
                    break;
                case "right":
                    e.el.style.rotate = "90deg";
                    break;
            }
        })
        this.walls.forEach(e => {
            if (this.isCollision(this.player, e)) {
                switch (this.player.toward) {
                    case 'up':
                        this.player.y++;
                        break;
                    case 'down':
                        this.player.y--;
                        break;
                    case 'left':
                        this.player.x++;
                        break;
                    case 'right':
                        this.player.x--;
                        break;
                }
            }
        })
        this.player.el.style.left = this.player.x + 'px'
        this.player.el.style.top = this.player.y + 'px'

        //bullet
        if (this.player.bullet.length > 0) {
            this.player.bullet.forEach(e => {
                switch (e.toward) {
                    case 'up':
                        e.y -= 2;
                        break;
                    case 'down':
                        e.y += 2;
                        break;
                    case 'left':
                        e.x -= 2;
                        break;
                    case 'right':
                        e.x += 2;
                        break;
                }
                e.el.style.top = e.y + 'px';
                e.el.style.left = e.x + 'px'
                if (!this.borderListen(e)) {
                    e.el.remove();
                    this.player.bullet.splice(this.player.bullet.indexOf(e), 1)
                }
            })
        }
        this.walls.forEach(wall => {
            this.player.bullet.forEach(bullet => {
                if (this.isCollision(wall, bullet)) {
                    bullet.el.remove();
                    this.player.bullet.splice(this.player.bullet.indexOf(bullet), 1)
                    wall.el.remove();
                    this.walls.splice(this.walls.indexOf(wall), 1)
                }
            })
        })
        //击中敌人
        this.enemy.forEach(enemy => {
            this.player.bullet.forEach(bullet => {
                if (this.isCollision(enemy, bullet)) {
                    bullet.el.remove();
                    this.player.bullet.splice(this.player.bullet.indexOf(bullet), 1)
                    enemy.el.remove();
                    this.enemy.splice(this.enemy.indexOf(enemy), 1)
                    this.score += 10;
                }
            })
        })
        if (this.enemy.length === 0) {
            if (this.level === 1) {//获胜
                $('.win-score').innerText = this.score
                this.clearWorld();
                console.log('获胜')
                $('.winText').style.display = 'unset'
                $('.score').style.display = 'none'
                $('.level-text').style.display = 'none'
            } else {
                this.level++;
                this.startLevel(this.level)
            }
        }
        //监控格子上是否有实体
        this.space.forEach(space=>{
            if(this.isCollision(space,this.player)||this.enemy.filter(enemy=>this.isCollision(enemy,space)).length>0){
                space.tag=3;
            }else {
                space.tag=0;
            }

        })
    }

    clearWorld() {
        clearInterval(this.interval)
        window.onkeydown = null;
        window.onkeyup = null;
        console.log('World Clear')
        this.player.bullet.forEach(e => {
            e.el.remove();
        })
        this.player.el.remove()
        this.enemy.forEach(e => {
            e.el.remove();
        })
        this.walls.forEach(e => {
            e.el.remove();
        })
        this.space.forEach(e=>{
            e.el.remove();
        })
    }

    createEnemy(count) {
        for (let i = 0; i < count; i++) {
            let cell = this.space.filter(e=>e.tag!==3)[getRandomNum(0,this.space.length-1)]
            cell.tag = 3;
            console.log(cell)
            let x = cell.x;
            let y = cell.y;

            let toward = direction[getRandomNum(0, direction.length - 1)]
            let enemy = new Tank(x, y, TANK_SIZE, TANK_SIZE, 'red', 'enemy', toward)
            this.enemy.push(enemy)
        }
    }

    makeBullet() {
        let bullet;
        switch (this.player.toward) {
            case 'up':
                bullet = new Bullet(this.player.x + this.player.width / 2 - 2.5, this.player.y, 'up')
                break;
            case 'down':
                bullet = new Bullet(this.player.x + this.player.width / 2 - 2.5, this.player.y + this.player.height, 'down')
                break;
            case 'left':
                bullet = new Bullet(this.player.x, this.player.y + this.player.height / 2 - 2.5, 'left')
                break;
            case 'right':
                bullet = new Bullet(this.player.x + this.player.width, this.player.y + this.player.height / 2 - 2.5, 'right')
                break;
        }
        return bullet
    }

    startLevel() {
        if (this.level === 1) {
            this.createEnemy(3);
        } else if (this.level === 2) {
            this.createEnemy(5)
        } else if (this.level === 3) {
            this.createEnemy(7);
        }
    }

    start() {
        this.makeMap()
        this.startLevel(1)
        this.player = new Tank(300, 200, TANK_SIZE, TANK_SIZE, 'green', 'player', 'up')
        window.onkeydown = e => {
            switch (e.key) {
                case "ArrowUp":
                case "w":
                    this.player.toward = 'up'
                    this.player.move = true;
                    break;
                case "ArrowDown":
                case "s":
                    this.player.toward = 'down'
                    this.player.move = true;
                    break;
                case "ArrowLeft":
                case "a":
                    this.player.toward = 'left'
                    this.player.move = true;
                    break;
                case "ArrowRight":
                case "d":
                    this.player.toward = 'right'
                    this.player.move = true;
                    break;
            }
        }
        window.onkeyup = e => {
            switch (e.key) {
                case "ArrowUp":
                case "w":
                    this.player.move = false;
                    break;
                case "ArrowDown":
                case "s":
                    this.player.move = false;
                    break;
                case "ArrowLeft":
                case "a":
                    this.player.move = false;
                    break;
                case "ArrowRight":
                case "d":
                    this.player.move = false;
                    break;
                case ' ':
                    this.player.bullet.push(this.makeBullet())
                    break;
            }
        }
        this.interval = setInterval(() => {
            this.render()
        })
    }
}

class Cell {
    constructor(x, y, tag) {
        this.x = x
        this.y = y
        this.width = SIZE;
        this.height = SIZE;
        this.tag = tag;
        this.el = document.createElement('div');
        this.el.style.position = "absolute"
        this.el.style.width = SIZE + 'px'
        this.el.style.height = SIZE + 'px'
        this.el.style.left = x + 'px'
        this.el.style.top = y + 'px'
        container.appendChild(this.el)
    }
}

class Bullet {
    constructor(x, y, toward) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 5;
        this.toward = toward;
        this.el = document.createElement('div')
        this.el.style.left = this.x + 'px'
        this.el.style.top = this.y + 'px'

        this.el.classList.add('bullet')
        container.appendChild(this.el)
    }
}

class Tank {
    constructor(x, y, width, height, color, className, toward) {
        this.bullet = []
        this.move = false;
        this.x = x
        this.y = y
        this.width = width;
        this.height = height;
        this.toward = toward;
        this.el = document.createElement('div')
        this.el.classList.add(className)
        this.el.style.width = 0
        this.el.style.height = 0
        this.el.style.borderBottom = `${height}px solid ${color}`
        this.el.style.borderLeft = `${width / 2}px solid transparent`
        this.el.style.borderRight = `${width / 2}px solid transparent`
        this.el.style.left = x + 'px'
        this.el.style.top = y + 'px'
        container.appendChild(this.el)
    }
}