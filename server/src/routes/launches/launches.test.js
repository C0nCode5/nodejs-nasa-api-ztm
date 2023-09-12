const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');



describe('launches api', () => {
    beforeAll(async() => {
        await mongoConnect()
    })
    afterAll(async() => {
        await mongoDisconnect()
    })

describe('Test GET /launches', () => {
// fetch test  
    // test('it should respond with 200 success', async() => {
    //     const response = await fetch('http://localhost:8000/launches');
    //     expect(response.status).toBe(200);
    // });
// supertest lib tests
    test('it should respond with 200 success (supertest lib)', async() => {
        const response = await request(app)
        .get('/v1/launches')
        .expect(200)
        .expect('Content-Type', /json/)
    });
});



describe('Test POST /launches', () => {
// fetch tests 
    // test('it should respond with 201 created', async() => {
    //     const response = await fetch('http://localhost:8000/launches', {
    //         method: 'post',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //                 "mission": "test1",
    //                 "rocket": "test1",
    //                 "target": "test1",
    //                 "launchDate": "july 1, 2028"
    //         })
    //     });
    //     expect(response.status).toBe(201);
    // });

// supertest lib tests

const completelaunchData = {
    "mission": "test1",
    "rocket": "test1",
    "target": "Kepler-62 f",
    "launchDate": "july 1, 2028"  
};

const launchDataWithoutDate = {
    "mission": "test1",
    "rocket": "test1",
    "target": "Kepler-62 f",
};

const launchInvalidDate = {
    "mission": "test1",
    "rocket": "test1",
    "target": "Kepler-62 f",
    "launchDate": "jufly 32, 20"
};

    test('it should respond with 201 created (supertest lib)', async() => {
        const response = await request(app)
        .post('/v1/launches')
        .send(completelaunchData)
        .expect(201)
        .expect('Content-Type', /json/)

        const requestDate = new Date(completelaunchData.launchDate).valueOf();
        const responseDate = new Date(response.body.launchDate).valueOf();
        expect(requestDate).toBe(responseDate);

        expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test('it should catch missing properties (supertest lib)', async() => {
        const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect(400)
        .expect('Content-Type', /json/)

        expect(response.body).toStrictEqual({error: 'Missing Required Launch Property'})

    });

    test('it should catch invalid dates (supertest lib)', async() => {
        const response = await request(app)
        .post('/v1/launches')
        .send(launchInvalidDate)
        .expect(400)
        .expect('Content-Type', /json/)

        expect(response.body).toStrictEqual({error: 'Invalid Date'})

    });

});
});