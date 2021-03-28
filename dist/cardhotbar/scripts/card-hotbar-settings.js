import { cardHotbarSettingsForm } from './card-hotbar-settings-form.js';
import { cardHotbarFlagsForm } from './card-hotbar-flags-form.js';

export class cardHotbarSettings {
    /**
     * Provides functionality for interaction with module settings and Flags
     */

    static register(){
    //Global, GM-only settings menus
        game.settings.registerMenu("cardsupport", 'chbSettingsMenu', {
            name: '(𝗚𝗠 𝗢𝗻𝗹𝘆) Default Player Hand Settings for All Users',
            label: 'Global Player Hand',
            icon: 'icon-pokerhand fa-2x',
            type: cardHotbarSettingsForm,
            restricted: true
        });

        //User-only "settings" menu that uses flags instead
        game.settings.registerMenu("cardsupport", 'chbFlagsMenu', {
            name: 'Your Hand of Cards Settings',
            label: 'Your Hand of Cards',
            icon: 'icon-pokerhand fa-2x',
            type: cardHotbarFlagsForm,
            restricted: false
        });

        //TO DO: add hotbarPageKeyEnabled and chbKeyEnabled
    
    //CARD HOTBAR SETTINGS    

        game.settings.register("cardsupport", "chbDrawFaceUpHand", {
            name: "cardHotbar.settings.chbDrawFaceUpHand.name",
            hint: "cardHotbar.settings.chbDrawFaceUpHand.nameHint",
            scope: "world",
            config: false,
            default: true,
            type: Boolean,
            onChange: (value) => {ui.cardHotbar.render();}        // A callback function which triggers when the setting is changed
        }); 

        game.settings.register("cardsupport", "chbDrawFaceUpTable", {
            name: "cardHotbar.settings.chbDrawFaceUpTable.name",
            hint: "cardHotbar.settings.chbDrawFaceUpTable.nameHint",
            scope: "world",
            config: false,
            default: true,
            type: Boolean,
            onChange: (value) => {ui.cardHotbar.render();}        // A callback function which triggers when the setting is changed
        }); 

        game.settings.register("cardsupport", "chbCardScaleX", {
            name: "cardHotbar.settings.chbCardScaleX.name",
            hint: "cardHotbar.settings.chbCardScaleX.nameHint",
            scope: "world",
            config: false,
            default: "0.5",
            type: Number,
            onChange: value => {
                ui.cardHotbar.render();
            }
        }); 

        game.settings.register("cardsupport", "chbCardScaleY", {
            name: "cardHotbar.settings.chbCardScaleY.name",
            hint: "cardHotbar.settings.chbCardScaleY.nameHint",
            scope: "world",
            config: false,
            default: "0.5",
            type: Number,
            onChange: value => {
                ui.cardHotbar.render();
            }
        }); 

        //                                     module        key             options
        game.settings.register("cardsupport", "chbPrimaryColor", {
            name: "cardHotbar.settings.chbPrimaryColor.name",      // The name of the setting in the settings menu
            hint: "cardHotbar.settings.chbPrimaryColor.nameHint",   // A description of the registered setting and its behavior
            label: "Color Picker",         // The text label used in the button
            restricted: false,             // Restrict this setting to gamemaster only?
            config: false,                 // Disable display on theta standard Foundry settings menu
            default: "#99999980",     // The default color of the setting
            type: String,
            scope: "world",               // The scope of the setting
            config: false,                 // Disable display on the standard Foundry settings menu
            onChange: (value) => {ui.cardHotbar.render();}        // A callback function which triggers when the setting is changed
        })
     
        //                                     module        key             options
        game.settings.register("cardsupport", "chbBorderColor", {
            name: "cardHotbar.settings.chbBorderColor.name",      // The name of the setting in the settings menu
            hint: "cardHotbar.settings.chbBorderColor.nameHint",   // A description of the registered setting and its behavior
            label: "Color Picker",         // The text label used in the button
            restricted: false,             // Restrict this setting to gamemaster only?
            default: "#999999ff",     // The default color of the setting
            type: String,
            scope: "world",               // The scope of the setting
            config: false,                 // Disable display on the standard Foundry settings menu
            onChange: (value) => {ui.cardHotbar.render();}        // A callback function which triggers when the setting is changed
        })

        //                                     module        key             options
        game.settings.register("cardsupport", "chbMarkedColor", {
            name: "cardHotbar.settings.chbMarkedColor.name",      // The name of the setting in the settings menu
            hint: "cardHotbar.settings.chbMarkedColor.nameHint",   // A description of the registered setting and its behavior
            label: "Color Picker",         // The text label used in the button
            restricted: false,             // Restrict this setting to gamemaster only?
            default: "#ff000080",     // The default color of the setting
            type: String,
            scope: "world",               // The scope of the setting
            config: false,                 // Disable display on the standard Foundry settings menu
            onChange: (value) => {ui.cardHotbar.render();}        // A callback function which triggers when the setting is changed
        })    

        game.settings.register("cardsupport", "chbXPos", {
            name: "cardHotbar.settings.chbXPos.name",
            hint: "cardHotbar.settings.chbXPos.nameHint",
            scope: "world",
            config: false,
            default: "220",
            type: Number,
            onChange: value => {
                ui.cardHotbar.render();
            }
        }); 

        game.settings.register("cardsupport", "chbYPos", {
            name: "cardHotbar.settings.chbYPos.name",
            hint: "cardHotbar.settings.chbYPos.nameHint",
            scope: "world",
            config: false,
            //The default YPos for custom hotbar and card support are the same. If default custom hotbar YPos is present, gracefully move above it by default.
            default:    game.modules.get("custom-hotbar")  
                            ?   ( 
                                ( game.modules.get("custom-hotbar").active ) 
                                &&  ( game.user.getFlag("custom-hotbar","chbYPos")=="63" ) || ( !game.user.getFlag("custom-hotbar","chbYPos") ) ? "116" : "63" 
                                ) 
                            : "63",
            type: Number,
            onChange: value => {
                ui.cardHotbar.render();
            }
        }); 
    }
        //Add ZPos set to uneditable?

    //getters that determine whether to grab the user flag or the setting
    //Card Hotbar getters
    //refactor into one function with variable for what you are getting when get chance?
    static getCHBDrawFaceUpHand(){
        var flag = game.user.getFlag("cardsupport", "chbDrawFaceUpHand");
        var sett = game.settings.get("cardsupport","chbDrawFaceUpHand");
        return (flag != undefined ? flag : sett );
    }

    static getCHBDrawFaceUpTable(){
        var flag = game.user.getFlag("cardsupport", "chbDrawFaceUpTable");
        var sett = game.settings.get("cardsupport","chbDrawFaceUpHand");
        return (flag != undefined ? flag : sett );
    }

    static getCHBCardScaleX(){
        var flag = game.user.getFlag("cardsupport", "chbCardScaleX");
        var sett = game.settings.get("cardsupport","chbCardScaleX");
        return (flag != undefined ? flag : sett );
    }

    static getCHBCardScaleY(){
        var flag = game.user.getFlag("cardsupport", "chbCardScaleY");
        var sett = game.settings.get("cardsupport","chbCardScaleY");
        return (flag != undefined ? flag : sett );
    }

    static getCHBPrimaryColor(){
        var flag = game.user.getFlag("cardsupport", "chbPrimaryColor");
        var sett = game.settings.get("cardsupport","chbPrimaryColor");
        return (flag != undefined ? flag : sett );
    }

    static getCHBBorderColor(){
        var flag = game.user.getFlag("cardsupport", "chbBorderColor");
        var sett = game.settings.get("cardsupport","chbBorderColor");
        return (flag != undefined ? flag : sett );
    }

    static getCHBMarkedColor(){
        var flag = game.user.getFlag("cardsupport", "chbMarkedColor");
        var sett = game.settings.get("cardsupport","chbMarkedColor");
        return (flag != undefined ? flag : sett );
    }

    static getCHBXPos(){
        var flag = game.user.getFlag("cardsupport", "chbXPos");
        var sett = game.settings.get("cardsupport","chbXPos");
        return (flag != undefined ? flag : sett );
    }

    static getCHBYPos(){
        var flag = game.user.getFlag("cardsupport", "chbYPos");
        var sett = game.settings.get("cardsupport","chbYPos");
        return (flag != undefined ? flag : sett );
    }

}