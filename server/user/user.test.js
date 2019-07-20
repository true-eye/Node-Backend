const mongoose = require("mongoose");
const request = require("supertest-as-promised");
const httpStatus = require("http-status");
const chai = require("chai"); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const app = require("../../index");

chai.config.includeStack = true;

/**
 * root level hooks
 */
after(done => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe("## User APIs", () => {
  let user = {
    fullname: "Rafael Sanchez",
    email: "hamesmodric@gmail.com"
  };

  describe("# POST /api/users", () => {
    it("should create a new user", done => {
      request(app)
        .post("/api/users")
        .send(user)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.fullname).to.equal(user.fullname);
          expect(res.body.email).to.equal(user.email);
          user = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe("# POST /api/users", () => {
    it("should handle express duplication error - email is duplicated", done => {
      request(app)
        .post("/api/users")
        .send(user)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(res => {
          // expect(res.body.message).to.equal(
          //   "The email address is already taken!"
          // );
          done();
        })
        .catch(done);
    });
  });

  describe("# GET /api/users/:userId", () => {
    it("should get user details", done => {
      request(app)
        .get(`/api/users/${user._id}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.fullname).to.equal(user.fullname);
          expect(res.body.email).to.equal(user.email);
          done();
        })
        .catch(done);
    });

    it("should report error with message - Not found, when user does not exists", done => {
      request(app)
        .get("/api/users/56c787ccc67fc16ccc1a5e92")
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.message).to.equal("Not Found");
          done();
        })
        .catch(done);
    });
  });

  describe("# PUT /api/users/:userId", () => {
    it("should update user details", done => {
      user.fullname = "KK";
      request(app)
        .put(`/api/users/${user._id}`)
        .send(user)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.fullname).to.equal("KK");
          expect(res.body.email).to.equal(user.email);
          done();
        })
        .catch(done);
    });
  });

  describe("# GET /api/users/", () => {
    it("should get all users", done => {
      request(app)
        .get("/api/users")
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.be.an("array");
          done();
        })
        .catch(done);
    });

    it("should get all users (with limit and skip)", done => {
      request(app)
        .get("/api/users")
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.be.an("array");
          done();
        })
        .catch(done);
    });
  });

  describe("# DELETE /api/users/", () => {
    it("should delete user", done => {
      request(app)
        .delete(`/api/users/${user._id}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.fullname).to.equal("KK");
          expect(res.body.email).to.equal(user.email);
          done();
        })
        .catch(done);
    });
  });
});
