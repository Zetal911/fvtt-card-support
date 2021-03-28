var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { handleDroppedCard } from './drop.js';
import { ViewJournalPile, DiscardJournalPile } from './DeckForm.js';
export function getGmId() {
    var gmPlayer = game.users.find(el => el.isGM && el.active);
    if (!gmPlayer) {
        throw new Error("A GM must be present for this action.");
    }
    return gmPlayer.id;
}
Hooks.on("ready", () => {
    //@ts-ignore
    game.socket.on('module.cardsupport', (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Socket Recieved: ", data);
        if (data.playerID != game.user.id) {
            return;
        }
        if ((data === null || data === void 0 ? void 0 : data.type) == "DEAL") {
            yield ui['cardHotbar'].populator.addToPlayerHand(data.cards);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "UPDATESTATE") {
            game.decks.get(data.deckID);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "SETDECKS") {
            game.decks.decks = JSON.parse(game.settings.get("cardsupport", "decks"));
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "DISCARD") {
            game.decks.getByCard(data.cardID).discardCard(data.cardID);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "GIVE") {
            if (data.to != game.user.id) {
                game.decks.giveToPlayer(data.to, data.cardID);
            }
            else {
                yield ui['cardHotbar'].populator.addToHand([data.cardID]);
            }
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "RESETDECK") {
            ui['cardHotbar'].populator.resetDeck(data.deckID);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "REVEALCARD") {
            game.journal.get(data.cardID).show("image", true);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "DROP") {
            handleDroppedCard(data.cardID, data.x, data.y, data.alt, data.sideUp);
            //handleTokenCard(data.cardID, data.x, data.y, data.alt, data.sideUp)
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "TAKECARD") {
            let img = ui['cardHotbar'].macros[data.cardNum - 1].icon;
            let macro = ui['cardHotbar'].macros[data.cardNum - 1].macro;
            let tex = yield loadTexture(img);
            new Dialog({
                title: `${game.users.get(data.playerID).data.name} is requesting a card`,
                content: `
          <img src="${img}"></img>        
        `,
                buttons: {
                    accept: {
                        label: "Accept",
                        callback: () => __awaiter(void 0, void 0, void 0, function* () {
                            if (game.user.isGM) {
                                game.decks.giveToPlayer(data.cardRequester, macro.getFlag("world", "cardID"));
                            }
                            else {
                                let msg = {
                                    type: "GIVE",
                                    playerID: getGmId(),
                                    to: data.cardRequester,
                                    cardID: macro.getFlag("world", "cardID")
                                };
                                //@ts-ignore
                                game.socket.emit('module.cardsupport', msg);
                            }
                            //delete the macro in hand
                            yield ui['cardHotbar'].populator.chbUnsetMacro(data.cardNum);
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
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "DRAWCARDS") {
            game.decks.get(data.deckID).dealToPlayer(data.receiverID, data.numCards, data.replacement);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "REQUESTVIEWCARDS") {
            let cards = [];
            let deck = game.decks.get(data.deckID);
            let cardIDs = deck._state.slice(deck._state.length - data.viewNum);
            cards = cardIDs.map(el => {
                return game.journal.get(el);
            }).reverse();
            let reply = {
                type: "VIEWCARDS",
                playerID: data.requesterID,
                deckID: data.deckID,
                cards: cards
            };
            //@ts-ignore
            game.socket.emit('module.cardsupport', reply);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "VIEWCARDS") {
            new ViewJournalPile({
                deckID: data.deckID,
                cards: data.cards
            }).render(true);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "REMOVECARDFROMSTATE") {
            game.decks.get(data.deckID).removeFromState([data.cardID]);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "REMOVECARDFROMDISCARD") {
            game.decks.get(data.deckID).removeFromDiscard([data.cardID]);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "REQUESTDISCARD") {
            let cards = [];
            cards = game.decks.get(data.deckID)._discard.map(el => {
                return game.journal.get(el);
            });
            let reply = {
                type: "VIEWDISCARD",
                playerID: data.requesterID,
                deckID: data.deckID,
                cards: cards
            };
            //@ts-ignore
            game.socket.emit('module.cardsupport', reply);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "VIEWDISCARD") {
            new DiscardJournalPile({
                deckID: data.deckID,
                cards: data.cards
            }).render(true);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "CARDTOPDECK") {
            game.decks.get(data.deckID).addToDeckState([data.cardID]);
            game.decks.get(data.deckID).removeFromDiscard([data.cardID]);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "SHUFFLEBACKDISCARD") {
            game.decks.get(data.deckID).addToDeckState(game.decks.get(data.deckID)._discard);
            game.decks.get(data.deckID).removeFromDiscard(game.decks.get(data.deckID)._discard);
            game.decks.get(data.deckID).shuffle();
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "GETALLCARDSBYDECK") {
            let cards = [];
            let deck = game.decks.get(data.deckID);
            let cardIDs = deck._state.slice(deck._state.length - data.viewNum);
            cards = cardIDs.map(el => {
                return game.journal.get(el);
            }).reverse();
            let msg = {
                type: "RECEIVECARDSBYDECK",
                playerID: data.to,
                cards: cards,
                deckID: data.deckID
            };
            game.socket.emit('module.cardsupport', msg);
        }
    }));
});
