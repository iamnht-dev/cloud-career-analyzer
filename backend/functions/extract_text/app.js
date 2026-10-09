const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const pdfParse = require("pdf-parse");

const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Hàm hỗ trợ chuyển đổi Stream file từ S3 sang dạng Buffer (bộ nhớ tạm)
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });

exports.handler = async (event) => {
    try {
        // 1. Nhận thông tin bucket và tên file (key) từ Event truyền vào
        const bucket = event.bucket || event.detail?.bucket?.name;
        const key = event.key || event.detail?.object?.key;

        if (!bucket || !key) {
            throw new Error("Không tìm thấy thông tin S3 bucket hoặc tên file PDF.");
        }

        console.log(`Bắt đầu tải file PDF từ: s3://${bucket}/${key}`);

        // 2. Kéo file PDF và Metadata từ S3 về
        const getObjectParams = {
            Bucket: bucket,
            Key: key
        };
        const s3Response = await s3Client.send(new GetObjectCommand(getObjectParams));
        
        // Đọc ra tên ngành nghề mà mình đã dán nhãn từ trước (ví dụ: Frontend Developer)
        const role = s3Response.Metadata?.["target-role"] || "Cloud Engineer";
        console.log(`Ngành nghề ứng tuyển: ${role}`);

        // Chuyển đổi dữ liệu file sang Buffer
        const pdfBuffer = await streamToBuffer(s3Response.Body);

        console.log("Kéo file hoàn tất. Bắt đầu quá trình bóc tách bằng pdf-parse...");

        // 3. Dùng pdf-parse để đọc chữ (Hoàn toàn miễn phí, không tốn tiền gọi AWS Textract)
        const pdfData = await pdfParse(pdfBuffer);
        const extractedText = pdfData.text;

        console.log("Trích xuất văn bản thành công!");
        console.log("Độ dài văn bản:", extractedText.length, "ký tự.");

        // 4. Trả kết quả chữ thô và ngành nghề về để chuyển cho AI (Bedrock) chấm điểm sau này
        return {
            statusCode: 200,
            bucket: bucket,
            key: key,
            targetRole: role, // Chuyền ngành nghề đi tiếp
            extractedText: extractedText
        };
    } catch (error) {
        console.error("Lỗi khi đọc file PDF:", error);
        throw error;
    }
};
