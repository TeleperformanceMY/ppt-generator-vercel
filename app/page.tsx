"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Loader2, CheckCircle, AlertCircle, Code, Zap, Plus, Trash2 } from "lucide-react"

// ============================================
// SLIDE TYPE DEFINITIONS
// TODO: Keep in sync with the API route types
// ============================================
interface Slide {
  type: "title" | "chapter" | "content" | "bullets" | "image" | "two-column"
  master: string
  title: string
  subtitle?: string
  content?: string
  items?: string[]
  imageBase64?: string
  chapterNumber?: number
  chapterImageNumber?: number
  leftContent?: string
  rightContent?: string
}

export default function PPTGeneratorDemo() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; fileName?: string } | null>(null)
  const [presentationTitle, setPresentationTitle] = useState("Q4 Strategy Presentation")

  // Default slides using the new TP-branded types
  const [slides, setSlides] = useState<Slide[]>([
    {
      type: "title",
      master: "TP_TITLE",
      title: "Welcome to Teleperformance",
      subtitle: "Q4 Strategy Briefing 2024",
    },
    {
      type: "chapter",
      master: "TP_CHAPTER",
      title: "Executive Overview",
      chapterNumber: 1,
      // TODO: Set chapterImageNumber (1-33) to include a chapter image
      chapterImageNumber: undefined,
    },
    {
      type: "content",
      master: "TP_CONTENT_WHITE",
      title: "Executive Summary",
      content:
        "This quarter we achieved significant milestones across all business units. Our strategic initiatives have yielded measurable results, positioning us well for continued growth in the coming year.",
    },
    {
      type: "bullets",
      master: "TP_CONTENT_WHITE",
      title: "Key Highlights",
      items: [
        "Revenue increased by 12% YoY",
        "Operating costs reduced by 6%",
        "Customer satisfaction score: 94%",
        "New market expansion in 3 regions",
      ],
    },
  ])

  const handleGenerate = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/generate-ppt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: presentationTitle,
          slides: slides,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate presentation")
      }

      // Download the file
      const binaryString = atob(data.fileBase64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = data.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setResult({
        success: true,
        message: "Presentation generated successfully!",
        fileName: data.fileName,
      })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateSlide = (index: number, field: string, value: string | string[] | number | undefined) => {
    const newSlides = [...slides]
    newSlides[index] = { ...newSlides[index], [field]: value }
    setSlides(newSlides)
  }

  const addSlide = (type: Slide["type"]) => {
    const newSlide: Slide = {
      type,
      master: type === "title" ? "TP_TITLE" : type === "chapter" ? "TP_CHAPTER" : "TP_CONTENT_WHITE",
      title: "New Slide",
      ...(type === "content" && { content: "" }),
      ...(type === "bullets" && { items: ["Item 1", "Item 2"] }),
      ...(type === "chapter" && { chapterNumber: slides.filter((s) => s.type === "chapter").length + 1 }),
      ...(type === "two-column" && { leftContent: "", rightContent: "" }),
    }
    setSlides([...slides, newSlide])
  }

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index))
  }

  // Example payload for documentation - using the new TP-branded types
  const examplePayload = {
    title: "My Presentation",
    slides: [
      {
        type: "title",
        master: "TP_TITLE",
        title: "Welcome",
        subtitle: "Q4 Strategy Briefing",
      },
      {
        type: "chapter",
        master: "TP_CHAPTER",
        title: "Introduction",
        chapterNumber: 1,
        chapterImageNumber: 5, // Uses image5.png from chapter images
      },
      {
        type: "content",
        master: "TP_CONTENT_WHITE",
        title: "Overview",
        content: "This quarter we achieved our financial goals...",
      },
      {
        type: "bullets",
        master: "TP_CONTENT_BEIGE",
        title: "Key Highlights",
        items: ["Revenue +12%", "Cost reduction -6%", "Customer satisfaction up"],
      },
      {
        type: "two-column",
        master: "TP_CONTENT_WHITE",
        title: "Comparison",
        leftContent: "Left column content...",
        rightContent: "Right column content...",
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PowerPoint Generator API</h1>
              <p className="text-sm text-muted-foreground">
                Generate .pptx files with Teleperformance branding via REST API
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="demo" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="demo">
              <Zap className="mr-2 h-4 w-4" />
              Demo
            </TabsTrigger>
            <TabsTrigger value="api">
              <Code className="mr-2 h-4 w-4" />
              API Docs
            </TabsTrigger>
            <TabsTrigger value="power-automate">
              <FileText className="mr-2 h-4 w-4" />
              Power Automate
            </TabsTrigger>
          </TabsList>

          {/* Demo Tab */}
          <TabsContent value="demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate a Presentation</CardTitle>
                <CardDescription>Configure your slides and generate a .pptx file with TP branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Presentation Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Presentation Title</Label>
                  <Input
                    id="title"
                    value={presentationTitle}
                    onChange={(e) => setPresentationTitle(e.target.value)}
                    placeholder="Enter presentation title"
                  />
                </div>

                {/* Add Slide Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Label className="w-full">Add Slide:</Label>
                  <Button variant="outline" size="sm" onClick={() => addSlide("title")}>
                    <Plus className="mr-1 h-3 w-3" /> Title
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSlide("chapter")}>
                    <Plus className="mr-1 h-3 w-3" /> Chapter
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSlide("content")}>
                    <Plus className="mr-1 h-3 w-3" /> Content
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSlide("bullets")}>
                    <Plus className="mr-1 h-3 w-3" /> Bullets
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSlide("two-column")}>
                    <Plus className="mr-1 h-3 w-3" /> Two Column
                  </Button>
                </div>

                {/* Slides */}
                <div className="space-y-4">
                  <Label>Slides ({slides.length})</Label>
                  {slides.map((slide, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-black px-2 py-1 text-xs font-medium text-white">
                              {slide.type.toUpperCase()}
                            </span>
                            <Select value={slide.master} onValueChange={(value) => updateSlide(index, "master", value)}>
                              <SelectTrigger className="w-40 h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {slide.type === "title" && <SelectItem value="TP_TITLE">TP_TITLE</SelectItem>}
                                {slide.type === "chapter" && <SelectItem value="TP_CHAPTER">TP_CHAPTER</SelectItem>}
                                {["content", "bullets", "image", "two-column"].includes(slide.type) && (
                                  <>
                                    <SelectItem value="TP_CONTENT_WHITE">TP_CONTENT_WHITE</SelectItem>
                                    <SelectItem value="TP_CONTENT_BEIGE">TP_CONTENT_BEIGE</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeSlide(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <Input
                          value={slide.title}
                          onChange={(e) => updateSlide(index, "title", e.target.value)}
                          placeholder="Slide title"
                        />

                        {slide.type === "title" && (
                          <Input
                            value={slide.subtitle || ""}
                            onChange={(e) => updateSlide(index, "subtitle", e.target.value)}
                            placeholder="Subtitle (optional)"
                          />
                        )}

                        {slide.type === "chapter" && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Chapter Number</Label>
                              <Input
                                type="number"
                                value={slide.chapterNumber || 1}
                                onChange={(e) =>
                                  updateSlide(index, "chapterNumber", Number.parseInt(e.target.value) || 1)
                                }
                                placeholder="Chapter number"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Chapter Image (1-33)</Label>
                              <Input
                                type="number"
                                min={1}
                                max={33}
                                value={slide.chapterImageNumber || ""}
                                onChange={(e) =>
                                  updateSlide(
                                    index,
                                    "chapterImageNumber",
                                    e.target.value ? Number.parseInt(e.target.value) : undefined,
                                  )
                                }
                                placeholder="Image number (optional)"
                              />
                            </div>
                          </div>
                        )}

                        {slide.type === "content" && (
                          <Textarea
                            value={slide.content || ""}
                            onChange={(e) => updateSlide(index, "content", e.target.value)}
                            placeholder="Content text"
                            rows={3}
                          />
                        )}

                        {slide.type === "bullets" && (
                          <Textarea
                            value={slide.items?.join("\n") || ""}
                            onChange={(e) => updateSlide(index, "items", e.target.value.split("\n"))}
                            placeholder="Bullet points (one per line)"
                            rows={4}
                          />
                        )}

                        {slide.type === "two-column" && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Left Column</Label>
                              <Textarea
                                value={slide.leftContent || ""}
                                onChange={(e) => updateSlide(index, "leftContent", e.target.value)}
                                placeholder="Left column content"
                                rows={3}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Right Column</Label>
                              <Textarea
                                value={slide.rightContent || ""}
                                onChange={(e) => updateSlide(index, "rightContent", e.target.value)}
                                placeholder="Right column content"
                                rows={3}
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full bg-black hover:bg-gray-800"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generate & Download
                    </>
                  )}
                </Button>

                {/* Result */}
                {result && (
                  <div
                    className={`flex items-center gap-2 rounded-lg p-4 ${
                      result.success ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {result.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <div>
                      <p className="font-medium">{result.message}</p>
                      {result.fileName && <p className="text-sm opacity-80">File: {result.fileName}</p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Docs Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  REST API endpoint for generating PowerPoint presentations with TP branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Endpoint */}
                <div className="space-y-2">
                  <Label>Endpoint</Label>
                  <code className="block rounded bg-muted p-3 text-sm">POST /api/generate-ppt</code>
                </div>

                {/* Request Body */}
                <div className="space-y-2">
                  <Label>Request Body Example</Label>
                  <pre className="overflow-auto rounded bg-muted p-4 text-sm">
                    {JSON.stringify(examplePayload, null, 2)}
                  </pre>
                </div>

                {/* Response */}
                <div className="space-y-2">
                  <Label>Response</Label>
                  <pre className="overflow-auto rounded bg-muted p-4 text-sm">
                    {JSON.stringify(
                      {
                        fileName: "My_Presentation_1234567890.pptx",
                        fileBase64: "<base64-encoded-pptx>",
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>

                {/* Slide Types */}
                <div className="space-y-2">
                  <Label>Supported Slide Types</Label>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { type: "title", master: "TP_TITLE", desc: "Black background title slide" },
                      { type: "chapter", master: "TP_CHAPTER", desc: "Chapter divider with number & optional image" },
                      { type: "content", master: "TP_CONTENT_*", desc: "Text content slide" },
                      { type: "bullets", master: "TP_CONTENT_*", desc: "Bullet list slide" },
                      { type: "image", master: "TP_CONTENT_*", desc: "Image slide (base64)" },
                      { type: "two-column", master: "TP_CONTENT_*", desc: "Two column layout" },
                    ].map((item) => (
                      <div key={item.type} className="rounded-lg border p-3">
                        <div className="font-medium">{item.type}</div>
                        <div className="text-xs text-muted-foreground">{item.master}</div>
                        <div className="mt-1 text-sm">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slide Masters */}
                <div className="space-y-2">
                  <Label>Available Slide Masters</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-3 bg-black text-white">
                      <div className="font-medium">TP_TITLE</div>
                      <div className="text-sm opacity-80">Black background, white text</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="font-medium">TP_CHAPTER</div>
                      <div className="text-sm text-muted-foreground">White background, chapter divider</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="font-medium">TP_CONTENT_WHITE</div>
                      <div className="text-sm text-muted-foreground">White background content</div>
                    </div>
                    <div className="rounded-lg border p-3" style={{ backgroundColor: "#D4D1CA" }}>
                      <div className="font-medium">TP_CONTENT_BEIGE</div>
                      <div className="text-sm">Warm gray/beige background</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Power Automate Tab */}
          <TabsContent value="power-automate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Power Automate Integration</CardTitle>
                <CardDescription>Steps to integrate with Microsoft Power Automate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white">
                      1
                    </span>
                    <Label>Add HTTP Action</Label>
                  </div>
                  <pre className="overflow-auto rounded bg-muted p-4 text-sm">
                    {`Method: POST
URI: https://your-domain.vercel.app/api/generate-ppt
Headers: 
  Content-Type: application/json
  x-api-key: YOUR_API_KEY (if authentication enabled)

Body:
{
  "title": "@{triggerBody()?['title']}",
  "slides": [
    {
      "type": "title",
      "master": "TP_TITLE",
      "title": "@{triggerBody()?['mainTitle']}",
      "subtitle": "@{triggerBody()?['subtitle']}"
    },
    {
      "type": "chapter",
      "master": "TP_CHAPTER",
      "title": "Introduction",
      "chapterNumber": 1,
      "chapterImageNumber": 1
    },
    {
      "type": "content",
      "master": "TP_CONTENT_WHITE",
      "title": "Overview",
      "content": "@{triggerBody()?['overviewContent']}"
    }
  ]
}`}
                  </pre>
                </div>

                {/* Step 2 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white">
                      2
                    </span>
                    <Label>Create File Action (OneDrive/SharePoint)</Label>
                  </div>
                  <pre className="overflow-auto rounded bg-muted p-4 text-sm">
                    {`Site Address: your-sharepoint-site
Folder Path: /Shared Documents/Presentations
File Name: @{body('HTTP')['fileName']}
File Content: @{base64ToBinary(body('HTTP')['fileBase64'])}`}
                  </pre>
                </div>

                {/* Step 3 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white">
                      3
                    </span>
                    <Label>Chapter Images Setup</Label>
                  </div>
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="text-sm font-medium">To use chapter images (1-33):</p>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>Upload your 33 images to Vercel Blob or a public folder</li>
                      <li>Name them: image1.png, image2.png, ... image33.png (or .jpg)</li>
                      <li>
                        Set <code className="bg-muted px-1 rounded">CHAPTER_IMAGE_BASE_URL</code> env variable
                      </li>
                      <li>
                        In your request, set <code className="bg-muted px-1 rounded">chapterImageNumber</code> (1-33)
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Environment Variables */}
                <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                  <h4 className="font-semibold text-yellow-600">Environment Variables to Set in Vercel</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>
                      • <code className="bg-muted px-1 rounded">PPT_API_KEY</code> - Optional API key for authentication
                    </li>
                    <li>
                      • <code className="bg-muted px-1 rounded">CHAPTER_IMAGE_BASE_URL</code> - Base URL for chapter
                      images (e.g., https://your-domain.vercel.app/images/chapter/)
                    </li>
                  </ul>
                </div>

                {/* Error Codes */}
                <div className="space-y-2">
                  <Label>Error Codes for Power Automate Error Handling</Label>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-2 text-left">Code</th>
                          <th className="px-3 py-2 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["INVALID_BODY", "Request body is not valid JSON"],
                          ["INVALID_TITLE", "Missing or invalid presentation title"],
                          ["INVALID_SLIDES", "Slides array is missing or empty"],
                          ["INVALID_SLIDE_TYPE", "Unknown slide type"],
                          ["MISSING_SLIDE_TITLE", "Slide missing title field"],
                          ["MISSING_CONTENT", "Content slide missing content"],
                          ["MISSING_ITEMS", "Bullets slide missing items array"],
                          ["MISSING_IMAGE", "Image slide missing imageBase64"],
                          ["MISSING_CHAPTER_NUMBER", "Chapter slide missing chapterNumber"],
                          ["UNAUTHORIZED", "Invalid or missing API key"],
                          ["PAYLOAD_TOO_LARGE", "Request exceeds 10MB limit"],
                        ].map(([code, desc]) => (
                          <tr key={code} className="border-t">
                            <td className="px-3 py-2 font-mono text-xs">{code}</td>
                            <td className="px-3 py-2">{desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
