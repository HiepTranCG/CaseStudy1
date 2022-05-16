const canvas = document.createElement("canvas");
document.querySelector(".myGame").appendChild(canvas);
canvas.width = innerWidth;
canvas.height = innerHeight;
const context = canvas.getContext("2d");
const form = document.querySelector("form");
const scoreBoard = document.querySelector(".scoreBoard");
let playerScore = 0;


document.querySelector("input").addEventListener("click", (e) => {
    e.preventDefault();
    form.style.display = "none";
    scoreBoard.style.display = "block";
    setInterval(spawnEnemy, 1400);
})

// -------------------- Creating Player, Enemy, Weapon, Etc Classes
playerPosition = {
    x: canvas.width / 2,
    y: canvas.height / 2,
}


class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
    }

    move(x, y) {

        this.x += x;
        this.y += y;
        this.draw();
    }
}

class Weapon {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        context.save();

        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
        context.restore();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

// -------------------------- Main logic --------------------------
const player = new Player(playerPosition.x, playerPosition.y, 15, "white");
const weapons = [];
const enemies = [];
const particles = [];

// ------------------------ Function to Spawn Enemy at Random Location ------------------------
const spawnEnemy = () => {
    const enemySize = Math.random() * (40 - 5) + 5;
    const enemyColor = `hsl(${Math.floor(Math.random() * 100)}, 100%, 50%)`;
    let random;

    if (Math.random() < 0.5) {
        random = {
            x: Math.random() < 0.5 ? canvas.width + enemySize : 0 - enemySize,
            y: Math.random() * canvas.height
        };
    } else {
       random = {
            x: Math.random() * canvas.width,
            y: Math.random() < 0.5 ? canvas.width + enemySize : 0 - enemySize
        };
    }

    const myAngle = Math.atan2(
        player.y - random.y,
        player.x - random.x
    );

    const velocity = {
        x: Math.cos(myAngle) * 3,
        y: Math.sin(myAngle) * 3
    };

    enemies.push(new Enemy(random.x, random.y, enemySize, enemyColor, velocity));
}

// ----------------------- End screen -----------------------
const gameoverLoader = () => {
    const gameOverBanner = document.createElement("div");
    const gameOverBtn = document.createElement("button");
    const highScore = document.createElement("div");

    highScore.innerHTML = `Your Score: ${playerScore}`;

    gameOverBtn.innerText = "Play Again";

    gameOverBanner.appendChild(highScore);

    gameOverBanner.appendChild(gameOverBtn);

    gameOverBtn.onclick = () => {
        window.location.reload();
    };

    gameOverBanner.classList.add("gameover");

    document.querySelector("body").appendChild(gameOverBanner);
};

// ------------------------ Creating Animation Function ------------------------
let animationId;

function animation() {
    animationId = requestAnimationFrame(animation);

    context.fillStyle = "rgba(49, 49, 49, 0.4)";

    context.fillRect(0, 0, canvas.width, canvas.height);

    player.draw();

    particles.forEach((particle, particleIndex) => {
        if (particle.alpha <= 0) {
            particles.splice(particleIndex, 1);
        } else {
            particle.update();
        }
    });

    weapons.forEach((weapon, weaponIndex) => {
        weapon.update();
        if (
            weapon.x + weapon.radius < 1 ||
            weapon.y + weapon.radius < 1 ||
            weapon.x - weapon.radius > canvas.width ||
            weapon.y - weapon.radius > canvas.height
        ) {
            weapons.splice(weaponIndex, 1);
        }
    })

    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        const distanceBetweenPlayerAndEnemy = Math.hypot(
            player.x - enemy.x,
            player.y - enemy.y
        );

        if (distanceBetweenPlayerAndEnemy - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId);

            return gameoverLoader();
        }

        weapons.forEach((weapon, weaponIndex) => {
            const distanceBetweenWeaponAndEnemy = Math.hypot(
                weapon.x - enemy.x,
                weapon.y - enemy.y
            );

            if (distanceBetweenWeaponAndEnemy - weapon.radius - enemy.radius < 1) {
                if (enemy.radius > 18) {
                    enemy.radius -= 10;
                    weapons.splice(weaponIndex, 1);

                    playerScore += 5;
                    scoreBoard.innerHTML = `Score: ${playerScore}`;
                }
                else {
                    for (let i = 0; i < enemy.radius * 5; i++) {
                        particles.push(
                            new Particle(weapon.x, weapon.y, Math.random() * 2, enemy.color, {
                                x: (Math.random() - 0.5) * (Math.random() * 7),
                                y: (Math.random() - 0.5) * (Math.random() * 7)
                            })
                        );
                    }

                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1);
                        weapons.splice(weaponIndex, 1);
                    }, 0);

                    playerScore += 10;

                    scoreBoard.innerHTML = `Score: ${playerScore}`;
                }
            }
        });
    })
}


// ------------------------ Adding Event Listeners ------------------------
canvas.addEventListener("click", (e) => {
    // find angle between player position and click co-ordinates
    const myAngle = Math.atan2(e.clientY - player.y, e.clientX - player.x,);

    const velocity = {
        x: Math.cos(myAngle) * 5,
        y: Math.sin(myAngle) * 5
    };

    weapons.push(new Weapon(player.x, player.y, 6, "white", velocity));
});

addEventListener("keypress", (e) => {
    switch (e.key) {
        case "a":
            if(player.x + player.radius > 40)
                player.move(-15, 0);
            break;
        case "w":
            if(player.y + player.radius > 50)
                player.move(0, -15);
            break;
        case "d":
            if(player.x + player.radius < canvas.width - 15)
                player.move(15, 0);
            break;
        case "s":
            if(player.y + player.radius < canvas.height - 15)
                player.move(0, 15);
            break;
    }
});

animation();
