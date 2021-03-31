import { mod_scope } from "./constants.js";
import {cardHotbarSettings} from '../cardhotbar/scripts/card-hotbar-settings.js'
import * as EMITTER from './socketEmitter.js';
import { getGmId } from './socketListener.js';

// Add the listener to the board html element
Hooks.once("canvasReady", () => {
  document.getElementById("board").addEventListener("drop", async (event) => {
    // Try to extract the data (type + src)
    try {
      let data = JSON.parse(event.dataTransfer.getData("text/plain"));
      console.log(data);
      
      let t = canvas.tokens.worldTransform;
      const _x = (event.x - t.tx) / canvas.stage.scale.x
      const _y = (event.y - t.ty) / canvas.stage.scale.y
      if(data.type == "Folder" && game.decks.get(data.id) != undefined && game.user.isGM){
        handleDroppedFolder(data.id, _x, _y);
      } else if (data.type == "JournalEntry" && game.decks.getByCard(data.id) != undefined){
        EMITTER.sendDropMsg(getGmId(), data.id, _x, _y, event.altKey, "");
      } else if (data.type == "Macro" &&  game.decks.getByCard(game.macros.get(data.id).getFlag(mod_scope, "cardID")) != undefined){
        EMITTER.sendDropMsg(getGmId(), game.macros.get(data.id).getFlag(mod_scope, "cardID"), _x, _y, event.altKey, game.macros.get(data.id).getFlag(mod_scope, "sideUp"));
        await ui['cardHotbar'].populator.chbUnsetMacro(data.cardSlot);
        game.macros.get(data.id).delete()  
      }
    } catch (err) {
      console.error(err)
      return;
    }
  });
});

async function handleDroppedFolder(folderId, _x, _y){
  return new Promise(async (resolve, reject) => {
    if(game.settings.get('cardsupport', `${folderId}-settings`) && game.settings.get('cardsupport', `${folderId}-settings`)['deckImg'] != ""){
      let deckImgTex = await loadTexture(game.settings.get('cardsupport', `${folderId}-settings`)['deckImg'])
      Tile.create({
        name: game.folders.get(folderId).name,
        img: game.settings.get('cardsupport', `${folderId}-settings`)['deckImg'],//`modules/cardsupport/assets/${Math.floor(Math.random() * 10) + 1}.png`,
        x: _x,
        y: _y,
        width: deckImgTex.width,//350, //2, //350 for tile
        height: deckImgTex.height, //400, //400 for tile
        flags: {
          [mod_scope]: {
            'deckID': folderId
          }
        }
      })
      resolve()
    } else {
      Tile.create({
        name: game.folders.get(folderId).name,
        img: `modules/cardsupport/assets/${Math.floor(Math.random() * 10) + 1}.png`,
        x: _x,
        y: _y,
        width: 350, //2, //350 for tile
        height: 400, //400 for tile
        flags: {
          [mod_scope]: {
            'deckID': folderId
          }
        }
      })  
    }
    resolve();
  })
}

// for Token cards
export async function handleDroppedCard(cardID:string, _x:number, _y:number, alt:boolean, sideUp="front"){
  let imgPath = "";
  if(alt || sideUp == "back"){
    imgPath = game.journal.get(cardID).getFlag(mod_scope, "cardBack")
  } else {
    imgPath = game.journal.get(cardID).data['img']
  }

  // Determine the Tile Size:
  const tex = await loadTexture(imgPath);
  const _width = tex.width / canvas.dimensions.size;
  const _height = tex.height / canvas.dimensions.size;

  const cardScaleX = cardHotbarSettings.getCHBCardScaleX();
  const cardScaleY = cardHotbarSettings.getCHBCardScaleY();
  console.debug(cardScaleX + " " + cardScaleY);
  
  const cardActorName = "ReservedCardSupportCardActor";
  let cardActor = game.actors.getName(cardActorName);
  if(!cardActor) {
    let cardActorPromise = Actor.create({
        name: cardActorName,
        permission: 4,
        type: "character",
    });
    cardActor = (await cardActorPromise) as Actor;
    console.log(cardActor);
  }
  
  await Token.create({
    name: "Card",
    img: imgPath,
    x: _x,
    y: _y,
    width: _width * cardScaleX,
    height: _height * cardScaleY,
    permission: 4,
    flags: {
      [mod_scope]: {
        "cardID": `${cardID}`,
      }
    },
    actorId: cardActor.id,
    actorLink: true
  })
}