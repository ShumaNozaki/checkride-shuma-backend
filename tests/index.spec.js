const chai = require('chai');
const request = require('supertest');
const expect = chai.expect;
const app = require('../../app');

describe('GET /', () => {
  it('should return hello message', async () => {
    const res = await request(app).get('/')

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Hello world!");
  });
});