class World {
  constructor() {
    this.state = {
      houseHoldId: 0,
      houseHolds: [],
      powerPlantId: 0,
      powerPlants: [],
    };
  }

  createPowerPlant() {
    const newPowerPlant = {
      name: `PowerPlant:${this.state.powerPlantId}`,
      id: this.state.powerPlantId,
      isActive: true,
      energySourceFor: [],
    };
    this.state.powerPlantId = this.state.powerPlantId + 1;
    this.state.powerPlants.push(newPowerPlant);

    return newPowerPlant;
  }

  createHousehold() {
    const newHouseHold = {
      name: `HouseHold:${this.state.houseHoldId}`,
      id: this.state.houseHoldId,
      activeEnergySource: [],
      notActiveEnergySource: [],
    };
    this.state.houseHoldId = this.state.houseHoldId + 1;
    this.state.houseHolds.push(newHouseHold);

    return newHouseHold;
  }

  connectHouseholdToPowerPlant(household, powerPlant) {
    if (powerPlant.isActive !== false) {
      const houseHolds = this.state.houseHolds[household.id];
      const powerPlants = this.state.powerPlants[powerPlant.id];
      houseHolds.activeEnergySource.push(powerPlant.name);
      powerPlants.energySourceFor.push(household.name);
    }
  }

  connectHouseholdToHousehold(household1, household2) {
    if (household1.activeEnergySource.length > 0) {
      let household = this.state.houseHolds[household2.id];
      household.activeEnergySource.push(household1.name);
    } else {
      let household = this.state.houseHolds[household1.id];
      household.activeEnergySource.push(household2.name);
    }
  }

  disconnectHouseholdFromPowerPlant(household, powerPlant) {
    const houseHolds = this.state.houseHolds[household.id];
    const powerPlants = this.state.powerPlants[powerPlant.id];

    let index = houseHolds.activeEnergySource.indexOf(powerPlant.id);
    houseHolds.activeEnergySource.splice(index, 1);

    index = powerPlants.energySourceFor.indexOf(household.id);
    powerPlants.energySourceFor.splice(index, 1);

    let disconnectedHouse = [houseHolds.name];

    this.state.houseHolds.forEach((el) => {
      if (el.activeEnergySource.includes(disconnectedHouse.join(""))) {
        let index = el.activeEnergySource.indexOf(disconnectedHouse.join(""));
        el.activeEnergySource.splice(index, 1);
        el.notActiveEnergySource.push(disconnectedHouse.join(""));
        disconnectedHouse = [];
        disconnectedHouse.push(el.name);
      }
    });
  }

  killPowerPlant(powerPlant) {
    const powerPlants = this.state.powerPlants[powerPlant.id];
    const houseHolds = this.state.houseHolds;
    powerPlants.isActive = false;
    let deactiveHouse = [];
    houseHolds.forEach((el, i) => {
      if (el.activeEnergySource.includes(powerPlants.name)) {
        let index = el.activeEnergySource.indexOf(powerPlants.name);
        deactiveHouse.push(el.name);
        el.activeEnergySource.splice(index, 1);
        el.notActiveEnergySource.push(powerPlants.name);
      } else if (el.activeEnergySource.includes(deactiveHouse.join(""))) {
        let index = el.activeEnergySource.indexOf(deactiveHouse.join(""));
        el.activeEnergySource.splice(index, 1);
        el.notActiveEnergySource.push(deactiveHouse.join(""));
        deactiveHouse = [];
        deactiveHouse.push(el.name);
      }
    });
  }

  repairPowerPlant(powerPlant) {
    const powerPlants = this.state.powerPlants[powerPlant.id];
    const houseHolds = this.state.houseHolds;
    let repairedHouse = [];
    houseHolds.forEach((el) => {
      if (el.notActiveEnergySource.includes(powerPlants.name)) {
        let index = el.notActiveEnergySource.indexOf(powerPlants.name);
        repairedHouse.push(el.name);
        el.notActiveEnergySource.splice(index, 1);
        el.activeEnergySource.push(powerPlants.name);
      } else if (el.notActiveEnergySource.includes(repairedHouse.join(""))) {
        let index = el.notActiveEnergySource.indexOf(repairedHouse.join(""));
        el.notActiveEnergySource.splice(index, 1);
        el.activeEnergySource.push(repairedHouse.join(""));
        repairedHouse = [];
        repairedHouse.push(el.name);
      }
    });
  }

  householdHasEletricity(household) {
    return household.activeEnergySource.length > 0 ? true : false;
  }
}

const assert = {
  equal(a, b) {
    if (a != b) {
      throw new Error("Assertion Failed");
    }
  }
};
window.mocha.setup("bdd");

describe("Households + Power Plants", function() {
  it("Household has no electricity by default", () => {
    const world = new World();
    const household = world.createHousehold();
    assert.equal(world.householdHasEletricity(household), false);
  });

  it("Household has electricity if connected to a Power Plant", () => {
    const world = new World();
    const household = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household, powerPlant);

    assert.equal(world.householdHasEletricity(household), true);
  });

  it("Household won't have Electricity after disconnecting from the only Power Plant", () => {
    const world = new World();
    const household = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household, powerPlant);

    assert.equal(world.householdHasEletricity(household), true);

    world.disconnectHouseholdFromPowerPlant(household, powerPlant);
    assert.equal(world.householdHasEletricity(household), false);
  });

  it("Household will have Electricity as long as there's at least 1 alive Power Plant connected", () => {
    const world = new World();
    const household = world.createHousehold();

    const powerPlant1 = world.createPowerPlant();
    const powerPlant2 = world.createPowerPlant();
    const powerPlant3 = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household, powerPlant1);
    world.connectHouseholdToPowerPlant(household, powerPlant2);
    world.connectHouseholdToPowerPlant(household, powerPlant3);

    assert.equal(world.householdHasEletricity(household), true);

    world.disconnectHouseholdFromPowerPlant(household, powerPlant1);
    assert.equal(world.householdHasEletricity(household), true);

    world.killPowerPlant(powerPlant2);
    assert.equal(world.householdHasEletricity(household), true);

    world.disconnectHouseholdFromPowerPlant(household, powerPlant3);
    assert.equal(world.householdHasEletricity(household), false);
  });

  it("Household won't have Electricity if the only Power Plant dies", () => {
    const world = new World();
    const household = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household, powerPlant);

    assert.equal(world.householdHasEletricity(household), true);

    world.killPowerPlant(powerPlant);
    assert.equal(world.householdHasEletricity(household), false);
  });

  it("PowerPlant can be repaired", () => {
    const world = new World();
    const household = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household, powerPlant);

    assert.equal(world.householdHasEletricity(household), true);

    world.killPowerPlant(powerPlant);
    assert.equal(world.householdHasEletricity(household), false);

    world.repairPowerPlant(powerPlant);
    assert.equal(world.householdHasEletricity(household), true);

    world.killPowerPlant(powerPlant);
    assert.equal(world.householdHasEletricity(household), false);

    world.repairPowerPlant(powerPlant);
    assert.equal(world.householdHasEletricity(household), true);
  });

  it("Few Households + few Power Plants, case 1", () => {
    const world = new World();

    const household1 = world.createHousehold();
    const household2 = world.createHousehold();

    const powerPlant1 = world.createPowerPlant();
    const powerPlant2 = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household1, powerPlant1);
    world.connectHouseholdToPowerPlant(household1, powerPlant2);
    world.connectHouseholdToPowerPlant(household2, powerPlant2);

    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), true);

    world.killPowerPlant(powerPlant2);
    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), false);

    world.killPowerPlant(powerPlant1);
    assert.equal(world.householdHasEletricity(household1), false);
    assert.equal(world.householdHasEletricity(household2), false);
  });

  it("Few Households + few Power Plants, case 2", () => {
    const world = new World();

    const household1 = world.createHousehold();
    const household2 = world.createHousehold();

    const powerPlant1 = world.createPowerPlant();
    const powerPlant2 = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household1, powerPlant1);
    world.connectHouseholdToPowerPlant(household1, powerPlant2);
    world.connectHouseholdToPowerPlant(household2, powerPlant2);

    world.disconnectHouseholdFromPowerPlant(household2, powerPlant2);

    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), false);

    world.killPowerPlant(powerPlant2);
    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), false);

    world.killPowerPlant(powerPlant1);
    assert.equal(world.householdHasEletricity(household1), false);
    assert.equal(world.householdHasEletricity(household2), false);
  });

  it("Household + Power Plant, case 1", () => {
    const world = new World();

    const household = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    assert.equal(world.householdHasEletricity(household), false);
    world.killPowerPlant(powerPlant);

    world.connectHouseholdToPowerPlant(household, powerPlant);

    assert.equal(world.householdHasEletricity(household), false);
  });
});

describe("Households + Households + Power Plants", function() {
  it("2 Households + 1 Power Plant", () => {
    const world = new World();

    const household1 = world.createHousehold();
    const household2 = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household1, powerPlant);
    world.connectHouseholdToHousehold(household1, household2);

    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), true);

    world.killPowerPlant(powerPlant);

    assert.equal(world.householdHasEletricity(household1), false);
    assert.equal(world.householdHasEletricity(household2), false);
  });

  it("Power Plant -> Household -> Household -> Household", () => {
    const world = new World();

    const household1 = world.createHousehold();
    const household2 = world.createHousehold();
    const household3 = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household1, powerPlant);
    world.connectHouseholdToHousehold(household1, household2);
    world.connectHouseholdToHousehold(household2, household3);

    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), true);
    assert.equal(world.householdHasEletricity(household3), true);

    world.killPowerPlant(powerPlant);

    assert.equal(world.householdHasEletricity(household1), false);
    assert.equal(world.householdHasEletricity(household2), false);
    assert.equal(world.householdHasEletricity(household3), false);

    world.repairPowerPlant(powerPlant);

    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), true);
    assert.equal(world.householdHasEletricity(household3), true);

    world.disconnectHouseholdFromPowerPlant(household1, powerPlant);

    assert.equal(world.householdHasEletricity(household1), false);
    assert.equal(world.householdHasEletricity(household2), false);
    assert.equal(world.householdHasEletricity(household3), false);
  });

  it("2 Households + 2 Power Plants", () => {
    const world = new World();

    const household1 = world.createHousehold();
    const household2 = world.createHousehold();

    const powerPlant1 = world.createPowerPlant();
    const powerPlant2 = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household1, powerPlant1);
    world.connectHouseholdToPowerPlant(household2, powerPlant2);

    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), true);

    world.killPowerPlant(powerPlant1);

    assert.equal(world.householdHasEletricity(household1), false);
    assert.equal(world.householdHasEletricity(household2), true);

    world.connectHouseholdToHousehold(household1, household2);

    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), true);

    world.disconnectHouseholdFromPowerPlant(household2, powerPlant2);

    assert.equal(world.householdHasEletricity(household1), false);
    assert.equal(world.householdHasEletricity(household2), false);
  });
});

window.mocha.run();
