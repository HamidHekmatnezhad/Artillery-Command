class Enemy {
    constructor(maxX, maxY, enemyType, friendlyLocX, friendlyLocY, friendlyRadius, multiplier, cols, rows) {
        
        this.multiplier = multiplier;
        this.radius = 13 * this.multiplier;
        this.health = 10;
        this.enemyType = enemyType;  
        this.iconSize = 15 * this.multiplier;
        this.scoreValue = 1;

        while (true) {
            const randomX = Math.floor(Math.random() * (maxX - 80)) + 40; // Ensure enemy is at least 20px from the edge
            const randomY = Math.floor(Math.random() * (maxY - 80)) + 40; // Ensure enemy is at least 20px from the edge
            const distance = Math.sqrt((randomX - friendlyLocX) ** 2 + (randomY - friendlyLocY) ** 2);
            if (distance > friendlyRadius + this.radius) {
                this.X = randomX;
                this.Y = randomY;
                break;
            }
        }

        // Grid Location
        const colIndex = Math.floor(this.X / (maxX / cols));
        const rowIndex = Math.floor(this.Y / (maxY / rows));
        this.gridLocation = String.fromCharCode(65 + rowIndex) + colIndex; // e.g., "A0", "B3", etc.

        switch (enemyType) {
            case 0:
                // Infantry
                this.health = 10 * this.multiplier;
                break;

            case 1:
                // Tank
                this.health = 100 * this.multiplier;
                break;

            case 2:
                // Base
                this.health = 500 * this.multiplier;
                break;

            case 3:
                // Truck
                this.health = 30 * this.multiplier;
                break;

            case 4:
                // APC
                this.health = 70 * this.multiplier;
                break;

            case 5:
                // Outpost
                this.health = 20 * this.multiplier;
                break;

            case 6:
                // Armored Car
                this.health = 50 * this.multiplier;
                break;
        }
        this.scoreValue = this.health * this.multiplier;
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health < 0) {
            this.health = 0;
        }
    }
    
    isDestroyed() {
        return this.health <= 0;
    }
    
}