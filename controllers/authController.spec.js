import bcrypt from "bcrypt";
import mssql from "mssql";
import { v4 } from "uuid";
import { registerUsers, userLogin } from "./authControllers";
const jwt = require("jsonwebtoken");

const req = {
  body: {
    // full_name,email,password
    full_name: "Milla",
    email: "millajesso2000@gmail.com",
    password: "12345678",
  },
};

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};

describe("Register User", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should register a user", async () => {
    jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("swredtfgjhjtrftg");

    const mockedInput = jest.fn().mockReturnThis();
    const mockedExecute = jest.fn().mockResolvedValue({ rowsAffected: [1] });

    const mockedRequest = {
      input: mockedInput,
      execute: mockedExecute,
    };

    const mockedPool = {
      request: jest.fn().mockReturnValue(mockedRequest),
      connected: true,
    };

    jest.spyOn(mssql, "connect").mockResolvedValueOnce(mockedPool);

       await registerUsers(req, res);

    expect(mockedInput).toHaveBeenCalledWith(
      "password",
      mssql.VarChar,
      "swredtfgjhjtrftg"
    );

    expect(mockedInput).toHaveBeenCalledWith(
      "email",
      mssql.VarChar,
      "millajesso2000@gmail.com"
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      message: "User registered successfully",
    });

    expect(mockedExecute).toHaveBeenCalledWith("registerUsersProc");

    //    expect(mockedInput).toHaveBeenCalledWith("id", expect.any(String));
    expect(mockedInput).toHaveBeenCalledWith("id", expect.any(String));
  });

  it("Fails if body is missing email or password", async () => {
    const req= {
      body: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    await registerUsers(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "Please input all values" });
  });

   it("Fails with error email already exists", async () => {
     jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("kjhgsaiuytwiulkyiyui");

     const mockedInput = jest.fn().mockReturnThis();
     const mockedExecute = jest.fn().mockResolvedValue({ rowsAffected: [0] });

     const mockedRequest = {
       input: mockedInput,
       execute: mockedExecute,
     };
     const res = {
       status: jest.fn().mockReturnThis(),
       json: jest.fn().mockReturnThis(),
     };

     const mockedPool = {
       request: jest.fn().mockReturnValue(mockedRequest),
     };

     jest.spyOn(mssql, "connect").mockResolvedValue(mockedPool);

     await registerUsers(req, res);

     expect(res.status).toHaveBeenCalledWith(200);
     expect(res.json).toHaveBeenCalledWith({
       message: "Registration failed",
     });
   });
});








// jest.mock("bcrypt");
// jest.mock("jsonwebtoken");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");




describe("Login User tests", () => {
  it("should return an error if email or password missing", async () => {
    const req = {
      body: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(), //this
      json: jest.fn().mockReturnThis(),
    };

    await userLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Please input all values" });
  });

  it("should return an error if email is not found/registered", async () => {
    const req = {
      body: {
        email: "abc@gmail.com",
        password: "12345678",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(), 
      json: jest.fn().mockReturnThis(),
    };

    jest.spyOn(mssql, "connect").mockResolvedValueOnce({
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValueOnce({ rowsAffected: 0 }),
    });

    await userLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email does not exist",
    });
  });

  it("should return an error if password is invalid", async () => {
    const expectedUser = {
      id: "99f32f04-caab-43d2-a210-6bdf0a3320c4",
      full_name: "John Wachira",
      email: "john.wachira@yopmail.com",
      password: "$2b$05$18uIWBCUljHauB1AatayZOJneM7hm00aFGqui58fouMc1F48PgMJi",
      
      assignedProject: "asdfghjwertyuisdfghjfghefg",
      // issent: false,
    };

    const req = {
      body: {
        email: expectedUser.email,
        password: "incorrect_pwd",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(), //this
      json: jest.fn().mockReturnThis(),
    };

    jest.spyOn(mssql, "connect").mockResolvedValueOnce({
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValueOnce({
        rowsAffected: 1,
        recordset: [expectedUser],
      }),
    });

    bcrypt.compare.mockResolvedValueOnce(false);

    await userLogin(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid login credentials",
    });

    bcrypt.compare.mockRestore();
  });

  it("should return a token and log in user successfully", async () => {
    const expectedUser = {
      id: "99f32f04-caab-43d2-a210-6bdf0a3320c4",
      full_name: "Johnnhh Wachira",
      email: "johnii.wachira@yopmail.com",
      password: "$2b$05$18uIWBCUljHauB1AatayZOJneM7hm00aFGqui58fouMc1F48PgMJi",
      assignedProject: "asdfghjwertyuisdfghjfghefg",
      role: "user",
    };

    const req = {
      body: {
        email: expectedUser.email,
        password: "correct_pwd",
      },
    };

    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(mssql, "connect").mockResolvedValueOnce({
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValueOnce({
        rowsAffected: 1,
        recordset: [expectedUser],
      }),
    });

    jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);

    // jwt.sign.mockResolvedValueOnce('jwt_token');
    jest.spyOn(jwt, "sign").mockReturnValueOnce("mockedToken");

    await userLogin(req, response);

    // expect(res.status).toHaveBeenCalledWith(200)
    expect(response.json).toHaveBeenCalledWith({
      message: "logged in",
      token: "mockedToken",
    });
  });


});




