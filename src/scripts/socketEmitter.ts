import { getGmId } from './socketListener.js';
import {handleDroppedCard} from './drop.js';
import { Deck } from './deck.js';
import {ViewJournalPile, DiscardJournalPile} from './DeckForm.js';
import {mod_scope} from './constants.js';

function emitMsg(msg: MSG_BASE) {
    if(msg.playerID == game.user.id) {
        console.log("Immediately executing " + msg.type);
        msg.execute();
    } else {
        console.log("Emitting message type " + msg.type);
        //@ts-ignore
        game.socket.emit('module.cardsupport', msg)
    }
}

export function sendDealMsg(playerID: string, cards: JournalEntry[]) {
    let msg:MSG_DEAL = new MSG_DEAL(playerID, cards);
    emitMsg(msg);
}

export function sendUpdateStateMsg(playerID: string, deckID: string) {
    let msg:MSG_UPDATESTATE = new MSG_UPDATESTATE(playerID, deckID);
    emitMsg(msg);
}

export function sendSetDecksMsg(playerID: string) {
    let msg:MSG_SETDECKS = new MSG_SETDECKS(playerID);
    emitMsg(msg);
}

export function sendDiscardMsg(playerID: string, cardID: string) {
    let msg:MSG_DISCARD = new MSG_DISCARD(playerID, cardID);
    emitMsg(msg);
}

export function sendGiveMsg(playerID: string, to: string, cardID: string) {
    let msg:MSG_GIVE = new MSG_GIVE(playerID, to, cardID);
    emitMsg(msg);
}

export function sendResetDeckMsg(playerID: string, deckID: string) {
    let msg:MSG_RESETDECK = new MSG_RESETDECK(playerID, deckID);
    emitMsg(msg);
}

export function sendRevealCardMsg(playerID: string, cardID: string) {
    let msg:MSG_REVEALCARD = new MSG_REVEALCARD(playerID, cardID);
    emitMsg(msg);
}

export function sendDropMsg(playerID: string, cardID: string, x: number, y: number, alt: boolean, sideUp: string) {
    let msg:MSG_DROP = new MSG_DROP(playerID, cardID, x, y, alt, sideUp);
    emitMsg(msg);
}

export function sendRemoveCardMsg(playerID: string, tokenID: string) {
    let msg:MSG_REMOVECARD = new MSG_REMOVECARD(playerID, tokenID);
    emitMsg(msg);
}

export function sendRequestTakeCardMsg(playerID: string, cardRequester: string, cardNum: number) {
    let msg:MSG_REQUESTTAKECARD = new MSG_REQUESTTAKECARD(playerID, cardRequester, cardNum);
    emitMsg(msg);
}

export function sendDrawCardsMsg(playerID: string, receiverID: string, deckID: string, numCards: number, replacement: boolean) {
    let msg:MSG_DRAWCARDS = new MSG_DRAWCARDS(playerID, receiverID, deckID, numCards, replacement);
    emitMsg(msg);
}

export function sendRequestViewCardsMsg(playerID: string, requesterID: string, deckID: string, viewNum: number) {
    let msg:MSG_REQUESTVIEWCARDS = new MSG_REQUESTVIEWCARDS(playerID, requesterID, deckID, viewNum);
    emitMsg(msg);
}

export function sendViewCardsMsg(playerID: string, deckID: string, cards: JournalEntry[]) {
    let msg:MSG_VIEWCARDS = new MSG_VIEWCARDS(playerID, deckID, cards);
    emitMsg(msg);
}

export function sendRemoveCardFromStateMsg(playerID: string, deckID: string, cardID: string) {
    let msg:MSG_REMOVECARDFROMSTATE = new MSG_REMOVECARDFROMSTATE(playerID, deckID, cardID);
    emitMsg(msg);
}

export function sendRemoveCardFromDiscardMsg(playerID: string, deckID: string, cardID: string) {
    let msg:MSG_REMOVECARDFROMDISCARD = new MSG_REMOVECARDFROMDISCARD(playerID, deckID, cardID);
    emitMsg(msg);
}

export function sendRequestViewDiscardMsg(playerID: string, requesterID: string, deckID: string) {
    let msg:MSG_REQUESTVIEWDISCARD = new MSG_REQUESTVIEWDISCARD(playerID, requesterID, deckID);
    emitMsg(msg);
}

export function sendViewDiscardMsg(playerID: string, deckID: string, cards: JournalEntry[]) {
    let msg:MSG_VIEWDISCARD = new MSG_VIEWDISCARD(playerID, deckID, cards);
    emitMsg(msg);
}

export function sendCardTopDeckMsg(playerID: string, deckID: string, cardID: string) {
    let msg:MSG_CARDTOPDECK = new MSG_CARDTOPDECK(playerID, deckID, cardID);
    emitMsg(msg);
}

export function sendShuffleBackDiscardMsg(playerID: string, deckID: string) {
    let msg:MSG_SHUFFLEBACKDISCARD = new MSG_SHUFFLEBACKDISCARD(playerID, deckID);
    emitMsg(msg);
}

export function sendGetAllCardsByDeckMsg(playerID: string, to: string, deckID: string) {
    let msg:MSG_GETALLCARDSBYDECK = new MSG_GETALLCARDSBYDECK(playerID, to, deckID);
    emitMsg(msg);
}

export function sendFlipCardMsg(playerID: string, tokenID: string) {
    let msg:MSG_FLIPCARD = new MSG_FLIPCARD(playerID, tokenID);
    emitMsg(msg);
}

//////////////////////////////////////////////////////////////

abstract class MSG_BASE {
    public playerID: string;
    public type: string;
    constructor() {};
    
    public async abstract execute();
}

export class MSG_DEAL extends MSG_BASE {
  constructor(
  public playerID: string,
  public cards: JournalEntry[],
  public type: string = "DEAL", 
  ) { super(); }
    
  public async execute() {
      await ui['cardHotbar'].populator.addToPlayerHand(this.cards);
  }
}

export class MSG_UPDATESTATE extends MSG_BASE {
  constructor(
  public playerID: string,
  public deckID: string,
  public type: string = "UPDATESTATE",
  ) { super(); }
    
  public async execute() {
      let deck = game.decks.get(this.deckID);
      await game.folders.get(this.deckID).setFlag(mod_scope, 'deckState', JSON.stringify({
        state: deck._state,
        cards: deck._cards,
        discard: deck._discard
      }))

      await game.settings.set("cardsupport", "decks", JSON.stringify(game.decks.decks))
      
      //@ts-ignore
      for(let user of game.users.entries) {
        if(user.isSelf){continue;}
        sendSetDecksMsg(user.id);
      }
  }
}

export class MSG_SETDECKS extends MSG_BASE {
  constructor(
  public playerID: string,
  public type: string = "SETDECKS",
  ) { super(); }
    
  public async execute() {
      game.decks.decks = JSON.parse(game.settings.get("cardsupport", "decks"))
  }
}

export class MSG_DISCARD extends MSG_BASE {
  constructor(
  public playerID: string,
  public cardID: string,
  public type: string = "DISCARD", 
  ) { super(); }
    
  public async execute() {
      game.decks.getByCard(this.cardID).discardCard(this.cardID);
  }
}

export class MSG_GIVE extends MSG_BASE {
  constructor(
  public playerID: string,
  public to:string, 
  public cardID: string,
  public type: string = "GIVE",
  ) { super(); }
    
  public async execute() {
      if(this.to != game.user.id){
        game.decks.giveToPlayer(this.to, this.cardID);
      } else {
        await ui['cardHotbar'].populator.addToHand([this.cardID])
      }
  }
}

export class MSG_RESETDECK extends MSG_BASE {
  constructor(
  public playerID: string,
  public deckID: string,
  public type: string = "RESETDECK",
  ) { super(); }
    
  public async execute() {
      ui['cardHotbar'].populator.resetDeck(this.deckID);
  }
}

export class MSG_REVEALCARD extends MSG_BASE {
  constructor(
  public playerID:string,
  public cardID: string,
  public type: string = "REVEALCARD",
  ) { super(); }
    
  public async execute() {
      game.journal.get(this.cardID).show("image", true);
      //@ts-ignore
      ui.notifications.notify("Card now revealed to all players..."); 
  }
}

export class MSG_DROP extends MSG_BASE {
  constructor(
  public playerID: string,
  public cardID: string,
  public x: number, 
  public y: number,
  public alt: boolean,
  public sideUp: string,
  public type: string = "DROP",
  ) { super(); }
    
  public async execute() {
      handleDroppedCard(this.cardID, this.x, this.y, this.alt, this.sideUp);
  }
}

export class MSG_REMOVECARD extends MSG_BASE {
  constructor(
  public playerID: string,
  public tokenID: string,
  public type: string = "REMOVECARD",
  ) { super(); }
    
  public async execute() {
    console.log("removing card: " + this.tokenID);
    canvas.tokens.get(this.tokenID).delete();    
  }
}

export class MSG_REQUESTTAKECARD extends MSG_BASE {
  constructor(
  public playerID: string,
  public cardRequester: string,
  public cardNum: number,
  public type: string = "REQUESTTAKECARD",
  ) { super(); }
    
  public async execute() {
      let img = ui['cardHotbar'].macros[this.cardNum-1].icon
      let macro = ui['cardHotbar'].macros[this.cardNum-1].macro

      let tex = await loadTexture(img)
      new Dialog({
        title: `${game.users.get(this.playerID).data.name} is requesting a card`,
        content: `
          <img src="${img}"></img>        
        `,
        buttons: {
          accept: {
            label: "Accept",
            callback: async () => {
              sendGiveMsg(getGmId(), this.cardRequester, macro.getFlag("world", "cardID"));
              //delete the macro in hand
              await ui['cardHotbar'].populator.chbUnsetMacro(this.cardNum)
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
}

export class MSG_DRAWCARDS extends MSG_BASE {
  constructor(
  public playerID: string,
  public receiverID: string,
  public deckID: string,
  public numCards: number,
  public replacement: boolean,
  public type: string = "DRAWCARDS",
  ) { super(); }
    
  public async execute() {
      game.decks.get(this.deckID).dealToPlayer(
        this.receiverID,
        this.numCards,
        this.replacement
      )
  }
}

export class MSG_REQUESTVIEWCARDS extends MSG_BASE {
  constructor(
  public playerID: string,
  public requesterID: string,
  public deckID: string,
  public viewNum: number,
  public type: string = "REQUESTVIEWCARDS",
  ) { super(); }
    
  public async execute() {
      let cards:JournalEntry[] = [];
      let deck =(<Deck>game.decks.get(this.deckID))
      let cardIDs = deck._state.slice(deck._state.length - this.viewNum)
      cards = cardIDs.map(el => {
        return game.journal.get(el)
      }).reverse()
      sendViewCardsMsg(this.requesterID, this.deckID, cards);
  }
}

export class MSG_VIEWCARDS extends MSG_BASE {
  constructor(
  public playerID: string,
  public deckID: string,
  public cards: JournalEntry[],
  public type: string = "VIEWCARDS",
  ) { super(); }
    
  public async execute() {
      new ViewJournalPile({
        deckID: this.deckID,
        cards: this.cards
      }).render(true)
  }
}

export class MSG_REMOVECARDFROMSTATE extends MSG_BASE {
  constructor(
  public playerID: string,
  public deckID: string,
  public cardID: string,
  public type: string = "REMOVECARDFROMSTATE",
  ) { super(); }
    
  public async execute() {
      game.decks.get(this.deckID).removeFromState([this.cardID]);
  }
}

export class MSG_REMOVECARDFROMDISCARD extends MSG_BASE {
  constructor(
  public playerID: string,
  public deckID: string,
  public cardID: string,
  public type: string = "REMOVECARDFROMDISCARD",
  ) { super(); }
    
  public async execute() {
      game.decks.get(this.deckID).removeFromDiscard([this.cardID]);
  }
}

export class MSG_REQUESTVIEWDISCARD extends MSG_BASE {
  constructor(
  public playerID: string,
  public requesterID: string,
  public deckID: string,
  public type: string = "REQUESTVIEWDISCARD",
  ) { super(); }
    
  public async execute() {
      let cards: JournalEntry[] = (<Deck>game.decks.get(this.deckID))._discard.map(el => { return game.journal.get(el) })
      sendViewDiscardMsg(this.requesterID, this.deckID, cards);
  }
}

export class MSG_VIEWDISCARD extends MSG_BASE {
  constructor(
  public playerID:string, 
  public deckID: string,
  public cards: JournalEntry[],
  public type: string = "VIEWDISCARD", 
  ) { super(); }
    
  public async execute() {
      new DiscardJournalPile({
        deckID: this.deckID,
        cards: this.cards
      }).render(true)
  }
}

export class MSG_CARDTOPDECK extends MSG_BASE {
  constructor(
  public playerID: string,
  public deckID: string,
  public cardID: string,
  public type: string = "CARDTOPDECK",
  ) { super(); }
    
  public async execute() {
      (<Deck>game.decks.get(this.deckID)).addToDeckState([this.cardID]);
      (<Deck>game.decks.get(this.deckID)).removeFromDiscard([this.cardID]);
  }
}

export class MSG_SHUFFLEBACKDISCARD extends MSG_BASE {
  constructor(
  public playerID: string,
  public deckID: string,
  public type: string = "SHUFFLEBACKDISCARD",
  ) { super(); }
    
  public async execute() {
      (<Deck>game.decks.get(this.deckID)).addToDeckState(game.decks.get(this.deckID)._discard);
      (<Deck>game.decks.get(this.deckID)).removeFromDiscard(game.decks.get(this.deckID)._discard);
      (<Deck>game.decks.get(this.deckID)).shuffle();
  }
}

export class MSG_GETALLCARDSBYDECK extends MSG_BASE {
  constructor(
  public playerID: string,
  public to: string,
  public deckID: string,
  public type: string = "GETALLCARDSBYDECK",
  ) { super(); }
    
  public async execute() {
      let cards:JournalEntry[] = [];
      let deck =(<Deck>game.decks.get(this.deckID))
      let cardIDs = deck._state.slice(deck._state.length)
      cards = cardIDs.map(el => {
        return game.journal.get(el)
      }).reverse()
      
      //sendReceiveCardsByDeckMsg(this.to, cards, this.deckID);
  }
}

export class MSG_FLIPCARD extends MSG_BASE {
  constructor(
  public playerID: string,
  public tokenID: string,
  public type: string = "FLIPCARD",
  ) { super(); }
    
  public async execute() {
    let td = canvas.tokens.get(this.tokenID).data;    
    //Create New Tile at Current Tile's X & Y
    let cardEntry = game.journal.get(td.flags[mod_scope].cardID)
    let newImg = "";
    
    if(td.img == cardEntry.data['img']){
      // Card if front up, switch to back
      newImg = cardEntry.getFlag(mod_scope, "cardBack")
    } else if(td.img == cardEntry.getFlag(mod_scope, "cardBack")){
      // Card is back up
      newImg = cardEntry.data['img']
    } else { 
      ui.notifications.error("What you doing m8? Stop breaking my code");
      return;
    }
    Token.create({
      name: td.name,
      img: newImg,
      x: td.x,
      y: td.y,
      width: td.width,
      height: td.height, 
      flags: td.flags,
      actorId: td.actorId,
      actorLink: td.actorLink
    });

    //Delete this tile
    canvas.tokens.get(td._id).delete();
  }
}

/*export class MSG_REMOVEFROMDISCARD extends MSG_BASE {
  constructor(
  public playerID: string,
  public deckID: string,
  public cardID: string,
  public type: string = "REMOVEFROMDISCARD",
  ) { super(); }
    
  public async execute() {
      
  }
}

export class MSG_RECEIVECARDSBYDECK extends MSG_BASE {
  constructor(
  public playerID: string,
  public cards: JournalEntry[],
  public deckID: string,
  public type: string = "RECEIVECARDSBYDECK",
  ) { super(); }
    
  public async execute() {
      
  }
}*/