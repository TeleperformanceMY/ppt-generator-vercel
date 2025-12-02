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
  subtitle?: string
  chapterImageNumber?: number
  chapterImageBase64?: string
}

interface ContentSlide {
  type: "content"
  master: "TP_CONTENT_WHITE" | "TP_CONTENT_BEIGE"
  title: string
  headerText?: string
  content: string
}

interface BulletsSlide {
  type: "bullets"
  master: "TP_CONTENT_WHITE" | "TP_CONTENT_BEIGE"
  title: string
  headerText?: string
  items: string[]
}

interface TwoColumnSlide {
  type: "two-column"
  master: "TP_CONTENT_WHITE" | "TP_CONTENT_BEIGE"
  title: string
  headerText?: string
  leftContent: string
  rightContent: string
}

interface ImageSlide {
  type: "image"
  master: "TP_CONTENT_WHITE" | "TP_CONTENT_BEIGE"
  title: string
  headerText?: string
  imageBase64: string
}

interface FlowSlide {
  type: "flow"
  master: "TP_CONTENT_WHITE" | "TP_CONTENT_BEIGE"
  title: string
  headerText?: string
  flowType: "current" | "future" // gray for current, blue for future
  steps: string[] // array of step descriptions
}

interface ThankYouSlide {
  type: "thankyou"
  master: "TP_THANKYOU"
  message?: string // defaults to "Thank you."
}

type Slide =
  | TitleSlide
  | ChapterSlide
  | ContentSlide
  | BulletsSlide
  | TwoColumnSlide
  | ImageSlide
  | FlowSlide
  | ThankYouSlide

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
  purple: "4A4C6A",
  purpleLight: "6B6D8A",
  pink: "ED1E81",
  gray: "666666",
  lightGray: "CCCCCC",
  flowGray: "8C8C8C",
  flowGrayLight: "A8A8A8",
  flowBlue: "4A6FA5",
  flowBlueDark: "3A5A8C",
}

const STATIC_ASSET_BASE_URL =
  process.env.STATIC_ASSET_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const LOGO_WHITE_URL = "/images/gmt-logo-20tp-rgb-feb-202025-white.png"
const LOGO_BLACK_URL = "/images/gmt-logo-20tp-rgb-feb-202025-black.png"

const CHAPTER_IMAGE_BASE_URL = process.env.CHAPTER_IMAGE_BASE_URL || ""

// ============================================
// HELPER FUNCTIONS
// ============================================

function resolveAssetUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  try {
    return new URL(url, STATIC_ASSET_BASE_URL).toString()
  } catch {
    return url
  }
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(resolveAssetUrl(url))
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

async function getChapterImageBase64(imageNumber: number): Promise<string | null> {
  if (!CHAPTER_IMAGE_BASE_URL || imageNumber < 1 || imageNumber > 33) {
    return null
  }

  const extensions = ["png", "jpg", "jpeg"]
  for (const ext of extensions) {
    const url = `${CHAPTER_IMAGE_BASE_URL}/image${imageNumber}.${ext}`
    const base64 = await fetchImageAsBase64(url)
    if (base64) return base64
  }
  return null
}

// ============================================
// SLIDE MASTER DEFINITIONS
// ============================================

function defineSlideMasters(pptx: PptxGenJS): void {
  pptx.defineSlideMaster({
    title: "TP_TITLE",
    background: { color: TP_COLORS.white },
  })

  pptx.defineSlideMaster({
    title: "TP_CHAPTER",
    background: { color: TP_COLORS.white },
  })

  pptx.defineSlideMaster({
    title: "TP_CONTENT_WHITE",
    background: { color: TP_COLORS.white },
  })

  pptx.defineSlideMaster({
    title: "TP_CONTENT_BEIGE",
    background: { color: TP_COLORS.beige },
  })

  pptx.defineSlideMaster({
    title: "TP_THANKYOU",
    background: { color: TP_COLORS.purple },
  })
}

// ============================================
// FOOTER HELPER
// ============================================

async function addContentFooter(
  pptSlide: PptxGenJS.Slide,
  presentationTitle: string,
  slideNumber: number,
): Promise<void> {
  pptSlide.addShape("line", {
    x: 0.3,
    y: 5.0,
    w: 9.4,
    h: 0,
    line: { color: TP_COLORS.black, width: 0.5 },
  })

  const logoBase64 = await fetchImageAsBase64(LOGO_BLACK_URL)
  if (logoBase64) {
    pptSlide.addImage({
      data: logoBase64,
      x: 0.3,
      y: 5.1,
      w: 0.2,
      h: 0.2,
    })
  }

  pptSlide.addText("tp.com", {
    x: 0.55,
    y: 5.1,
    w: 0.5,
    h: 0.2,
    fontSize: 7,
    fontFace: "Calibri",
    color: TP_COLORS.black,
  })

  pptSlide.addText(presentationTitle, {
    x: 7.0,
    y: 5.1,
    w: 2.0,
    h: 0.2,
    fontSize: 7,
    fontFace: "Calibri",
    color: TP_COLORS.black,
    align: "right",
  })

  pptSlide.addShape("line", {
    x: 9.1,
    y: 5.08,
    w: 0,
    h: 0.22,
    line: { color: TP_COLORS.black, width: 0.5 },
  })

  pptSlide.addText(slideNumber.toString(), {
    x: 9.2,
    y: 5.1,
    w: 0.4,
    h: 0.2,
    fontSize: 7,
    fontFace: "Calibri",
    color: TP_COLORS.black,
    align: "center",
  })
}

// ============================================
// SLIDE BUILDERS
// ============================================

async function addTitleSlide(pptx: PptxGenJS, slide: TitleSlide): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: "TP_TITLE" })

  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 2.2,
    w: 9,
    h: 1.2,
    fontSize: 44,
    fontFace: "Calibri",
    color: TP_COLORS.black,
    bold: true,
    align: "left",
    valign: "middle",
  })

  if (slide.subtitle) {
    pptSlide.addText(slide.subtitle, {
      x: 0.5,
      y: 3.4,
      w: 9,
      h: 0.8,
      fontSize: 24,
      fontFace: "Calibri Light",
      color: TP_COLORS.gray,
      align: "left",
      valign: "middle",
    })
  }

  pptSlide.addShape("line", {
    x: 0.3,
    y: 5.0,
    w: 9.4,
    h: 0,
    line: { color: TP_COLORS.black, width: 0.5 },
  })

  const logoBase64 = await fetchImageAsBase64(LOGO_BLACK_URL)
  if (logoBase64) {
    pptSlide.addImage({
      data: logoBase64,
      x: 0.3,
      y: 5.1,
      w: 0.2,
      h: 0.2,
    })
  }

  pptSlide.addText("tp.com", {
    x: 0.55,
    y: 5.1,
    w: 0.5,
    h: 0.2,
    fontSize: 7,
    fontFace: "Calibri",
    color: TP_COLORS.black,
  })
}

async function addChapterSlide(pptx: PptxGenJS, slide: ChapterSlide): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: "TP_CHAPTER" })

  pptSlide.addShape("rect", {
    x: 5,
    y: 0,
    w: 5,
    h: 5.63,
    fill: { color: TP_COLORS.purple },
    line: { color: TP_COLORS.purple },
  })

  let hasImage = false
  if (slide.chapterImageBase64) {
    const imageData = slide.chapterImageBase64.includes("base64,")
      ? slide.chapterImageBase64
      : `data:image/png;base64,${slide.chapterImageBase64}`
    pptSlide.addImage({
      data: imageData,
      x: 0,
      y: 0,
      w: 5,
      h: 5.63,
      sizing: { type: "cover", w: 5, h: 5.63 },
    })
    hasImage = true
  } else if (slide.chapterImageNumber) {
    const imageBase64 = await getChapterImageBase64(slide.chapterImageNumber)
    if (imageBase64) {
      pptSlide.addImage({
        data: imageBase64,
        x: 0,
        y: 0,
        w: 5,
        h: 5.63,
        sizing: { type: "cover", w: 5, h: 5.63 },
      })
      hasImage = true
    }
  }

  if (!hasImage) {
    pptSlide.addShape("rect", {
      x: 0,
      y: 0,
      w: 5,
      h: 5.63,
      fill: { color: TP_COLORS.beige },
    })
  }

  const logoBase64 = await fetchImageAsBase64(LOGO_WHITE_URL)
  if (logoBase64) {
    pptSlide.addImage({
      data: logoBase64,
      x: 9.2,
      y: 0.3,
      w: 0.4,
      h: 0.4,
    })
  }

  const formattedNumber = slide.chapterNumber.toString().padStart(2, "0")
  pptSlide.addText(formattedNumber, {
    x: 5.3,
    y: 0.8,
    w: 4.2,
    h: 1.5,
    fontSize: 72,
    fontFace: "Calibri Light",
    color: TP_COLORS.purpleLight,
    align: "right",
  })

  pptSlide.addShape("rect", {
    x: 5.5,
    y: 2.5,
    w: 4,
    h: 1.2,
    fill: { type: "none" },
    line: { color: TP_COLORS.white, width: 1, dashType: "dash" },
  })

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
    italic: true,
  })

  if (slide.subtitle) {
    pptSlide.addShape("line", {
      x: 5.5,
      y: 4.0,
      w: 4,
      h: 0,
      line: { color: TP_COLORS.white, width: 0.5 },
    })

    pptSlide.addText(slide.subtitle, {
      x: 5.5,
      y: 4.1,
      w: 4,
      h: 0.5,
      fontSize: 14,
      fontFace: "Calibri",
      color: TP_COLORS.white,
      align: "center",
    })
  }

  pptSlide.addShape("rect", {
    x: 5,
    y: 5.43,
    w: 5,
    h: 0.2,
    fill: { color: TP_COLORS.pink },
    line: { color: TP_COLORS.pink },
  })
}

async function addContentSlide(
  pptx: PptxGenJS,
  slide: ContentSlide,
  presentationTitle: string,
  slideNumber: number,
): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: slide.master })

  let yOffset = 0.3

  if (slide.headerText) {
    pptSlide.addText(slide.headerText, {
      x: 0.5,
      y: yOffset,
      w: 9,
      h: 0.3,
      fontSize: 12,
      fontFace: "Calibri",
      color: TP_COLORS.pink,
    })
    yOffset += 0.35
  }

  pptSlide.addText(slide.title, {
    x: 0.5,
    y: yOffset,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    color: TP_COLORS.black,
    bold: true,
  })

  pptSlide.addText(slide.content, {
    x: 0.5,
    y: yOffset + 0.9,
    w: 9,
    h: 3.2,
    fontSize: 16,
    fontFace: "Calibri Light",
    color: TP_COLORS.black,
    valign: "top",
    paraSpaceAfter: 12,
  })

  await addContentFooter(pptSlide, presentationTitle, slideNumber)
}

async function addBulletsSlide(
  pptx: PptxGenJS,
  slide: BulletsSlide,
  presentationTitle: string,
  slideNumber: number,
): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: slide.master })

  let yOffset = 0.3

  if (slide.headerText) {
    pptSlide.addText(slide.headerText, {
      x: 0.5,
      y: yOffset,
      w: 9,
      h: 0.3,
      fontSize: 12,
      fontFace: "Calibri",
      color: TP_COLORS.pink,
    })
    yOffset += 0.35
  }

  pptSlide.addText(slide.title, {
    x: 0.5,
    y: yOffset,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    color: TP_COLORS.black,
    bold: true,
  })

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
    y: yOffset + 0.9,
    w: 9,
    h: 3.2,
    fontSize: 18,
    fontFace: "Calibri Light",
    color: TP_COLORS.black,
    valign: "top",
  })

  await addContentFooter(pptSlide, presentationTitle, slideNumber)
}

async function addTwoColumnSlide(
  pptx: PptxGenJS,
  slide: TwoColumnSlide,
  presentationTitle: string,
  slideNumber: number,
): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: slide.master })

  let yOffset = 0.3

  if (slide.headerText) {
    pptSlide.addText(slide.headerText, {
      x: 0.5,
      y: yOffset,
      w: 9,
      h: 0.3,
      fontSize: 12,
      fontFace: "Calibri",
      color: TP_COLORS.pink,
    })
    yOffset += 0.35
  }

  pptSlide.addText(slide.title, {
    x: 0.5,
    y: yOffset,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    color: TP_COLORS.black,
    bold: true,
  })

  pptSlide.addText(slide.leftContent, {
    x: 0.5,
    y: yOffset + 0.9,
    w: 4.3,
    h: 3.2,
    fontSize: 16,
    fontFace: "Calibri Light",
    color: TP_COLORS.black,
    valign: "top",
  })

  pptSlide.addText(slide.rightContent, {
    x: 5.2,
    y: yOffset + 0.9,
    w: 4.3,
    h: 3.2,
    fontSize: 16,
    fontFace: "Calibri Light",
    color: TP_COLORS.black,
    valign: "top",
  })

  await addContentFooter(pptSlide, presentationTitle, slideNumber)
}

async function addImageSlide(
  pptx: PptxGenJS,
  slide: ImageSlide,
  presentationTitle: string,
  slideNumber: number,
): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: slide.master })

  let yOffset = 0.3

  if (slide.headerText) {
    pptSlide.addText(slide.headerText, {
      x: 0.5,
      y: yOffset,
      w: 9,
      h: 0.3,
      fontSize: 12,
      fontFace: "Calibri",
      color: TP_COLORS.pink,
    })
    yOffset += 0.35
  }

  pptSlide.addText(slide.title, {
    x: 0.5,
    y: yOffset,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    color: TP_COLORS.black,
    bold: true,
  })

  const imageData = slide.imageBase64.includes("base64,")
    ? slide.imageBase64
    : `data:image/png;base64,${slide.imageBase64}`

  pptSlide.addImage({
    data: imageData,
    x: 1,
    y: yOffset + 0.9,
    w: 8,
    h: 3.2,
    sizing: { type: "contain", w: 8, h: 3.2 },
  })

  await addContentFooter(pptSlide, presentationTitle, slideNumber)
}

async function addFlowSlide(
  pptx: PptxGenJS,
  slide: FlowSlide,
  presentationTitle: string,
  slideNumber: number,
): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: slide.master })

  let yOffset = 0.3

  if (slide.headerText) {
    pptSlide.addText(slide.headerText, {
      x: 0.5,
      y: yOffset,
      w: 9,
      h: 0.3,
      fontSize: 12,
      fontFace: "Calibri",
      color: TP_COLORS.pink,
    })
    yOffset += 0.35
  }

  pptSlide.addText(slide.title, {
    x: 0.5,
    y: yOffset,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    color: TP_COLORS.black,
    bold: true,
  })

  // Calculate chevron dimensions based on number of steps
  const steps = slide.steps
  const stepCount = steps.length
  const maxSteps = 8 // Maximum steps that fit well
  const displaySteps = steps.slice(0, maxSteps)

  const totalWidth = 9.0 // Available width
  const chevronHeight = 0.9
  const chevronWidth = totalWidth / Math.min(stepCount, maxSteps)
  const overlap = 0.15 // Chevron overlap for arrow effect
  const startX = 0.5
  const startY = yOffset + 1.5

  // Colors based on flow type
  const isCurrentFlow = slide.flowType === "current"
  const fillColor = isCurrentFlow ? TP_COLORS.flowGray : TP_COLORS.flowBlue
  const darkColor = isCurrentFlow ? TP_COLORS.gray : TP_COLORS.flowBlueDark

  // Draw chevron shapes for each step
  displaySteps.forEach((step, index) => {
    const x = startX + index * (chevronWidth - overlap)

    // Create chevron/arrow shape using a pentagon
    // PptxGenJS doesn't have native chevron, so we use rounded rectangles with gradient effect
    pptSlide.addShape("roundRect", {
      x: x,
      y: startY,
      w: chevronWidth,
      h: chevronHeight,
      fill: { color: index % 2 === 0 ? fillColor : darkColor },
      line: { color: TP_COLORS.white, width: 1 },
      rectRadius: 0.1,
    })

    // Add arrow point overlay on right side (except last)
    if (index < displaySteps.length - 1) {
      pptSlide.addShape("triangle", {
        x: x + chevronWidth - 0.15,
        y: startY,
        w: 0.2,
        h: chevronHeight,
        fill: { color: (index + 1) % 2 === 0 ? fillColor : darkColor },
        line: { type: "none" },
        rotate: 0,
      })
    }

    // Add step text centered in the chevron
    pptSlide.addText(step, {
      x: x + 0.1,
      y: startY + 0.1,
      w: chevronWidth - 0.2,
      h: chevronHeight - 0.2,
      fontSize: stepCount > 6 ? 8 : stepCount > 4 ? 9 : 10,
      fontFace: "Calibri",
      color: TP_COLORS.white,
      align: "center",
      valign: "middle",
      wrap: true,
    })
  })

  // Add indicator if there are more steps than displayed
  if (stepCount > maxSteps) {
    pptSlide.addText(`+${stepCount - maxSteps} more steps...`, {
      x: 0.5,
      y: startY + chevronHeight + 0.2,
      w: 9,
      h: 0.3,
      fontSize: 10,
      fontFace: "Calibri",
      color: TP_COLORS.gray,
      align: "right",
    })
  }

  await addContentFooter(pptSlide, presentationTitle, slideNumber)
}

async function addThankYouSlide(pptx: PptxGenJS, slide: ThankYouSlide): Promise<void> {
  const pptSlide = pptx.addSlide({ masterName: "TP_THANKYOU" })

  // "eai" logo text in top-left (styled as in screenshot)
  pptSlide.addText("eai", {
    x: 0.4,
    y: 0.3,
    w: 0.5,
    h: 0.5,
    fontSize: 28,
    fontFace: "Calibri",
    color: TP_COLORS.white,
    bold: true,
  })

  // "Emotional and Artificial Intelligence" text
  pptSlide.addText("Emotional\nand Artificial\nIntelligence", {
    x: 0.95,
    y: 0.25,
    w: 1.5,
    h: 0.7,
    fontSize: 9,
    fontFace: "Calibri",
    color: TP_COLORS.white,
    lineSpacing: 12,
  })

  // "Thank you." text on left side
  const message = slide.message || "Thank you."
  pptSlide.addText(message, {
    x: 0.4,
    y: 2.5,
    w: 3,
    h: 0.8,
    fontSize: 36,
    fontFace: "Calibri Light",
    color: TP_COLORS.white,
    align: "left",
    valign: "middle",
  })

  // Large white TP logo in center
  const logoBase64 = await fetchImageAsBase64(LOGO_WHITE_URL)
  if (logoBase64) {
    pptSlide.addImage({
      data: logoBase64,
      x: 4.0,
      y: 1.8,
      w: 2.0,
      h: 2.0,
    })
  }

  // "tp.com" text with underline next to logo
  pptSlide.addText("tp.com", {
    x: 6.2,
    y: 2.5,
    w: 1.5,
    h: 0.5,
    fontSize: 24,
    fontFace: "Calibri",
    color: TP_COLORS.pink,
    underline: { style: "sng", color: TP_COLORS.pink },
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

  const validTypes = ["title", "chapter", "content", "bullets", "two-column", "image", "flow", "thankyou"]
  const validMasters = ["TP_TITLE", "TP_CHAPTER", "TP_CONTENT_WHITE", "TP_CONTENT_BEIGE", "TP_THANKYOU"]

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

    if (slide.type !== "thankyou" && (!slide.title || typeof slide.title !== "string")) {
      return {
        valid: false,
        error: {
          error: `Missing title in slide at index ${i}`,
          code: "MISSING_SLIDE_TITLE",
        },
      }
    }

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

    if (slide.type === "flow") {
      if (!Array.isArray(slide.steps) || slide.steps.length === 0) {
        return {
          valid: false,
          error: {
            error: `Missing steps array in flow slide at index ${i}`,
            code: "MISSING_STEPS",
          },
        }
      }
      if (slide.flowType !== "current" && slide.flowType !== "future") {
        return {
          valid: false,
          error: {
            error: `Invalid flowType in flow slide at index ${i}`,
            code: "INVALID_FLOW_TYPE",
            details: "flowType must be 'current' or 'future'",
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

    let slideNumber = 1
    for (const slide of slides) {
      switch (slide.type) {
        case "title":
          await addTitleSlide(pptx, slide)
          break
        case "chapter":
          await addChapterSlide(pptx, slide)
          break
        case "content":
          await addContentSlide(pptx, slide, title, slideNumber)
          break
        case "bullets":
          await addBulletsSlide(pptx, slide, title, slideNumber)
          break
        case "two-column":
          await addTwoColumnSlide(pptx, slide, title, slideNumber)
          break
        case "image":
          await addImageSlide(pptx, slide, title, slideNumber)
          break
        case "flow":
          await addFlowSlide(pptx, slide, title, slideNumber)
          break
        case "thankyou":
          await addThankYouSlide(pptx, slide)
          break
      }
      slideNumber++
    }

    const base64Data = await pptx.write({ outputType: "base64" })
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, "_")
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
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
