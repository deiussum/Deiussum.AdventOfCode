const readfile = require('../../common/node/readfile');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) console.log('No input to process');

    let seeds = [];
    const almanac = new Almanac();
    let currentMap = null;

    lines.forEach((line) => {
        if (line.slice(0, 6) === 'seeds:') {
            seeds = line.slice(7).split(' ').map((x) => Number(x));
        }
        else if (line === '') {
            currentMap = null;
        }
        else if (line.indexOf(':') >= 0) {
            const mapLineParts = line.split(' ');
            const mapName = mapLineParts[0];
            currentMap = almanac.getMapFor(mapName);
        }
        else {
            currentMap.addRange(line);
        }
    });

    let minLocation = 0;
    const seedLocations = seeds.map((seed) => {
        const location = almanac.getLocationForSeed(seed);
        if (minLocation === 0 || location < minLocation) minLocation = location;

        const seedLocation = {
            seed: seed,
            location: location
        };
        console.log(seedLocation);

        return seedLocation;
    });
    console.log(`Lowest Location: ${minLocation}`);

});

class AlmanacMap {
    #ranges = [];

    addRange(line) {
        const numbers = line.split(' ').map((x) => Number(x));
        if (numbers.length !== 3) return;

        const range = {
            sourceStart: numbers[1],
            destinationStart: numbers[0],
            length: numbers[2]
        };

        this.#ranges.push(range);
    }

    mapValue(source) {
        let dest = source;

        this.#ranges.forEach((range) => {
            if (source >= range.sourceStart && source < range.sourceStart + range.length) {
                dest = range.destinationStart + (source - range.sourceStart);
            }
        });

        return dest;
    }
}

class Almanac {
    #seedToSoilMap = new AlmanacMap();
    #soilToFertilizerMap = new AlmanacMap();
    #fertilizerToWaterMap = new AlmanacMap();
    #waterToLightMap = new AlmanacMap();
    #lightToTemperatureMap = new AlmanacMap();
    #temperatureToHumidityMap = new AlmanacMap();
    #humidityToLocationMap = new AlmanacMap();

    getMapFor(mapName) {
        switch(mapName) {
            case 'seed-to-soil': return this.#seedToSoilMap;
            case 'soil-to-fertilizer': return this.#soilToFertilizerMap;
            case 'fertilizer-to-water': return this.#fertilizerToWaterMap;
            case 'water-to-light': return this.#waterToLightMap;
            case 'light-to-temperature': return this.#lightToTemperatureMap;
            case 'temperature-to-humidity': return this.#temperatureToHumidityMap;
            case 'humidity-to-location': return this.#humidityToLocationMap;
            default: return null;
        }
    }

    getLocationForSeed(seedId) {
        const soilId = this.#seedToSoilMap.mapValue(seedId);
        const fertilizerId = this.#soilToFertilizerMap.mapValue(soilId);
        const waterId = this.#fertilizerToWaterMap.mapValue(fertilizerId);
        const lightId = this.#waterToLightMap.mapValue(waterId);
        const temperatureId = this.#lightToTemperatureMap.mapValue(lightId);
        const humidityId = this.#temperatureToHumidityMap.mapValue(temperatureId);
        const locationId = this.#humidityToLocationMap.mapValue(humidityId);

        return locationId;
    }

}