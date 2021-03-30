import { getGmId } from './socketListener.js';

function emitMsg(msg) {
    //@ts-ignore
    game.socket.emit('module.cardsupport', msg)
}

export function sendDealMsg(playerID: string, cards: JournalEntry[]) {
    let msg:MSG_DEAL = {
      playerID: playerID,
      cards: cards
    }
    emitMsg(msg);
}

export function sendUpdateStateMsg(playerID: string, deckID: string) {
    let msg:MSG_UPDATESTATE = {
      playerID: playerID,
      deckID: deckID
    }
    emitMsg(msg);
}

export function sendSetDecksMsg(playerID: string) {
    let msg:MSG_SETDECKS = {
      playerID: playerID
    }
    emitMsg(msg);
}

export function sendDiscardMsg(playerID: string, cardID: string) {
    let msg:MSG_DISCARD = {
      playerID: playerID,
      cardID: cardID
    }
    emitMsg(msg);
}

export function sendGiveMsg(playerID: string, to: string, cardID: string) {
    let msg:MSG_GIVE = {
      playerID: playerID,
      to: to,
      cardID: cardID
    }
    emitMsg(msg);
}

export function sendResetDeckMsg(playerID: string, deckID: string) {
    let msg:MSG_RESETDECK = {
      playerID: playerID,
      deckID: deckID
    }
    emitMsg(msg);
}

export function sendRevealCardMsg(playerID: string, cardID: string) {
    let msg:MSG_REVEALCARD = {
      playerID: playerID,
      cardID: cardID
    }
    emitMsg(msg);
}

export function sendDropMsg(playerID: string, cardID: string, x: number, y: number, alt: boolean, sideUp: string) {
    let msg:MSG_DROP = {
      playerID: playerID,
      cardID: cardID,
      x: x, 
      y: y,
      alt: alt,
      sideUp: sideUp
    }
    emitMsg(msg);
}

export function sendRemoveCardMsg(playerID: string, tokenID: string) {
    let msg:MSG_REMOVECARD = {
      playerID: playerID,
      tokenID: tokenID
    }
    emitMsg(msg);
}

export function sendRequestTakeCardMsg(playerID: string, cardRequester: string, cardNum: number) {
    let msg:MSG_REQUESTTAKECARD = {
      playerID: playerID,
      cardRequester: cardRequester,
      cardNum: cardNum
    }
    emitMsg(msg);
}

export function sendDrawCardsMsg(playerID: string, receiverID: string, deckID: string, numCards: number, replacement: boolean) {
    let msg:MSG_DRAWCARDS = {
      playerID: playerID,
      receiverID: receiverID,
      deckID: deckID,
      numCards: numCards,
      replacement: replacement
    }
    emitMsg(msg);
}

export function sendRequestViewCardsMsg(playerID: string, requesterID: string, deckID: string, viewNum: string) {
    let msg:MSG_REQUESTVIEWCARDS = {
      playerID: playerID,
      requesterID: requesterID,
      deckID: deckID,
      viewNum: viewNum
    }
    emitMsg(msg);
}

export function sendViewCardsMsg(playerID: string, deckID: string, cards: JournalEntry[]) {
    let msg:MSG_VIEWCARDS = {
      playerID: playerID,
      deckID: deckID,
      cards: cards
    }
    emitMsg(msg);
}

export function sendRemoveCardFromStateMsg(playerID: string, deckID: string, cardID: string) {
    let msg:MSG_REMOVECARDFROMSTATE = {
      playerID: playerID,
      deckID: deckID,
      cardID: cardID
    }
    emitMsg(msg);
}

export function sendRemoveCardFromDiscardMsg(playerID: string, deckID: string, cardID: string) {
    let msg:MSG_REMOVECARDFROMDISCARD = {
      playerID: playerID,
      deckID: deckID,
      cardID: cardID
    }
    emitMsg(msg);
}

export function sendRequestDiscardMsg(playerID: string, requesterID: string, deckID: string) {
    let msg:MSG_REQUESTDISCARD = {
      playerID: playerID,
      requesterID: requesterID,
      deckID: deckID
    }
    emitMsg(msg);
}

export function sendViewDiscardMsg(playerID: string, deckID: string, cards: JournalEntry[]) {
    let msg:MSG_VIEWDISCARD = {
      playerID: playerID,
      deckID: deckID,
      cards: cards
    }
    emitMsg(msg);
}

export function sendCardTopDeckMsg(playerID: string, deckID: string, cardID: string) {
    let msg:MSG_CARDTOPDECK = {
      playerID: playerID,
      deckID: deckID,
      cardID: cardID
    }
    emitMsg(msg);
}

export function sendShuffleBackDiscardMsg(playerID: string, deckID: string) {
    let msg:MSG_SHUFFLEBACKDISCARD = {
      playerID: playerID,
      deckID: deckID
    }
    emitMsg(msg);
}

export function sendGetAllCardsByDeckMsg(playerID: string, to: string, deckID: string) {
    let msg:MSG_GETALLCARDSBYDECK = {
      playerID: playerID,
      to: to,
      deckID: deckID
    }
    emitMsg(msg);
}

//////////////////////////////////////////////////////////////

export interface MSG_DEAL {
  type?: "DEAL", 
  playerID: string
  cards: JournalEntry[],
}

export interface MSG_UPDATESTATE {
  type?: "UPDATESTATE",
  playerID: string,
  deckID: string
}

export interface MSG_SETDECKS {
  type?: "SETDECKS",
  playerID: string,
}

export interface MSG_DISCARD {
  type?: "DISCARD", 
  playerID: string,
  cardID: string
}

export interface MSG_GIVE {
  type?: "GIVE",
  playerID: string,
  to:string, 
  cardID: string
}

export interface MSG_RESETDECK {
  type?: "RESETDECK",
  playerID: string,
  deckID: string
}

export interface MSG_REVEALCARD {
  type?: "REVEALCARD",
  playerID:string,
  cardID: string
}

export interface MSG_DROP {
  type?: "DROP",
  playerID: string,
  cardID: string,
  x: number, 
  y: number,
  alt: boolean,
  sideUp: string
}

export interface MSG_REMOVECARD {
  type?: "REMOVECARD",
  playerID:string,
  tokenID: string
}

export interface MSG_REQUESTTAKECARD {
  type?: "REQUESTTAKECARD",
  playerID: string,
  cardRequester: string,
  cardNum: number
}

export interface MSG_DRAWCARDS {
  type?: "DRAWCARDS",
  playerID: string,
  receiverID: string,
  deckID: string,
  numCards: number,
  replacement: boolean
}

export interface MSG_REQUESTVIEWCARDS {
  type?: "REQUESTVIEWCARDS",
  playerID: string,
  requesterID: string,
  deckID: string,
  viewNum: string
}

export interface MSG_VIEWCARDS {
  type?: "VIEWCARDS",
  playerID: string,
  deckID: string
  cards: JournalEntry[],
}

export interface MSG_REMOVECARDFROMSTATE {
  type?: "REMOVECARDFROMSTATE"
  playerID: string,
  deckID: string,
  cardID: string
}

export interface MSG_REMOVECARDFROMDISCARD {
  type?: "REMOVECARDFROMDISCARD",
  playerID: string,
  deckID: string,
  cardID: string
}

export interface MSG_REQUESTDISCARD {
  type?: "REQUESTDISCARD",
  playerID: string,
  requesterID: string,
  deckID: string
}

export interface MSG_VIEWDISCARD {
  type?: "VIEWDISCARD", 
  playerID:string, 
  deckID: string,
  cards: JournalEntry[]
}

export interface MSG_CARDTOPDECK {
  type?: "CARDTOPDECK",
  playerID: string,
  deckID: string,
  cardID: string
}

export interface MSG_SHUFFLEBACKDISCARD {
  type?: "SHUFFLEBACKDISCARD",
  playerID: string,
  deckID: string
}

export interface MSG_GETALLCARDSBYDECK {
  type?: "GETALLCARDSBYDECK",
  playerID: string,
  to: string,
  deckID: string
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