const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");

const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    try {
        const bucketName = process.env.UPLOAD_BUCKET;
        
        // Lấy tên ngành nghề từ query string do Frontend truyền xuống
        // Nếu không có, mặc định là Cloud Engineer
        const role = event.queryStringParameters?.role || "Cloud Engineer";
        
        const fileId = crypto.randomBytes(8).toString("hex");
        const fileName = `cvs/${fileId}.pdf`;

        // Đính kèm Metadata (Nhãn dán) vào file PDF khi lưu lên S3
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            ContentType: "application/pdf",
            Metadata: {
                "target-role": role // Dán nhãn ngành nghề cho AI sau này biết đường đọc
            }
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({
                uploadUrl: uploadUrl,
                fileName: fileName,
                role: role
            })
        };
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ message: "Internal server error" })
        };
    }
};
