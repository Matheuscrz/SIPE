import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import express from "express";
import { GetRoutes } from "../src/router/Get.routes";

const app = express();
const getRouter = new GetRoutes();
app.use(express.json());
app.use(getRouter.getRouter);

describe("Teste das rotas GET", () => {
  it("Deve retornar 400 se o token não for informado", async () => {
    const res = await request(app).get("/logout");
    expect(res.statusCode).toEqual(400);
    expect(res.text).toEqual("Token não informado");
  });

  it("Deve retornar 404 se o usuário não for encontrado", async () => {
    const res = await request(app).get("/user/12345678900");
    expect(res.statusCode).toEqual(404);
    expect(res.text).toEqual("Usuário não encontrado");
  });
});
