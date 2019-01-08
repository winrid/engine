var q = require('q'),
    _ = require('lodash'),
    utils = require('../../../utils'),
    driver = utils.getDriver(),
    C = driver.constants;

module.exports = function(intent, user, {roomObjectsByType, userPowerCreeps, gameTime, bulkObjects, bulkUsersPowerCreeps}) {

    var powerLevel = Math.floor(Math.pow((user.power || 0) / C.POWER_LEVEL_MULTIPLY, 1 / C.POWER_LEVEL_POW));
    var used = Object.keys(userPowerCreeps).length + _.sum(userPowerCreeps, 'level');
    if(used >= powerLevel) {
        return;
    }

    var powerCreep = _.find(userPowerCreeps, i => i.user == user._id && i._id == intent.id);
    if (!powerCreep) {
        return;
    }

    if(powerCreep.level >= C.POWER_CREEP_MAX_LEVEL) {
        return;
    }
    var powerInfo = C.POWER_INFO[intent.power];
    if(!powerInfo) {
        return;
    }
    if(powerInfo.className !== powerCreep.className) {
        return;
    }

    let level = powerCreep.level;
    if(!powerCreep.powers[intent.power]) {
        powerCreep.powers[intent.power] = {level: 0};
    }

    if(level < powerInfo.level[powerCreep.powers[intent.power].level]) {
        return;
    }

    level++;
    let energyCapacity = powerCreep.energyCapacity + 100;
    let hitsMax = powerCreep.hitsMax + 1000;
    powerCreep.powers[intent.power].level++;

    let roomPowerCreep = _.find(roomObjectsByType.powerCreep, i => i._id == intent.id);
    if(roomPowerCreep) {
        bulkObjects.update(roomPowerCreep, {
            level,
            hitsMax,
            energyCapacity,
            powers: powerCreep.powers
        });
    }

    bulkUsersPowerCreeps.update(powerCreep, {
        level,
        hitsMax,
        energyCapacity,
        powers: powerCreep.powers
    });
};