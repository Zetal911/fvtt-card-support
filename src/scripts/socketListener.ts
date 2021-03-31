import {handleDroppedCard} from './drop.js';
import { Deck } from './deck.js';
import {ViewJournalPile, DiscardJournalPile} from './DeckForm.js';
import * as EMITTER from './socketEmitter.js';

export function getGmId() {
    var gmPlayer = game.users.find(el => el.isGM && el.active);
    if(!gmPlayer) {
        throw new Error("A GM must be present for this action.");
    }
    return gmPlayer.id;
}

Hooks.on("ready", () => {
  //@ts-ignore
  game.socket.on('module.cardsupport', async (data:any) => {
    console.log("Socket Received: ", data);
    if(data.playerID != game.user.id) { return; }
    
    let receivedMessage = null;
    if(data?.type == "DEAL"){
      receivedMessage = (new EMITTER.MSG_DEAL(data.playerID, data.cards));
    } else if (data?.type == "UPDATESTATE") {
      receivedMessage = (new EMITTER.MSG_UPDATESTATE(data.playerID, data.deckID));
    } else if (data?.type == "SETDECKS") {
      receivedMessage = (new EMITTER.MSG_SETDECKS(data.playerID));
    } else if (data?.type == "DISCARD") {
      receivedMessage = (new EMITTER.MSG_DISCARD(data.playerID, data.cardID));
    } else if (data?.type == "GIVE") {
      receivedMessage = (new EMITTER.MSG_GIVE(data.playerID, data.to, data.cardID));
    } else if (data?.type == "RESETDECK"){
      receivedMessage = (new EMITTER.MSG_RESETDECK(data.playerID, data.deckID));
    } else if (data?.type == "REVEALCARD"){
      receivedMessage = (new EMITTER.MSG_REVEALCARD(data.playerID, data.cardID));
    } else if (data?.type == "DROP"){
      receivedMessage = (new EMITTER.MSG_DROP(data.playerID, data.cardID, data.x, data.y, data.alt, data.sideUp));
    } else if (data?.type == "REMOVECARD") {
      receivedMessage = (new EMITTER.MSG_REMOVECARD(data.playerID, data.tokenID));
    } else if (data?.type == "REQUESTTAKECARD") {
      receivedMessage = (new EMITTER.MSG_REQUESTTAKECARD(data.playerID, data.cardRequester, data.cardNum));
    } else if (data?.type == "DRAWCARDS") {
      receivedMessage = (new EMITTER.MSG_DRAWCARDS(data.playerID, data.receiverID, data.deckID, data.numCards, data.replacement));
    } else if (data?.type == "REQUESTVIEWCARDS") {
      receivedMessage = (new EMITTER.MSG_REQUESTVIEWCARDS(data.playerID, data.requesterID, data.deckID, data.viewNum));
    } else if (data?.type == "VIEWCARDS") {
      receivedMessage = (new EMITTER.MSG_VIEWCARDS(data.playerID, data.deckID, data.cards));
    } else if (data?.type == "REMOVECARDFROMSTATE") {
      receivedMessage = (new EMITTER.MSG_REMOVECARDFROMSTATE(data.playerID, data.deckID, data.cardID));
    } else if (data?.type == "REMOVECARDFROMDISCARD") {
      receivedMessage = (new EMITTER.MSG_REMOVECARDFROMDISCARD(data.playerID, data.deckID, data.cardID));
    } else if (data?.type == "REQUESTDISCARD") {
      receivedMessage = (new EMITTER.MSG_REQUESTDISCARD(data.playerID, data.requesterID, data.deckID));
    } else if (data?.type == "CARDTOPDECK") {
      receivedMessage = (new EMITTER.MSG_CARDTOPDECK(data.playerID, data.deckID, data.cardID));
    } else if (data?.type == "SHUFFLEBACKDISCARD") {
      receivedMessage = (new EMITTER.MSG_SHUFFLEBACKDISCARD(data.playerID, data.deckID));
    } else if (data?.type == "GETALLCARDSBYDECK"){
      receivedMessage = (new EMITTER.MSG_GETALLCARDSBYDECK(data.playerID, data.to, data.deckID));
    }
    
    if(receivedMessage != null) {
        console.log(receivedMessage);
        receivedMessage.execute();
    } else {
      console.error("Received message could not determine type: " + data);
      ui.notifications.error("A critical error occurred receiving message: " + data)
    }
  })  
});

