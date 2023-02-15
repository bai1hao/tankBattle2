let container = document.querySelector('.container')
document.querySelector('button').addEventListener('click', e => {
    document.querySelector('.text').style.display = 'none'
    document.querySelector('.score').style.display = 'unset'
    document.querySelector('.level').style.display = 'unset'
    let game = new Game()
    game.start();
})

function getRandomNum(min, max) {
    return min + Math.round(Math.random() * (max - min))
}
const SIZE = 20;
class Game {
    constructor() {
        this.player = null;
        this.walls = [];
        this.width = 600;
        this.height = 400;
        this.enemy = []
    }

    makeMap() {
        let mapIndex = getRandomNum(0, data.length - 1)
        data[mapIndex].forEach((row, index1) => {
            row.forEach((tag, index2) => {
                if (tag === 1) {
                    this.walls.push(new Cell(index2 * SIZE, index1 * SIZE, tag))
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
    collisionWall(role) {
        this.walls.forEach(e => {
            return this.isCollision(role, e)
        })
    }
    render() {
        console.log(this.isCollision(this.player,this.walls[0]));
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
        this.player.el.style.left = this.player.x + 'px'
        this.player.el.style.top = this.player.y + 'px'

        //bullet
        if (this.player.bullet.length > 0) {
            this.player.bullet.forEach(e => {
                switch (e.toward) {
                    case 'up':
                        e.y-=2;
                        break;
                    case 'down':
                        e.y+=2;
                        break;
                    case 'left':
                        e.x-=2;
                        break;
                    case 'right':
                        e.x+=2;
                        break;
                }
                e.el.style.top = e.y + 'px';
                e.el.style.left = e.x + 'px'
                if (!this.borderListen(e)) {
                    e.el.remove();
                }
            })
        }
        this.walls.forEach(e=>{
            this.player.bullet.forEach(ev=>{
                if(this.isCollision(e,ev)){
                    console.log('test');
                    e.el.remove();
                    ev.el.remove();
                }
            })
        })
    }
    createEnemy(count){
        for(let i=0;i<count;i++){
            let x = getRandomNum(20,this.width-20)
            let y =  getRandomNum(20,this.height-20)
            this.enemy.push(new Tank(x,y,'enemy'))
        }
    }
    makeBullet() {
        let bullet;
        switch (this.player.toward) {
            case 'up':
                bullet = new Bullet(this.player.x + this.player.width / 2 - 2, this.player.y, 'up')
                break;
            case 'down':
                bullet = new Bullet(this.player.x + this.player.width / 2 - 2, this.player.y+this.player.height, 'down')
                break;
            case 'left':
                bullet = new Bullet(this.player.x ,this.player.y + this.player.height/2 - 2, 'left')
                break;
            case 'right':
                bullet = new Bullet(this.player.x+this.player.width,this.player.y + this.player.height/2 - 2, 'right')
                break;
        }
        return bullet
    }
    start() {
        this.makeMap()
        this.player = new Tank(300, 200, 'player')
        this.createEnemy(3);
        window.onkeydown = e => {
            switch (e.key) {
                case "ArrowUp":
                    this.player.toward = 'up'
                    this.player.move = true;
                    break;
                case "ArrowDown":
                    this.player.toward = 'down'
                    this.player.move = true;
                    break;
                case "ArrowLeft":
                    this.player.toward = 'left'
                    this.player.move = true;
                    break;
                case 'ArrowRight':
                    this.player.toward = 'right'
                    this.player.move = true;
                    break;
            }
        }
        window.onkeyup = e => {
            switch (e.key) {
                case "ArrowUp":
                    this.player.move = false;
                    break;
                case "ArrowDown":
                    this.player.move = false;
                    break;
                case "ArrowLeft":
                    this.player.move = false;
                    break;
                case 'ArrowRight':
                    this.player.move = false;
                    break;
                case ' ':
                    this.player.bullet.push(this.makeBullet())
                    break;
            }
        }
        setInterval(() => {
            this.render()
        })
    }
}

class Cell {
    constructor(x, y, tag) {
        this.x = x
        this.y = y
        this.tag = tag
        this.el = document.createElement('div');
        this.el.classList.add('wall')
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
        this.el.style.left = this.x+'px'
        this.el.style.top = this.y+'px'

        this.el.classList.add('bullet')
        container.appendChild(this.el)
    }
}

class Tank {
    constructor(x, y, className) {
        this.bullet = []
        this.move = false;
        this.x = x
        this.y = y
        this.width = 20;
        this.height = 20;
        this.toward = 'up'
        this.el = document.createElement('div')
        this.el.classList.add(className)
        this.el.style.left = x + 'px'
        this.el.style.top = y + 'px'
        container.appendChild(this.el)
    }
}