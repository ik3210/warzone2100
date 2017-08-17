include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const GAMMA = 1; // Player 1 is Gamma team.
const NEXUS_RES = [
	"R-Defense-WallUpgrade08", "R-Struc-Materials08", "R-Struc-Factory-Upgrade06",
	"R-Struc-Factory-Cyborg-Upgrade06", "R-Struc-VTOLFactory-Upgrade06",
	"R-Struc-VTOLPad-Upgrade06", "R-Vehicle-Engine09", "R-Vehicle-Metals06",
	"R-Cyborg-Metals07", "R-Vehicle-Armor-Heat05", "R-Cyborg-Armor-Heat05",
	"R-Sys-Engineering03", "R-Vehicle-Prop-Hover02", "R-Vehicle-Prop-VTOL02",
	"R-Wpn-Bomb-Accuracy03", "R-Wpn-Energy-Accuracy01", "R-Wpn-Energy-Damage01",
	"R-Wpn-Energy-ROF01", "R-Wpn-Missile-Accuracy01", "R-Wpn-Missile-Damage01",
	"R-Wpn-Rail-Damage02", "R-Wpn-Rail-ROF02", "R-Sys-Sensor-Upgrade01",
	"R-Sys-NEXUSrepair", "R-Wpn-Flamer-Damage06",
];
const GAMMA_RES = [
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Cannon-Damage06", "R-Wpn-Cannon-ROF03",
	"R-Wpn-Flamer-Damage06", "R-Wpn-Flamer-ROF03", "R-Wpn-Howitzer-Accuracy02",
	"R-Wpn-Howitzer-Damage03", "R-Wpn-MG-Damage07", "R-Wpn-MG-ROF03",
	"R-Wpn-Mortar-Acc02", "R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF03",
	"R-Wpn-Rocket-Accuracy02", "R-Wpn-Rocket-Damage06", "R-Wpn-Rocket-ROF03",
	"R-Wpn-RocketSlow-Accuracy03", "R-Wpn-RocketSlow-Damage06", "R-Wpn-RocketSlow-ROF03",
	"R-Vehicle-Armor-Heat02", "R-Vehicle-Engine06", "R-Vehicle-Metals06", "R-Cyborg-Metals06",
	"R-Cyborg-Armor-Heat02", "R-Defense-WallUpgrade06", "R-Struc-Factory-Upgrade06",
	"R-Struc-Factory-Cyborg-Upgrade06", "R-Struc-VTOLFactory-Upgrade03",
	"R-Struc-VTOLPad-Upgrade03", "R-Struc-Materials06", "R-Struc-Power-Upgrade01",
	"R-Struc-Research-Upgrade06", "R-Struc-RprFac-Upgrade06", "R-Sys-Engineering02",
	"R-Sys-MobileRepairTurret01", "R-Sys-Sensor-Upgrade01", "R-Wpn-AAGun-Accuracy02",
	"R-Wpn-AAGun-Damage03", "R-Wpn-AAGun-ROF03", "R-Wpn-Bomb-Accuracy02",
];
var videoIndex;

//Remove Nexus VTOL droids.
camAreaEvent("vtolRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		if (isVTOL(droid))
		{
			camSafeRemoveObject(droid, false);
		}
	}

	resetLabel("vtolRemoveZone", NEXUS);
});

camAreaEvent("trapTrigger", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		playSound("pcv455.ogg"); //Incoming message.
		queue("trapSprung", 2000);
	}
	else
	{
		resetLabel("trapTrigger", CAM_HUMAN_PLAYER);
	}
});

//Play videos.
function eventVideoDone(flag)
{
	const VIDEOS = ["MB3_B_MSG", "MB3_B_MSG2", "MB3_B_MSG3"];
	if(!camDef(videoIndex))
	{
		videoIndex = 0;
	}

	if(!camDef(flag) && (videoIndex === 2))
	{
		return; //Last message is triggered by an area event.
	}

	if(videoIndex < VIDEOS.length)
	{
		hackAddMessage(VIDEOS[videoIndex], MISS_MSG, CAM_HUMAN_PLAYER, true);
		videoIndex += 1;
	}
}

//VTOL units stop coming when the Nexus HQ is destroyed.
function checkNexusHQ()
{
	if(getObject("NXCommandCenter") === null)
	{
		camToggleVtolSpawn();
	}
	else
	{
		queue("checkNexusHQ", 8000);
	}
}

//Setup Nexus VTOL hit and runners.
function vtolAttack()
{
	var list; with (camTemplates) list = [nxmheapv, nxmtherv, nxlscouv];
	camSetVtolData(NEXUS, "vtolAppearPos", "vtolRemovePos", list, camChangeOnDiff(120000)); //2 min
	checkNexusHQ();
}

function enableAllFactories()
{
	camEnableFactory("gammaFactory");
	camEnableFactory("gammaCyborgFactory");
}

//return 10 units if for a transport and up to 15 for land.
function getDroidsForNXLZ(isTransport)
{
	if(!camDef(isTransport))
	{
		isTransport = false;
	}

	const COUNT = isTransport ? 10 : 8 + camRand(8);
	var units;
	with (camTemplates) units = [nxcyrail, nxcyscou, nxcylas, nxmlinkh, nxmrailh, nxmsamh];

	var droids = [];
	for (var i = 0; i < COUNT; ++i)
	{
		droids.push(units[camRand(units.length)]);
	}

	return droids;
}

//Send Nexus transport units
function sendNXTransporter()
{
	if(!enumArea("NXEastBaseCleanup", NEXUS, false).length && !enumArea("NXWestBaseCleanup", NEXUS, false).length)
	{
		return; //Call off transport when both west and east Nexus bases are destroyed.
	}

	const LZ_ALIAS = "CM3B_TRANS"; //1 and 2
	var lzNum = camRand(2) + 1;
	var list = getDroidsForNXLZ(true);
	var pos = (lzNum === 1) ? "nexusEastTransportPos" : "nexusWestTransportPos";

	camSendReinforcement(NEXUS, camMakePos(pos), list,
		CAM_REINFORCE_TRANSPORT, {
			message: LZ_ALIAS + lzNum,
			entry: { x: 63, y: 4 },
			exit: { x: 63, y: 4 }
		}
	);

	queue("sendNXTransporter", camChangeOnDiff(180000)); //3 min
}

//Send Nexus transport units
function sendNXlandReinforcements()
{
	if(!enumArea("NXWestBaseCleanup", NEXUS, false).length)
	{
		return;
	}

	camSendReinforcement(NEXUS, camMakePos("westPhantomFactory"), getDroidsForNXLZ(),
		CAM_REINFORCE_GROUND, {
			data: {regroup: true, count: -1,},
		}
	);

	queue("sendNXlandReinforcements", camChangeOnDiff(240000)); //4 min
}

function transferPower()
{
    const AWARD = 5000;
    var powerTransferSound = "power-transferred.ogg";
    setPower(playerPower(me) + AWARD, me);
    playSound(powerTransferSound);
}

function activateNexusGroups()
{
	camManageGroup(camMakeGroup("eastNXGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("northEndOfPass"),
			camMakePos("southOfRidge"),
			camMakePos("westRidge"),
			camMakePos("eastRidge"),
		],
		interval: 45000,
		regroup: false,
		count: -1
		//morale: 90,
		//fallback: camMakePos("eastRetreat")
	});

	camManageGroup(camMakeGroup("westNXGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("westDoorOfBase"),
			camMakePos("eastDoorOfBase"),
			camMakePos("playerLZ"),
		],
		interval: 45000,
		regroup: false,
		count: -1
		//morale: 90,
		//fallback: camMakePos("westRetreat")
	});

	camManageGroup(camMakeGroup("gammaBaseCleanup"), CAM_ORDER_DEFEND, {
		pos: [
			camMakePos("gammaBase"),
			camMakePos("northEndOfPass"),
		],
		regroup: true,
		count: -1,
		morale: 10,
		fallback: camMakePos("gammaBase")
	});
}

//Take everything Gamma has and donate to Nexus.
function trapSprung()
{
	eventVideoDone(true);
	hackRemoveMessage("CM3B_GAMMABASE", PROX_MSG, CAM_HUMAN_PLAYER);

	setMissionTime(camChangeOnDiff(5400));

	activateNexusGroups();
	enableAllFactories();

	sendNXlandReinforcements();
	sendNXTransporter();
	changePlayerColour(GAMMA, NEXUS); // Black painting.
	playSound(SYNAPTICS_ACTIVATED);
}

function eventStartLevel()
{
	const MISSION_TIME = camChangeOnDiff(1800); //30 minutes. Rescue part.
	const NEXUS_POWER = camChangeOnDiff(60000); //20000
	const GAMMA_POWER = camChangeOnDiff(60000); //20000
	var startpos = getObject("startPosition");
	var lz = getObject("landingZone");
	var tent = getObject("transporterEntry");
	var text = getObject("transporterExit");

     camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "SUB_3_2S");
	setMissionTime(MISSION_TIME);

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	setPower(NEXUS_POWER, NEXUS);
	setPower(NEXUS_POWER, GAMMA);

	camCompleteRequiredResearch(NEXUS_RES, NEXUS);
	camCompleteRequiredResearch(GAMMA_RES, GAMMA);
	camCompleteRequiredResearch(NEXUS_RES, GAMMA); //They get even more research.

	setAlliance(GAMMA, NEXUS, true);

	camSetArtifacts({
		"NXCommandCenter": { tech: "R-Struc-Research-Upgrade07" },
		"NXBeamTowerArti": { tech: "R-Wpn-Laser01" },
		"gammaResLabArti": { tech: "R-Wpn-Mortar-Acc03" },
		"gammaCommandArti": { tech: "R-Vehicle-Body03" }, //retalitation
	});

	camSetEnemyBases({
		"GammaBase": {
			cleanup: "gammaBaseCleanup",
			detectMsg: "CM3B_GAMMABASE",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"NX-EastBase": {
			cleanup: "NXEastBaseCleanup",
			detectMsg: "CM3B_BASE4",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"NX-WestBase": {
			cleanup: "NXWestBaseCleanup",
			detectMsg: "CM3B_BASE6",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		}
	});

	with (camTemplates) camSetFactories({
		"gammaFactory": {
			order: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("northEndOfPass"),
					camMakePos("southOfRidge"),
					camMakePos("westRidge"),
					camMakePos("eastRidge"),
				],
				interval: 45000,
				count: -1
			},
			group: camMakeGroup("eastNXGroup"),
			groupSize: 4,
			throttle: camChangeOnDiff(45000),
			regroup: false,
			repair: 40,
			templates: [nxmrailh, nxmscouh]
		},
		"gammaCyborgFactory": {
			order: CAM_ORDER_DEFEND,
			data: {
				pos: [
					camMakePos("gammaBase"),
					camMakePos("northEndOfPass"),
				]
			},
			group: camMakeGroup("gammaBaseCleanup"),
			groupSize: 5,
			throttle: camChangeOnDiff(40000),
			regroup: true,
			repair: 40,
			templates: [nxcyrail, nxcyscou, nxcylas]
		}
	});

	hackAddMessage("CM3B_GAMMABASE", PROX_MSG, CAM_HUMAN_PLAYER, true);
	eventVideoDone();

	queue("transferPower", 3000);
	queue("vtolAttack", camChangeOnDiff(300000)); //5 min
	queue("enableAllFactories", camChangeOnDiff(300000)); //5 min
}
