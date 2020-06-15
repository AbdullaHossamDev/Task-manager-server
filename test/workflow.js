const chai = require('chai')
const chaiHttp = require('chai-http');
const server = require('../app');
const { response } = require('express');

chai.should();
chai.use(chaiHttp);


describe("Workflow APIs", () => {
  let userToken;
  let userId;
  let user = {
    name: 'name workflow test',
    email: 'nameWFT@name.com',
    password: '123'
  }
  let savedWorkflow = {};
  describe("Register new user /user/register", () => {
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
          userToken = response.body.token;
          userId = response.body.id;
          done()
        })
    })
  })

  describe("Save /workflow/save", () => {
    let workflow = {
      name: 'first workflow',
      stages: ["stage 1", "stage 2", "stage 3", "stage 4"],
      status: "public"
    }
    it("It should get status code = 200, workflow object, and msg as it is saved ", function (done) {
      this.timeout(10000);
      chai.request(server)
        .post('/workflow/save')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .send(workflow)
        .end((err, response) => {
          response.should.status(200)
          response.body.should.be.a('object')
          response.body.should.have.property('savedWorkflow');
          response.body.should.have.property('msg');
          response.body.msg.should.eq('Workflow added successfully');
          savedWorkflow = response.body.savedWorkflow;
          done()
        })

    })

    it("It should get status code = 401, as header doesn't contain token", function (done) {
      this.timeout(10000);
      chai.request(server)
        .post('/workflow/save')
        .set('content-type', 'application/json')
        .send(workflow)
        .end((err, response) => {
          response.should.status(401);
          response.text.should.eq('Unauthorized request');
          done();
        })
    })

    it("It should get status code = 400 as not all attributes are valid ", function (done) {
      this.timeout(10000)
      let invalidWFData = JSON.parse(JSON.stringify(workflow))
      invalidWFData.status = undefined;

      chai.request(server)
        .post('/workflow/save')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidWFData)
        .end((err, response) => {
          response.should.status(400);
          response.text.should.eq('Bad request');
          done()
        })
    })
  })

  describe('Get all /workflow/getAll', () => {
    it("It should get status code = 200, with array of all workflows that i could reach (public, private('I'm in it's users'))", function (done) {
      this.timeout(10000);
      chai.request(server)
        .get('/workflow/getAll')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('array');
          done();
        })
    })


  })

  describe('Get by ID /workflow/get', () => {
    it("It should get status code = 200, with workflow", function (done) {
      this.timeout(10000);
      chai.request(server)
        .get(`/workflow/get/${savedWorkflow._id}`)
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('array');
          response.body[0].name.should.eq(savedWorkflow.name);
          done();
        })
    })
  })

  describe('Update /workflow/update', () => {
    let newUserId;
    let newUserToken;
    let newUser = {
      name: 'newname workflow test',
      email: 'newnameWFT@newname.com',
      password: '123'
    }
    it("It should get status code = 200, wih msg", function (done) {
      let newWorkflow = JSON.parse(JSON.stringify(savedWorkflow))
      newWorkflow.name = "first workflow updated"
      newWorkflow.stages.push("new stage 5");
      newWorkflow.status = "private"
      this.timeout(10000);
      chai.request(server)
        .put('/workflow/update')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newWorkflow)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('object')
          response.body.should.have.property('msg')
          response.body.msg.should.eq('Workflow updated successfully')
          done()
        })
    })

    it("It should get status code = 200, with updated workflow", function (done) {
      this.timeout(10000);
      chai.request(server)
        .get(`/workflow/get/${savedWorkflow._id}`)
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('array');
          response.body[0].name.should.eq("first workflow updated");
          response.body[0].status.should.eq("private");
          response.body[0].stages[4].should.eq("new stage 5");
          done();
        })
    })

    it("It should get status code = 200, JSON object with token, id, and name", function (done) {
      this.timeout(10000);
      chai.request(server)
        .post('/user/register')
        .set('content-type', 'application/json')
        .send(newUser)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('object');
          response.body.should.have.property('token');
          response.body.should.have.property('name');
          response.body.should.have.property('id');
          newUserToken = response.body.token;
          newUserId = response.body.id;
          done()
        })
    })

    it("It should get status code = 401 as it is allowed for the creator only to update", function (done) {
      let newWorkflow = JSON.parse(JSON.stringify(savedWorkflow))
      newWorkflow.name = "first workflow updated"
      newWorkflow.stages.push("new stage 5");
      newWorkflow.status = "private"
      this.timeout(10000);
      chai.request(server)
        .put('/workflow/update')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send(newWorkflow)
        .end((err, response) => {
          response.should.status(401);
          response.text.should.eq('Unauthorized request');
          done()
        })
    })

    it("It should get status code = 200, as user deleted successfully ", function (done) {
      this.timeout(10000);
      chai.request(server)
        .delete('/user/delete')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${newUserToken}`)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.have.property('msg')
          response.body.msg.should.eq('User deleted successfully')
          done();
        })
    })

    it("It should get status code = 400 as not all attributes are valid", function(done){
      let newWorkflow = JSON.parse(JSON.stringify(savedWorkflow))
      delete newWorkflow.name;
      this.timeout(10000);
      chai.request(server)
        .put('/workflow/update')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newWorkflow)
        .end((err, response) => {
          response.should.status(400);
          response.text.should.eq('Bad request')
          done()
        })
    })

  })

  describe("Delete /workflow/delete", () => {
    it("It should get status code = 200, as workflow deleted successfully", function (done) {
      this.timeout(10000)
      chai.request(server)
        .delete(`/workflow/delete/${savedWorkflow._id}`)
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.have.property('msg')
          response.body.msg.should.eq('Workflow deleted successfully')
          done();
        })
    })
  })

  describe("Delete created user /user/delete", () => {
    it("It should get status code = 200, as user deleted successfully ", function (done) {
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
  })
})