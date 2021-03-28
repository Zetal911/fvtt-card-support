import { mod_scope } from "./constants.js";
import {cardHotbarSettings} from '../cardhotbar/scripts/card-hotbar-settings.js'
import * as MSGTYPES from './socketListener.js';
import { getGmId } from './socketListener.js';

// Add the listener to the board html element
Hooks.once("canvasReady", () => {
  document.getElementById("board").addEventListener("drop", async (event) => {
    // Try to extract the data (type + src)
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      console.log(data);
      if(data.type == "Folder" && game.decks.get(data.id) != undefined && game.user.isGM){
        handleDroppedFolder(data.id, event.x, event.y);
      } else if (data.type == "JournalEntry" && game.decks.getByCard(data.id) != undefined){
        if(game.user.isGM){
          handleDroppedCard(data.id, event.clientX, event.clientY, event.altKey)
        } else {
          let msg: MSGTYPES.MSG_DROPTILE = {
            type: "DROP",
            playerID: getGmId(), 
            cardID: data.id,
            x: event.clientX, 
            y: event.clientY, 
            alt: event.altKey,
            sideUp: ""
          }
          //@ts-ignore
          game.socket.emit('module.cardsupport', msg)
        }
      } else if (data.type == "Macro" &&  game.decks.getByCard(game.macros.get(data.id).getFlag(mod_scope, "cardID")) != undefined){
        if(game.user.isGM){
          handleDroppedCard(
            game.macros.get(data.id).getFlag(mod_scope, "cardID"),
            event.clientX, 
            event.clientY,
            event.altKey,
            game.macros.get(data.id).getFlag(mod_scope, "sideUp")
          )
          await ui['cardHotbar'].populator.chbUnsetMacro(data.cardSlot);
          game.macros.get(data.id).delete()  
        } else {
          let msg: MSGTYPES.MSG_DROPTILE = {
            type: "DROP",
            playerID: getGmId(), 
            cardID: game.macros.get(data.id).getFlag(mod_scope, "cardID"),
            x: event.clientX, 
            y: event.clientY, 
            alt: event.altKey,
            sideUp: game.macros.get(data.id).getFlag(mod_scope, "sideUp")
          }
          //@ts-ignore
          game.socket.emit('module.cardsupport', msg)
          await ui['cardHotbar'].populator.chbUnsetMacro(data.cardSlot);
          game.macros.get(data.id).delete()  
        }
      }
    } catch (err) {
      console.error(err)
      return;
    }
  });
});

async function handleDroppedFolder(folderId, x, y){
  return new Promise(async (resolve, reject) => {
    let t = canvas.tiles.worldTransform;
    const _x = (x - t.tx) / canvas.stage.scale.x
    const _y = (y - t.ty) / canvas.stage.scale.y

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

// for Journal cards
/*export async function handleDroppedCard(cardID:string, x:number, y:number, alt:boolean, sideUp="front"){
  let imgPath = "";
  if(alt || sideUp == "back"){
    imgPath = game.journal.get(cardID).getFlag(mod_scope, "cardBack")
  } else {
    imgPath = game.journal.get(cardID).data['img']
  }

  // Determine the Tile Size:
  const tex = await loadTexture(imgPath);
  const _width = tex.width;
  const _height = tex.height;

  // Project the tile Position
  let t = canvas.tiles.worldTransform;
  const _x = (x - t.tx) / canvas.stage.scale.x
  const _y = (y - t.ty) / canvas.stage.scale.y

  const cardScaleX = cardHotbarSettings.getCHBCardScaleX();
  const cardScaleY = cardHotbarSettings.getCHBCardScaleY();
  console.debug(cardScaleX + " " + cardScaleY);
  await Tile.create({
    img: imgPath,
    x: _x,
    y: _y,
    width: _width * cardScaleX,
    height: _height * cardScaleY,
    flags: {
      [mod_scope]: {
        "cardID": `${cardID}`,
      }
    }
  })
}*/

// for Token cards
export async function handleDroppedCard(cardID:string, x:number, y:number, alt:boolean, sideUp="front"){
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

  // Project the tile Position
  let t = canvas.tiles.worldTransform;
  const _x = (x - t.tx) / canvas.stage.scale.x
  const _y = (y - t.ty) / canvas.stage.scale.y

  const cardScaleX = cardHotbarSettings.getCHBCardScaleX();
  const cardScaleY = cardHotbarSettings.getCHBCardScaleY();
  console.debug(cardScaleX + " " + cardScaleY);
  await Token.create({
    name: "Card",
    img: imgPath,
    x: _x,
    y: _y,
    width: _width * cardScaleX,
    height: _height * cardScaleY,
    permissions: 3,
    flags: {
      [mod_scope]: {
        "cardID": `${cardID}`,
      }
    }
  })
}