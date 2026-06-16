class RadioSystem {
    
    constructor(userName = "Player") {
        this.chatBox = document.getElementById("chat-box");
        this.history = []; // 0: typeSender, 1: mag(null), 2:msgCode, 3: category, 4: loc, 5: Type(enmey=0-6, Friendly=10, player=11 und null), 6: multiplier= 0,1,2 und null, 7: rowHtml
        this.data = null;
        this.userName = userName;
        this.delayMsgOp = 1200;
        this.delayMsgHq = 1000;
        this.maxNumberOfHistory = 50;

    }

    async loadJsonData() {
        try{
            const response = await fetch('/api/radioOperator');
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading JSON data:', error);
        }
    }

    rdmNumInt(max, min=0) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    show(rowHtml) {
        this.chatBox.innerHTML += rowHtml;
        this.chatBox.parentElement.scrollTop = this.chatBox.parentElement.scrollHeight;

        playChatSound();
    }

    formatMessage(category, loc, type, mul, ammoType, hp, enemyCount, deg, mil) {

        let message = this.data[category];
        let rdm = this.rdmNumInt(message.length - 1);
        let text = message[rdm];

        if(loc != null) {
            let locHtml = `<span class="text-info">${loc}</span>`;
            text = text.replace("{loc}", locHtml);
        }

        if(type != null && type >= 0 && type <= 6) {
            let enemyHtml = `<span class="text-info">${this.data.enemyType[type][mul-1]}</span>`;
            text = text.replace("{enemy}", enemyHtml);
        }

        if(ammoType != null) {
            let ammoHtml = `<span class="text-info">${this.data.ammoType[ammoType]}</span>`;
            text = text.replace("{ammo}", ammoHtml);
        }

        if(hp != null) {
            let hpHtml = `<span class="text-info">${hp}</span>`;
            text = text.replace("{hp}", hpHtml);
        }

        if(enemyCount != null) {
            let enemyCountHtml = `<span class="text-info">${enemyCount}</span>`;
            text = text.replace("{enemyCount}", enemyCountHtml);
        }

        if(deg != null) {
            let degHtml = `<span class="text-info">${deg}</span>`;
            text = text.replace("{deg}", degHtml);
        }
        if(mil != null) {
            let milHtml = `<span class="text-info">${mil}</span>`;
            text = text.replace("{mil}", milHtml);
        }

        return text;
    }

    logMessage(typeSender=null, msg=null, msgCode=null, category=null, loc=null, type=null, mul=null, ammoType=null, hp=null, enemyCount=null, deg=null, mil=null) {
        let finalMsg = "";
        if(msg === null) {
            finalMsg = this.formatMessage(category, loc, type, mul, ammoType, hp, enemyCount, deg, mil);
        }
        else {
            finalMsg = msg;
        }

        let rowHtml = "";

        switch (typeSender) {
            case 0: // Player
                rowHtml = `<p class="text-secondary">[${this.userName}]: ${finalMsg}</p>`;
                break;
            case 1: // HQ
                rowHtml = `<p class="text-warning mb-1">[${this.data.sender[1]}]: ${finalMsg}</p>`;
                break;
            case 2: // Radio Operator
                rowHtml = `<p class="text-success mb-1">[${this.data.sender[0]}]: ${finalMsg}</p>`;
                break;
        }
        this.history.push([typeSender, msg,  msgCode, category, loc, type, mul, rowHtml]);
        if(this.history.length > this.maxNumberOfHistory){
            this.history.shift();
        }

        if(typeSender == 2) { // Radio Operator
            setTimeout(() => {
                this.show(rowHtml);
            }, this.delayMsgOp);
        }
        else if(typeSender == 1) { // HQ
            setTimeout(() => {
                this.show(rowHtml);
            }, this.delayMsgHq);
        }
        else { // Player
            this.show(rowHtml);
        } 
    }

    aimHelper(cleanInput) {
        let gridMatch = cleanInput.match(/([a-t])\s*([0-2]?[0-9])/);
        if(gridMatch){
            let gridLetter = gridMatch[1].toUpperCase();
            let gridNumber = parseInt(gridMatch[2]); 
            let ans = calculateGridToMilAndDeg(gridLetter, gridNumber);
            if(!ans) {
                this.logMessage(2, null, 1012, "gridHelpFalse");
            }
            else {
                let loc = gridLetter + gridNumber;
                this.logMessage(2, null, 1012, "gridHelpTrue", loc, null, null, null, null, null, ans[0], ans[1]);
            }
        }   
    }

    handleMessageOperator(gameOver,category, loc=null, type=null, mul=null) {
        if(!gameOver){
          this.logMessage(2, null, null, category, loc, type, mul); 
        }
    }

    handleMessageHq(category, ammoType=null) {
        this.logMessage(1, null, null, category, null, null, null, ammoType);
    } 

    handleMessagePlayer(gameOver, userInput) {

        let cleanInput = userInput.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, " "); // remove punctuation with regex
        cleanInput = cleanInput.trim().toLowerCase(); 
        let weightCode = {};

        this.logMessage(0, userInput, 1000, null, null, 11) // show message from Player
        
        if(!gameOver){
            for(let kw of this.data.keyword){
                // kw[0]: string
                // kw[1]: msgCode
                
                if(cleanInput.includes(kw[0])) {
                    
                    if(weightCode[kw[1]]) {
                        weightCode[kw[1]] += 1;
                    }
                    else {
                        weightCode[kw[1]] = 1;
                    }
                }
            }
            
            let bestCode = null;
            let maxWeight = 0;

            for(let code in weightCode) {
                if(weightCode[code] > maxWeight) {
                    maxWeight = weightCode[code];
                    bestCode = parseInt(code);
                }
            }

            if(bestCode != null) {     
                switch(bestCode){   
                    case 1001: // accept
                        return true; // for start game, operator for new target and more
                        break; // not usefull, but...

                    case 1002: // repeat
                        let pmsg = false;
                        for(let i = this.history.length - 1; i >= 0; i--){
                            let pastMsg = this.history[i];
                            if(pastMsg[0] == 2) {
                                this.show(pastMsg[7]);
                                pmsg = true;
                                break;
                            }
                        }
                        if(!pmsg){
                            this.logMessage(2, "no previous Request", msgCode);
                        }
                        break;

                    case 1003: // Help System
                        this.logMessage(2, null, 1003, "helpGeneral")
                        break;

                    case 1004: // Report Friendly Location
                        this.logMessage(2, null, 1004, "reportFriendlyLoc", friendlyUnit.gridLocation)
                        break;

                    case 1005: // Report Enemy Spots (Target Recalling)
                        let currentEnemies = enemies.length;
                        if (currentEnemies == 0) {
                            this.logMessage(2, null, 1005, "noEnemy");
                        } 
                        else {
                            this.logMessage(2, null, 1005, "enemyCount", null, null, null, null, null, currentEnemies)
                            let dly = 700
                            for (let i = 0; i < currentEnemies; i++) {
                                setTimeout(() => {
                                    this.logMessage(2, null, 1005, "enemySpot", enemies[i].gridLocation, enemies[i].enemyType, enemies[i].multiplier);
                                }, dly);
                                dly += 700; // a small delay
                            }
                        }
                        break;

                    case 1006: // status report
                        let hp = friendlyUnit.health;
                        let enemyCount = enemies.length;

                        if(enemyCount > 0) {
                            this.logMessage(2, null, 1006, "statusReportWithEnemy", null, null, null, null, hp, enemyCount)
                        }
                        else{
                            this.logMessage(2, null, 1006, "statusReportNoEnemy", null, null, null, null, hp)
                        }
                        break;

                    case 1007: // help ammo
                        this.logMessage(2, null, 1007, "helpAmmo")
                        break;
                        
                    case 1008: // help aim
                        this.logMessage(2, null, 1008, "helpAim")
                        break;

                    case 1009: // msgThanks
                        this.logMessage(2, null, 1009, "msgThanks")
                        break;
                    
                    case 1010: // msgPanic
                        this.logMessage(2, null, 1010, "msgPanic")
                        break;
                        
                    case 1011: // Radio Discipline
                        this.logMessage(2, null, 1011, "radioDiscipline");
                        break;
                
                    case 1012: // grid help
                        this.aimHelper(cleanInput);
                        break;
                }
            }
            else {
                this.logMessage(2, null, null, "unknownCommond");
            }
        }
    }

    clear() {
        this.history = [];
        if(this.chatBox) {
            this.chatBox.innerHTML = "";
        }
    }

    loadHistory(history) {
        this.clear();
        this.history = history;
        for(let h of history) {
            this.show(h[7]);
        }
    }
}