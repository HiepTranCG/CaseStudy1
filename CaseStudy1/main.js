// Basic Environment Setup
const canvas = document.createElement("canvas");
document.querySelector(".myGame").appendChild(canvas);
canvas.width = innerWidth;
canvas.height = innerHeight;
const context = canvas.getContext("2d");
const form = document.querySelector("form");
const scoreBoard = document.querySelector(".scoreBoard");
let playerScore = 0;

// Basic Function


// Event form

document.querySelector("input").addEventListener("click", (e) => {
    e.preventDefault();
    form.style.display = "none";
    scoreBoard.style.display = "block";
    setInterval(spawnEnemy, 1400);
})

// -------------------- Creating Player, Enemy, Weapong, Etc Classes

// Setting player position to center
playerPosition = {
    x: canvas.width / 2,
    y: canvas.height / 2,
}

// Creating Player Class
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

// Creating Weapon Class
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

// Creating Enemy Class
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

// Creating Particle Class
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

// Creating Player Object, Weapons Array, Enemy Array, Etc Array
const abhi = new Player(playerPosition.x, playerPosition.y,15,"white");
const weapons = [];
const enemies = [];
const particles = [];

// ------------------------ Function to Spawn Enemy at Random Location ------------------------
const spawnEnemy = () => {
    // generating random size for enemy
    const enemySize = Math.random() * (40 - 5) + 5;
    // generating random color for enemy
    const enemyColor = `hsl(${Math.floor(Math.random() * 100)}, 100%, 50%)`;
    // random is Enemy Spawn position
    let random;

    // Making Enemy Location Random but only from outsize of screen
    if(Math.random() < 0.5) {
        // making X equal to very left off of screen or very right off of screen and setting Y to any where vertically
        random = {
            x: Math.random() < 0.5 ? canvas.width + enemySize : 0 - enemySize,
            y: Math.random() * canvas.height
        };
    } else {
        // making Y equal to very up off of screen or very down off of screen and setting X to any where horizontally
        random = {
            x: Math.random() * canvas.width,
            y: Math.random() < 0.5 ? canvas.width + enemySize : 0 - enemySize
        };
    }


    // finding Angle between center (means Player position) and enemy position
    const myAngle = Math.atan2(
        canvas.height / 2 - random.y,
        canvas.width / 2 - random.x
    );

    // making velocity or speed of enemy
    const velocity = {
        x: Math.cos(myAngle) * 3,
        y: Math.sin(myAngle) * 3
    };

    // adding enemy to enemies array
    enemies.push(new Enemy(random.x, random.y, enemySize, enemyColor, velocity));
}

// ----------------------- End screen -----------------------
const gameoverLoader = () => {
    // Creating end screen div and play again button and high score element
    const gameOverBanner = document.createElement("div");
    const gameOverBtn = document.createElement("button");
    const highScore = document.createElement("div");

    highScore.innerHTML = `Your Score: ${playerScore}`;

    // adding text to play agin button
    gameOverBtn.innerText = "Play Again";

    gameOverBanner.appendChild(highScore);

    gameOverBanner.appendChild(gameOverBtn);

    // Making reload on clicking playAgain button
    gameOverBtn.onclick = () => {
        window.location.reload();
    };

    gameOverBanner.classList.add("gameover");

    document.querySelector("body").appendChild(gameOverBanner);
};

// ------------------------ Creating Animation Function ------------------------
let animationId;
function animation() {
    // Making recursion
    animationId = requestAnimationFrame(animation);

    // clearing canvas on each frame
    context.fillStyle="rgba(49, 49, 49, 0.4)";

    context.fillRect(0, 0, canvas.width, canvas.height);

    // draw player
    abhi.draw();

    // Generating Particles
    particles.forEach((particle, particleIndex) => {
        if(particle.alpha <= 0) {
            particles.splice(particleIndex, 1);
        } else {
            particle.update();
        }
    });

    // generating bullets
    weapons.forEach((weapon, weaponIndex) => {
        weapon.update();

        // Removing Weapons if they are off screen
        if(
            weapon.x + weapon.radius < 1 ||
            weapon.y + weapon.radius < 1 ||
            weapon.x - weapon.radius > canvas.width ||
            weapon.y - weapon.radius > canvas.height
            ) {
            weapons.splice(weaponIndex, 1);
        }
    })

    // generating enemies
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        // Finding distance between player and enemy
        const distanceBetweenPlayerAndEnemy = Math.hypot(
            abhi.x - enemy.x,
            abhi.y - enemy.y
        );

        // Stop Game if enemy hit player
        if(distanceBetweenPlayerAndEnemy - abhi.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId);

            return gameoverLoader();
        }

        weapons.forEach((weapon, weaponIndex) => {
            // finding Distance between weapon and enemy
            const distanceBetweenWeaponAndEnemy = Math.hypot(
                weapon.x - enemy.x,
                weapon.y - enemy.y
            );

            if(distanceBetweenWeaponAndEnemy - weapon.radius - enemy.radius < 1) {
                // reducing Size of enemy on hit
                if(enemy.radius > 18) {
                    enemy.radius -= 10;
                    weapons.splice(weaponIndex, 1);

                    // increasing player score when shoot
                    playerScore += 5;

                    // Rendering player Score in scoreboard html element
                    scoreBoard.innerHTML = `Score: ${playerScore}`;
                }
                // Removing enemy on hit if they are below 18
                else {
                    for(let i = 0; i < enemy.radius*5; i++) {
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

                    // increasing player score when kill one enemy
                    playerScore += 10;

                    // Rendering player Score in scoreboard html element
                    scoreBoard.innerHTML = `Score: ${playerScore}`;
                }
            }
        });

    })
}



// ------------------------ Adding Event Listeners ------------------------
// event Listener for Light Weapon aka left click
canvas.addEventListener("click", (e)=> {
    // find angle between player position(center) and click co-ordinates
    const myAngle = Math.atan2(
        e.clientY - canvas.height / 2,
        e.clientX - canvas.width / 2,
    );

    // making const speed for light weapon
    const velocity = {
        x: Math.cos(myAngle) * 5,
        y: Math.sin(myAngle) * 5
    };

    // adding light weapon in weapons array
    weapons.push(new Weapon(canvas.width / 2, canvas.height / 2,6,"white", velocity));
});


animation();
