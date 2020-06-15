const chai = require('chai')
const chaiHttp = require('chai-http');
const server = require('../app');
const { response } = require('express');
const task = require('../model/task');
const { json } = require('body-parser');

chai.should();
chai.use(chaiHttp);

describe("Task APIs", () => {
  let userToken;
  let userId;
  let user = {
    name: 'name task test',
    email: 'nameTT@name.com',
    password: '123'
  }
  let savedTask = {};
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

  describe("Save /task/save", () => {
    let task = {
      name: 'first task',
      description: 'first task description',
      startDate: new Date(),
      done: false
    }
    it("It should get status code = 200, and task object", function (done) {
      this.timeout(10000);
      chai.request(server)
        .post('/task/save')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .send(task)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('object')
          response.body.should.have.property('_id');
          savedTask = response.body;
          done()
        })
    })

    it("It should get status code = 401, as header doesn't contain token", function (done) {
      this.timeout(10000);
      chai.request(server)
        .post('/task/save')
        .set('content-type', 'application/json')
        .send(task)
        .end((err, response) => {
          response.should.status(401);
          response.text.should.eq('Unauthorized request');
          done();
        })
    })

    it("It should get status code = 400 as not all attributes are valid ", function (done) {
      this.timeout(10000)
      let invalidTaskData = JSON.parse(JSON.stringify(task))
      delete invalidTaskData.name

      chai.request(server)
        .post('/task/save')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidTaskData)
        .end((err, response) => {
          response.should.status(400);
          response.text.should.eq('Bad request');
          done()
        })
    })
  })

  describe("Get by id /task/get", () => {
    it("It should get status code = 200 and the task", function (done) {
      this.timeout(10000)
      chai.request(server)
        .get(`/task/get/${savedTask._id}`)
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('object')
          response.body._id.should.eq(savedTask._id);
          response.body.name.should.eq(savedTask.name);

          done();
        })
    })
  })

  describe("Get my all tasks /task/get", () => {
    it("It should get status code = 200 and array of tasks ", function (done) {
      this.timeout(10000)
      chai.request(server)
        .get(`/task/get`)
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('array')
          response.body[0]._id.should.eq(savedTask._id);
          response.body[0].name.should.eq(savedTask.name);

          done();
        })
    })
  })

  describe('Update /task/update', () => {
    it("It should get status code = 200, wih msg", function (done) {
      let newTaskData = JSON.parse(JSON.stringify(savedTask))
      newTaskData.name = 'first task updated';
      newTaskData.description = "first task description updated"
      newTaskData.done = true;

      this.timeout(10000);
      chai.request(server)
        .put('/task/update')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newTaskData)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('object')
          response.body.should.have.property('msg')
          response.body.msg.should.eq('Task updated successfully')
          done()
        })
    })

    it("It should get status code = 200, with updated task", function (done) {
      this.timeout(10000);
      chai.request(server)
        .get(`/task/get/${savedTask._id}`)
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.be.a('object');
          response.body.name.should.eq("first task updated");
          response.body.description.should.eq("first task description updated");
          response.body.done.should.eq(true);
          done();
        })
    })
    
    it("It should get status code = 400 as not all attributes are valid ", function (done) {
      this.timeout(10000)
      let invalidTaskData = JSON.parse(JSON.stringify(savedTask))
      delete invalidTaskData.name

      chai.request(server)
        .put('/task/update')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidTaskData)
        .end((err, response) => {
          response.should.status(400);
          response.text.should.eq('Bad request');
          done()
        })
    })

  })


  describe("Delete /task/delete", () => {
    it("It should get status code = 200, as task deleted successfully", function (done) {
      this.timeout(10000)
      chai.request(server)
        .delete(`/task/delete/${savedTask._id}`)
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, response) => {
          response.should.status(200);
          response.body.should.have.property('msg')
          response.body.msg.should.eq('Task deleted successfully')
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