//import { Deck } from "../scripts/deck.js";
import * as EMITTER from '../../scripts/socketEmitter.js';

export class cardHotbarPopulator {
    constructor() { 
        this.macroMap = this.chbGetMacros();    
        console.debug("Card Hotbar | Initial state:");
        console.debug(this.macroMap);
    }

    // Backwards compatibilty
    async addToHand(cardIDs){
        //console.log("Add to Hand CardIDs", cardIDs);
        let journalEntries = []
        for(let id of cardIDs){
            journalEntries.push(game.journal.get(id))
        }
        //console.log("JEs", journalEntries)
        await this.addToPlayerHand(journalEntries);
    }


    /**
     * 
     * @param card type: JournalEntry[]
     * 
     */
    async addToPlayerHand(cards){
        //console.log("Player Hand Add Cards", cards)
        return new Promise(async (resolve, reject) => {
            let defaultSideUp = "front";
            if( game.user.getFlag('cardsupport', 'chbDrawFaceUpHand')!==undefined ){
                defaultSideUp = game.user.getFlag('cardsupport', 'chbDrawFaceUpHand') == true ? "front" : "back"
            } else {
                defaultSideUp = game.settings.get("cardsupport", "chbDrawFaceUpHand") == true ? "front" : "back"
            }
            console.debug(defaultSideUp);
            const maxSlot = 54;
            let firstEmpty = this.getNextSlot();
            if(firstEmpty === -1 || firstEmpty > maxSlot){
                ui.notifications.error("There is no room in your hand!");
                reject("No more room in hand!")
            }
    
            //preserve existing cards
            let hand = [];
            hand.length = this.macroMap.length
            for(let slot = 0; slot <= this.macroMap.length; slot++){
                //hand.push(this.macroMap[slot])
                hand[slot] = this.macroMap[slot]
            }
    
            for(let i=0; i<cards.length; i++){
                if(maxSlot >= i+firstEmpty){
                    console.log("Card In Hand: ", cards[i])
                    let img = ""
                    if (cards[i]?.data != undefined) {
                        img = defaultSideUp == "front" ? cards[i].data.img : cards[i].getFlag("world","cardBack");
                        //img = defaultSideUp == "back" ? cards[i].getFlag("world","cardBack") : cards[i].data.img;
                        //console.debug("Card Hotbar | Invalid default card facing provided.");
                    } else {
                        // THIS ELSE IS VERY IMPORTANT DO NOT DELETE IT!! @ Norc
                        //(For Players, when reciving JE, they won't have the full JE, only the data prop, which means no .data object)
                        img = defaultSideUp == "front" ? cards[i].img : cards[i].flags.world.cardBack;
                        //img = defaultSideUp == "back" ? cards[i].getFlag("world","cardBack") : cards[i].data.img; 
                    }
                    let imgTex = await loadTexture(img);
                    let imgHeight = imgTex.height;
                    let imgWidth = imgTex.width;
                    let scaledWidth = (200 / imgHeight ) * imgWidth;
                    let macro = await Macro.create({
                        name: `Card`,
                        type: 'script',
                        flags: {
                            "world": {
                                "cardID": cards[i]._id,
                                "img": cards[i]?.data != undefined ? cards[i].data.img : cards[i].img, 
                                "cardBack": cards[i]?.data != undefined ? cards[i].data.flags.world.cardBack : cards[i].flags.world.cardBack,
                                "sideUp": defaultSideUp,
                                "scaledWidth": scaledWidth
                            }
                        }, 
                        scope: "global",
                        command: `
                        new Dialog({
                            title: "Card",
                            content: '<img src="${img}" />'
                            ,
                            buttons: {}
                        }, {height:${imgHeight}, width:${imgWidth}}).render(true)
                        `,
                        img: img
                    })
                    hand[firstEmpty+i] = macro.id;
                    //hand.push(macro.id);
                } else {
                    ui.notifications.error("Not enough space in your hand. ");
                    ui.notifications.render();
                    reject("No more room in hand!")
                }
            }
            this.macroMap = hand;
            ui.cardHotbar.macros = ui.cardHotbar.getcardHotbarMacros();
            await this._updateFlags();
            ui.cardHotbar.render();
            resolve();
        })
    }

   async addToHand_OLD(cardId, sideUp) {
        //console.debug("Card Hotbar | Adding card to hand...");
        //generate macro for card
        //TODO: better consolidate with code in index.js in hotbarDrop hook (call hook? make function at least?)
        // Make a new macro for the Journal
        
        //will use the card facing if provided (1 = front, 0 = back). Otherwise default to User Flag for drawFaceUp, else setting for same.
        let defaultSide = true;
        if ( game.user.getFlag("cardsupport","chbDrawFaceUp") != undefined ) {
            defaultSide = game.user.getFlag("cardsupport","chbDrawFaceUp");
        } else {
            defaultSide = game.settings.get("cardsupport","chbDrawFaceUp");
        }
        
        console.debug(`Card Hotbar | defaultSide is: ${defaultSide}`);
        if (sideUp === undefined) sideUp = defaultSide;
        sideUp ? sideUp = "front" : sideUp ="back";
        console.debug(sideUp);
        if (sideUp == undefined) {
            ui.notifications.error("Error: Cannot determine card facing.");
            return;
        }
        const maxSlot = 54; 
        let journal = {};
        let firstEmpty = this.getNextSlot();
        console.debug("First empty:");
        console.debug(firstEmpty);
        //check for invalid input
        if (!cardId.length) {
            ui.notifications.error("Please provide an array of cardIds");
            return false;
        } 
        if ( firstEmpty === -1 || firstEmpty > maxSlot ) {
            ui.notifications.error("There is no room in your hand.");
            return false;
        }
        console.debug("Card Hotbar | MacroMap")
        console.debug(this.macroMap);
        console.debug(this.macroMap.length);
        let tempCardMacros = [null];
        //preserve existing cards
        tempCardMacros.length = this.macroMap.length;
        for (let slot = 1; slot <= this.macroMap.length; slot++) {
            tempCardMacros[slot] = this.macroMap[slot];
        }
        /*
        for (let i = 1; i < cardId.length; i++) {
            tempCardMacros.push( null );
        }
        */
        console.debug("tempCardMacros before:");
        console.debug(tempCardMacros);
        let macro = {};
        for (let i = 0; i < cardId.length; i++) { 
            if ( maxSlot >= i + firstEmpty ) {
                journal = game.journal.get(cardId[i]);
                macro = await Macro.create({
                    name: `Card: ${journal.name}`,
                    type: "script",
                    flags: {
                        "world": {
                            "cardID": journal.id,
                            "sideUp": sideUp
                        }
                    },
                    scope: "global",
                    command: `game.journal.get("${journal.id}").sheet.render(true, {sheetMode: "image"} );`,
                    img: sideUp == "front" ? journal.data.img : journal.getFlag("world","cardBack") 
                });
                console.debug("Prepping new macro to add...");
                tempCardMacros[firstEmpty+i] = macro.id;
            } else {
                ui.notifications.error("Not enough space in hand, at least 1 card not added.");
                ui.cardHotbar.render();
                return -1;
            }
        }
        console.debug("Card Hotbar | tempCardMacros after:")
        console.debug(tempCardMacros);
        this.macroMap = tempCardMacros;
        console.debug("Card Hotbar | this.macroMap after:");
        console.debug(this.macroMap);
        console.debug(tempCardMacros);
        ui.cardHotbar.macros = ui.cardHotbar.getcardHotbarMacros();
//        ui.cardHotbar.getcardHotbarMacros();
        this._updateFlags().then(set => { 
//            this.chbSetMacros.then(render => { 
                return ui.cardHotbar.render();
//            });    
        });

    }
    

    takeFromPlayer(){
        let players = ""
        for(let user of game.users.entries){
            if(!user.isSelf && user.active){
                players += `<option value="${user.id}">${user.data.name}</option>`
            }
        }
        let dialogHTML = 
        `
        <p><select id="playerID">${players}</select></p>
        <p>Card Number: <input type="number" id="cardNum" style="width:50px"></input> </p>
        `

        new Dialog({
            name: "Request Card From Player",
            content: dialogHTML, 
            buttons: {
                take: {
                    label: "Request",
                    callback: (html) => {
                        let socketMsg = {
                            type: "REQUESTTAKECARD",
                            playerID: html.find("#playerID")[0].value,
                            cardRequester: game.user.id,
                            cardNum: html.find("#cardNum")[0].value
                        }
                        game.socket.emit("module.cardsupport", socketMsg)
                    }
                }
            }
        }).render(true);
    }

    async resetDeck(deckID){
        for(let mId of ui.cardHotbar.populator.macroMap){
            const macro = game.macros.get(mId);
            const cardID = macro?.getFlag("world", "cardID");
            if(game.decks.decks[deckID]._cards.includes(cardID)){
                let slot = this.macroMap.indexOf(macro.id)
                await this.chbUnsetMacro(slot);
            }
        }
    }

    discardHand() {
        new Dialog({
            title: 'Please Confirm Enitre Hand Discard',
            content: '<p>Are you sure you want to discard your entire hand?</p>',
            buttons: {
                Yes: {
                    icon: '<i class="fa fa-check"></i>',
                    label: 'Yes',
                    callback: (dlg) => {
                        ui.notifications.notify("Discarding entire hand");
                        console.debug("Card Hotbar | discarding entire hand");
                        try {
                            for (let mId of ui.cardHotbar.populator.macroMap) {
                                const m = game.macros.get(mId);
                                console.debug(m)
                                if ( m ) {
                                    const mCardId = m.getFlag("world","cardID");
                                    console.debug(mCardId);
                                    if ( mCardId ) {
                                        const mDeck = game.decks.getByCard( mCardId );
                                        console.debug(mDeck);
                                        if (mDeck) {
                                            //console.debug("Card Hotbar | Discarding card (macro, deck)...");
                                            EMITTER.sendDiscardMsg(game.users.find(el => el.isGM && el.active).id, mCardId);
                                        }   
                                    }
                                    m.delete();
                                }
                            }  
                        } catch (error) {
                            const msg = "Issue found with hand data, resetting hand to try solve it...";                           
                            console.debug("Card Hotbar | " + msg);
                            //ui.notifications.notify(msg);
                        }
                        ui.cardHotbar.populator.chbResetMacros();
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'No'
                },
            },
            default: 'cancel'
        }).render(true);
    }

    /* in progress
    async discardCards (deck, cards, slot=1, num=cards.length ) {
        for (let c of cards) {
            try {
                deck.discardCards(c);
                //console.debug("Card Hotbar | Discarding card (macro, slot, deck)...");
                //console.debug(macro);
                //console.debug(index);
                //console.debug(mDeck);
                await ui.cardHotbar.populator.chbUnsetMacro(index);
                macro.delete();
              } catch (e) {
                //console.debug ("Card Hotbar | Could not properly discard card from hand");
              }
        }
    }
    */
    async flipCard(slot) {
        let mm = game.macros.get( this.macroMap[slot] );
        let frontImg = mm.getFlag("world","img");
        let backImg = mm.getFlag("world", "cardBack");
        let newImg = "";
        let sideUp = "";
        //console.debug(cardEntry);
        console.debug(mm);

        if(mm.data.img == frontImg) {
            // Card is front up, switch to back
            newImg = backImg;
            sideUp = "back";            
        } else if( mm.data.img == backImg ) {
            // Card is back up
            newImg = frontImg;
            sideUp = "front";
        } else{ 
            ui.notifications.error("What you doing m8? Stop breaking Spaceman's code that Norc stole...");
            return sideUp;
        }
        //TO DO: combine with mm.update statement below
        await mm.setFlag("world","sideUp",sideUp);
        await mm.update({img: newImg});
        return sideUp;
    }

    compact() {
        let filled = duplicate( this.macroMap.filter(function (card) {
            return card != null;
          }) );
        filled.unshift(null);
        //console.debug("Card Hotbar | Compacting... ");
        //console.debug(filled);
        return filled;
    }

    //checks to see if there is available space in the hand. Returns -1 if entirely full (this is an error code)
    //or the last available slot number otherwise
    getNextSlot() {
        //console.debug ("Card Hotbar | Checking macroMap for next available slot...");
        //have to perform some trickery so that the null at slot 0 is not picked up incorrectly.
        //functionally, this will return the actual slot number when 1 is added again at end.
        let slotCheck = this.macroMap.slice(1);
        const maxSlot = 54;
        slotCheck.length = maxSlot;
        const startSlot = this.macroMap.filter(slot => slot).length;
        console.debug("Card Hotbar | Filling slotCheck...");
        console.debug(startSlot, maxSlot);
        slotCheck.fill(null,startSlot,maxSlot);
        console.debug("Card Hotbar | slotCheck");
        console.debug(slotCheck);
        let result = slotCheck.findIndex(this.checkSlotNull);
        console.debug("Card Hotbar | nextSlot is: ");
        console.debug(result);
        return result != -1 ? result + 1 : -1 ;  
    } 

    checkSlotNull(cardId) {
        return cardId == null;     
    }

    /**
     * Returns a single cardHotbar macro
     * @return {string[]} [slot]: macroId
     */
    chbGetMacro(slot) {
        return game.user.getFlag('cardsupport', 'chbMacroMap')[slot] || [];
    }

    /**
     * Returns all cardHotbar macros
     * @return {string[]} [slot]: macroId
     */
    chbGetMacros() {
        return game.user.getFlag('cardsupport', 'chbMacroMap') || [];
    }

    /**
     * Set or replace a macro on one of the card hotbar slots.
     * @param {string} macroId
     * @param {number} slot 
     * @return {Promise<unknown>} Promise indicating whether the macro was set and the hotbar was rendered.
     */
    chbSetMacro(macroId, slot) {
        //console.debug("Card Hotbar |", "Setting macro", slot, macroId);
        this.macroMap[slot] = macroId;
        ui.cardHotbar.getcardHotbarMacros();
        this._updateFlags().then(render => { 
            return ui.cardHotbar.render();
        });
    }

    /**
     * Replace all card hotbar slots.
     * @param {string[]} macros ([slot]: macroId)
     * @return {Promise<unknown>} Promise indicating whether the macros were set and the hotbar was rendered.
     */
    async chbSetMacros(macros) {
        /**
         * !
         * ! Assumes a single page card hotbar with maxSlots
         * !
         */

        const maxSlot = 54
        for (let slot = 1; slot <= maxSlot; slot++) {
            this.macroMap[slot] = ui.cardHotbar.macros[slot];
        }
        await this._updateFlags();
        return ui.cardHotbar.render();
    }

    /**
     * Remove the macro from the card hotbar slot.
     * @param {number} slot
     * @return {Promise<unknown>} Promise indicating whether the macro was removed.
     */
    async chbUnsetMacro(slot) {
        const macro = game.macros.get(this.macroMap[slot])
        this.macroMap[slot] = null;
        this.macroMap = duplicate( await this.compact() );
        ui.cardHotbar.getcardHotbarMacros();
        this._updateFlags().then(render => {
            if(macro){macro.delete()}
            return ui.cardHotbar.render();
        });
    }

    /**
     * Remove all macros from the card hotbar.
     * @return {Promise<unknown>} Promise indicating whether the macros were removed.
     */
    chbResetMacros() {
        this.macroMap = [];
        ui.cardHotbar.getcardHotbarMacros();
        this._updateFlags().then(render => { 
            return ui.cardHotbar.render();
        });
    }

    async _updateFlags() {
            await game.user.unsetFlag('cardsupport', 'chbMacroMap');
            const result = await game.user.setFlag('cardsupport', 'chbMacroMap', this.macroMap);
            //quick solution to set css width for all slots based on first slot image
            //TODO: improve to set individual slot width eventually?
            console.debug("updating flags");
            console.debug(this.macroMap[1]);
            return result;
    }
}
