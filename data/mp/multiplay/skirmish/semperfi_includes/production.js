
// Tank definitions
var tankBodyList = [
	"Body14SUP", // dragon
	"Body10MBT", //vengeance
	"Body7ABT", // retribution
	"Body9REC", // tiger
	"Body6SUPP", // panther
	"Body11ABT", // python
	"Body5REC", // cobra
	"Body1REC", // viper
];
var tankPropList = [
	"HalfTrack", // half-track
	"wheeled01", // wheels
];
var tankWeaponList = [
	"Missile-A-T", // Scourge
	"Rocket-HvyA-T", // Tank-killer
	"Rocket-LtA-T", // Lancer
	"Rocket-Pod", // mini-pod
	"MG2Mk1", // twin mg
	"MG1Mk1", // mg, initial weapon
];
var tankArtillery = [
	//"Missile-HvyArt", // Arch-angel
	"Missile-MdArt", // Seraph
	//"Rocket-IDF", // Ripple rockets
	"Rocket-MRL", // MRL
];

// System definitions
var systemBodyList = [
	"Body7ABT", // retribution
	"Body6SUPP", // panther
	"Body8MBT", // scorpion
	"Body5REC", // cobra
	"Body1REC", // viper
];
var systemPropList = [
	"hover01", // hover
	"wheeled01", // wheels
];

// VTOL definitions
var bombList = [
	"Bomb5-VTOL-Plasmite",	// plasmite bomb
	"Bomb4-VTOL-HvyINC",	// thermite bomb
	"Bomb3-VTOL-LtINC",	// phosphor bomb
];
var vtolRockets = [
	"Missile-VTOL-AT", // scourge
	"Rocket-VTOL-HvyA-T", //tank killer
	"Rocket-VTOL-LtA-T", // lancer
];
var vtolBodyList = [
	"Body7ABT", // retribution
	"Body6SUPP", // panther
	"Body8MBT", // scorpion
	"Body5REC", // cobra
	"Body4ABT", // bug
	"Body1REC", // viper
];

function buildAttacker(struct)
{
	const HOVER_CHANCE = 58;
	const WEAPON_CHANCE = 68;
	const EMP_CHANCE = 40;
	//Choose either artillery or anti-tank.
	var weaponChoice = (random(101) < WEAPON_CHANCE) ? tankWeaponList : tankArtillery;
	var SECONDARY;

	//Give a chance to produce hover propulsion units if not a sea map.
	if (!isSeaMap && (random(101) < HOVER_CHANCE))
	{
		SECONDARY = weaponChoice;
		if (componentAvailable("Body14SUP") && componentAvailable("EMP-Cannon") && random(101) < EMP_CHANCE)
		{
			SECONDARY = "EMP-Cannon";
		}
		buildDroid(struct, "Ranged Attacker", tankBodyList, tankPropList, "", "", weaponChoice, SECONDARY);
	}
	else
	{
		buildDroid(struct, "Ranged Attacker", tankBodyList, "hover01", "", "", weaponChoice, weaponChoice);
	}
}

function buildTruck(struct)
{
	buildDroid(struct, "Constructor", systemBodyList, systemPropList, "", "", "Spade1Mk1");
}

function buildCyborg(struct)
{
	// Cyborg templates are special -- their bodies, legs and weapons are linked. We should fix this one day...
	buildDroid(struct, "Cyborg Thermite", "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Thermite");
}

function buildVTOL(struct)
{
	const WEAPON_CHANCE = 50;
	const EMP_CHANCE = 20;

	var weaponChoice = (random(101) < WEAPON_CHANCE) ? bombList : vtolRockets;
	if (random(101) < EMP_CHANCE && componentAvailable("Bomb6-VTOL-EMP"))
	{
		weaponChoice = "Bomb6-VTOL-EMP";
	}

	buildDroid(struct, "Bomber", vtolBodyList, "V-Tol", "", "", weaponChoice);
}

//Produce droids.
function produce()
{
	const MIN_POWER = -300;
	const MIN_TRUCKS = 5;

	var fac = enumStruct(me, FACTORY);
	var facNum = fac.length;

	//Count the trucks being built so as not to build too many of them.
	var virtualTrucks = 0;
	for(var i = 0; i < facNum; ++i)
	{
		var virDroid = getDroidProduction(fac[i]);
		if(virDroid !== null)
		{
			if(virDroid.droidType === DROID_CONSTRUCT)
				virtualTrucks += 1;
		}
	}

	for(var i = 0; i < facNum; ++i)
	{
		if(structureIdle(fac[i]) && (getRealPower() > MIN_POWER))
		{
			if ((countDroid(DROID_CONSTRUCT) + virtualTrucks) < MIN_TRUCKS)
			{
				buildTruck(fac[i]);
			}
			else
			{
				buildAttacker(fac[i]);
			}
		}
	}

	//No point building cyborgs if it is a sea map.
	if(!isSeaMap)
	{
		var cyborgFac = enumStruct(me, CYBORG_FACTORY);
		for(var i = 0, l = cyborgFac.length; i < l; ++i)
		{
			if(structureIdle(cyborgFac[i]) && (getRealPower() > MIN_POWER))
			{
				buildCyborg(cyborgFac[i]);
			}
		}
	}

	var vtolFac = enumStruct(me, VTOL_FACTORY);
	for(var i = 0, l = vtolFac.length; i < l; ++i)
	{
		if(structureIdle(vtolFac[i]) && (getRealPower() > MIN_POWER))
		{
			buildVTOL(vtolFac[i]);
		}
	}

}
