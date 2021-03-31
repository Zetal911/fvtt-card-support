var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getGmId } from './socketListener.js';
import { handleDroppedCard } from './drop.js';
import { ViewJournalPile, DiscardJournalPile } from './DeckForm.js';
import { mod_scope } from './constants.js';
function emitMsg(msg) {
    if (msg.playerID == game.user.id) {
        console.log("Immediately executing " + msg.type);
        msg.execute();
    }
    else {
        console.log("Emitting message type " + msg.type);
        //@ts-ignore
        game.socket.emit('module.cardsupport', msg);
    }
}
export function sendDealMsg(playerID, cards) {
    let msg = new MSG_DEAL(playerID, cards);
    emitMsg(msg);
}
export function sendUpdateStateMsg(playerID, deckID) {
    let msg = new MSG_UPDATESTATE(playerID, deckID);
    emitMsg(msg);
}
export function sendSetDecksMsg(playerID) {
    let msg = new MSG_SETDECKS(playerID);
    emitMsg(msg);
}
export function sendDiscardMsg(playerID, cardID) {
    let msg = new MSG_DISCARD(playerID, cardID);
    emitMsg(msg);
}
export function sendGiveMsg(playerID, to, cardID) {
    let msg = new MSG_GIVE(playerID, to, cardID);
    emitMsg(msg);
}
export function sendResetDeckMsg(playerID, deckID) {
    let msg = new MSG_RESETDECK(playerID, deckID);
    emitMsg(msg);
}
export function sendRevealCardMsg(playerID, cardID) {
    let msg = new MSG_REVEALCARD(playerID, cardID);
    emitMsg(msg);
}
export function sendDropMsg(playerID, cardID, x, y, alt, sideUp) {
    let msg = new MSG_DROP(playerID, cardID, x, y, alt, sideUp);
    emitMsg(msg);
}
export function sendRemoveCardMsg(playerID, tokenID) {
    let msg = new MSG_REMOVECARD(playerID, tokenID);
    console.log(msg);
    emitMsg(msg);
}
export function sendRequestTakeCardMsg(playerID, cardRequester, cardNum) {
    let msg = new MSG_REQUESTTAKECARD(playerID, cardRequester, cardNum);
    emitMsg(msg);
}
export function sendDrawCardsMsg(playerID, receiverID, deckID, numCards, replacement) {
    let msg = new MSG_DRAWCARDS(playerID, receiverID, deckID, numCards, replacement);
    emitMsg(msg);
}
export function sendRequestViewCardsMsg(playerID, requesterID, deckID, viewNum) {
    let msg = new MSG_REQUESTVIEWCARDS(playerID, requesterID, deckID, viewNum);
    emitMsg(msg);
}
export function sendViewCardsMsg(playerID, deckID, cards) {
    let msg = new MSG_VIEWCARDS(playerID, deckID, cards);
    emitMsg(msg);
}
export function sendRemoveCardFromStateMsg(playerID, deckID, cardID) {
    let msg = new MSG_REMOVECARDFROMSTATE(playerID, deckID, cardID);
    emitMsg(msg);
}
export function sendRemoveCardFromDiscardMsg(playerID, deckID, cardID) {
    let msg = new MSG_REMOVECARDFROMDISCARD(playerID, deckID, cardID);
    emitMsg(msg);
}
export function sendRequestViewDiscardMsg(playerID, requesterID, deckID) {
    let msg = new MSG_REQUESTVIEWDISCARD(playerID, requesterID, deckID);
    emitMsg(msg);
}
export function sendViewDiscardMsg(playerID, deckID, cards) {
    let msg = new MSG_VIEWDISCARD(playerID, deckID, cards);
    emitMsg(msg);
}
export function sendCardTopDeckMsg(playerID, deckID, cardID) {
    let msg = new MSG_CARDTOPDECK(playerID, deckID, cardID);
    emitMsg(msg);
}
export function sendShuffleBackDiscardMsg(playerID, deckID) {
    let msg = new MSG_SHUFFLEBACKDISCARD(playerID, deckID);
    emitMsg(msg);
}
export function sendGetAllCardsByDeckMsg(playerID, to, deckID) {
    let msg = new MSG_GETALLCARDSBYDECK(playerID, to, deckID);
    emitMsg(msg);
}
//////////////////////////////////////////////////////////////
class MSG_BASE {
    constructor() { }
    ;
}
export class MSG_DEAL extends MSG_BASE {
    constructor(playerID, cards, type = "DEAL") {
        super();
        this.playerID = playerID;
        this.cards = cards;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield ui['cardHotbar'].populator.addToPlayerHand(this.cards);
        });
    }
}
export class MSG_UPDATESTATE extends MSG_BASE {
    constructor(playerID, deckID, type = "UPDATESTATE") {
        super();
        this.playerID = playerID;
        this.deckID = deckID;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let deck = game.decks.get(this.deckID);
            yield game.folders.get(this.deckID).setFlag(mod_scope, 'deckState', JSON.stringify({
                state: deck._state,
                cards: deck._cards,
                discard: deck._discard
            }));
            yield game.settings.set("cardsupport", "decks", JSON.stringify(game.decks.decks));
            //@ts-ignore
            for (let user of game.users.entries) {
                if (user.isSelf) {
                    continue;
                }
                sendSetDecksMsg(user.id);
            }
        });
    }
}
export class MSG_SETDECKS extends MSG_BASE {
    constructor(playerID, type = "SETDECKS") {
        super();
        this.playerID = playerID;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            game.decks.decks = JSON.parse(game.settings.get("cardsupport", "decks"));
        });
    }
}
export class MSG_DISCARD extends MSG_BASE {
    constructor(playerID, cardID, type = "DISCARD") {
        super();
        this.playerID = playerID;
        this.cardID = cardID;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            game.decks.getByCard(this.cardID).discardCard(this.cardID);
        });
    }
}
export class MSG_GIVE extends MSG_BASE {
    constructor(playerID, to, cardID, type = "GIVE") {
        super();
        this.playerID = playerID;
        this.to = to;
        this.cardID = cardID;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.to != game.user.id) {
                game.decks.giveToPlayer(this.to, this.cardID);
            }
            else {
                yield ui['cardHotbar'].populator.addToHand([this.cardID]);
            }
        });
    }
}
export class MSG_RESETDECK extends MSG_BASE {
    constructor(playerID, deckID, type = "RESETDECK") {
        super();
        this.playerID = playerID;
        this.deckID = deckID;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            ui['cardHotbar'].populator.resetDeck(this.deckID);
        });
    }
}
export class MSG_REVEALCARD extends MSG_BASE {
    constructor(playerID, cardID, type = "REVEALCARD") {
        super();
        this.playerID = playerID;
        this.cardID = cardID;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            game.journal.get(this.cardID).show("image", true);
            //@ts-ignore
            ui.notifications.notify("Card now revealed to all players...");
        });
    }
}
export class MSG_DROP extends MSG_BASE {
    constructor(playerID, cardID, x, y, alt, sideUp, type = "DROP") {
        super();
        this.playerID = playerID;
        this.cardID = cardID;
        this.x = x;
        this.y = y;
        this.alt = alt;
        this.sideUp = sideUp;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            handleDroppedCard(this.cardID, this.x, this.y, this.alt, this.sideUp);
        });
    }
}
export class MSG_REMOVECARD extends MSG_BASE {
    constructor(playerID, tokenID, type = "REMOVECARD") {
        super();
        this.playerID = playerID;
        this.tokenID = tokenID;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("removing card: " + this.tokenID);
            canvas.tokens.get(this.tokenID).delete();
        });
    }
}
export class MSG_REQUESTTAKECARD extends MSG_BASE {
    constructor(playerID, cardRequester, cardNum, type = "REQUESTTAKECARD") {
        super();
        this.playerID = playerID;
        this.cardRequester = cardRequester;
        this.cardNum = cardNum;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let img = ui['cardHotbar'].macros[this.cardNum - 1].icon;
            let macro = ui['cardHotbar'].macros[this.cardNum - 1].macro;
            let tex = yield loadTexture(img);
            new Dialog({
                title: `${game.users.get(this.playerID).data.name} is requesting a card`,
                content: `
          <img src="${img}"></img>        
        `,
                buttons: {
                    accept: {
                        label: "Accept",
                        callback: () => __awaiter(this, void 0, void 0, function* () {
                            sendGiveMsg(getGmId(), this.cardRequester, macro.getFlag("world", "cardID"));
                            //delete the macro in hand
                            yield ui['cardHotbar'].populator.chbUnsetMacro(this.cardNum);
                        })
                    },
                    decline: {
                        label: "Decline"
                    }
                }
            }, {
                height: tex.height,
                width: tex.width
            }).render(true);
        });
    }
}
export class MSG_DRAWCARDS extends MSG_BASE {
    constructor(playerID, receiverID, deckID, numCards, replacement, type = "DRAWCARDS") {
        super();
        this.playerID = playerID;
        this.receiverID = receiverID;
        this.deckID = deckID;
        this.numCards = numCards;
        this.replacement = replacement;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            game.decks.get(this.deckID).dealToPlayer(this.receiverID, this.numCards, this.replacement);
        });
    }
}
export class MSG_REQUESTVIEWCARDS extends MSG_BASE {
    constructor(playerID, requesterID, deckID, viewNum, type = "REQUESTVIEWCARDS") {
        super();
        this.playerID = playerID;
        this.requesterID = requesterID;
        this.deckID = deckID;
        this.viewNum = viewNum;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let cards = [];
            let deck = game.decks.get(this.deckID);
            let cardIDs = deck._state.slice(deck._state.length - this.viewNum);
            cards = cardIDs.map(el => {
                return game.journal.get(el);
            }).reverse();
            sendViewCardsMsg(this.requesterID, this.deckID, cards);
        });
    }
}
export class MSG_VIEWCARDS extends MSG_BASE {
    constructor(playerID, deckID, cards, type = "VIEWCARDS") {
        super();
        this.playerID = playerID;
        this.deckID = deckID;
        this.cards = cards;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            new ViewJournalPile({
                deckID: this.deckID,
                cards: this.cards
            }).render(true);
        });
    }
}
export class MSG_REMOVECARDFROMSTATE extends MSG_BASE {
    constructor(playerID, deckID, cardID, type = "REMOVECARDFROMSTATE") {
        super();
        this.playerID = playerID;
        this.deckID = deckID;
        this.cardID = cardID;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            game.decks.get(this.deckID).removeFromState([this.cardID]);
        });
    }
}
export class MSG_REMOVECARDFROMDISCARD extends MSG_BASE {
    constructor(playerID, deckID, cardID, type = "REMOVECARDFROMDISCARD") {
        super();
        this.playerID = playerID;
        this.deckID = deckID;
        this.cardID = cardID;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            game.decks.get(this.deckID).removeFromDiscard([this.cardID]);
        });
    }
}
export class MSG_REQUESTVIEWDISCARD extends MSG_BASE {
    constructor(playerID, requesterID, deckID, type = "REQUESTVIEWDISCARD") {
        super();
        this.playerID = playerID;
        this.requesterID = requesterID;
        this.deckID = deckID;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let cards = game.decks.get(this.deckID)._discard.map(el => { return game.journal.get(el); });
            sendViewDiscardMsg(this.requesterID, this.deckID, cards);
        });
    }
}
export class MSG_VIEWDISCARD extends MSG_BASE {
    constructor(playerID, deckID, cards, type = "VIEWDISCARD") {
        super();
        this.playerID = playerID;
        this.deckID = deckID;
        this.cards = cards;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            new DiscardJournalPile({
                deckID: this.deckID,
                cards: this.cards
            }).render(true);
        });
    }
}
export class MSG_CARDTOPDECK extends MSG_BASE {
    constructor(playerID, deckID, cardID, type = "CARDTOPDECK") {
        super();
        this.playerID = playerID;
        this.deckID = deckID;
        this.cardID = cardID;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            game.decks.get(this.deckID).addToDeckState([this.cardID]);
            game.decks.get(this.deckID).removeFromDiscard([this.cardID]);
        });
    }
}
export class MSG_SHUFFLEBACKDISCARD extends MSG_BASE {
    constructor(playerID, deckID, type = "SHUFFLEBACKDISCARD") {
        super();
        this.playerID = playerID;
        this.deckID = deckID;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            game.decks.get(this.deckID).addToDeckState(game.decks.get(this.deckID)._discard);
            game.decks.get(this.deckID).removeFromDiscard(game.decks.get(this.deckID)._discard);
            game.decks.get(this.deckID).shuffle();
        });
    }
}
export class MSG_GETALLCARDSBYDECK extends MSG_BASE {
    constructor(playerID, to, deckID, type = "GETALLCARDSBYDECK") {
        super();
        this.playerID = playerID;
        this.to = to;
        this.deckID = deckID;
        this.type = type;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let cards = [];
            let deck = game.decks.get(this.deckID);
            let cardIDs = deck._state.slice(deck._state.length);
            cards = cardIDs.map(el => {
                return game.journal.get(el);
            }).reverse();
            //sendReceiveCardsByDeckMsg(this.to, cards, this.deckID);
        });
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
