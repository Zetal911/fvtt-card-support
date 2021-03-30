// Tada: import * as EMITTER from '../scripts/socketEmitter.js';
function emitMsg(msg) {
    //@ts-ignore
    game.socket.emit('module.cardsupport', msg);
}
export function sendDealMsg(playerID, cards) {
    let msg = {
        playerID: playerID,
        cards: cards
    };
    emitMsg(msg);
}
export function sendUpdateStateMsg(playerID, deckID) {
    let msg = {
        playerID: playerID,
        deckID: deckID
    };
    emitMsg(msg);
}
export function sendSetDecksMsg(playerID) {
    let msg = {
        playerID: playerID
    };
    emitMsg(msg);
}
export function sendDiscardMsg(playerID, cardID) {
    let msg = {
        playerID: playerID,
        cardID: cardID
    };
    emitMsg(msg);
}
export function sendGiveMsg(playerID, to, cardID) {
    let msg = {
        playerID: playerID,
        to: to,
        cardID: cardID
    };
    emitMsg(msg);
}
export function sendResetDeckMsg(playerID, deckID) {
    let msg = {
        playerID: playerID,
        deckID: deckID
    };
    emitMsg(msg);
}
export function sendRevealCardMsg(playerID, cardID) {
    let msg = {
        playerID: playerID,
        cardID: cardID
    };
    emitMsg(msg);
}
export function sendDropMsg(playerID, cardID, x, y, alt, sideUp) {
    let msg = {
        playerID: playerID,
        cardID: cardID,
        x: x,
        y: y,
        alt: alt,
        sideUp: sideUp
    };
    emitMsg(msg);
}
export function sendRemoveCardMsg(playerID, tokenID) {
    let msg = {
        playerID: playerID,
        tokenID: tokenID
    };
    emitMsg(msg);
}
export function sendRequestTakeCardMsg(playerID, cardRequester, cardNum) {
    let msg = {
        playerID: playerID,
        cardRequester: cardRequester,
        cardNum: cardNum
    };
    emitMsg(msg);
}
export function sendDrawCardsMsg(playerID, receiverID, deckID, numCards, replacement) {
    let msg = {
        playerID: playerID,
        receiverID: receiverID,
        deckID: deckID,
        numCards: numCards,
        replacement: replacement
    };
    emitMsg(msg);
}
export function sendRequestViewCardsMsg(playerID, requesterID, deckID, viewNum) {
    let msg = {
        playerID: playerID,
        requesterID: requesterID,
        deckID: deckID,
        viewNum: viewNum
    };
    emitMsg(msg);
}
export function sendViewCardsMsg(playerID, deckID, cards) {
    let msg = {
        playerID: playerID,
        deckID: deckID,
        cards: cards
    };
    emitMsg(msg);
}
export function sendRemoveCardFromStateMsg(playerID, deckID, cardID) {
    let msg = {
        playerID: playerID,
        deckID: deckID,
        cardID: cardID
    };
    emitMsg(msg);
}
export function sendRemoveCardFromDiscardMsg(playerID, deckID, cardID) {
    let msg = {
        playerID: playerID,
        deckID: deckID,
        cardID: cardID
    };
    emitMsg(msg);
}
export function sendRequestDiscardMsg(playerID, requesterID, deckID) {
    let msg = {
        playerID: playerID,
        requesterID: requesterID,
        deckID: deckID
    };
    emitMsg(msg);
}
export function sendViewDiscardMsg(playerID, deckID, cards) {
    let msg = {
        playerID: playerID,
        deckID: deckID,
        cards: cards
    };
    emitMsg(msg);
}
export function sendCardTopDeckMsg(playerID, deckID, cardID) {
    let msg = {
        playerID: playerID,
        deckID: deckID,
        cardID: cardID
    };
    emitMsg(msg);
}
export function sendShuffleBackDiscardMsg(playerID, deckID) {
    let msg = {
        playerID: playerID,
        deckID: deckID
    };
    emitMsg(msg);
}
export function sendGetAllCardsByDeckMsg(playerID, to, deckID) {
    let msg = {
        playerID: playerID,
        to: to,
        deckID: deckID
    };
    emitMsg(msg);
}
/*export interface MSG_REMOVEFROMDISCARD {
  type?: "REMOVEFROMDISCARD",
  playerID: string,
  deckID: string,
  cardID: string
}

export interface MSG_RECEIVECARDSBYDECK {
  type?: "RECEIVECARDSBYDECK",
  playerID: string,
  cards: JournalEntry[],
  deckID: string
}*/ 
