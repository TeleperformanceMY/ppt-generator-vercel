module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[project]/app/api/generate-ppt/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pptxgenjs$2f$dist$2f$pptxgen$2e$es$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pptxgenjs/dist/pptxgen.es.js [app-route] (ecmascript)");
;
;
// ============================================
// CONFIGURATION
// ============================================
const VALID_API_KEY = process.env.PPT_API_KEY || null;
const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024;
// TP Brand Colors
const TP_COLORS = {
    black: "000000",
    white: "FFFFFF",
    beige: "D4D1CA",
    darkGray: "4A4C6A",
    pink: "ED1E81",
    taupe: "918D80"
};
const STATIC_ASSET_BASE_URL = process.env.STATIC_ASSET_BASE_URL || "http://localhost:3000";
const LOGO_WHITE_URL = "/images/gmt-logo-20tp-rgb-feb-202025-white.png";
const LOGO_BLACK_URL = "/images/gmt-logo-20tp-rgb-feb-202025-black.png";
// Chapter images base URL - set this env var to your Vercel blob storage URL
// Example: https://yourdomain.com/images/chapter/
// Images should be named: image1.png, image2.jpg, etc. (1-33)
const CHAPTER_IMAGE_BASE_URL = process.env.CHAPTER_IMAGE_BASE_URL || "";
// ============================================
// HELPER FUNCTIONS
// ============================================
function resolveAssetUrl(url) {
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    try {
        return new URL(url, STATIC_ASSET_BASE_URL).toString();
    } catch  {
        return url;
    }
}
async function fetchImageAsBase64(url) {
    try {
        const response = await fetch(resolveAssetUrl(url));
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = response.headers.get("content-type") || "image/png";
        return `data:${contentType};base64,${base64}`;
    } catch (error) {
        console.error("Failed to fetch image:", url, error);
        return null;
    }
}
async function getChapterImageUrl(imageNumber) {
    if (!CHAPTER_IMAGE_BASE_URL || imageNumber < 1 || imageNumber > 33) {
        return null;
    }
    // Try different extensions
    const extensions = [
        "png",
        "jpg",
        "jpeg"
    ];
    for (const ext of extensions){
        const url = `${CHAPTER_IMAGE_BASE_URL}/image${imageNumber}.${ext}`;
        try {
            const response = await fetch(url, {
                method: "HEAD"
            });
            if (response.ok) {
                return url;
            }
        } catch  {
            continue;
        }
    }
    return null;
}
// ============================================
// SLIDE MASTER DEFINITIONS
// ============================================
function defineSlideMasters(pptx) {
    // TP_TITLE - Black background title slide
    pptx.defineSlideMaster({
        title: "TP_TITLE",
        background: {
            color: TP_COLORS.black
        }
    });
    // TP_CHAPTER - Chapter divider slide
    pptx.defineSlideMaster({
        title: "TP_CHAPTER",
        background: {
            color: TP_COLORS.black
        }
    });
    // TP_CONTENT_WHITE - White background content
    pptx.defineSlideMaster({
        title: "TP_CONTENT_WHITE",
        background: {
            color: TP_COLORS.white
        },
        slideNumber: {
            x: 9.3,
            y: 5.2,
            color: TP_COLORS.darkGray,
            fontSize: 10
        }
    });
    // TP_CONTENT_BEIGE - Beige background content
    pptx.defineSlideMaster({
        title: "TP_CONTENT_BEIGE",
        background: {
            color: TP_COLORS.beige
        },
        slideNumber: {
            x: 9.3,
            y: 5.2,
            color: TP_COLORS.darkGray,
            fontSize: 10
        }
    });
}
// ============================================
// SLIDE BUILDERS
// ============================================
async function addTitleSlide(pptx, slide) {
    const pptSlide = pptx.addSlide({
        masterName: "TP_TITLE"
    });
    // Main title
    pptSlide.addText(slide.title, {
        x: 0.5,
        y: 2.2,
        w: 9,
        h: 1.2,
        fontSize: 44,
        fontFace: "Calibri",
        color: TP_COLORS.white,
        bold: true,
        align: "left",
        valign: "middle"
    });
    // Subtitle
    if (slide.subtitle) {
        pptSlide.addText(slide.subtitle, {
            x: 0.5,
            y: 3.4,
            w: 9,
            h: 0.8,
            fontSize: 24,
            fontFace: "Calibri Light",
            color: TP_COLORS.beige,
            align: "left",
            valign: "middle"
        });
    }
    // Add white logo
    const logoBase64 = await fetchImageAsBase64(LOGO_WHITE_URL);
    if (logoBase64) {
        pptSlide.addImage({
            data: logoBase64,
            x: 0.3,
            y: 4.8,
            w: 0.5,
            h: 0.5
        });
    }
    // Add tp.com text
    pptSlide.addText("tp.com", {
        x: 0.85,
        y: 4.95,
        w: 1,
        h: 0.3,
        fontSize: 10,
        fontFace: "Calibri",
        color: TP_COLORS.white
    });
}
async function addChapterSlide(pptx, slide) {
    const pptSlide = pptx.addSlide({
        masterName: "TP_CHAPTER"
    });
    // Large chapter number (formatted as 01, 02, etc.)
    const formattedNumber = slide.chapterNumber.toString().padStart(2, "0");
    pptSlide.addText(formattedNumber, {
        x: 0.5,
        y: 1.5,
        w: 3,
        h: 2,
        fontSize: 120,
        fontFace: "Calibri",
        color: TP_COLORS.white,
        bold: true
    });
    // Chapter title
    pptSlide.addText(slide.title, {
        x: 0.5,
        y: 3.5,
        w: 5,
        h: 1,
        fontSize: 32,
        fontFace: "Calibri",
        color: TP_COLORS.white,
        bold: true
    });
    // Add chapter image if specified
    if (slide.chapterImageNumber && CHAPTER_IMAGE_BASE_URL) {
        const imageUrl = await getChapterImageUrl(slide.chapterImageNumber);
        if (imageUrl) {
            const imageBase64 = await fetchImageAsBase64(imageUrl);
            if (imageBase64) {
                pptSlide.addImage({
                    data: imageBase64,
                    x: 5.5,
                    y: 0.5,
                    w: 4,
                    h: 4.5,
                    sizing: {
                        type: "contain",
                        w: 4,
                        h: 4.5
                    }
                });
            }
        }
    }
    // Add white logo
    const logoBase64 = await fetchImageAsBase64(LOGO_WHITE_URL);
    if (logoBase64) {
        pptSlide.addImage({
            data: logoBase64,
            x: 0.3,
            y: 4.8,
            w: 0.5,
            h: 0.5
        });
    }
    pptSlide.addText("tp.com", {
        x: 0.85,
        y: 4.95,
        w: 1,
        h: 0.3,
        fontSize: 10,
        fontFace: "Calibri",
        color: TP_COLORS.white
    });
}
async function addContentSlide(pptx, slide) {
    const pptSlide = pptx.addSlide({
        masterName: slide.master
    });
    const isBeige = slide.master === "TP_CONTENT_BEIGE";
    const textColor = TP_COLORS.black;
    // Title
    pptSlide.addText(slide.title, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.6,
        fontSize: 28,
        fontFace: "Calibri",
        color: textColor,
        bold: true
    });
    // Content
    pptSlide.addText(slide.content, {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 3.5,
        fontSize: 16,
        fontFace: "Calibri Light",
        color: textColor,
        valign: "top",
        paraSpaceAfter: 12
    });
    // Add black logo
    const logoBase64 = await fetchImageAsBase64(LOGO_BLACK_URL);
    if (logoBase64) {
        pptSlide.addImage({
            data: logoBase64,
            x: 0.3,
            y: 4.8,
            w: 0.5,
            h: 0.5
        });
    }
    pptSlide.addText("tp.com", {
        x: 0.85,
        y: 4.95,
        w: 1,
        h: 0.3,
        fontSize: 10,
        fontFace: "Calibri",
        color: TP_COLORS.darkGray
    });
}
async function addBulletsSlide(pptx, slide) {
    const pptSlide = pptx.addSlide({
        masterName: slide.master
    });
    const textColor = TP_COLORS.black;
    // Title
    pptSlide.addText(slide.title, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.6,
        fontSize: 28,
        fontFace: "Calibri",
        color: textColor,
        bold: true
    });
    // Bullet points
    const bulletItems = slide.items.map((item)=>({
            text: item,
            options: {
                bullet: {
                    type: "bullet",
                    color: TP_COLORS.pink
                },
                paraSpaceBefore: 8,
                paraSpaceAfter: 8
            }
        }));
    pptSlide.addText(bulletItems, {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 3.5,
        fontSize: 18,
        fontFace: "Calibri Light",
        color: textColor,
        valign: "top"
    });
    // Add black logo
    const logoBase64 = await fetchImageAsBase64(LOGO_BLACK_URL);
    if (logoBase64) {
        pptSlide.addImage({
            data: logoBase64,
            x: 0.3,
            y: 4.8,
            w: 0.5,
            h: 0.5
        });
    }
    pptSlide.addText("tp.com", {
        x: 0.85,
        y: 4.95,
        w: 1,
        h: 0.3,
        fontSize: 10,
        fontFace: "Calibri",
        color: TP_COLORS.darkGray
    });
}
async function addTwoColumnSlide(pptx, slide) {
    const pptSlide = pptx.addSlide({
        masterName: slide.master
    });
    const textColor = TP_COLORS.black;
    // Title
    pptSlide.addText(slide.title, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.6,
        fontSize: 28,
        fontFace: "Calibri",
        color: textColor,
        bold: true
    });
    // Left column
    pptSlide.addText(slide.leftContent, {
        x: 0.5,
        y: 1.2,
        w: 4.3,
        h: 3.5,
        fontSize: 16,
        fontFace: "Calibri Light",
        color: textColor,
        valign: "top"
    });
    // Right column
    pptSlide.addText(slide.rightContent, {
        x: 5.2,
        y: 1.2,
        w: 4.3,
        h: 3.5,
        fontSize: 16,
        fontFace: "Calibri Light",
        color: textColor,
        valign: "top"
    });
    // Add black logo
    const logoBase64 = await fetchImageAsBase64(LOGO_BLACK_URL);
    if (logoBase64) {
        pptSlide.addImage({
            data: logoBase64,
            x: 0.3,
            y: 4.8,
            w: 0.5,
            h: 0.5
        });
    }
    pptSlide.addText("tp.com", {
        x: 0.85,
        y: 4.95,
        w: 1,
        h: 0.3,
        fontSize: 10,
        fontFace: "Calibri",
        color: TP_COLORS.darkGray
    });
}
async function addImageSlide(pptx, slide) {
    const pptSlide = pptx.addSlide({
        masterName: slide.master
    });
    const textColor = TP_COLORS.black;
    // Title
    pptSlide.addText(slide.title, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.6,
        fontSize: 28,
        fontFace: "Calibri",
        color: textColor,
        bold: true
    });
    // Image
    const imageData = slide.imageBase64.includes("base64,") ? slide.imageBase64 : `data:image/png;base64,${slide.imageBase64}`;
    pptSlide.addImage({
        data: imageData,
        x: 1,
        y: 1.2,
        w: 8,
        h: 3.5,
        sizing: {
            type: "contain",
            w: 8,
            h: 3.5
        }
    });
    // Add black logo
    const logoBase64 = await fetchImageAsBase64(LOGO_BLACK_URL);
    if (logoBase64) {
        pptSlide.addImage({
            data: logoBase64,
            x: 0.3,
            y: 4.8,
            w: 0.5,
            h: 0.5
        });
    }
    pptSlide.addText("tp.com", {
        x: 0.85,
        y: 4.95,
        w: 1,
        h: 0.3,
        fontSize: 10,
        fontFace: "Calibri",
        color: TP_COLORS.darkGray
    });
}
// ============================================
// VALIDATION
// ============================================
function validateRequest(data) {
    if (!data || typeof data !== "object") {
        return {
            valid: false,
            error: {
                error: "Invalid request body",
                code: "INVALID_BODY",
                details: "Request body must be a valid JSON object"
            }
        };
    }
    const req = data;
    if (!req.title || typeof req.title !== "string") {
        return {
            valid: false,
            error: {
                error: "Missing or invalid title",
                code: "INVALID_TITLE",
                details: "The 'title' field must be a non-empty string"
            }
        };
    }
    if (!Array.isArray(req.slides) || req.slides.length === 0) {
        return {
            valid: false,
            error: {
                error: "Missing or invalid slides",
                code: "INVALID_SLIDES",
                details: "The 'slides' field must be a non-empty array"
            }
        };
    }
    const validTypes = [
        "title",
        "chapter",
        "content",
        "bullets",
        "two-column",
        "image"
    ];
    const validMasters = [
        "TP_TITLE",
        "TP_CHAPTER",
        "TP_CONTENT_WHITE",
        "TP_CONTENT_BEIGE"
    ];
    for(let i = 0; i < req.slides.length; i++){
        const slide = req.slides[i];
        if (!slide.type || !validTypes.includes(slide.type)) {
            return {
                valid: false,
                error: {
                    error: `Invalid slide type at index ${i}`,
                    code: "INVALID_SLIDE_TYPE",
                    details: `Slide type must be one of: ${validTypes.join(", ")}`
                }
            };
        }
        if (!slide.master || !validMasters.includes(slide.master)) {
            return {
                valid: false,
                error: {
                    error: `Invalid master at index ${i}`,
                    code: "INVALID_MASTER",
                    details: `Master must be one of: ${validMasters.join(", ")}`
                }
            };
        }
        if (!slide.title || typeof slide.title !== "string") {
            return {
                valid: false,
                error: {
                    error: `Missing title in slide at index ${i}`,
                    code: "MISSING_SLIDE_TITLE"
                }
            };
        }
        // Type-specific validation
        if (slide.type === "content" && typeof slide.content !== "string") {
            return {
                valid: false,
                error: {
                    error: `Missing content in content slide at index ${i}`,
                    code: "MISSING_CONTENT"
                }
            };
        }
        if (slide.type === "bullets" && !Array.isArray(slide.items)) {
            return {
                valid: false,
                error: {
                    error: `Missing items array in bullets slide at index ${i}`,
                    code: "MISSING_ITEMS"
                }
            };
        }
        if (slide.type === "chapter" && typeof slide.chapterNumber !== "number") {
            return {
                valid: false,
                error: {
                    error: `Missing chapterNumber in chapter slide at index ${i}`,
                    code: "MISSING_CHAPTER_NUMBER"
                }
            };
        }
        if (slide.type === "two-column") {
            if (typeof slide.leftContent !== "string" || typeof slide.rightContent !== "string") {
                return {
                    valid: false,
                    error: {
                        error: `Missing leftContent or rightContent in two-column slide at index ${i}`,
                        code: "MISSING_COLUMN_CONTENT"
                    }
                };
            }
        }
        if (slide.type === "image" && typeof slide.imageBase64 !== "string") {
            return {
                valid: false,
                error: {
                    error: `Missing imageBase64 in image slide at index ${i}`,
                    code: "MISSING_IMAGE"
                }
            };
        }
    }
    return {
        valid: true,
        data: req
    };
}
async function POST(request) {
    try {
        const contentLength = request.headers.get("content-length");
        if (contentLength && Number.parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Payload too large",
                code: "PAYLOAD_TOO_LARGE",
                details: `Maximum payload size is ${MAX_PAYLOAD_SIZE / 1024 / 1024}MB`
            }, {
                status: 413
            });
        }
        let body;
        try {
            body = await request.json();
        } catch  {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid JSON",
                code: "INVALID_JSON",
                details: "Request body must be valid JSON"
            }, {
                status: 400
            });
        }
        if (VALID_API_KEY) {
            const apiKey = body?.apiKey || request.headers.get("x-api-key");
            if (apiKey !== VALID_API_KEY) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Unauthorized",
                    code: "UNAUTHORIZED",
                    details: "Invalid or missing API key"
                }, {
                    status: 401
                });
            }
        }
        const validation = validateRequest(body);
        if (!validation.valid) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(validation.error, {
                status: 400
            });
        }
        const { title, slides } = validation.data;
        const pptx = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pptxgenjs$2f$dist$2f$pptxgen$2e$es$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]();
        pptx.title = title;
        pptx.author = "TP PPT Generator";
        pptx.company = "Teleperformance";
        pptx.layout = "LAYOUT_16x9";
        defineSlideMasters(pptx);
        // Build slides (async for image fetching)
        for (const slide of slides){
            switch(slide.type){
                case "title":
                    await addTitleSlide(pptx, slide);
                    break;
                case "chapter":
                    await addChapterSlide(pptx, slide);
                    break;
                case "content":
                    await addContentSlide(pptx, slide);
                    break;
                case "bullets":
                    await addBulletsSlide(pptx, slide);
                    break;
                case "two-column":
                    await addTwoColumnSlide(pptx, slide);
                    break;
                case "image":
                    await addImageSlide(pptx, slide);
                    break;
            }
        }
        const base64Data = await pptx.write({
            outputType: "base64"
        });
        const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
        const fileName = `${sanitizedTitle}_${Date.now()}.pptx`;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            fileName,
            fileBase64: base64Data
        });
    } catch (error) {
        console.error("PPT Generation Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error",
            code: "INTERNAL_ERROR",
            details: error instanceof Error ? error.message : "Unknown error occurred"
        }, {
            status: 500
        });
    }
}
async function GET() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        status: "ok",
        service: "TP PPT Generator API",
        version: "2.0.0",
        endpoints: {
            POST: "/api/generate-ppt"
        },
        supportedSlideTypes: [
            "title",
            "chapter",
            "content",
            "bullets",
            "two-column",
            "image"
        ],
        slideMasters: [
            "TP_TITLE",
            "TP_CHAPTER",
            "TP_CONTENT_WHITE",
            "TP_CONTENT_BEIGE"
        ],
        chapterImagesConfigured: !!CHAPTER_IMAGE_BASE_URL
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0ffc1c75._.js.map