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
    }

    formatMessage(category, loc, type, mul, ammoType) {

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

        // TODO: ammoType
        if(ammoType != null) {
            let ammoHtml = `<span class="text-info">${this.data.ammoType[ammoType]}</span>`;
            text = text.replace("{ammo}", ammoHtml);
        }

        return text;
    }

    logMessage(typeSender, msg, msgCode, category, loc, type, mul, ammoType) {
        let finalMsg = "";
        if(!msg) {
            finalMsg = this.formatMessage(category, loc, type, mul, ammoType);
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

        if(typeSender == 2) {
            setTimeout(() => {
                this.show(rowHtml);
            }, this.delayMsgOp);
        }
        else if(typeSender == 1) {
            setTimeout(() => {
                this.show(rowHtml);
            }, this.delayMsgHq);
        }
        else {
            this.show(rowHtml);
        } 
    }

    handleMessageOperator(gameOver,category, loc=null, type=null, mul=null) {
        if(!gameOver){
          this.logMessage(2, null, null, category, loc, type, mul, null); 
        }
    }

    handleMessageHq(category, ammoType=null) {
        this.logMessage(1, null, null, category, null, null, null, ammoType);
    }

    handleMessagePlayer(gameOver, userInput) {

        let cleanInput = userInput.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, " "); // remove punctuation with regex
        cleanInput = cleanInput.trim().toLowerCase(); 

        let commandFound = false;

        this.logMessage(0, userInput, 1000, null, null, 11, null, null) // show message from Player
        if(!gameOver){
            for(let kw of this.data.keyword){

                if(cleanInput.includes(kw[0])) {

                    let msgCode = kw[1];
                    commandFound = true;

                    switch(msgCode){   
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
                                this.logMessage(2, "no previous Request", msgCode, "", "", null, null, null);
                            }
                            break;

                        case 1003: // help
                            // TODO need a new logic
                            break;

                    }
                    break;
                }
            }
            if(!commandFound){
                this.logMessage(2, null, null, "unknownCommond", null, null, null, null);
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