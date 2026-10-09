const { TextractClient, DetectDocumentTextCommand } = require("@aws-sdk/client-textract");

const textractClient = new TextractClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    try {
        // Nhận thông tin bucket và tên file (key) từ Event truyền vào
        const bucket = event.bucket || event.detail?.bucket?.name;
        const key = event.key || event.detail?.object?.key;

        if (!bucket || !key) {
            throw new Error("Không tìm thấy thông tin S3 bucket hoặc tên file PDF.");
        }

        console.log(`Bắt đầu nhờ Textract đọc file: s3://${bucket}/${key}`);

        // Chuẩn bị lệnh gọi Textract
        const params = {
            Document: {
                S3Object: {
                    Bucket: bucket,
                    Name: key
                }
            }
        };

        const command = new DetectDocumentTextCommand(params);
        const response = await textractClient.send(command);

        // Bóc tách toàn bộ chữ từ các khối văn bản (Blocks)
        let extractedText = "";
        if (response.Blocks) {
            response.Blocks.forEach(block => {
                if (block.BlockType === "LINE") {
                    extractedText += block.Text + "\n";
                }
            });
        }

        console.log("Trích xuất văn bản thành công!");
        console.log("Độ dài văn bản:", extractedText.length, "ký tự.");

        // Trả kết quả chữ thô về để các bước sau xử lý tiếp
        return {
            statusCode: 200,
            bucket: bucket,
            key: key,
            extractedText: extractedText
        };
    } catch (error) {
        console.error("Lỗi khi đọc file bằng Textract:", error);
        throw error;
    }
};
