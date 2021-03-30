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
    if(data.playerID != game.user.id){return;}
    if(data?.type == "DEAL"){
      await ui['cardHotbar'].populator.addToPlayerHand(data.cards);
    } else if (data?.type == "UPDATESTATE") {
      game.decks.get(data.deckID)
    } else if (data?.type == "SETDECKS") {
      game.decks.decks = JSON.parse(game.settings.get("cardsupport", "decks"))
    } else if (data?.type == "DISCARD") {
      game.decks.getByCard(data.cardID).discardCard(data.cardID);
    } else if (data?.type == "GIVE") {
      if(data.to != game.user.id){
        game.decks.giveToPlayer(data.to, data.cardID);
      } else {
        await ui['cardHotbar'].populator.addToHand([data.cardID])
      }
    } else if (data?.type == "RESETDECK"){
      ui['cardHotbar'].populator.resetDeck(data.deckID);
    } else if (data?.type == "REVEALCARD"){
      game.journal.get(data.cardID).show("image", true);
    } else if (data?.type == "DROP"){
      handleDroppedCard(data.cardID, data.x, data.y, data.alt, data.sideUp);
    } else if (data?.type == "REMOVECARD") {
        canvas.tokens.get(data.tokenID).delete();    
    } else if (data?.type == "REQUESTTAKECARD") {
        requestTakeCard(data);
    } else if (data?.type == "DRAWCARDS") {
      game.decks.get(data.deckID).dealToPlayer(
        data.receiverID,
        data.numCards,
        data.replacement
      )
    } else if (data?.type == "REQUESTVIEWCARDS") {
      let cards:JournalEntry[] = [];
      let deck =(<Deck>game.decks.get(data.deckID))
      let cardIDs = deck._state.slice(deck._state.length - data.viewNum)
      cards = cardIDs.map(el => {
        return game.journal.get(el)
      }).reverse()
      EMITTER.sendViewCardsMsg(data.requesterID, data.deckID, cards);
    } else if (data?.type == "VIEWCARDS") {
      new ViewJournalPile({
        deckID: data.deckID,
        cards: data.cards
      }).render(true)
    } else if (data?.type == "REMOVECARDFROMSTATE") {
      game.decks.get(data.deckID).removeFromState([data.cardID]);
    } else if (data?.type == "REMOVECARDFROMDISCARD") {
      game.decks.get(data.deckID).removeFromDiscard([data.cardID]);
    } else if (data?.type == "REQUESTDISCARD") {
      let cards: JournalEntry[] = []
      cards = (<Deck>game.decks.get(data.deckID))._discard.map(el => {
        return game.journal.get(el)
      })
      EMITTER.sendViewDiscardMsg(data.requesterID, data.deckID, cards);
    } else if (data?.type == "VIEWDISCARD") {
      new DiscardJournalPile({
        deckID: data.deckID,
        cards: data.cards
      }).render(true)
    } else if (data?.type == "CARDTOPDECK") {
      (<Deck>game.decks.get(data.deckID)).addToDeckState([data.cardID]);
      (<Deck>game.decks.get(data.deckID)).removeFromDiscard([data.cardID]);
    } else if (data?.type == "SHUFFLEBACKDISCARD") {
      (<Deck>game.decks.get(data.deckID)).addToDeckState(game.decks.get(data.deckID)._discard);
      (<Deck>game.decks.get(data.deckID)).removeFromDiscard(game.decks.get(data.deckID)._discard);
      (<Deck>game.decks.get(data.deckID)).shuffle();
    } else if (data?.type == "GETALLCARDSBYDECK"){
      let cards:JournalEntry[] = [];
      let deck =(<Deck>game.decks.get(data.deckID))
      let cardIDs = deck._state.slice(deck._state.length - data.viewNum)
      cards = cardIDs.map(el => {
        return game.journal.get(el)
      }).reverse()
      
      //sendReceiveCardsByDeckMsg(data.to, cards, data.deckID);
    }
  })  
});

async function requestTakeCard(data) {
  let img = ui['cardHotbar'].macros[data.cardNum-1].icon
  let macro = ui['cardHotbar'].macros[data.cardNum-1].macro

  let tex = await loadTexture(img)
  new Dialog({
    title: `${game.users.get(data.playerID).data.name} is requesting a card`,
    content: `
      <img src="${img}"></img>        
    `,
    buttons: {
      accept: {
        label: "Accept",
        callback: async () => {
          if(game.user.isGM){
            game.decks.giveToPlayer(data.cardRequester, macro.getFlag("world", "cardID"));
          } else {
            EMITTER.sendGiveMsg(getGmId(), data.cardRequester, macro.getFlag("world", "cardID"));
          }
          //delete the macro in hand
          await ui['cardHotbar'].populator.chbUnsetMacro(data.cardNum)
        }
      },
      decline: {
        label: "Decline"
      }
    }
  }, {
    height: tex.height,
    width: tex.width
  }).render(true);
}

