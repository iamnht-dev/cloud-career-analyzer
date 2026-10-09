const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    try {
        console.log("Nhận dữ liệu từ hàm ExtractText:");
        const cvText = event.extractedText;
        const targetRole = event.targetRole || "IT Professional";

        if (!cvText) {
            throw new Error("Không có dữ liệu CV (extractedText) để phân tích.");
        }

        const prompt = `You are an expert IT technical recruiter and career mentor.
I will provide you with a candidate's CV text. Your task is to analyze it against the typical requirements for a "${targetRole}" position.

Respond ONLY with a valid JSON object in the following format (no other text, no markdown block):
{
  "score": <number 0-100 representing how well the CV fits the role>,
  "feedback": "<string: overall constructive feedback and first impressions>",
  "strengths": ["<string>", "<string>"],
  "skillGaps": ["<string: what key technical skills they are missing for this role>", "<string>"],
  "recommendedCerts": ["<string: suggested AWS or industry certifications>", "<string>"]
}

Candidate CV:
---
${cvText}
---`;

        console.log(`Đang gọi Amazon Bedrock (Claude 3 Haiku) để phân tích cho vị trí ${targetRole}...`);

        const command = new ConverseCommand({
            modelId: "anthropic.claude-3-haiku-20240307-v1:0",
            messages: [
                {
                    role: "user",
                    content: [{ text: prompt }]
                }
            ],
            inferenceConfig: {
                maxTokens: 1000,
                temperature: 0.2
            }
        });

        const response = await bedrockClient.send(command);
        const aiResponseText = response.output.message.content[0].text;

        console.log("AI Phân tích thành công!");
        
        // Cố gắng parse JSON từ kết quả của AI
        let aiResult;
        try {
            aiResult = JSON.parse(aiResponseText);
        } catch (e) {
            console.error("Lỗi khi parse JSON của AI. Kết quả thô:", aiResponseText);
            throw new Error("AI trả về kết quả không phải là JSON chuẩn.");
        }

        return {
            statusCode: 200,
            targetRole: targetRole,
            analysisResult: aiResult
        };

    } catch (error) {
        console.error("Lỗi trong quá trình phân tích bằng Bedrock:", error);
        throw error;
    }
};
