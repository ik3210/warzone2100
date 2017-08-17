
//TODO: The WZ script SemperFi has a scout group that patrols around the map,
//and repair cyborgs were made as well.
//It should be able to outpace Nexus in grabbing oil.

// -- definitions
const OIL_RES = "OilResource";
const RES_LAB = "A0ResearchFacility";
const POW_GEN = "A0PowerGenerator";
const FACTORY = "A0LightFactory";
const DERRICK = "A0ResourceExtractor";
const CYBORG_FACTORY = "A0CyborgFactory";
const PLAYER_HQ = "A0CommandCentre";
const VTOL_PAD = "A0VtolPad";
const VTOL_FACTORY = "A0VTolFactory1";
const CB_TOWER = "Sys-CB-Tower01";
const WIDE_SPECTRUM_TOWER = "Sys-SensoTowerWS";
const UPLINK = "A0Sat-linkCentre";
const ELECTRONIC_DEFENSES = ["Sys-SpyTower", "WallTower-EMP", "Emplacement-MortarEMP"];

// -- globals
var attackGroup;
var vtolGroup;
var researchDone = false;
var isSeaMap; // Used to determine if it is a hover map.
var lastBeaconDrop = 0; // last game time SemperFi sent a beacon.
var currentEnemy; // Current enemy SemperFi is attacking.
var currentEnemyTick; // Last time the enemy was changed.

//And include the rest here.
include("/multiplay/skirmish/semperfi_includes/miscFunctions.js");
include("/multiplay/skirmish/semperfi_includes/production.js");
include("/multiplay/skirmish/semperfi_includes/build.js");
include("/multiplay/skirmish/semperfi_includes/tactics.js");
include("/multiplay/skirmish/semperfi_includes/events.js");
include("/multiplay/skirmish/semperfi_includes/research.js");
include("/multiplay/skirmish/semperfi_includes/chat.js");
