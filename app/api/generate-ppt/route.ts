import { type NextRequest, NextResponse } from "next/server"
import PptxGenJS from "pptxgenjs"

// ============================================
// TYPE DEFINITIONS
// ============================================

// TODO: Add more slide types as needed (e.g., "two-column", "chart", "table")
interface TitleSlide {
  type: "title"
  master: "TP_TITLE"
  title: string
  subtitle?: string
}

interface ChapterSlide {
  type: "chapter"
  master: "TP_CHAPTER"
  title: string
  chapterNumber: number
  // TODO: Upload chapter images to /public/images/chapter/image1.png through image33.png (or .jpg/.jpeg)
  // Then pass chapterImageNumber (1-33) to select which image to use
  chapterImageNumber?: number
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

interface ImageSlide {
  type: "image"
  master: "TP_CONTENT_WHITE" | "TP_CONTENT_BEIGE"
  title: string
  imageBase64: string
}

interface TwoColumnSlide {
  type: "two-column"
  master: "TP_CONTENT_WHITE" | "TP_CONTENT_BEIGE"
  title: string
  leftContent: string
  rightContent: string
}

type Slide = TitleSlide | ChapterSlide | ContentSlide | BulletsSlide | ImageSlide | TwoColumnSlide

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
// CONFIGURATION - CUSTOMIZE THESE VALUES
// ============================================

// TODO: Set your API key in Vercel environment variables for production
const VALID_API_KEY = process.env.PPT_API_KEY || null

// TODO: Adjust max payload size if needed (currently 10MB)
const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024

// ============================================
// BRAND COLORS - TELEPERFORMANCE PALETTE
// TODO: Update these hex codes to match your brand guidelines
// ============================================
const COLORS = {
  // Primary colors
  BLACK: "000000",
  WHITE: "FFFFFF",

  // Neutral colors (from TP brand guidelines)
  BEIGE: "D4D1CA", // Warm gray background
  TAUPE: "918D80", // Secondary neutral
  LIGHT_GRAY: "C2C7CC", // Light accents

  // Accent colors (use sparingly per brand guidelines)
  PINK: "ED1E81", // For highlights only
  MAGENTA: "FF0082", // Alternative pink

  // Purple palette (minimal use)
  PURPLE_DARK: "4C3193",
  PURPLE_MID: "706297",
  PURPLE_LIGHT: "848DAC",

  // Text colors
  DARK_GRAY: "4A4C6A", // For body text on light backgrounds
}

// ============================================
// LOGO URLS - UPDATE AFTER HOSTING ON VERCEL
// TODO: After deploying to Vercel, update these URLs to your hosted logo files
// ============================================
const LOGOS = {
  // White logo for dark backgrounds
  WHITE: "/images/gmt-logo-20tp-rgb-feb-202025-white.png",
  // Black logo for light backgrounds
  BLACK: "/images/gmt-logo-20tp-rgb-feb-202025-black.png",
}

// ============================================
// CHAPTER IMAGES CONFIGURATION
// TODO: Upload your 33 chapter images to Vercel Blob or your hosting
// Format: Replace {N} with the image number (1-33)
// Supported formats: .png, .jpg, .jpeg
// ============================================
const CHAPTER_IMAGE_BASE_URL =
  process.env.CHAPTER_IMAGE_BASE_URL || "https://your-vercel-domain.vercel.app/images/chapter/"

// Helper function to get chapter image URL
function getChapterImageUrl(imageNumber: number): string {
  // TODO: Update this function based on your actual image naming convention
  // Current expected format: image1.png, image2.jpg, etc.
  // The API will try .png first, then .jpg, then .jpeg
  return `${CHAPTER_IMAGE_BASE_URL}image${imageNumber}`
}

// ============================================
// FONTS - TELEPERFORMANCE BRAND FONTS
// TODO: Update font names if your brand uses different fonts
// Note: Calibri is a Microsoft font, so it should work in PowerPoint
// ============================================
const FONTS = {
  HEADING: "Calibri", // For titles and headings
  BODY: "Calibri Light", // For body text (lighter weight)
}

// ============================================
// SLIDE DIMENSIONS AND POSITIONS
// TODO: Adjust these values to match your exact slide master layouts
// All values are in inches
// ============================================
const LAYOUT = {
  // Logo positioning (bottom-left corner)
  LOGO: {
    X: 0.3,
    Y: 4.9,
    WIDTH: 0.4,
    HEIGHT: 0.4,
  },
  // Footer text position (next to logo)
  FOOTER: {
    X: 0.75,
    Y: 5.05,
  },
  // Slide number position
  SLIDE_NUMBER: {
    X: 9.2,
    Y: 5.05,
  },
  // Title slide text positions
  TITLE_SLIDE: {
    TITLE_Y: 2.0,
    SUBTITLE_Y: 3.2,
  },
  // Content area margins
  CONTENT: {
    MARGIN_X: 0.5,
    MARGIN_TOP: 1.2,
    WIDTH: 9.0,
  },
  // Chapter slide positions
  CHAPTER: {
    NUMBER_X: 0.5,
    NUMBER_Y: 1.5,
    TITLE_X: 0.5,
    TITLE_Y: 3.0,
    IMAGE_X: 6.0,
    IMAGE_Y: 1.0,
    IMAGE_WIDTH: 3.5,
    IMAGE_HEIGHT: 3.5,
  },
}

// ============================================
// SLIDE MASTER DEFINITIONS
// TODO: Customize colors, positions, and styles to match your templates
// ============================================

async function defineSlideMasters(pptx: PptxGenJS): Promise<void> {
  // TP_TITLE - Black background title slide with white logo
  pptx.defineSlideMaster({
    title: "TP_TITLE",
    background: { color: COLORS.BLACK },
    objects: [
      // TODO: Add any decorative elements for title slides here
      // Example: accent lines, shapes, etc.
    ],
  })

  // TP_CHAPTER - Chapter/section divider slide
  pptx.defineSlideMaster({
    title: "TP_CHAPTER",
    background: { color: COLORS.WHITE },
    objects: [
      // TODO: Add chapter slide decorative elements here
    ],
  })

  // TP_CONTENT_WHITE - White background content slide
  pptx.defineSlideMaster({
    title: "TP_CONTENT_WHITE",
    background: { color: COLORS.WHITE },
    objects: [
      // Header line at top
      {
        rect: {
          x: 0,
          y: 0.9,
          w: "100%",
          h: 0.02,
          fill: { color: COLORS.LIGHT_GRAY },
        },
      },
      // Footer line at bottom
      {
        rect: {
          x: 0,
          y: 4.85,
          w: "100%",
          h: 0.01,
          fill: { color: COLORS.LIGHT_GRAY },
        },
      },
    ],
  })

  // TP_CONTENT_BEIGE - Beige/warm gray background content slide
  pptx.defineSlideMaster({
    title: "TP_CONTENT_BEIGE",
    background: { color: COLORS.BEIGE },
    objects: [
      // Header line at top
      {
        rect: {
          x: 0,
          y: 0.9,
          w: "100%",
          h: 0.02,
          fill: { color: COLORS.TAUPE },
        },
      },
      // Footer line at bottom
      {
        rect: {
          x: 0,
          y: 4.85,
          w: "100%",
          h: 0.01,
          fill: { color: COLORS.TAUPE },
        },
      },
    ],
  })
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Add logo and footer to a slide
async function addLogoAndFooter(
  slide: PptxGenJS.Slide,
  variant: "white" | "black",
  presentationTitle: string,
  slideNumber?: number,
): Promise<void> {
  const logoUrl = variant === "white" ? LOGOS.WHITE : LOGOS.BLACK
  const textColor = variant === "white" ? COLORS.WHITE : COLORS.BLACK

  try {
    // Add logo
    slide.addImage({
      path: logoUrl,
      x: LAYOUT.LOGO.X,
      y: LAYOUT.LOGO.Y,
      w: LAYOUT.LOGO.WIDTH,
      h: LAYOUT.LOGO.HEIGHT,
    })
  } catch (error) {
    // TODO: Handle logo loading errors - you may want to log this
    console.error("Failed to load logo:", error)
  }

  // Add "tp.com" text next to logo
  slide.addText("tp.com", {
    x: LAYOUT.FOOTER.X,
    y: LAYOUT.FOOTER.Y,
    fontSize: 8,
    fontFace: FONTS.BODY,
    color: textColor,
  })

  // Add presentation title in footer (center)
  slide.addText(presentationTitle, {
    x: 3,
    y: LAYOUT.FOOTER.Y,
    w: 4,
    fontSize: 8,
    fontFace: FONTS.BODY,
    color: textColor,
    align: "center",
  })

  // Add slide number (if provided)
  if (slideNumber !== undefined) {
    slide.addText(String(slideNumber), {
      x: LAYOUT.SLIDE_NUMBER.X,
      y: LAYOUT.SLIDE_NUMBER.Y,
      fontSize: 8,
      fontFace: FONTS.BODY,
      color: textColor,
    })
  }
}

// ============================================
// SLIDE BUILDERS
// TODO: Customize each slide builder to match your exact template layouts
// ============================================

async function addTitleSlide(pptx: PptxGenJS, slide: TitleSlide, presentationTitle: string): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: "TP_TITLE" })

  // Main title - white text on black background
  pptSlide.addText(slide.title, {
    x: LAYOUT.CONTENT.MARGIN_X,
    y: LAYOUT.TITLE_SLIDE.TITLE_Y,
    w: LAYOUT.CONTENT.WIDTH,
    h: 1.0,
    fontSize: 44,
    fontFace: FONTS.HEADING,
    color: COLORS.WHITE,
    bold: true,
    align: "left",
    valign: "middle",
  })

  // Subtitle (optional) - can use accent color
  if (slide.subtitle) {
    pptSlide.addText(slide.subtitle, {
      x: LAYOUT.CONTENT.MARGIN_X,
      y: LAYOUT.TITLE_SLIDE.SUBTITLE_Y,
      w: LAYOUT.CONTENT.WIDTH,
      h: 0.6,
      fontSize: 24,
      fontFace: FONTS.BODY,
      // TODO: Change subtitle color if needed (currently using light gray)
      color: COLORS.LIGHT_GRAY,
      align: "left",
      valign: "middle",
    })
  }

  // Add white logo for dark background
  await addLogoAndFooter(pptSlide, "white", presentationTitle)
}

async function addChapterSlide(
  pptx: PptxGenJS,
  slide: ChapterSlide,
  presentationTitle: string,
  slideNumber: number,
): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: "TP_CHAPTER" })

  // Large chapter number (formatted as 01, 02, etc.)
  const formattedNumber = String(slide.chapterNumber).padStart(2, "0")
  pptSlide.addText(formattedNumber, {
    x: LAYOUT.CHAPTER.NUMBER_X,
    y: LAYOUT.CHAPTER.NUMBER_Y,
    w: 3,
    h: 1.5,
    fontSize: 72,
    fontFace: FONTS.HEADING,
    color: COLORS.BLACK,
    bold: true,
  })

  // Chapter title
  pptSlide.addText(slide.title, {
    x: LAYOUT.CHAPTER.TITLE_X,
    y: LAYOUT.CHAPTER.TITLE_Y,
    w: 5,
    h: 1.0,
    fontSize: 32,
    fontFace: FONTS.HEADING,
    color: COLORS.BLACK,
    bold: true,
  })

  // Chapter image (if specified)
  // TODO: Ensure your chapter images are uploaded to the correct location
  if (slide.chapterImageNumber && slide.chapterImageNumber >= 1 && slide.chapterImageNumber <= 33) {
    try {
      const imageUrl = getChapterImageUrl(slide.chapterImageNumber)
      // Try loading the image - it may be .png, .jpg, or .jpeg
      pptSlide.addImage({
        path: `${imageUrl}.png`,
        x: LAYOUT.CHAPTER.IMAGE_X,
        y: LAYOUT.CHAPTER.IMAGE_Y,
        w: LAYOUT.CHAPTER.IMAGE_WIDTH,
        h: LAYOUT.CHAPTER.IMAGE_HEIGHT,
        sizing: { type: "contain", w: LAYOUT.CHAPTER.IMAGE_WIDTH, h: LAYOUT.CHAPTER.IMAGE_HEIGHT },
      })
    } catch {
      // If .png fails, the image might not exist or be in different format
      // TODO: Add fallback logic for .jpg/.jpeg if needed
      console.warn(`Chapter image ${slide.chapterImageNumber} not found`)
    }
  }

  // Add black logo for light background
  await addLogoAndFooter(pptSlide, "black", presentationTitle, slideNumber)
}

async function addContentSlide(
  pptx: PptxGenJS,
  slide: ContentSlide,
  presentationTitle: string,
  slideNumber: number,
): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: slide.master })
  const isBeige = slide.master === "TP_CONTENT_BEIGE"
  const textColor = COLORS.DARK_GRAY

  // Slide title
  pptSlide.addText(slide.title, {
    x: LAYOUT.CONTENT.MARGIN_X,
    y: 0.3,
    w: LAYOUT.CONTENT.WIDTH,
    h: 0.5,
    fontSize: 24,
    fontFace: FONTS.HEADING,
    color: textColor,
    bold: true,
  })

  // Content body
  pptSlide.addText(slide.content, {
    x: LAYOUT.CONTENT.MARGIN_X,
    y: LAYOUT.CONTENT.MARGIN_TOP,
    w: LAYOUT.CONTENT.WIDTH,
    h: 3.5,
    fontSize: 14,
    fontFace: FONTS.BODY,
    color: textColor,
    valign: "top",
    paraSpaceAfter: 10,
  })

  // Add black logo for light background
  await addLogoAndFooter(pptSlide, "black", presentationTitle, slideNumber)
}

async function addBulletsSlide(
  pptx: PptxGenJS,
  slide: BulletsSlide,
  presentationTitle: string,
  slideNumber: number,
): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: slide.master })
  const textColor = COLORS.DARK_GRAY

  // Slide title
  pptSlide.addText(slide.title, {
    x: LAYOUT.CONTENT.MARGIN_X,
    y: 0.3,
    w: LAYOUT.CONTENT.WIDTH,
    h: 0.5,
    fontSize: 24,
    fontFace: FONTS.HEADING,
    color: textColor,
    bold: true,
  })

  // Bullet points
  // TODO: Customize bullet color - currently using pink accent per brand guidelines
  const bulletItems = slide.items.map((item) => ({
    text: item,
    options: {
      bullet: { type: "bullet" as const, color: COLORS.PINK },
      paraSpaceBefore: 6,
      paraSpaceAfter: 6,
    },
  }))

  pptSlide.addText(bulletItems, {
    x: LAYOUT.CONTENT.MARGIN_X,
    y: LAYOUT.CONTENT.MARGIN_TOP,
    w: LAYOUT.CONTENT.WIDTH,
    h: 3.5,
    fontSize: 14,
    fontFace: FONTS.BODY,
    color: textColor,
    valign: "top",
  })

  await addLogoAndFooter(pptSlide, "black", presentationTitle, slideNumber)
}

async function addImageSlide(
  pptx: PptxGenJS,
  slide: ImageSlide,
  presentationTitle: string,
  slideNumber: number,
): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: slide.master })
  const textColor = COLORS.DARK_GRAY

  // Slide title
  pptSlide.addText(slide.title, {
    x: LAYOUT.CONTENT.MARGIN_X,
    y: 0.3,
    w: LAYOUT.CONTENT.WIDTH,
    h: 0.5,
    fontSize: 24,
    fontFace: FONTS.HEADING,
    color: textColor,
    bold: true,
  })

  // Image - ensure proper base64 format
  const imageData = slide.imageBase64.includes("base64,")
    ? slide.imageBase64
    : `data:image/png;base64,${slide.imageBase64}`

  pptSlide.addImage({
    data: imageData,
    x: 1.0,
    y: LAYOUT.CONTENT.MARGIN_TOP,
    w: 8.0,
    h: 3.5,
    sizing: { type: "contain", w: 8.0, h: 3.5 },
  })

  await addLogoAndFooter(pptSlide, "black", presentationTitle, slideNumber)
}

async function addTwoColumnSlide(
  pptx: PptxGenJS,
  slide: TwoColumnSlide,
  presentationTitle: string,
  slideNumber: number,
): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: slide.master })
  const textColor = COLORS.DARK_GRAY

  // Slide title
  pptSlide.addText(slide.title, {
    x: LAYOUT.CONTENT.MARGIN_X,
    y: 0.3,
    w: LAYOUT.CONTENT.WIDTH,
    h: 0.5,
    fontSize: 24,
    fontFace: FONTS.HEADING,
    color: textColor,
    bold: true,
  })

  // Left column
  pptSlide.addText(slide.leftContent, {
    x: LAYOUT.CONTENT.MARGIN_X,
    y: LAYOUT.CONTENT.MARGIN_TOP,
    w: 4.2,
    h: 3.5,
    fontSize: 14,
    fontFace: FONTS.BODY,
    color: textColor,
    valign: "top",
  })

  // Right column
  pptSlide.addText(slide.rightContent, {
    x: 5.0,
    y: LAYOUT.CONTENT.MARGIN_TOP,
    w: 4.2,
    h: 3.5,
    fontSize: 14,
    fontFace: FONTS.BODY,
    color: textColor,
    valign: "top",
  })

  await addLogoAndFooter(pptSlide, "black", presentationTitle, slideNumber)
}

// ============================================
// VALIDATION
// TODO: Add validation for any new slide types you create
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

  // Valid slide types - add new types here when you create them
  const validSlideTypes = ["title", "chapter", "content", "bullets", "image", "two-column"]

  // Validate each slide
  for (let i = 0; i < req.slides.length; i++) {
    const slide = req.slides[i] as Record<string, unknown>

    if (!slide.type || !validSlideTypes.includes(slide.type as string)) {
      return {
        valid: false,
        error: {
          error: `Invalid slide type at index ${i}`,
          code: "INVALID_SLIDE_TYPE",
          details: `Slide type must be one of: ${validSlideTypes.join(", ")}`,
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

    if (slide.type === "image" && typeof slide.imageBase64 !== "string") {
      return {
        valid: false,
        error: {
          error: `Missing imageBase64 in image slide at index ${i}`,
          code: "MISSING_IMAGE",
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
  }

  return { valid: true, data: req as unknown as PresentationRequest }
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse<PresentationResponse | ErrorResponse>> {
  try {
    // Check content length
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

    // Parse request body
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

    // API Key authentication (optional - enable by setting PPT_API_KEY env var)
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

    // Validate request
    const validation = validateRequest(body)
    if (!validation.valid) {
      return NextResponse.json(validation.error, { status: 400 })
    }

    const { title, slides } = validation.data

    // Create presentation
    const pptx = new PptxGenJS()
    pptx.title = title
    // TODO: Update author and company name
    pptx.author = "Teleperformance"
    pptx.company = "Teleperformance"
    pptx.layout = "LAYOUT_16x9"

    // Define slide masters
    await defineSlideMasters(pptx)

    // Build slides
    let slideNumber = 1
    for (const slide of slides) {
      switch (slide.type) {
        case "title":
          await addTitleSlide(pptx, slide, title)
          break
        case "chapter":
          await addChapterSlide(pptx, slide, title, slideNumber)
          break
        case "content":
          await addContentSlide(pptx, slide, title, slideNumber)
          break
        case "bullets":
          await addBulletsSlide(pptx, slide, title, slideNumber)
          break
        case "image":
          await addImageSlide(pptx, slide, title, slideNumber)
          break
        case "two-column":
          await addTwoColumnSlide(pptx, slide, title, slideNumber)
          break
      }
      slideNumber++
    }

    // Generate file as base64
    const base64Data = await pptx.write({ outputType: "base64" })

    // Generate filename
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

// ============================================
// HEALTH CHECK / API INFO ENDPOINT
// ============================================

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    service: "PPT Generator API - Teleperformance",
    version: "2.0.0",
    endpoints: {
      POST: "/api/generate-ppt",
    },
    // TODO: Update this list when you add new slide types
    supportedSlideTypes: ["title", "chapter", "content", "bullets", "image", "two-column"],
    slideMasters: ["TP_TITLE", "TP_CHAPTER", "TP_CONTENT_WHITE", "TP_CONTENT_BEIGE"],
    brandColors: COLORS,
  })
}
