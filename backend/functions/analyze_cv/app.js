exports.handler = async (event) => {
    try {
        console.log("Nhận dữ liệu để phân tích:");
        
        // Hỗ trợ cả 2 kiểu Event: Gọi trực tiếp hoặc gọi qua API Gateway
        let payload = event;
        if (event.body) {
            payload = JSON.parse(event.body);
        }

        const cvText = payload.extractedText || "";
        const targetRole = payload.targetRole || "IT Professional";

        if (!cvText) {
            throw new Error("Không có dữ liệu CV (extractedText) để phân tích.");
        }

        console.log(`Đang phân tích CV cho vị trí ${targetRole} bằng AI Cục bộ (Bypass Quota)...`);

        // Vì AWS Bedrock bị khóa (Yêu cầu tài khoản trả phí)
        // Và Google Gemini API Key bị giới hạn (Quota = 0)
        // Chúng ta tạm thời sử dụng thuật toán Mock AI phân tích từ khóa để Frontend có thể hoạt động được.
        
        const cvLower = cvText.toLowerCase();
        let score = 50;
        let strengths = [];
        let skillGaps = [];
        let recommendedCerts = [];
        let feedback = "";

        // Phân tích cơ bản dựa trên Role và Text
        if (targetRole.toLowerCase().includes("cloud")) {
            if (cvLower.includes("aws") || cvLower.includes("amazon web services")) { score += 20; strengths.push("Có kiến thức cơ bản về nền tảng AWS"); }
            else { skillGaps.push("Thiếu kinh nghiệm thực tế với AWS (EC2, S3, Lambda)"); }
            
            if (cvLower.includes("docker") || cvLower.includes("kubernetes")) { score += 15; strengths.push("Hiểu biết về Containerization (Docker/K8s)"); }
            else { skillGaps.push("Chưa thấy kỹ năng về Containerization"); }
            
            recommendedCerts = ["AWS Certified Solutions Architect - Associate", "AWS Certified Developer"];
            feedback = score > 70 ? "CV của bạn khá phù hợp cho vị trí Cloud. Hãy tập trung lấy thêm chứng chỉ AWS." : "Bạn cần bổ sung thêm nhiều kỹ năng thực tế về Điện toán đám mây và DevOps.";
        } 
        else if (targetRole.toLowerCase().includes("frontend")) {
            if (cvLower.includes("react") || cvLower.includes("vue") || cvLower.includes("angular")) { score += 20; strengths.push("Sử dụng thành thạo Modern UI Framework"); }
            else { skillGaps.push("Cần bổ sung kỹ năng ReactJS hoặc VueJS"); }
            
            if (cvLower.includes("typescript")) { score += 15; strengths.push("Có kinh nghiệm với TypeScript"); }
            else { skillGaps.push("Nên học thêm TypeScript để code an toàn hơn"); }
            
            recommendedCerts = ["Meta Front-End Developer Professional Certificate", "AWS Certified Cloud Practitioner (để biết deploy web)"];
            feedback = score > 70 ? "Kỹ năng Frontend của bạn rất ổn định, sẵn sàng làm việc." : "Hãy làm thêm nhiều dự án cá nhân (Pet Projects) về React/NextJS.";
        }
        else {
            score = 65;
            strengths = ["Trình bày CV rõ ràng", "Có nền tảng CNTT"];
            skillGaps = ["Chưa làm nổi bật kỹ năng chuyên sâu cho vai trò này", "Thiếu dự án thực tế"];
            recommendedCerts = ["AWS Certified Cloud Practitioner", "Các chứng chỉ lập trình cơ bản trên Coursera"];
            feedback = "CV của bạn ở mức cơ bản. Hãy thêm các từ khóa chuyên ngành và dự án cụ thể hơn.";
        }

        // Đảm bảo điểm không vượt 100
        score = Math.min(score + Math.floor(Math.random() * 10), 98);

        const aiResult = {
            score,
            feedback,
            strengths,
            skillGaps,
            recommendedCerts
        };

        console.log("Phân tích AI Cục bộ thành công!");

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                targetRole: targetRole,
                analysisResult: aiResult
            })
        };

    } catch (error) {
        console.error("Lỗi trong quá trình phân tích:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};
