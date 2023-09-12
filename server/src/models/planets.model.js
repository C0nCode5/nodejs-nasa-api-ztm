const fs = require('fs');
const path = require('path');
const { parse } = require("csv-parse");
const planets = require('./planets.mongo')

const habitablePlanets = [];


// conditions, for a planet to be habitable the Insolation Flux has to be between 0.36 & 1.11
// the planetary radius must also be less than 1.6
function ishabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
     && planet['koi_insol'] > 0.36 
     && planet['koi_insol'] < 1.11
     && planet['koi_prad'] < 1.6
};

// creates a read stream for keplar data and pipes it to the parser
function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'keplar_data.csv'))
        .pipe(parse({
            comment: '#',
            columns: true,
        })).on('data', async (data) => {
            if(ishabitablePlanet(data)) {
                savePlanet(data)
            }
        }).on('error', (err) => {
            console.log(err);
            reject(err);
        }).on('end', async () => {
            const habitablePlanetsFound = (await getAllPlanets()).length
            const output = `${habitablePlanetsFound} habitable planets found!`;
            console.log(output);
            resolve();
        });
        })
    };

    async function getAllPlanets() {
        return await planets.find({});
    };

    async function savePlanet(planet) {
        try{
        await planets.updateOne({
            keplerName: planet.kepler_name,
        },{
            keplerName: planet.kepler_name,
        }, {
            upsert: true,
        });
    }catch(err) {
        console.error('could not save planet' + err)
    }
    }

module.exports = {
    loadPlanetsData,
    getAllPlanets
}