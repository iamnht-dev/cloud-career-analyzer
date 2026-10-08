const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");

const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    try {
        const bucketName = process.env.UPLOAD_BUCKET;
        
        // Tạo tên file ngẫu nhiên để không bị trùng (Vd: cvs/1a2b3c4d.pdf)
        const fileId = crypto.randomBytes(8).toString("hex");
        const fileName = `cvs/${fileId}.pdf`;

        // Định nghĩa lệnh upload
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            ContentType: "application/pdf"
        });

        // Lấy Presigned URL có thời hạn 5 phút (300 giây)
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({
                uploadUrl: uploadUrl,
                fileName: fileName
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
