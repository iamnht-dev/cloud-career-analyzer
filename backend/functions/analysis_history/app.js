const { randomUUID } = require("crypto");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.HISTORY_TABLE;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const response = (statusCode, body) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "POST") {
      const payload = JSON.parse(event.body || "{}");
      const { sessionId, targetRole, score, feedback, strengths, skillGaps, recommendedCerts } = payload;

      if (!/^[a-f0-9-]{36}$/i.test(sessionId || "")) {
        return response(400, { error: "Invalid sessionId." });
      }
      if (typeof targetRole !== "string" || typeof score !== "number" ||
          typeof feedback !== "string" || !Array.isArray(strengths) ||
          !Array.isArray(skillGaps) || !Array.isArray(recommendedCerts)) {
        return response(400, { error: "Invalid analysis result." });
      }

      const item = {
        sessionId,
        createdAt: new Date().toISOString(),
        analysisId: randomUUID(),
        targetRole: targetRole.slice(0, 100),
        score: Math.max(0, Math.min(100, Math.round(score))),
        feedback: feedback.slice(0, 2000),
        strengths: strengths.slice(0, 30).map((value) => String(value).slice(0, 300)),
        skillGaps: skillGaps.slice(0, 30).map((value) => String(value).slice(0, 300)),
        recommendedCerts: recommendedCerts.slice(0, 30).map((value) => String(value).slice(0, 300)),
        expiresAt: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60,
      };

      await dynamo.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
      return response(201, { item });
    }

    if (event.httpMethod === "GET") {
      const sessionId = event.queryStringParameters?.sessionId;
      if (!/^[a-f0-9-]{36}$/i.test(sessionId || "")) {
        return response(400, { error: "Invalid sessionId." });
      }
      const result = await dynamo.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "sessionId = :sessionId",
        ExpressionAttributeValues: { ":sessionId": sessionId },
        ScanIndexForward: false,
        Limit: 50,
      }));
      return response(200, { items: result.Items || [] });
    }

    return response(405, { error: "Method not allowed." });
  } catch (error) {
    console.error("Analysis history request failed:", error);
    return response(500, { error: "Unable to process analysis history." });
  }
};
