import { type NextRequest, NextResponse } from "next/server"
import PptxGenJS from "pptxgenjs"

// ============================================
// TYPE DEFINITIONS
// ============================================

interface TitleSlide {
  type: "title"
  master: "TP_TITLE"
  title: string
  subtitle?: string
}

interface ChapterSlide {
  type: "chapter"
  master: "TP_CHAPTER"
  chapterNumber: number
  title: string
  chapterImageNumber?: number // 1-33 for dynamic chapter images
}

interface ContentSlide {
  type: "content"
  master: "TP_CONTENT_WHITE" | "TP_CONTENT_BEIGE"
  title: string
  content: string
}

interface BulletsSlide {
  type: "bullets"
  master: "TP_CONTENT_WHITE" | "TP_CONTENT_BEIGE"
  title: string
  items: string[]
}

interface TwoColumnSlide {
  type: "two-column"
  master: "TP_CONTENT_WHITE" | "TP_CONTENT_BEIGE"
  title: string
  leftContent: string
  rightContent: string
}

interface ImageSlide {
  type: "image"
  master: "TP_CONTENT_WHITE" | "TP_CONTENT_BEIGE"
  title: string
  imageBase64: string
}

type Slide = TitleSlide | ChapterSlide | ContentSlide | BulletsSlide | TwoColumnSlide | ImageSlide

interface PresentationRequest {
  title: string
  slides: Slide[]
  apiKey?: string
}

interface PresentationResponse {
  fileName: string
  fileBase64: string
}

interface ErrorResponse {
  error: string
  code: string
  details?: string
}

// ============================================
// CONFIGURATION
// ============================================

const VALID_API_KEY = process.env.PPT_API_KEY || null
const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024

// TP Brand Colors
const TP_COLORS = {
  black: "000000",
  white: "FFFFFF",
  beige: "D4D1CA",
  darkGray: "4A4C6A",
  pink: "ED1E81",
  taupe: "918D80",
}

// Logo URLs (direct URLs - no filesystem access needed)
const LOGO_WHITE_URL = "/images/gmt-logo-20tp-rgb-feb-202025-white.png"
const LOGO_BLACK_URL = "/images/gmt-logo-20tp-rgb-feb-202025-black.png"

// Chapter images base URL - set this env var to your Vercel blob storage URL
// Example: https://yourdomain.com/images/chapter/
// Images should be named: image1.png, image2.jpg, etc. (1-33)
const CHAPTER_IMAGE_BASE_URL = process.env.CHAPTER_IMAGE_BASE_URL || ""

// ============================================
// HELPER FUNCTIONS
// ============================================

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const contentType = response.headers.get("content-type") || "image/png"
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error("Failed to fetch image:", url, error)
    return null
  }
}

async function getChapterImageUrl(imageNumber: number): Promise<string | null> {
  if (!CHAPTER_IMAGE_BASE_URL || imageNumber < 1 || imageNumber > 33) {
    return null
  }

  // Try different extensions
  const extensions = ["png", "jpg", "jpeg"]
  for (const ext of extensions) {
    const url = `${CHAPTER_IMAGE_BASE_URL}/image${imageNumber}.${ext}`
    try {
      const response = await fetch(url, { method: "HEAD" })
      if (response.ok) {
        return url
      }
    } catch {
      continue
    }
  }
  return null
}

// ============================================
// SLIDE MASTER DEFINITIONS
// ============================================

function defineSlideMasters(pptx: PptxGenJS): void {
  // TP_TITLE - Black background title slide
  pptx.defineSlideMaster({
    title: "TP_TITLE",
    background: { color: TP_COLORS.black },
  })

  // TP_CHAPTER - Chapter divider slide
  pptx.defineSlideMaster({
    title: "TP_CHAPTER",
    background: { color: TP_COLORS.black },
  })

  // TP_CONTENT_WHITE - White background content
  pptx.defineSlideMaster({
    title: "TP_CONTENT_WHITE",
    background: { color: TP_COLORS.white },
    slideNumber: { x: 9.3, y: 5.2, color: TP_COLORS.darkGray, fontSize: 10 },
  })

  // TP_CONTENT_BEIGE - Beige background content
  pptx.defineSlideMaster({
    title: "TP_CONTENT_BEIGE",
    background: { color: TP_COLORS.beige },
    slideNumber: { x: 9.3, y: 5.2, color: TP_COLORS.darkGray, fontSize: 10 },
  })
}

// ============================================
// SLIDE BUILDERS
// ============================================

async function addTitleSlide(pptx: PptxGenJS, slide: TitleSlide): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: "TP_TITLE" })

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
    valign: "middle",
  })

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
      valign: "middle",
    })
  }

  // Add white logo
  const logoBase64 = await fetchImageAsBase64(LOGO_WHITE_URL)
  if (logoBase64) {
    pptSlide.addImage({
      data: logoBase64,
      x: 0.3,
      y: 4.8,
      w: 0.5,
      h: 0.5,
    })
  }

  // Add tp.com text
  pptSlide.addText("tp.com", {
    x: 0.85,
    y: 4.95,
    w: 1,
    h: 0.3,
    fontSize: 10,
    fontFace: "Calibri",
    color: TP_COLORS.white,
  })
}

async function addChapterSlide(pptx: PptxGenJS, slide: ChapterSlide): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: "TP_CHAPTER" })

  // Large chapter number (formatted as 01, 02, etc.)
  const formattedNumber = slide.chapterNumber.toString().padStart(2, "0")
  pptSlide.addText(formattedNumber, {
    x: 0.5,
    y: 1.5,
    w: 3,
    h: 2,
    fontSize: 120,
    fontFace: "Calibri",
    color: TP_COLORS.white,
    bold: true,
  })

  // Chapter title
  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 3.5,
    w: 5,
    h: 1,
    fontSize: 32,
    fontFace: "Calibri",
    color: TP_COLORS.white,
    bold: true,
  })

  // Add chapter image if specified
  if (slide.chapterImageNumber && CHAPTER_IMAGE_BASE_URL) {
    const imageUrl = await getChapterImageUrl(slide.chapterImageNumber)
    if (imageUrl) {
      const imageBase64 = await fetchImageAsBase64(imageUrl)
      if (imageBase64) {
        pptSlide.addImage({
          data: imageBase64,
          x: 5.5,
          y: 0.5,
          w: 4,
          h: 4.5,
          sizing: { type: "contain", w: 4, h: 4.5 },
        })
      }
    }
  }

  // Add white logo
  const logoBase64 = await fetchImageAsBase64(LOGO_WHITE_URL)
  if (logoBase64) {
    pptSlide.addImage({
      data: logoBase64,
      x: 0.3,
      y: 4.8,
      w: 0.5,
      h: 0.5,
    })
  }

  pptSlide.addText("tp.com", {
    x: 0.85,
    y: 4.95,
    w: 1,
    h: 0.3,
    fontSize: 10,
    fontFace: "Calibri",
    color: TP_COLORS.white,
  })
}

async function addContentSlide(pptx: PptxGenJS, slide: ContentSlide): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: slide.master })
  const isBeige = slide.master === "TP_CONTENT_BEIGE"
  const textColor = TP_COLORS.black

  // Title
  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 28,
    fontFace: "Calibri",
    color: textColor,
    bold: true,
  })

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
    paraSpaceAfter: 12,
  })

  // Add black logo
  const logoBase64 = await fetchImageAsBase64(LOGO_BLACK_URL)
  if (logoBase64) {
    pptSlide.addImage({
      data: logoBase64,
      x: 0.3,
      y: 4.8,
      w: 0.5,
      h: 0.5,
    })
  }

  pptSlide.addText("tp.com", {
    x: 0.85,
    y: 4.95,
    w: 1,
    h: 0.3,
    fontSize: 10,
    fontFace: "Calibri",
    color: TP_COLORS.darkGray,
  })
}

async function addBulletsSlide(pptx: PptxGenJS, slide: BulletsSlide): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: slide.master })
  const textColor = TP_COLORS.black

  // Title
  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 28,
    fontFace: "Calibri",
    color: textColor,
    bold: true,
  })

  // Bullet points
  const bulletItems = slide.items.map((item) => ({
    text: item,
    options: {
      bullet: { type: "bullet" as const, color: TP_COLORS.pink },
      paraSpaceBefore: 8,
      paraSpaceAfter: 8,
    },
  }))

  pptSlide.addText(bulletItems, {
    x: 0.5,
    y: 1.2,
    w: 9,
    h: 3.5,
    fontSize: 18,
    fontFace: "Calibri Light",
    color: textColor,
    valign: "top",
  })

  // Add black logo
  const logoBase64 = await fetchImageAsBase64(LOGO_BLACK_URL)
  if (logoBase64) {
    pptSlide.addImage({
      data: logoBase64,
      x: 0.3,
      y: 4.8,
      w: 0.5,
      h: 0.5,
    })
  }

  pptSlide.addText("tp.com", {
    x: 0.85,
    y: 4.95,
    w: 1,
    h: 0.3,
    fontSize: 10,
    fontFace: "Calibri",
    color: TP_COLORS.darkGray,
  })
}

async function addTwoColumnSlide(pptx: PptxGenJS, slide: TwoColumnSlide): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: slide.master })
  const textColor = TP_COLORS.black

  // Title
  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 28,
    fontFace: "Calibri",
    color: textColor,
    bold: true,
  })

  // Left column
  pptSlide.addText(slide.leftContent, {
    x: 0.5,
    y: 1.2,
    w: 4.3,
    h: 3.5,
    fontSize: 16,
    fontFace: "Calibri Light",
    color: textColor,
    valign: "top",
  })

  // Right column
  pptSlide.addText(slide.rightContent, {
    x: 5.2,
    y: 1.2,
    w: 4.3,
    h: 3.5,
    fontSize: 16,
    fontFace: "Calibri Light",
    color: textColor,
    valign: "top",
  })

  // Add black logo
  const logoBase64 = await fetchImageAsBase64(LOGO_BLACK_URL)
  if (logoBase64) {
    pptSlide.addImage({
      data: logoBase64,
      x: 0.3,
      y: 4.8,
      w: 0.5,
      h: 0.5,
    })
  }

  pptSlide.addText("tp.com", {
    x: 0.85,
    y: 4.95,
    w: 1,
    h: 0.3,
    fontSize: 10,
    fontFace: "Calibri",
    color: TP_COLORS.darkGray,
  })
}

async function addImageSlide(pptx: PptxGenJS, slide: ImageSlide): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: slide.master })
  const textColor = TP_COLORS.black

  // Title
  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 28,
    fontFace: "Calibri",
    color: textColor,
    bold: true,
  })

  // Image
  const imageData = slide.imageBase64.includes("base64,")
    ? slide.imageBase64
    : `data:image/png;base64,${slide.imageBase64}`

  pptSlide.addImage({
    data: imageData,
    x: 1,
    y: 1.2,
    w: 8,
    h: 3.5,
    sizing: { type: "contain", w: 8, h: 3.5 },
  })

  // Add black logo
  const logoBase64 = await fetchImageAsBase64(LOGO_BLACK_URL)
  if (logoBase64) {
    pptSlide.addImage({
      data: logoBase64,
      x: 0.3,
      y: 4.8,
      w: 0.5,
      h: 0.5,
    })
  }

  pptSlide.addText("tp.com", {
    x: 0.85,
    y: 4.95,
    w: 1,
    h: 0.3,
    fontSize: 10,
    fontFace: "Calibri",
    color: TP_COLORS.darkGray,
  })
}

// ============================================
// VALIDATION
// ============================================

function validateRequest(
  data: unknown,
): { valid: true; data: PresentationRequest } | { valid: false; error: ErrorResponse } {
  if (!data || typeof data !== "object") {
    return {
      valid: false,
      error: {
        error: "Invalid request body",
        code: "INVALID_BODY",
        details: "Request body must be a valid JSON object",
      },
    }
  }

  const req = data as Record<string, unknown>

  if (!req.title || typeof req.title !== "string") {
    return {
      valid: false,
      error: {
        error: "Missing or invalid title",
        code: "INVALID_TITLE",
        details: "The 'title' field must be a non-empty string",
      },
    }
  }

  if (!Array.isArray(req.slides) || req.slides.length === 0) {
    return {
      valid: false,
      error: {
        error: "Missing or invalid slides",
        code: "INVALID_SLIDES",
        details: "The 'slides' field must be a non-empty array",
      },
    }
  }

  const validTypes = ["title", "chapter", "content", "bullets", "two-column", "image"]
  const validMasters = ["TP_TITLE", "TP_CHAPTER", "TP_CONTENT_WHITE", "TP_CONTENT_BEIGE"]

  for (let i = 0; i < req.slides.length; i++) {
    const slide = req.slides[i] as Record<string, unknown>

    if (!slide.type || !validTypes.includes(slide.type as string)) {
      return {
        valid: false,
        error: {
          error: `Invalid slide type at index ${i}`,
          code: "INVALID_SLIDE_TYPE",
          details: `Slide type must be one of: ${validTypes.join(", ")}`,
        },
      }
    }

    if (!slide.master || !validMasters.includes(slide.master as string)) {
      return {
        valid: false,
        error: {
          error: `Invalid master at index ${i}`,
          code: "INVALID_MASTER",
          details: `Master must be one of: ${validMasters.join(", ")}`,
        },
      }
    }

    if (!slide.title || typeof slide.title !== "string") {
      return {
        valid: false,
        error: {
          error: `Missing title in slide at index ${i}`,
          code: "MISSING_SLIDE_TITLE",
        },
      }
    }

    // Type-specific validation
    if (slide.type === "content" && typeof slide.content !== "string") {
      return {
        valid: false,
        error: {
          error: `Missing content in content slide at index ${i}`,
          code: "MISSING_CONTENT",
        },
      }
    }

    if (slide.type === "bullets" && !Array.isArray(slide.items)) {
      return {
        valid: false,
        error: {
          error: `Missing items array in bullets slide at index ${i}`,
          code: "MISSING_ITEMS",
        },
      }
    }

    if (slide.type === "chapter" && typeof slide.chapterNumber !== "number") {
      return {
        valid: false,
        error: {
          error: `Missing chapterNumber in chapter slide at index ${i}`,
          code: "MISSING_CHAPTER_NUMBER",
        },
      }
    }

    if (slide.type === "two-column") {
      if (typeof slide.leftContent !== "string" || typeof slide.rightContent !== "string") {
        return {
          valid: false,
          error: {
            error: `Missing leftContent or rightContent in two-column slide at index ${i}`,
            code: "MISSING_COLUMN_CONTENT",
          },
        }
      }
    }

    if (slide.type === "image" && typeof slide.imageBase64 !== "string") {
      return {
        valid: false,
        error: {
          error: `Missing imageBase64 in image slide at index ${i}`,
          code: "MISSING_IMAGE",
        },
      }
    }
  }

  return { valid: true, data: req as unknown as PresentationRequest }
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse<PresentationResponse | ErrorResponse>> {
  try {
    const contentLength = request.headers.get("content-length")
    if (contentLength && Number.parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        {
          error: "Payload too large",
          code: "PAYLOAD_TOO_LARGE",
          details: `Maximum payload size is ${MAX_PAYLOAD_SIZE / 1024 / 1024}MB`,
        },
        { status: 413 },
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON",
          code: "INVALID_JSON",
          details: "Request body must be valid JSON",
        },
        { status: 400 },
      )
    }

    if (VALID_API_KEY) {
      const apiKey = (body as Record<string, unknown>)?.apiKey || request.headers.get("x-api-key")
      if (apiKey !== VALID_API_KEY) {
        return NextResponse.json(
          {
            error: "Unauthorized",
            code: "UNAUTHORIZED",
            details: "Invalid or missing API key",
          },
          { status: 401 },
        )
      }
    }

    const validation = validateRequest(body)
    if (!validation.valid) {
      return NextResponse.json(validation.error, { status: 400 })
    }

    const { title, slides } = validation.data

    const pptx = new PptxGenJS()
    pptx.title = title
    pptx.author = "TP PPT Generator"
    pptx.company = "Teleperformance"
    pptx.layout = "LAYOUT_16x9"

    defineSlideMasters(pptx)

    // Build slides (async for image fetching)
    for (const slide of slides) {
      switch (slide.type) {
        case "title":
          await addTitleSlide(pptx, slide)
          break
        case "chapter":
          await addChapterSlide(pptx, slide)
          break
        case "content":
          await addContentSlide(pptx, slide)
          break
        case "bullets":
          await addBulletsSlide(pptx, slide)
          break
        case "two-column":
          await addTwoColumnSlide(pptx, slide)
          break
        case "image":
          await addImageSlide(pptx, slide)
          break
      }
    }

    const base64Data = await pptx.write({ outputType: "base64" })
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50)
    const fileName = `${sanitizedTitle}_${Date.now()}.pptx`

    return NextResponse.json({
      fileName,
      fileBase64: base64Data as string,
    })
  } catch (error) {
    console.error("PPT Generation Error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    service: "TP PPT Generator API",
    version: "2.0.0",
    endpoints: {
      POST: "/api/generate-ppt",
    },
    supportedSlideTypes: ["title", "chapter", "content", "bullets", "two-column", "image"],
    slideMasters: ["TP_TITLE", "TP_CHAPTER", "TP_CONTENT_WHITE", "TP_CONTENT_BEIGE"],
    chapterImagesConfigured: !!CHAPTER_IMAGE_BASE_URL,
  })
}
