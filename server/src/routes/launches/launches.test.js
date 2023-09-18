const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const {loadPlanetsData} = require('../../models/planets.model')


describe('launches api', () => {
    beforeAll(async() => {
        await mongoConnect();
        await loadPlanetsData();

    })
    afterAll(async() => {
        await mongoDisconnect();
    })

describe('Test GET /launches with pagination', () => {
// supertest lib tests
    test('it should respond with 200 success (supertest lib)', async() => {
        const response = await request(app)
        .get('/v1/launches?limit=10&page=0')
        .expect(200)
        .expect('Content-Type', /json/)
    });
});

describe('Test POST /launches', () => {
// supertest lib tests
const data = {
  completelaunchData: {
        "mission": "test1",
        "rocket": "test1",
        "target": "Kepler-62 f",
        "launchDate": "july 1, 2028"  
    },
  launchDataWithoutDate:{
        "mission": "test1",
        "rocket": "test1",
        "target": "Kepler-62 f",
    },
  launchInvalidDate: {
        "mission": "test1",
        "rocket": "test1",
        "target": "Kepler-62 f",
        "launchDate": "jufly 32, 20"
    },
};
    test('it should respond with 201 created (supertest lib)', async() => {
        const response = await request(app)
        .post('/v1/launches')
        .send(data.completelaunchData)
        .expect(201)
        .expect('Content-Type', /json/)

        const requestDate = new Date(data.completelaunchData.launchDate).valueOf();
        const responseDate = new Date(response.body.launchDate).valueOf();
        expect(requestDate).toBe(responseDate);

        expect(response.body).toMatchObject(data.launchDataWithoutDate);
    });

    test('it should catch missing properties (supertest lib)', async() => {
        const response = await request(app)
        .post('/v1/launches')
        .send(data.launchDataWithoutDate)
        .expect(400)
        .expect('Content-Type', /json/)

        expect(response.body).toStrictEqual({error: 'Missing Required Launch Property'})

    });

    test('it should catch invalid dates (supertest lib)', async() => {
        const response = await request(app)
        .post('/v1/launches')
        .send(data.launchInvalidDate)
        .expect(400)
        .expect('Content-Type', /json/)

        expect(response.body).toStrictEqual({error: 'Invalid Date'})

    });

});
});