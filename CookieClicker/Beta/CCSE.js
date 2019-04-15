Game.Win('Third-party');
if(CCSE === undefined) var CCSE = {};
CCSE.name = 'CCSE';
CCSE.version = '0.18';
CCSE.GameVersion = '2.019';

CCSE.launch = function(){
	
	CCSE.init = function(){
		// Define more parts of CCSE
		CCSE.Backup = {};
		CCSE.collapseMenu = {};
	
		
		// Inject the hooks into the main game
		CCSE.ReplaceMainGame();
		
		
		// Show the version number in Stats
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(CCSE.name, CCSE.version);
		});
		
		
		// Announce completion, set the isLoaded flag, and run any functions that were waiting for this to load
		if (Game.prefs.popups) Game.Popup('CCSE loaded!');
		else Game.Notify('CCSE loaded!', '', '', 1, 1);
		CCSE.isLoaded = 1;
		if(CCSE.postLoadHooks) for(var i in CCSE.postLoadHooks) CCSE.postLoadHooks[i]();
	}
	
	
	/*=====================================================================================
	Do all replacing in one function
	Also declare hook arrays in the close vicinity of the functions they get used in
	=======================================================================================*/
	CCSE.ReplaceMainGame = function(){
		// Temporary variable for storing function strings
		// Slightly more efficient than nesting functions
		// Doubt it really matters
		var temp = '';
		var pos = 0;
		var proto;
		var obj;
		
		
		// Game.UpdateMenu
		if(!Game.customMenu) Game.customMenu = [];
		if(!Game.customOptionsMenu) Game.customOptionsMenu = [];
		if(!Game.customStatsMenu) Game.customStatsMenu = [];
		if(!Game.customInfoMenu) Game.customInfoMenu = [];
		
		temp = Game.UpdateMenu.toString();
		eval('Game.UpdateMenu = ' + temp.slice(0, -1) + `
			if(Game.onMenu == 'prefs'){
				for(var i in Game.customOptionsMenu) Game.customOptionsMenu[i]();
			}
			else if(Game.onMenu == 'stats'){
				for(var i in Game.customStatsMenu) Game.customStatsMenu[i]();
			}
			else if(Game.onMenu == 'log'){
				for(var i in Game.customInfoMenu) Game.customInfoMenu[i]();
			}
			
			// Any that don't want to fit into a label
			for(var i in Game.customMenu) Game.customMenu[i]();
		` + temp.slice(-1));
		
		
		// Game.LoadSave
		// I do a check before replacing this one. Game.customLoad is already in the game, just unused
		// Need to do a nesting replace because Game.LoadSave returns a value
		// This value is passed to the custom functions as ret
		if(!(Game.LoadSave.toString().indexOf('Game.customLoad') > 0)){
			CCSE.Backup.LoadSave = Game.LoadSave;
			Game.LoadSave = function(data){
				var ret = CCSE.Backup.LoadSave(data);
				for(var i in Game.customLoad) ret = Game.customLoad[i](ret);
				return ret;
			}
		}
		
		
		// randomFloor
		// Return ret to have no effect
		if(!Game.customRandomFloor) Game.customRandomFloor = []; 
		CCSE.Backup.randomFloor = randomFloor;
		randomFloor = function(x){
			var ret = CCSE.Backup.randomFloor(x);
			for(var i in Game.customRandomFloor) ret = Game.customRandomFloor[i](x, ret);
			return ret;
		}
		
		
		// Beautify
		// Return ret to have no effect
		if(!Game.customBeautify) Game.customBeautify = []; 
		CCSE.Backup.Beautify = Beautify;
		Beautify = function(value, floats){
			var ret = CCSE.Backup.Beautify(value, floats);
			for(var i in Game.customBeautify) ret = Game.customBeautify[i](value, floats, ret);
			return ret;
		}
		
		
		// -----     Tooltips block     ----- //
		
		// Game.tooltip.draw
		if(!Game.customTooltipDraw) Game.customTooltipDraw = [];
		temp = Game.tooltip.draw.toString();
		eval('Game.tooltip.draw = ' + temp.slice(0, -1) + 
			'\nfor(var i in Game.customTooltipDraw) Game.customTooltipDraw[i](from, text, origin);\n' 
			+ temp.slice(-1));
		
		
		// Game.tooltip.update
		if(!Game.customTooltipUpdate) Game.customTooltipUpdate = [];
		temp = Game.tooltip.update.toString();
		eval('Game.tooltip.update = ' + temp.slice(0, -1) + 
			'\nfor(var i in Game.customTooltipUpdate) Game.customTooltipUpdate[i]();\n' + 
			temp.slice(-1));
		
		
		// -----     Ascension block     ----- //
		
		// Game.GetHeavenlyMultiplier
		// Functions should return a value to multiply the heavenlyMult by
		if(!Game.customHeavenlyMultiplier) Game.customHeavenlyMultiplier = []; 
		temp = Game.GetHeavenlyMultiplier.toString();
		eval('Game.GetHeavenlyMultiplier = ' + temp.replace('return heavenlyMult;', `
			for(var i in Game.customHeavenlyMultiplier) heavenlyMult *= Game.customHeavenlyMultiplier[i]();
			return heavenlyMult;`));
		
		
		// Game.Reincarnate
		// Only runs when bypass == 1 (i.e. passed the confirmation prompt)
		if(!Game.customReincarnate) Game.customReincarnate = [];
		temp = Game.Reincarnate.toString();
		pos = temp.lastIndexOf('}', temp.length - 2)
		eval('Game.Reincarnate = ' + temp.slice(0, pos) + `
				for(var i in Game.customReincarnate) Game.customReincarnate[i]();
			` + temp.slice(pos));
		
		
		// Game.Ascend
		// Only runs when bypass == 1 (i.e. passed the confirmation prompt)
		if(!Game.customAscend) Game.customAscend = [];
		temp = Game.Ascend.toString();
		pos = temp.lastIndexOf('}', temp.length - 2)
		eval('Game.Ascend = ' + temp.slice(0, pos) + `
				for(var i in Game.customAscend) Game.customAscend[i]();
			` + temp.slice(pos));
		
		
		// Game.UpdateAscend
		// Runs every frame while on the Ascension tree
		if(!Game.customUpdateAscend) Game.customUpdateAscend = [];
		temp = Game.UpdateAscend.toString();
		eval('Game.UpdateAscend = ' + temp.slice(0, -1) + `
			for(var i in Game.customUpdateAscend) Game.customUpdateAscend[i](); 
		` + temp.slice(-1));
		
		
		// -----     Sugar Lumps block     ----- //
		
		// Game.computeLumpTimes
		if(!Game.customComputeLumpTimes) Game.customComputeLumpTimes = [];
		temp = Game.computeLumpTimes.toString();
		eval('Game.computeLumpTimes = ' + temp.slice(0, -1) + `
			for(var i in Game.customComputeLumpTimes) Game.customComputeLumpTimes[i](); 
		` + temp.slice(-1));
		
		
		// Game.gainLumps
		if(!Game.customGainLumps) Game.customGainLumps = [];
		temp = Game.gainLumps.toString();
		eval('Game.gainLumps = ' + temp.slice(0, -1) + `
			for(var i in Game.customGainLumps) Game.customGainLumps[i](total); 
		` + temp.slice(-1));
		
		
		// Game.clickLump
		if(!Game.customClickLump) Game.customClickLump = [];
		temp = Game.clickLump.toString();
		eval('Game.clickLump = ' + temp.slice(0, -1) + `
			for(var i in Game.customClickLump) Game.customClickLump[i](); 
		` + temp.slice(-1));
		
		
		// Game.harvestLumps
		// I doubt this is useful. The functions get called after the interesting stuff happens
		// TODO make a function that eases adding a lump type
		// Same for Game.computeLumpType. Pointless to make a generic hook
		if(!Game.customHarvestLumps) Game.customHarvestLumps = [];
		temp = Game.harvestLumps.toString();
		eval('Game.harvestLumps = ' + temp.slice(0, -1) + `
			for(var i in Game.customHarvestLumps) Game.customHarvestLumps[i](amount, silent); 
		` + temp.slice(-1));
		
		
		// Game.canLumps
		// Return ret to have no effect
		if(!Game.customCanLumps) Game.customCanLumps = []; 
		CCSE.Backup.canLumps = Game.canLumps;
		Game.canLumps = function(){
			var ret = CCSE.Backup.canLumps();
			for(var i in Game.customCanLumps) ret = Game.customCanLumps[i](ret);
			return ret;
		}
		
		
		// Game.getLumpRefillMax
		// Return ret to have no effect
		if(!Game.customLumpRefillMax) Game.customLumpRefillMax = []; 
		CCSE.Backup.getLumpRefillMax = Game.getLumpRefillMax;
		Game.getLumpRefillMax = function(){
			var ret = CCSE.Backup.getLumpRefillMax();
			for(var i in Game.customLumpRefillMax) ret = Game.customLumpRefillMax[i](ret);
			return ret;
		}
		
		
		// Game.doLumps
		// Runs every logic frame when lumps matter
		if(!Game.customDoLumps) Game.customDoLumps = [];
		temp = Game.doLumps.toString();
		eval('Game.doLumps = ' + temp.slice(0, -1) + `
			for(var i in Game.customDoLumps) Game.customDoLumps[i](); 
		` + temp.slice(-1));
		
		
		// -----     Economics block     ----- //
		
		// Game.CalculateGains
		// I really think this is what he meant it to be
		// The original just has Game.customCps doing the same thing as Game.customCpsMult
		//eval('Game.CalculateGains = ' + Game.CalculateGains.toString().replace(
		//	'for (var i in Game.customCps) {mult*=Game.customCps[i]();}', 
		//	'for (var i in Game.customCps) {Game.cookiesPs += Game.customCps[i]();}'));
		
		
		// Game.dropRateMult
		// Return 1 to have no effect
		if(!Game.customDropRateMult) Game.customDropRateMult = []; 
		CCSE.Backup.dropRateMult = Game.dropRateMult;
		Game.dropRateMult = function(){
			var ret = CCSE.Backup.dropRateMult();
			for(var i in Game.customDropRateMult) ret *= Game.customDropRateMult[i]();
			return ret;
		}
		
		
		// -----     Shimmers block     ----- //
		
		// Game.shimmer
		// Runs when a shimmer (Golden cookie or reindeer) gets created
		// You can push a function that pops it immediately, but it will mess up any FtHoF predictor you use
		if(!Game.customShimmer) Game.customShimmer = [];
		temp = Game.shimmer.toString();
		proto = Game.shimmer.prototype;
		eval('Game.shimmer = ' + temp.slice(0, -1) + `
			for(var i in Game.customShimmer) Game.customShimmer[i](this); 
		` + temp.slice(-1));
		Game.shimmer.prototype = proto;
		
		
		// Game.updateShimmers
		// Runs every logic frame when shimmers matter
		if(!Game.customUpdateShimmers) Game.customUpdateShimmers = [];
		temp = Game.updateShimmers.toString();
		eval('Game.updateShimmers = ' + temp.slice(0, -1) + `
			for(var i in Game.customUpdateShimmers) Game.customUpdateShimmers[i](); 
		` + temp.slice(-1));
		
		
		// Game.killShimmers
		// Runs when we want to remove all shimmers
		if(!Game.customKillShimmers) Game.customKillShimmers = [];
		temp = Game.killShimmers.toString();
		eval('Game.killShimmers = ' + temp.slice(0, -1) + `
			for(var i in Game.customKillShimmers) Game.customKillShimmers[i](); 
		` + temp.slice(-1));
		
		
		// Game.shimmerTypes
		// In these, "me" refers to the shimmer itself, and "this" to the shimmer's type object
		// I put this in a separate function to call them when a new type is defined
		if(!Game.customShimmerTypes) Game.customShimmerTypes = {};
		CCSE.Backup.customShimmerTypes = {};
		for(var key in Game.shimmerTypes){
			CCSE.ReplaceShimmerType(key);
		}
		
		
		// Game.shimmerTypes['golden'].popFunc
		// customListPush functions should push strings to list
		// customEffectDurMod functions should return a multiplier to the effect's duration
		// customMult functions should return a multiplier to the effect's magnitude (for Lucky, Chain Cookie, and Cookie Storm drops)
		if(!Game.customShimmerTypes['golden'].customListPush) Game.customShimmerTypes['golden'].customListPush = [];
		if(!Game.customShimmerTypes['golden'].customEffectDurMod) Game.customShimmerTypes['golden'].customEffectDurMod = [];
		if(!Game.customShimmerTypes['golden'].customMult) Game.customShimmerTypes['golden'].customMult = [];
		temp = Game.shimmerTypes['golden'].popFunc.toString();
		eval("Game.shimmerTypes['golden'].popFunc = " + temp.replace('var list=[];', `var list=[];
					for(var i in Game.customShimmerTypes['golden'].customListPush) Game.customShimmerTypes['golden'].customListPush[i](me, list);`
			).replace('var buff=0;', `var buff=0;
					for(var i in Game.customShimmerTypes['golden'].customEffectDurMod) effectDurMod *= Game.customShimmerTypes['golden'].customEffectDurMod[i](me);
					for(var i in Game.customShimmerTypes['golden'].customMult) mult *= Game.customShimmerTypes['golden'].customMult[i](me);`));
		
		
		// Game.shimmerTypes['reindeer'].popFunc
		// customDropRateMult should return a multiplier to the fail rate for reindeer drops
		// Game.customDropRateMult is already taken into account. This is for reindeer specific fucntions
		// Return 1 to have no effect. Return 0 for a guarantee*
		if(!Game.customShimmerTypes['reindeer'].customDropRateMult) Game.customShimmerTypes['reindeer'].customDropRateMult = [];
		temp = Game.shimmerTypes['reindeer'].popFunc.toString();
		eval("Game.shimmerTypes['reindeer'].popFunc = " + temp.replace('if (Math.random()>failRate)', 
					`for(var i in Game.customShimmerTypes['reindeer'].customDropRateMult) failRate *= Game.customShimmerTypes['reindeer'].customDropRateMult[i](me);
					if (Math.random()>failRate)`
			));
		
		
		// -----     Particles block       ----- //
		// -----     Notifications block   ----- //
		// -----     Prompts block         ----- //
		// -----     Menu block            ----- //
		// These start to get into the basic appearance of the game, and stray away from the gameplay itself
		// If someone has an idea they want to try that requires hooks into these functions, I can add them then
		
		
		// -----     Buildings block     ----- //
		if(!Game.customBuildings) Game.customBuildings = {};
		CCSE.Backup.customBuildings = {};
		for(var key in Game.Objects){
			CCSE.ReplaceBuilding(key);
		}
		
		
		// Game.DrawBuildings
		// Runs every draw frame if we're not ascending
		if(!Game.customDrawBuildings) Game.customDrawBuildings = [];
		temp = Game.DrawBuildings.toString();
		eval('Game.DrawBuildings = ' + temp.slice(0, -1) + `
			for(var i in Game.customDrawBuildings) Game.customDrawBuildings[i](); 
		` + temp.slice(-1));
		
		
		// Game.modifyBuildingPrice
		// Functions should return a value to multiply the price by
		// Return 1 to have no effect
		if(!Game.customModifyBuildingPrice) Game.customModifyBuildingPrice = [];
		temp = Game.modifyBuildingPrice.toString();
		eval('Game.modifyBuildingPrice = ' + temp.replace('return', `
			for(var i in Game.customModifyBuildingPrice) price *= Game.customModifyBuildingPrice[i](building, price); 
			return`));
		
		
		// Game.storeBulkButton
		if(!Game.customStoreBulkButton) Game.customStoreBulkButton = [];
		temp = Game.storeBulkButton.toString();
		eval('Game.storeBulkButton = ' + temp.slice(0, -1) + `
			for(var i in Game.customStoreBulkButton) Game.customStoreBulkButton[i](); 
		` + temp.slice(-1));
		
		
		// Game.RefreshStore
		if(!Game.customRefreshStore) Game.customRefreshStore = [];
		temp = Game.RefreshStore.toString();
		eval('Game.RefreshStore = ' + temp.slice(0, -1) + `
			for(var i in Game.customRefreshStore) Game.customRefreshStore[i](); 
		` + temp.slice(-1));
		
		
		// Game.scriptLoaded
		if(!Game.customScriptLoaded) Game.customScriptLoaded = [];
		if(!Game.customMinigameOnLoad) Game.customMinigameOnLoad = {};
		for(key in Game.Objects) if(!Game.customMinigameOnLoad[key]) Game.customMinigameOnLoad[key] = [];
		
		temp = Game.scriptLoaded.toString();
		eval('Game.scriptLoaded = ' + temp.slice(0, -1) + `
			for(var i in Game.customScriptLoaded) Game.customScriptLoaded[i](who, script); // Who knows, maybe those arguments might be needed
			for(var i in Game.customMinigameOnLoad[who.name]) Game.customMinigameOnLoad[who.name][i](who, script);
		` + temp.slice(-1));
		
		
		// -----     Individual Buildings block     ----- //
		
		obj = Game.Objects['Cursor'];
		// Cursor.cps
		// cpsAdd Functions should return a value to add per non cursor building (Return 0 to have no effect)
		if(!Game.customBuildings[obj.name].cpsAdd) Game.customBuildings[obj.name].cpsAdd = [];
		if(!Game.customBuildings[obj.name].cpsMult) Game.customBuildings[obj.name].cpsMult = [];
		temp = obj.cps.toString();
		eval('obj.cps = ' + temp.replace('var mult=1;', `
			for(var i in Game.customBuildings['` + obj.name + `'].cpsAdd) add += Game.customBuildings['` + obj.name + `'].cpsAdd[i](me);
			var mult=1;`
		));
		
		
		obj = Game.Objects['Grandma'];
		// Grandma.art.pic
		// Functions should push an image name (sans the .png part) into list
		if(!Game.customGrandmaPicture) Game.customGrandmaPicture = [];
		temp = obj.art.pic.toString();
		eval('obj.art.pic = ' + temp.replace('return', `
			for(var j in Game.customGrandmaPicture) Game.customGrandmaPicture[j](i, list);
			return`));
		
		
		// Grandma.cps
		// cpsAdd Functions should return a value to add before multiplying (Return 0 to have no effect)
		if(!Game.customBuildings[obj.name].cpsAdd) Game.customBuildings[obj.name].cpsAdd = [];
		if(!Game.customBuildings[obj.name].cpsMult) Game.customBuildings[obj.name].cpsMult = [];
		temp = obj.cps.toString();
		eval('obj.cps = ' + temp.replace('return', `
			for(var i in Game.customBuildings['` + obj.name + `'].cpsAdd) add += Game.customBuildings['` + obj.name + `'].cpsAdd[i](me);
			return`));
		
		
		// -----     Upgrades block     ----- //
		if(!Game.customUpgradesAll) 			Game.customUpgradesAll = {};
		if(!Game.customUpgradesAll.getPrice) 	Game.customUpgradesAll.getPrice = []; 
		if(!Game.customUpgradesAll.click) 		Game.customUpgradesAll.click = [];
		if(!Game.customUpgradesAll.buy) 		Game.customUpgradesAll.buy = []; 
		if(!Game.customUpgradesAll.earn) 		Game.customUpgradesAll.earn = [];
		if(!Game.customUpgradesAll.unearn) 		Game.customUpgradesAll.unearn = [];
		if(!Game.customUpgradesAll.unlock) 		Game.customUpgradesAll.unlock = [];
		if(!Game.customUpgradesAll.lose) 		Game.customUpgradesAll.lose = [];
		if(!Game.customUpgradesAll.toggle) 		Game.customUpgradesAll.toggle = [];
		if(!Game.customUpgradesAll.buyFunction)	Game.customUpgradesAll.buyFunction = [];
		if(!Game.customUpgradesAll.descFunc)	Game.customUpgradesAll.descFunc = [];
		
		if(!Game.customUpgrades) Game.customUpgrades = {};
		CCSE.Backup.customUpgrades = {};
		for(var key in Game.Upgrades){
			CCSE.ReplaceUpgrade(key);
		}
		
		
		// Correct these descFuncs
		var slots=['Permanent upgrade slot I','Permanent upgrade slot II','Permanent upgrade slot III','Permanent upgrade slot IV','Permanent upgrade slot V'];
		for (var i=0;i<slots.length;i++)
		{
			CCSE.Backup.customUpgrades[slots[i]].descFunc=function(i){return function(){
				if (Game.permanentUpgrades[i]==-1) return Game.Upgrades[slots[i]].desc;
				var upgrade=Game.UpgradesById[Game.permanentUpgrades[i]];
				return '<div style="text-align:center;">'+'Current : <div class="icon" style="vertical-align:middle;display:inline-block;'+(upgrade.icon[2]?'background-image:url('+upgrade.icon[2]+');':'')+'background-position:'+(-upgrade.icon[0]*48)+'px '+(-upgrade.icon[1]*48)+'px;transform:scale(0.5);margin:-16px;"></div> <b>'+upgrade.name+'</b><div class="line"></div></div>'+Game.Upgrades[slots[i]].desc;
			};}(i);
		}
		
		
		// Game.storeBuyAll
		if(!Game.customStoreBuyAll) Game.customStoreBuyAll = [];
		temp = Game.storeBuyAll.toString();
		eval('Game.storeBuyAll = ' + temp.slice(0, -1) + `
			for(var i in Game.customStoreBuyAll) Game.customStoreBuyAll[i](); 
		` + temp.slice(-1));
		
		
		// Game.CountsAsUpgradeOwned
		// Return ret to have no effect
		if(!Game.customCountsAsUpgradeOwned) Game.customCountsAsUpgradeOwned = []; 
		CCSE.Backup.CountsAsUpgradeOwned =  Game.CountsAsUpgradeOwned;
		Game.CountsAsUpgradeOwned = function(pool){
			var ret = CCSE.Backup.CountsAsUpgradeOwned(pool);
			for(var i in Game.customCountsAsUpgradeOwned) ret = Game.customCountsAsUpgradeOwned[i](pool, ret);
			return ret;
		}
		
		
		// Game.Unlock
		if(!Game.customUnlock) Game.customUnlock = [];
		temp = Game.Unlock.toString();
		eval('Game.Unlock = ' + temp.slice(0, -1) + `
			for(var i in Game.customUnlock) Game.customUnlock[i](what); 
		` + temp.slice(-1));
		
		
		// Game.Lock
		if(!Game.customLock) Game.customLock = [];
		temp = Game.Lock.toString();
		eval('Game.Lock = ' + temp.slice(0, -1) + `
			for(var i in Game.customLock) Game.customLock[i](what); 
		` + temp.slice(-1));
		
		
		// Game.RebuildUpgrades
		if(!Game.customRebuildUpgrades) Game.customRebuildUpgrades = [];
		temp = Game.RebuildUpgrades.toString();
		eval('Game.RebuildUpgrades = ' + temp.slice(0, -1) + `
			for(var i in Game.customRebuildUpgrades) Game.customRebuildUpgrades[i](); 
		` + temp.slice(-1));
		
		
		// Game.GetTieredCpsMult
		// Functions should return a value to multiply mult by (Return 1 to have no effect)
		if(!Game.customGetTieredCpsMult) Game.customGetTieredCpsMult = [];
		temp = Game.GetTieredCpsMult.toString();
		eval('Game.GetTieredCpsMult = ' + temp.replace('return', `
			for(var i in Game.customGetTieredCpsMult) mult *= Game.customGetTieredCpsMult[i](me);
			return`));
		
		
		// Game.UnlockTiered
		if(!Game.customUnlockTiered) Game.customUnlockTiered = [];
		temp = Game.UnlockTiered.toString();
		eval('Game.UnlockTiered = ' + temp.slice(0, -1) + `
			for(var i in Game.customUnlockTiered) Game.customUnlockTiered[i](me); 
		` + temp.slice(-1));
		
		
		// Game.SetResearch
		if(!Game.customSetResearch) Game.customSetResearch = [];
		temp = Game.SetResearch.toString();
		eval('Game.SetResearch = ' + temp.slice(0, -1) + `
			for(var i in Game.customSetResearch) Game.customSetResearch[i](what, time); 
		` + temp.slice(-1));
		
		
		// Game.DropEgg
		// Functions should return a value to multiply failRate by (Return 1 to have no effect)
		if(!Game.customDropEgg) Game.customDropEgg = [];
		temp = Game.DropEgg.toString();
		eval('Game.DropEgg = ' + temp.replace('{', `{
			for(var i in Game.customDropEgg) failRate *= Game.customDropEgg[i]();`));
		
		
		// Game.AssignPermanentSlot
		// Don't know where to put the hook. If you have a good idea, let me know.
		
		
		// Game.PutUpgradeInPermanentSlot
		if(!Game.customPutUpgradeInPermanentSlot) Game.customPutUpgradeInPermanentSlot = [];
		temp = Game.PutUpgradeInPermanentSlot.toString();
		eval('Game.PutUpgradeInPermanentSlot = ' + temp.slice(0, -1) + `
			for(var i in Game.customPutUpgradeInPermanentSlot) Game.customPutUpgradeInPermanentSlot[i](upgrade, slot); 
		` + temp.slice(-1));
		
		
		// Game.loseShimmeringVeil
		if(!Game.customLoseShimmeringVeil) Game.customLoseShimmeringVeil = [];
		temp = Game.loseShimmeringVeil.toString();
		eval('Game.loseShimmeringVeil = ' + temp.slice(0, -1) + `
			for(var i in Game.customLoseShimmeringVeil) Game.customLoseShimmeringVeil[i](context); 
		` + temp.slice(-1));
		
		
		// Game.listTinyOwnedUpgrades
		if(!Game.customListTinyOwnedUpgrades) Game.customListTinyOwnedUpgrades = [];
		temp = Game.listTinyOwnedUpgrades.toString();
		eval('Game.listTinyOwnedUpgrades = ' + temp.replace('return', `
			for(var i in Game.customListTinyOwnedUpgrades) str = Game.customListTinyOwnedUpgrades[i](arr, str);
			return`));
		
		
		// -----     Seasons block     ----- //
	}
	
	CCSE.ReplaceShimmerType = function(key){
		var temp = '';
		var pos = 0;
		var proto;
		var escKey = key.replace("'", "\\'");
		
		if(!Game.customShimmerTypes[key]) Game.customShimmerTypes[key] = {};
		CCSE.Backup.customShimmerTypes[key] = {};
		
		
		// Game.shimmerTypes[key].initFunc
		// durationMult functions should return a value to multiply the duration by
		if(!Game.customShimmerTypes[key].initFunc) Game.customShimmerTypes[key].initFunc = [];
		if(!Game.customShimmerTypes[key].durationMult) Game.customShimmerTypes[key].durationMult = [];
		temp = Game.shimmerTypes[key].initFunc.toString();
		eval('Game.shimmerTypes[key].initFunc = ' + temp.slice(0, -1).replace(
			'me.dur=dur;', `for(var i in Game.customShimmerTypes['` + escKey + `'].durationMult) dur *= Game.customShimmerTypes['` + escKey + `'].durationMult[i](); 
					me.dur=dur;`) + `
					for(var i in Game.customShimmerTypes['` + escKey + `'].initFunc) Game.customShimmerTypes['` + escKey + `'].initFunc[i]();
				` + temp.slice(-1));
		
		
		// Game.shimmerTypes[key].updateFunc
		if(!Game.customShimmerTypes[key].updateFunc) Game.customShimmerTypes[key].updateFunc = [];
		temp = Game.shimmerTypes[key].updateFunc.toString();
		eval('Game.shimmerTypes[key].updateFunc = ' + temp.slice(0, -1) + `
					for(var i in Game.customShimmerTypes['` + escKey + `'].updateFunc) Game.customShimmerTypes['` + escKey + `'].updateFunc[i](); 
				` + temp.slice(-1));
		
		
		// Game.shimmerTypes[key].popFunc
		if(!Game.customShimmerTypes[key].popFunc) Game.customShimmerTypes[key].popFunc = [];
		temp = Game.shimmerTypes[key].popFunc.toString();
		eval('Game.shimmerTypes[key].popFunc = ' + temp.slice(0, -1) + `
					for(var i in Game.customShimmerTypes['` + escKey + `'].popFunc) Game.customShimmerTypes['` + escKey + `'].popFunc[i](); 
				` + temp.slice(-1));
		
		
		// Game.shimmerTypes[key].spawnConditions
		// Return ret to have no effect 
		if(!Game.customShimmerTypes[key].spawnConditions) Game.customShimmerTypes[key].spawnConditions = [];
		CCSE.Backup.customShimmerTypes[key].spawnConditions = Game.shimmerTypes[key].spawnConditions;
		eval(`Game.shimmerTypes['` + escKey + `'].spawnConditions = function(){
				var ret = CCSE.Backup.customShimmerTypes['` + escKey + `'].spawnConditions();
				for(var i in Game.customShimmerTypes['` + escKey + `'].spawnConditions) ret = Game.customShimmerTypes['` + escKey + `'].spawnConditions[i](ret);
				return ret;
			}`);
		
		
		// Game.shimmerTypes[key].getTimeMod
		// Functions should return a multiplier to the shimmer's spawn time (higher takes longer to spawn)
		// Return 1 to have no effect 
		// These run at the top of the function, before the vanilla code
		if(!Game.customShimmerTypes[key].getTimeMod) Game.customShimmerTypes[key].getTimeMod = [];
		temp = Game.shimmerTypes[key].getTimeMod.toString();
		eval('Game.shimmerTypes[key].getTimeMod = ' + temp.replace('{', `{
					for(var i in Game.customShimmerTypes['` + escKey + `'].getTimeMod) m *= Game.customShimmerTypes['` + escKey + `'].getTimeMod[i](me);`));
	}
	
	CCSE.ReplaceBuilding = function(key){
		// A lot of Copy/Paste happened, hence why I did so many functions.
		// Also, I may not have fully tested each one.
		var temp = '';
		var pos = 0;
		var proto;
		var escKey = key.replace("'", "\\'");
		var obj = Game.Objects[key];
		
		if(!Game.customBuildings[key]) Game.customBuildings[key] = {};
		CCSE.Backup.customBuildings[key] = {};
		
		
		// this.switchMinigame
		if(!Game.customBuildings[key].switchMinigame) Game.customBuildings[key].switchMinigame = [];
		temp = obj.switchMinigame.toString();
		eval('obj.switchMinigame = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + escKey + `'].switchMinigame) Game.customBuildings['` + escKey + `'].switchMinigame[i](this, on); 
			` + temp.slice(-1));
		
		
		// this.getSellMultiplier
		// Return ret to have no effect
		if(!Game.customBuildings[key].getSellMultiplier) Game.customBuildings[key].getSellMultiplier = [];
		temp = obj.getSellMultiplier.toString();
		eval('obj.getSellMultiplier = ' + temp.replace('return', `
				for(var i in Game.customBuildings['` + escKey + `'].getSellMultiplier) giveBack = Game.customBuildings['` + escKey + `'].getSellMultiplier[i](this, giveBack); 
				return`));
		
		
		// this.buy
		if(!Game.customBuildings[key].buy) Game.customBuildings[key].buy = [];
		temp = obj.buy.toString();
		eval('obj.buy = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + escKey + `'].buy) Game.customBuildings['` + escKey + `'].buy[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.sell
		if(!Game.customBuildings[key].sell) Game.customBuildings[key].sell = [];
		temp = obj.sell.toString();
		eval('obj.sell = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + escKey + `'].sell) Game.customBuildings['` + escKey + `'].sell[i](this, amount, bypass); 
			` + temp.slice(-1));
		
		
		// this.sacrifice
		if(!Game.customBuildings[key].sacrifice) Game.customBuildings[key].sacrifice = [];
		temp = obj.sacrifice.toString();
		eval('obj.sacrifice = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + escKey + `'].sacrifice) Game.customBuildings['` + escKey + `'].sacrifice[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.buyFree
		if(!Game.customBuildings[key].buyFree) Game.customBuildings[key].buyFree = [];
		temp = obj.buyFree.toString();
		eval('obj.buyFree = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + escKey + `'].buyFree) Game.customBuildings['` + escKey + `'].buyFree[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.getFree
		if(!Game.customBuildings[key].getFree) Game.customBuildings[key].getFree = [];
		temp = obj.getFree.toString();
		eval('obj.getFree = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + escKey + `'].getFree) Game.customBuildings['` + escKey + `'].getFree[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.getFreeRanks
		if(!Game.customBuildings[key].getFreeRanks) Game.customBuildings[key].getFreeRanks = [];
		temp = obj.getFreeRanks.toString();
		eval('obj.getFreeRanks = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + escKey + `'].getFreeRanks) Game.customBuildings['` + escKey + `'].getFreeRanks[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.tooltip
		// Return ret to have no effect
		if(!Game.customBuildings[key].tooltip) Game.customBuildings[key].tooltip = []; 
		eval('CCSE.Backup.customBuildings[key].tooltip = ' + obj.tooltip.toString().split('this').join("Game.Objects['" + escKey + "']"));
		obj.tooltip = function(){
			var ret = CCSE.Backup.customBuildings[this.name].tooltip();
			for(var i in Game.customBuildings[this.name].tooltip) ret = Game.customBuildings[this.name].tooltip[i](this, ret);
			return ret;
		}
		
		
		// this.levelTooltip
		// Return ret to have no effect
		if(!Game.customBuildings[key].levelTooltip) Game.customBuildings[key].levelTooltip = []; 
		eval('CCSE.Backup.customBuildings[key].levelTooltip = ' + obj.levelTooltip.toString().replace('this', "Game.Objects['" + escKey + "']"));
		obj.levelTooltip = function(){
			var ret = CCSE.Backup.customBuildings[this.name].levelTooltip();
			for(var i in Game.customBuildings[this.name].levelTooltip) ret = Game.customBuildings[this.name].levelTooltip[i](this, ret);
			return ret;
		}
		
		
		// this.levelUp
		// Haha no. This is like four functions that return each other
		// I'm not dealing with it unless I have to.
		
		
		// this.refresh
		if(!Game.customBuildings[key].refresh) Game.customBuildings[key].refresh = [];
		temp = obj.refresh.toString();
		eval('obj.refresh = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + escKey + `'].refresh) Game.customBuildings['` + escKey + `'].refresh[i](this); 
			` + temp.slice(-1));
		
		
		// this.rebuild
		if(!Game.customBuildings[key].rebuild) Game.customBuildings[key].rebuild = [];
		temp = obj.rebuild.toString();
		eval('obj.rebuild = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + escKey + `'].rebuild) Game.customBuildings['` + escKey + `'].rebuild[i](this); 
			` + temp.slice(-1));
		
		
		// this.mute
		if(!Game.customBuildings[key].mute) Game.customBuildings[key].mute = [];
		temp = obj.mute.toString();
		eval('obj.mute = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + escKey + `'].mute) Game.customBuildings['` + escKey + `'].mute[i](this, val); 
			` + temp.slice(-1));
		
		
		// this.draw
		if(!Game.customBuildings[key].draw) Game.customBuildings[key].draw = [];
		temp = obj.draw.toString();
		eval('obj.draw = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + escKey + `'].draw) Game.customBuildings['` + escKey + `'].draw[i](this); 
			` + temp.slice(-1));
		
		
		// this.buyFunction
		if(!Game.customBuildings[key].buyFunction) Game.customBuildings[key].buyFunction = [];
		temp = obj.buyFunction.toString();
		eval('obj.buyFunction = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + escKey + `'].buyFunction) Game.customBuildings['` + escKey + `'].buyFunction[i](this); 
			` + temp.slice(-1));
		
		
		// this.cps
		// cpsMult Functions should return a value to multiply the price by (Return 1 to have no effect)
		if(!Game.customBuildings[obj.name].cpsMult) Game.customBuildings[obj.name].cpsMult = [];
		temp = obj.cps.toString();
		eval('obj.cps = ' + temp.replace('return', `
			for(var i in Game.customBuildings['` + escKey + `'].cpsMult) mult *= Game.customBuildings['` + escKey + `'].cpsMult[i](me);
			return`));
		
	}
	
	CCSE.ReplaceUpgrade = function(key){
		var temp = '';
		var pos = 0;
		var proto;
		var escKey = key.replace("'", "\\'");
		var upgrade = Game.Upgrades[key];
		
		if(!Game.customUpgrades[key]) Game.customUpgrades[key] = {};
		CCSE.Backup.customUpgrades[key] = {};
		
		
		// this.getPrice
		// Functions should return a value to multiply the price by (Return 1 to have no effect)
		if(!Game.customUpgrades[key].getPrice) Game.customUpgrades[key].getPrice = []; 
		Game.customUpgrades[key].getPrice.push(CCSE.customUpgradesAllgetPrice);
		temp = upgrade.getPrice.toString();
		eval('upgrade.getPrice = ' + temp.replace('return Math', `
			for(var i in Game.customUpgrades['` + escKey + `'].getPrice) price *= Game.customUpgrades['` + escKey + `'].getPrice[i](this);
			return Math`));
		
		
		// this.click
		if(!Game.customUpgrades[key].click) Game.customUpgrades[key].click = [];
		Game.customUpgrades[key].click.push(CCSE.customUpgradesAllclick);
		temp = upgrade.click.toString();
		eval('upgrade.click = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades['` + escKey + `'].click) Game.customUpgrades['` + escKey + `'].click[i](this, e); 
			` + temp.slice(-1));
		
		
		// this.buy
		if(!Game.customUpgrades[key].buy) Game.customUpgrades[key].buy = []; 
		Game.customUpgrades[key].buy.push(CCSE.customUpgradesAllbuy);
		temp = upgrade.buy.toString();
		eval('upgrade.buy = ' + temp.replace('return', `
			for(var i in Game.customUpgrades['` + escKey + `'].buy) Game.customUpgrades['` + escKey + `'].buy[i](this, bypass, success);
			return`));
		
		
		// this.earn 
		if(!Game.customUpgrades[key].earn) Game.customUpgrades[key].earn = [];
		Game.customUpgrades[key].earn.push(CCSE.customUpgradesAllearn);
		temp = upgrade.earn.toString();
		eval('upgrade.earn = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades['` + escKey + `'].earn) Game.customUpgrades['` + escKey + `'].earn[i](this); 
			` + temp.slice(-1));
		
		
		// this.unearn
		if(!Game.customUpgrades[key].unearn) Game.customUpgrades[key].unearn = [];
		Game.customUpgrades[key].unearn.push(CCSE.customUpgradesAllunearn);
		temp = upgrade.unearn.toString();
		eval('upgrade.unearn = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades['` + escKey + `'].unearn) Game.customUpgrades['` + escKey + `'].unearn[i](this); 
			` + temp.slice(-1));
		
		
		// this.unlock
		if(!Game.customUpgrades[key].unlock) Game.customUpgrades[key].unlock = [];
		Game.customUpgrades[key].unlock.push(CCSE.customUpgradesAllunlock);
		temp = upgrade.unlock.toString();
		eval('upgrade.unlock = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades['` + escKey + `'].unlock) Game.customUpgrades['` + escKey + `'].unlock[i](this); 
			` + temp.slice(-1));
		
		
		// this.lose
		if(!Game.customUpgrades[key].lose) Game.customUpgrades[key].lose = [];
		Game.customUpgrades[key].lose.push(CCSE.customUpgradesAlllose);
		temp = upgrade.lose.toString();
		eval('upgrade.lose = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades['` + escKey + `'].lose) Game.customUpgrades['` + escKey + `'].lose[i](this); 
			` + temp.slice(-1));
		
		
		// this.toggle
		if(!Game.customUpgrades[key].toggle) Game.customUpgrades[key].toggle = [];
		Game.customUpgrades[key].toggle.push(CCSE.customUpgradesAlltoggle);
		temp = upgrade.toggle.toString();
		eval('upgrade.toggle = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades['` + escKey + `'].toggle) Game.customUpgrades['` + escKey + `'].toggle[i](this); 
			` + temp.slice(-1));
		
		
		// this.buyFunction
		if(!Game.customUpgrades[key].buyFunction) Game.customUpgrades[key].buyFunction = [];
		Game.customUpgrades[key].buyFunction.push(CCSE.customUpgradesAllbuyFunction);
		if(upgrade.buyFunction){
			temp = upgrade.buyFunction.toString();
			eval('upgrade.buyFunction = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades['` + escKey + `'].buyFunction) Game.customUpgrades['` + escKey + `'].buyFunction[i](this); 
			` + temp.slice(-1));
		}else{
			upgrade.buyFunction = function(){
				for(var i in Game.customUpgrades['` + escKey + `'].buyFunction) Game.customUpgrades['` + escKey + `'].buyFunction[i](this);
			}
		}
		
		
		// this.descFunc
		if(!Game.customUpgrades[key].descFunc) Game.customUpgrades[key].descFunc = [];
		Game.customUpgrades[key].descFunc.push(CCSE.customUpgradesAlldescFunc);
		if(upgrade.descFunc){
			eval('CCSE.Backup.customUpgrades[key].descFunc = ' + upgrade.descFunc.toString().split('this.').join("Game.Upgrades['" + escKey + "']."));
			upgrade.descFunc = function(){
				var desc = CCSE.Backup.customUpgrades[key].descFunc();
				for(var i in Game.customUpgrades[key].descFunc) desc = Game.customUpgrades[key].descFunc[i](this, desc);
				return desc;
			}
		}else{
			upgrade.descFunc = function(){
				var desc = this.desc;
				for(var i in Game.customUpgrades[key].descFunc) desc = Game.customUpgrades[key].descFunc[i](this, desc);
				return desc;
			}
		}
		
		
	}
	
	
	/*=====================================================================================
	Menu functions
	=======================================================================================*/
	CCSE.AppendOptionsMenu = function(inp){
		// Accepts inputs of either string or div
		var div;
		if(typeof inp == 'string'){
			div = document.createElement('div');
			div.innerHTML = inp;
		}
		else{
			div = inp;
		}
		
		var menu = l('menu');
		if(menu){
			menu = menu.getElementsByClassName('subsection')[0];
			if(menu){
				var padding = menu.getElementsByTagName('div');
				padding = padding[padding.length - 1];
				if(padding){
					menu.insertBefore(div, padding);
				} else {
					menu.appendChild(div);
				}
			}
		}
	}
	
	CCSE.AppendCollapsibleOptionsMenu = function(title, body){
		// Title must be a string. Body may be either string or div
		var titleDiv = document.createElement('div');
		titleDiv.className = 'title';
		titleDiv.textContent = title + ' ';
		
		if(CCSE.collapseMenu[title] === undefined) CCSE.collapseMenu[title] = 0;
		
		// Stolen wholesale from Cookie Monster
		var span = document.createElement('span');
		span.style.cursor = 'pointer';
		span.style.display = 'inline-block';
		span.style.height = '14px';
		span.style.width = '14px';
		span.style.borderRadius = '7px';
		span.style.textAlign = 'center';
		span.style.backgroundColor = '#C0C0C0';
		span.style.color = 'black';
		span.style.fontSize = '13px';
		span.style.verticalAlign = 'middle';
		span.textContent = (CCSE.collapseMenu[title] ? '+' : '-');
		span.onclick = function(){CCSE.ToggleCollabsibleMenu(title); Game.UpdateMenu();};
		titleDiv.appendChild(span);
		
		var bodyDiv;
		if(typeof body == 'string'){
			bodyDiv = document.createElement('div');
			bodyDiv.innerHTML = body;
		}
		else{
			bodyDiv = body;
		}
		
		var div = document.createElement('div');
		div.appendChild(titleDiv);
		if(!CCSE.collapseMenu[title]) div.appendChild(bodyDiv);
		
		CCSE.AppendOptionsMenu(div);
	}
	
	CCSE.ToggleCollabsibleMenu = function(title) {
		if(CCSE.collapseMenu[title] == 0){
			CCSE.collapseMenu[title]++;
		}
		else{
			CCSE.collapseMenu[title]--;
		}
	}
	
	CCSE.AppendStatsGeneral = function(inp){
		// Accepts inputs of either string or div
		var div;
		if(typeof inp == 'string'){
			div = document.createElement('div');
			div.innerHTML = inp;
		}
		else{
			div = inp;
		}
		
		var general;
		var subsections = l('menu').getElementsByClassName('subsection');
		
		for(var i in subsections){
			if(subsections[i].childNodes && subsections[i].childNodes[0].innerHTML == 'General'){
				general = subsections[i];
				break;
			}
		}
		
		if(general){
			var br = general.getElementsByTagName('br')[0];
			if(br) general.insertBefore(div, br);
		}
	}
	
	CCSE.AppendStatsSpecial = function(inp){
		// Accepts inputs of either string or div
		var div;
		if(typeof inp == 'string'){
			div = document.createElement('div');
			div.innerHTML = inp;
		}
		else{
			div = inp;
		}
		
		var special;
		var subsections = l('menu').getElementsByClassName('subsection');
		
		for(var i in subsections){
			if(subsections[i].childNodes && subsections[i].childNodes[0].innerHTML == 'Special'){
				special = subsections[i];
				break;
			}
		}
		
		if(!special){
			var general;
			subsections = l('menu').getElementsByClassName('subsection');
			
			for(var i in subsections){
				if(subsections[i].childNodes && subsections[i].childNodes[0].innerHTML == 'General'){
					general = subsections[i];
					break;
				}
			}
			
			if(general){
				special = document.createElement('div');
				special.className = 'subsection';
				special.innerHTML = '<div class="title">Special</div>';
				l('menu').insertBefore(special, subsections[1]);
			}
		}
		
		special.appendChild(div);
	}
	
	CCSE.AppendStatsVersionNumber = function(modName, versionString){
		var general;
		var str = '<b>' + modName + ' version :</b> ' + versionString;
		var div = document.createElement('div');
		div.className = 'listing';
		div.innerHTML = str;
		
		var subsections = l('menu').getElementsByClassName('subsection');
		for(var i in subsections){
			if(subsections[i].childNodes && subsections[i].childNodes[0].innerHTML == 'General'){
				general = subsections[i];
				break;
			}
		}
		
		if(general) general.appendChild(div);
	}
	
	
	/*=====================================================================================
	Minigames
	=======================================================================================*/
	CCSE.MinigameReplacer = function(func, objKey){
		var me = Game.Objects[objKey];
		if(me.minigameLoaded) func(me, 'minigameScript-' + me.id);
		else Game.customMinigameOnLoad[objKey].push(func);
	}
	
	
	/*=====================================================================================
	Grimoire
	=======================================================================================*/
	CCSE.RedrawSpells = function(){
		var str = '';
		var M = Game.Objects['Wizard tower'].minigame;
		
		for (var i in M.spells){
			var me = M.spells[i];
			var icon = me.icon || [28,12];
			str += '<div class="grimoireSpell titleFont" id="grimoireSpell' + me.id + '" ' + Game.getDynamicTooltip('Game.ObjectsById[' + M.parent.id + '].minigame.spellTooltip(' + me.id + ')','this') + '><div class="usesIcon shadowFilter grimoireIcon" style="background-position:' + (-icon[0] * 48) + 'px ' + (-icon[1] * 48) + 'px;"></div><div class="grimoirePrice" id="grimoirePrice' + me.id + '">-</div></div>';
		}
		
		l('grimoireSpells').innerHTML = str;
		
		for (var i in M.spells){
			var me = M.spells[i];
			AddEvent(l('grimoireSpell' + me.id), 'click', function(spell){return function(){PlaySound('snd/tick.mp3'); M.castSpell(spell);}}(me));
		}
		
		if(typeof CM != 'undefined') CM.Disp.AddTooltipGrimoire();
	}
	
	CCSE.NewSpell = function(key, spell){
		var M = Game.Objects['Wizard tower'].minigame;
		
		M.spells[key] = spell;
		
		M.spellsById = [];
		var n = 0;
		for(var i in M.spells){
			M.spells[i].id = n;
			M.spellsById[n] = M.spells[i];
			n++;
		}
		
		CCSE.RedrawSpells();
	}
	
	
	/*=====================================================================================
	Upgrades
	=======================================================================================*/
	CCSE.customUpgradesAllgetPrice = function(me){
		var ret = 1
		for(var i in Game.customUpgradesAll.getPrice) ret *= Game.customUpgradesAll.getPrice[i](me);
		return ret;
	}
	
	CCSE.customUpgradesAllclick = function(me, e){
		for(var i in Game.customUpgradesAll.click) Game.customUpgradesAll.click[i](me, e);
	}
	
	CCSE.customUpgradesAllbuy = function(me, bypass, success){
		for(var i in Game.customUpgradesAll.buy) Game.customUpgradesAll.buy[i](me, bypass, success);
	}
	
	CCSE.customUpgradesAllearn = function(me){
		for(var i in Game.customUpgradesAll.earn) Game.customUpgradesAll.earn[i](me);
	}
	
	CCSE.customUpgradesAllunearn = function(me){
		for(var i in Game.customUpgradesAll.unearn) Game.customUpgradesAll.unearn[i](me);
	}
	
	CCSE.customUpgradesAllunlock = function(me){
		for(var i in Game.customUpgradesAll.unlock) Game.customUpgradesAll.unlock[i](me);
	}
	
	CCSE.customUpgradesAlllose = function(me){
		for(var i in Game.customUpgradesAll.lose) Game.customUpgradesAll.lose[i](me);
	}
	
	CCSE.customUpgradesAlltoggle = function(me){
		for(var i in Game.customUpgradesAll.toggle) Game.customUpgradesAll.toggle[i](me);
	}
	
	CCSE.customUpgradesAllbuyFunction = function(me){
		for(var i in Game.customUpgradesAll.buyFunction) Game.customUpgradesAll.buyFunction[i](me);
	}
	
	CCSE.customUpgradesAlldescFunc = function(me, desc){
		for(var i in Game.customUpgradesAll.descFunc) desc = Game.customUpgradesAll.descFunc[i](me, desc);
		return desc;
	}
	
	
	CCSE.NewHeavenlyUpgrade = function(name, desc, price, icon, posX, posY, parents, buyFunction){
		var me = new Game.Upgrade(name, desc, price, icon, buyFunction);
		Game.PrestigeUpgrades.push(me);
		
		me.pool = 'prestige';
		me.posX = posX;
		me.posY = posY;
		
		me.parents = parents;
		if(me.parents.length == 0) me.parents = ['Legacy'];
		me.parents = me.parents || [-1];
		for(var ii in me.parents){
			if(me.parents[ii] != -1) me.parents[ii] = Game.Upgrades[me.parents[ii]];
		}
		
		return me;
	}
	
	
	/*=====================================================================================
	Start your engines
	=======================================================================================*/
	CCSE.init();
}

if(!CCSE.isLoaded) CCSE.launch();