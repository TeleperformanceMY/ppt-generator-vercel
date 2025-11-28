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
    purple: "4A4C6A",
    purpleLight: "6B6D8A",
    pink: "ED1E81",
    gray: "666666",
    lightGray: "CCCCCC"
};
const STATIC_ASSET_BASE_URL = process.env.STATIC_ASSET_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const LOGO_WHITE_URL = "/images/gmt-logo-20tp-rgb-feb-202025-white.png";
const LOGO_BLACK_URL = "/images/gmt-logo-20tp-rgb-feb-202025-black.png";
// Chapter images base URL - set this env var to your hosted images URL
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
async function getChapterImageBase64(imageNumber) {
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
        const base64 = await fetchImageAsBase64(url);
        if (base64) return base64;
    }
    return null;
}
// ============================================
// SLIDE MASTER DEFINITIONS
// ============================================
function defineSlideMasters(pptx) {
    pptx.defineSlideMaster({
        title: "TP_TITLE",
        background: {
            color: TP_COLORS.black
        }
    });
    pptx.defineSlideMaster({
        title: "TP_CHAPTER",
        background: {
            color: TP_COLORS.white
        }
    });
    pptx.defineSlideMaster({
        title: "TP_CONTENT_WHITE",
        background: {
            color: TP_COLORS.white
        }
    });
    pptx.defineSlideMaster({
        title: "TP_CONTENT_BEIGE",
        background: {
            color: TP_COLORS.beige
        }
    });
}
// ============================================
// FOOTER HELPER - Adds consistent footer to content slides
// ============================================
async function addContentFooter(pptSlide, presentationTitle, slideNumber, useDarkLogo = true) {
    pptSlide.addShape("line", {
        x: 0.3,
        y: 5.0,
        w: 9.4,
        h: 0,
        line: {
            color: TP_COLORS.lightGray,
            width: 0.5
        }
    });
    const logoUrl = useDarkLogo ? LOGO_BLACK_URL : LOGO_WHITE_URL;
    const logoBase64 = await fetchImageAsBase64(logoUrl);
    if (logoBase64) {
        pptSlide.addImage({
            data: logoBase64,
            x: 0.3,
            y: 5.1,
            w: 0.25,
            h: 0.25
        });
    }
    pptSlide.addText("tp.com", {
        x: 0.6,
        y: 5.12,
        w: 0.6,
        h: 0.2,
        fontSize: 8,
        fontFace: "Calibri",
        color: useDarkLogo ? TP_COLORS.gray : TP_COLORS.white
    });
    pptSlide.addShape("line", {
        x: 8.4,
        y: 5.1,
        w: 0,
        h: 0.25,
        line: {
            color: TP_COLORS.lightGray,
            width: 0.5
        }
    });
    pptSlide.addText(presentationTitle, {
        x: 6.5,
        y: 5.12,
        w: 1.8,
        h: 0.2,
        fontSize: 8,
        fontFace: "Calibri",
        color: useDarkLogo ? TP_COLORS.gray : TP_COLORS.white,
        align: "right"
    });
    pptSlide.addShape("line", {
        x: 8.6,
        y: 5.1,
        w: 0,
        h: 0.25,
        line: {
            color: TP_COLORS.lightGray,
            width: 0.5
        }
    });
    pptSlide.addText(slideNumber.toString(), {
        x: 8.7,
        y: 5.12,
        w: 0.5,
        h: 0.2,
        fontSize: 8,
        fontFace: "Calibri",
        color: useDarkLogo ? TP_COLORS.gray : TP_COLORS.white,
        align: "center"
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
    // White logo - smaller
    const logoBase64 = await fetchImageAsBase64(LOGO_WHITE_URL);
    if (logoBase64) {
        pptSlide.addImage({
            data: logoBase64,
            x: 0.3,
            y: 5.1,
            w: 0.25,
            h: 0.25
        });
    }
    pptSlide.addText("tp.com", {
        x: 0.6,
        y: 5.12,
        w: 0.6,
        h: 0.2,
        fontSize: 8,
        fontFace: "Calibri",
        color: TP_COLORS.white
    });
}
async function addChapterSlide(pptx, slide) {
    const pptSlide = pptx.addSlide({
        masterName: "TP_CHAPTER"
    });
    pptSlide.addShape("rect", {
        x: 5,
        y: 0,
        w: 5,
        h: 5.63,
        fill: {
            color: TP_COLORS.purple
        },
        line: {
            color: TP_COLORS.purple
        }
    });
    let hasImage = false;
    if (slide.chapterImageBase64) {
        const imageData = slide.chapterImageBase64.includes("base64,") ? slide.chapterImageBase64 : `data:image/png;base64,${slide.chapterImageBase64}`;
        pptSlide.addImage({
            data: imageData,
            x: 0,
            y: 0,
            w: 5,
            h: 5.63,
            sizing: {
                type: "cover",
                w: 5,
                h: 5.63
            }
        });
        hasImage = true;
    } else if (slide.chapterImageNumber) {
        const imageBase64 = await getChapterImageBase64(slide.chapterImageNumber);
        if (imageBase64) {
            pptSlide.addImage({
                data: imageBase64,
                x: 0,
                y: 0,
                w: 5,
                h: 5.63,
                sizing: {
                    type: "cover",
                    w: 5,
                    h: 5.63
                }
            });
            hasImage = true;
        }
    }
    // If no image, add a subtle gray placeholder on left
    if (!hasImage) {
        pptSlide.addShape("rect", {
            x: 0,
            y: 0,
            w: 5,
            h: 5.63,
            fill: {
                color: TP_COLORS.beige
            }
        });
    }
    const logoBase64 = await fetchImageAsBase64(LOGO_WHITE_URL);
    if (logoBase64) {
        pptSlide.addImage({
            data: logoBase64,
            x: 9.2,
            y: 0.3,
            w: 0.4,
            h: 0.4
        });
    }
    const formattedNumber = slide.chapterNumber.toString().padStart(2, "0");
    pptSlide.addText(formattedNumber, {
        x: 5.3,
        y: 0.8,
        w: 4.2,
        h: 1.5,
        fontSize: 72,
        fontFace: "Calibri Light",
        color: TP_COLORS.purpleLight,
        align: "right"
    });
    pptSlide.addShape("rect", {
        x: 5.5,
        y: 2.5,
        w: 4,
        h: 1.2,
        fill: {
            type: "none"
        },
        line: {
            color: TP_COLORS.white,
            width: 1,
            dashType: "dash"
        }
    });
    pptSlide.addText(slide.title, {
        x: 5.6,
        y: 2.6,
        w: 3.8,
        h: 1,
        fontSize: 24,
        fontFace: "Calibri",
        color: TP_COLORS.white,
        align: "center",
        valign: "middle",
        italic: true
    });
    if (slide.subtitle) {
        // Line above subtitle
        pptSlide.addShape("line", {
            x: 5.5,
            y: 4.0,
            w: 4,
            h: 0,
            line: {
                color: TP_COLORS.white,
                width: 0.5
            }
        });
        pptSlide.addText(slide.subtitle, {
            x: 5.5,
            y: 4.1,
            w: 4,
            h: 0.5,
            fontSize: 14,
            fontFace: "Calibri",
            color: TP_COLORS.white,
            align: "center"
        });
    }
    pptSlide.addShape("rect", {
        x: 5,
        y: 5.43,
        w: 5,
        h: 0.2,
        fill: {
            color: TP_COLORS.pink
        },
        line: {
            color: TP_COLORS.pink
        }
    });
}
async function addContentSlide(pptx, slide, presentationTitle, slideNumber) {
    const pptSlide = pptx.addSlide({
        masterName: slide.master
    });
    let yOffset = 0.3;
    if (slide.headerText) {
        pptSlide.addText(slide.headerText, {
            x: 0.5,
            y: yOffset,
            w: 9,
            h: 0.3,
            fontSize: 12,
            fontFace: "Calibri",
            color: TP_COLORS.pink
        });
        yOffset += 0.35;
    }
    // Title
    pptSlide.addText(slide.title, {
        x: 0.5,
        y: yOffset,
        w: 9,
        h: 0.7,
        fontSize: 32,
        fontFace: "Calibri",
        color: TP_COLORS.black,
        bold: true
    });
    // Content
    pptSlide.addText(slide.content, {
        x: 0.5,
        y: yOffset + 0.9,
        w: 9,
        h: 3.2,
        fontSize: 16,
        fontFace: "Calibri Light",
        color: TP_COLORS.black,
        valign: "top",
        paraSpaceAfter: 12
    });
    await addContentFooter(pptSlide, presentationTitle, slideNumber, true);
}
async function addBulletsSlide(pptx, slide, presentationTitle, slideNumber) {
    const pptSlide = pptx.addSlide({
        masterName: slide.master
    });
    let yOffset = 0.3;
    if (slide.headerText) {
        pptSlide.addText(slide.headerText, {
            x: 0.5,
            y: yOffset,
            w: 9,
            h: 0.3,
            fontSize: 12,
            fontFace: "Calibri",
            color: TP_COLORS.pink
        });
        yOffset += 0.35;
    }
    // Title
    pptSlide.addText(slide.title, {
        x: 0.5,
        y: yOffset,
        w: 9,
        h: 0.7,
        fontSize: 32,
        fontFace: "Calibri",
        color: TP_COLORS.black,
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
        y: yOffset + 0.9,
        w: 9,
        h: 3.2,
        fontSize: 18,
        fontFace: "Calibri Light",
        color: TP_COLORS.black,
        valign: "top"
    });
    await addContentFooter(pptSlide, presentationTitle, slideNumber, true);
}
async function addTwoColumnSlide(pptx, slide, presentationTitle, slideNumber) {
    const pptSlide = pptx.addSlide({
        masterName: slide.master
    });
    let yOffset = 0.3;
    if (slide.headerText) {
        pptSlide.addText(slide.headerText, {
            x: 0.5,
            y: yOffset,
            w: 9,
            h: 0.3,
            fontSize: 12,
            fontFace: "Calibri",
            color: TP_COLORS.pink
        });
        yOffset += 0.35;
    }
    // Title
    pptSlide.addText(slide.title, {
        x: 0.5,
        y: yOffset,
        w: 9,
        h: 0.7,
        fontSize: 32,
        fontFace: "Calibri",
        color: TP_COLORS.black,
        bold: true
    });
    // Left column
    pptSlide.addText(slide.leftContent, {
        x: 0.5,
        y: yOffset + 0.9,
        w: 4.3,
        h: 3.2,
        fontSize: 16,
        fontFace: "Calibri Light",
        color: TP_COLORS.black,
        valign: "top"
    });
    // Right column
    pptSlide.addText(slide.rightContent, {
        x: 5.2,
        y: yOffset + 0.9,
        w: 4.3,
        h: 3.2,
        fontSize: 16,
        fontFace: "Calibri Light",
        color: TP_COLORS.black,
        valign: "top"
    });
    await addContentFooter(pptSlide, presentationTitle, slideNumber, true);
}
async function addImageSlide(pptx, slide, presentationTitle, slideNumber) {
    const pptSlide = pptx.addSlide({
        masterName: slide.master
    });
    let yOffset = 0.3;
    if (slide.headerText) {
        pptSlide.addText(slide.headerText, {
            x: 0.5,
            y: yOffset,
            w: 9,
            h: 0.3,
            fontSize: 12,
            fontFace: "Calibri",
            color: TP_COLORS.pink
        });
        yOffset += 0.35;
    }
    // Title
    pptSlide.addText(slide.title, {
        x: 0.5,
        y: yOffset,
        w: 9,
        h: 0.7,
        fontSize: 32,
        fontFace: "Calibri",
        color: TP_COLORS.black,
        bold: true
    });
    // Image
    const imageData = slide.imageBase64.includes("base64,") ? slide.imageBase64 : `data:image/png;base64,${slide.imageBase64}`;
    pptSlide.addImage({
        data: imageData,
        x: 1,
        y: yOffset + 0.9,
        w: 8,
        h: 3.2,
        sizing: {
            type: "contain",
            w: 8,
            h: 3.2
        }
    });
    await addContentFooter(pptSlide, presentationTitle, slideNumber, true);
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
        // Build slides - track slide number for footer
        let slideNumber = 1;
        for (const slide of slides){
            switch(slide.type){
                case "title":
                    await addTitleSlide(pptx, slide);
                    break;
                case "chapter":
                    await addChapterSlide(pptx, slide);
                    break;
                case "content":
                    await addContentSlide(pptx, slide, title, slideNumber);
                    break;
                case "bullets":
                    await addBulletsSlide(pptx, slide, title, slideNumber);
                    break;
                case "two-column":
                    await addTwoColumnSlide(pptx, slide, title, slideNumber);
                    break;
                case "image":
                    await addImageSlide(pptx, slide, title, slideNumber);
                    break;
            }
            slideNumber++;
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
        version: "2.1.0",
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