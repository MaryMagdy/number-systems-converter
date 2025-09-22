Minimal endpoints to specify now:

POST /api/convert — convert a number

GET /api/convert/examples — returns table 1–20 (optional)

GET /api/logs — list saved logs (optional, admin)

GET /health — service health

POST /api/convert

Request

POST /api/convert
Content-Type: application/json

{
  "input": "13",
  "base": "decimal",
  "showSteps": true
}


Response (200)

{
  "input":"13",
  "base":"decimal",
  "results":{"decimal":"13","binary":"1101","hex":"D"},
  "steps":{
    "toBinary":[ "13 / 2 = 6 remainder 1", "...", "Read remainders bottom-up: 1101" ],
    "toHex":[ "13 / 16 = 0 remainder 13", "13 -> D" ]
  },
  "visualizer":{"binaryBits":[1,1,0,1],"hexNibbles":["D"]}
}


Errors

400 Bad Request — invalid characters for given base. Example: input 102 with base binary.

413 Payload Too Large — input exceeds allowed length.

Validation rules

binary: regex ^[01]+$

decimal: regex ^[0-9]+$

hex: regex ^[0-9A-Fa-f]+$

maximum input length: define (e.g., 64 bits or 16 hex digits) — specify in NFR

OpenAPI hint (starter)

openapi: "3.0.0"
info:
  title: Number Systems Tutor API
paths:
  /api/convert:
    post:
      summary: Convert number between bases
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                input:
                  type: string
                base:
                  type: string
                  enum: [binary, decimal, hex]
                showSteps:
                  type: boolean
      responses:
        "200":
          description: conversion result