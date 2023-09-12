const axios = require('axios');
const launchesDataBase = require('./launches.mongo');
const planets = require('./planets.mongo');


const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'


async function populateLaunches() {
    console.log('downloading data');

    const response = await axios.post(SPACEX_API_URL, {
                query: {},
                options: {
                    populate: [
                  {
                    path: 'rocket',
                    select: {
                      name: 1
                    }
                  },
                  {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                  }
                ],
                pagination: false
               }
            });            

            if(response.status !== 200) {
                console.log('failed to download data');
                throw new Error('Failed to download data')
            }

            const launchDocs = response.data.docs;
    
        for (const launchDoc of launchDocs) {
            const payloads = launchDoc['payloads']
            const customers = payloads.flatMap((payload) => {
              return payload['customers']
            });
            const launch = {
                flightNumber: launchDoc['flight_number'],
                mission: launchDoc['name'],
                rocket: launchDoc['rocket']['name'],
                launchDate: launchDoc['date_local'],
                customers,
                success: launchDoc['success'],
                upcoming: launchDoc['upcoming'],
              }
              console.log(`${launch.flightNumber}, ${launch.mission}, ${launch.customers}`)
              await saveLaunch(launch)
            }
}


async function loadLaunchData() {

    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });

    console.log(firstLaunch)

    if(firstLaunch) {
        console.log('Launch Data Already Loaded');
    }else {
        await populateLaunches()
    }
}


async function findLaunch(filter) {
    return await launchesDataBase.findOne(filter)
};

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId,
    });
};

async function getLastestFlightNumber() {
    const latestFlight = await launchesDataBase
    .findOne()
    .sort('-flightNumber')

    if (!latestFlight) {
        return DEFAULT_FLIGHT_NUMBER
    }

    return latestFlight.flightNumber
}

async function getAllLaunches(skip, limit) {
    return await launchesDataBase.find({}, {'__v': 0, '_id': 0,})
    .sort({flightNumber: 1})
    .skip(skip)
    .limit(limit)
};

async function saveLaunch(launch) {
    
        await launchesDataBase.findOneAndUpdate(
        {
            flightNumber: launch.flightNumber
        }, launch,
        {
            upsert: true
        });
    };

async function scheduleNewLaunch(launch) {

    const planet = await planets.find({keplerName: launch.target});
    
    if(!planet) {
        throw new Error('no planet found')
    }

    const newFlightNumber = await getLastestFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        customers: ['zero to mastery', 'nasa'],
        success: true,
        upcoming: true,
        flightNumber: newFlightNumber
    });

    await saveLaunch(newLaunch);

};

async function abortLaunchById(launchId) {

     const aborted = await launchesDataBase.updateOne({
        flightNumber: launchId
    },
    {
        upcoming: false,
        success: false,
    });
    console.log(aborted)
    return aborted.modifiedCount === 1;
};



module.exports = {
    loadLaunchData,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
    existsLaunchWithId
}