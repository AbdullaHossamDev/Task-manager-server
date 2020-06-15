const chai = require('chai')
const chaiHttp = require('chai-http');
const server = require('../app');
const { response } = require('express');

chai.should();
chai.use(chaiHttp);

describe("User APIs", () => {

  let userToken;
  let user = {
    name: 'name',
    email: 'name@name.com',
    password: '123'
  }
  describe("Resister /user/register", () => {
    it("It should get status code = 200, JSON object with token, id, and name", function (done) {
      this.timeout(10000);
      chai.request(server)
        .post('/user/register')
        .set('content-type', 'application/json')
        .send(user)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('object');
          response.body.should.have.property('token');
          response.body.should.have.property('name');
          response.body.should.have.property('id');
          done()
        })
    })

    it("It should get error with status 409 as email already exist", function (done) {
      this.timeout(10000)
      chai.request(server)
        .post('/user/register')
        .set('content-type', 'application/json')
        .send(user)
        .end((err, response) => {
          response.should.status(409);
          response.text.should.eq('The email is already exsit');
          done()
        })
    })

    it("It should get bad request with status 400 as not all attributes are valid", function (done) {
      this.timeout(10000)
      let invalidUserData = JSON.parse(JSON.stringify(user))
      invalidUserData.password = undefined;
      chai.request(server)
        .post('/user/register')
        .set('content-type', 'application/json')
        .send(invalidUserData)
        .end((err, response) => {
          response.should.status(400);
          response.text.should.eq('Bad request');
          done()
        })
    })
  })

  describe("Login /user/login", () => {
    it("It should get status code = 200, and JSON object with token, id, and name", function (done) {
      this.timeout(10000);
      chai.request(server)
        .post('/user/login')
        .set('content-type', 'application/json')
        .send(user)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('object');
          response.body.should.have.property('token');
          response.body.should.have.property('name');
          response.body.should.have.property('id');
          userToken = response.body.token;
          done()
        })
    })

    it("It should get error with 401 as email is invalid", function (done) {
      let invalidUserData = JSON.parse(JSON.stringify(user))
      invalidUserData.email = 'notExistEmail@name.com';
      this.timeout(10000);
      chai.request(server)
        .post('/user/login')
        .set('content-type', 'application/json')
        .send(invalidUserData)
        .end((err, response) => {
          response.should.status(401);
          response.text.should.eq('Invalid email');
          done()
        })
    })

    it("It should get error with 401 as password is invalid", function (done) {
      let invalidUserData = JSON.parse(JSON.stringify(user))
      invalidUserData.password = 'bla bla';
      this.timeout(10000);
      chai.request(server)
        .post('/user/login')
        .set('content-type', 'application/json')
        .send(invalidUserData)
        .end((err, response) => {
          response.should.status(401);
          response.text.should.eq('Invalid password');
          done()
        })
    })

    it("It should get bad request with status 400 as not all attributes are valid", function (done) {
      let invalidUserData = JSON.parse(JSON.stringify(user))
      invalidUserData.password = undefined;
      this.timeout(10000);
      chai.request(server)
        .post('/user/login')
        .set('content-type', 'application/json')
        .send(invalidUserData)
        .end((err, response) => {
          response.should.status(400);
          response.text.should.eq('Bad request');
          done()
        })
    })

  })

  describe("Update /user/update", () => {
    it("It should get status code = 200, and updated user", function (done) {
      let newUserData = { email: 'newNameEmail@name.com', password: '112233445566' }

      this.timeout(10000);
      chai.request(server)
        .put('/user/update')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newUserData)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('object');
          response.body.should.have.property('msg');
          response.body.msg.should.eq('User updated successfully')
          done();
        })
    })

    it("It should login with new credentials", function (done) {
      let newUserData = { email: 'newNameEmail@name.com', password: '112233445566' }

      this.timeout(10000);
      chai.request(server)
        .post('/user/login')
        .set('content-type', 'application/json')
        .send(newUserData)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('object');
          response.body.should.have.property('token');
          response.body.should.have.property('name');
          response.body.should.have.property('id');
          userToken = response.body.token;
          done()
        })
    })
  })

  describe("Get My data /user/user", () => {
    it("It should get status code = 200, and json contains my data", function (done) {
      this.timeout(10000);
      chai.request(server)
        .get('/user/user')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('object');
          response.body.should.have.property('_id');
          response.body.should.have.property('name');
          response.body.should.have.property('email');
          response.body.should.have.property('password');
          done();
        })
    })

    it("It should get status code = 401, as header doesn't contain token", function (done) {
      this.timeout(10000);
      chai.request(server)
        .get('/user/user')
        .set('content-type', 'application/json')
        .end((err, response) => {
          response.should.status(401);
          response.text.should.eq('Unauthorized request');
          done();
        })
    })
  })

  describe("Get all users /user/getAll", () => {
    it("It should get status = 200, with array of all users except me", function (done) {
      this.timeout(10000)
      chai.request(server)
        .get('/user/getAll')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('array');
          done();
        })
    })
  })

  describe("Delete /user/delete", () => {
    it("It should get status code = 200, as user deleted successfully", function (done) {
      this.timeout(10000);
      chai.request(server)
        .delete('/user/delete')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.have.property('msg')
          response.body.msg.should.eq('User deleted successfully')
          done();
        })
    })

    it("It should get status code = 401, as header doesn't contain token", function (done) {
      this.timeout(10000);
      chai.request(server)
        .delete('/user/delete')
        .set('content-type', 'application/json')
        .end((err, response) => {
          response.should.status(401);
          response.text.should.eq('Unauthorized request');
          done();
        })
    })
  })


});