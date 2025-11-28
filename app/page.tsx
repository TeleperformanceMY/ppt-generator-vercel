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

interface Slide {
  type: "title" | "chapter" | "content" | "bullets" | "two-column" | "image"
  master: "TP_TITLE" | "TP_CHAPTER" | "TP_CONTENT_WHITE" | "TP_CONTENT_BEIGE"
  title: string
  subtitle?: string
  content?: string
  items?: string[]
  chapterNumber?: number
  chapterImageNumber?: number
  leftContent?: string
  rightContent?: string
  imageBase64?: string
}

export default function PPTGeneratorDemo() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; fileName?: string } | null>(null)
  const [presentationTitle, setPresentationTitle] = useState("TP Strategy Presentation")
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
      chapterImageNumber: 1,
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
      master: "TP_CONTENT_BEIGE",
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
        throw new Error(data.details || data.error || "Failed to generate presentation")
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
    const masterMap: Record<Slide["type"], Slide["master"]> = {
      title: "TP_TITLE",
      chapter: "TP_CHAPTER",
      content: "TP_CONTENT_WHITE",
      bullets: "TP_CONTENT_WHITE",
      "two-column": "TP_CONTENT_WHITE",
      image: "TP_CONTENT_WHITE",
    }

    const newSlide: Slide = {
      type,
      master: masterMap[type],
      title: "New Slide",
      ...(type === "chapter" && { chapterNumber: slides.filter((s) => s.type === "chapter").length + 1 }),
      ...(type === "content" && { content: "Enter your content here..." }),
      ...(type === "bullets" && { items: ["Item 1", "Item 2", "Item 3"] }),
      ...(type === "two-column" && { leftContent: "Left column", rightContent: "Right column" }),
    }

    setSlides([...slides, newSlide])
  }

  const removeSlide = (index: number) => {
    if (slides.length > 1) {
      setSlides(slides.filter((_, i) => i !== index))
    }
  }

  const examplePayload = {
    title: "TP Presentation",
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
        chapterNumber: 1,
        title: "Introduction",
        chapterImageNumber: 5,
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
              <h1 className="text-2xl font-bold">TP PowerPoint Generator</h1>
              <p className="text-sm text-muted-foreground">Generate branded .pptx files via REST API</p>
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
                <CardDescription>Configure your slides and generate a branded .pptx file</CardDescription>
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

                {/* Slides */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Slides ({slides.length})</Label>
                    <Select onValueChange={(value) => addSlide(value as Slide["type"])}>
                      <SelectTrigger className="w-40">
                        <Plus className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Add slide" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Title Slide</SelectItem>
                        <SelectItem value="chapter">Chapter Slide</SelectItem>
                        <SelectItem value="content">Content Slide</SelectItem>
                        <SelectItem value="bullets">Bullets Slide</SelectItem>
                        <SelectItem value="two-column">Two Column</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {slides.map((slide, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-black px-2 py-1 text-xs font-medium text-white">
                              {slide.type.toUpperCase()}
                            </span>
                            <Select value={slide.master} onValueChange={(value) => updateSlide(index, "master", value)}>
                              <SelectTrigger className="h-7 w-44 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {slide.type === "title" && <SelectItem value="TP_TITLE">TP_TITLE</SelectItem>}
                                {slide.type === "chapter" && <SelectItem value="TP_CHAPTER">TP_CHAPTER</SelectItem>}
                                {(slide.type === "content" ||
                                  slide.type === "bullets" ||
                                  slide.type === "two-column" ||
                                  slide.type === "image") && (
                                  <>
                                    <SelectItem value="TP_CONTENT_WHITE">TP_CONTENT_WHITE</SelectItem>
                                    <SelectItem value="TP_CONTENT_BEIGE">TP_CONTENT_BEIGE</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeSlide(index)}
                            disabled={slides.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
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
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Chapter Number</Label>
                              <Input
                                type="number"
                                min={1}
                                value={slide.chapterNumber || 1}
                                onChange={(e) =>
                                  updateSlide(index, "chapterNumber", Number.parseInt(e.target.value) || 1)
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Image Number (1-33)</Label>
                              <Input
                                type="number"
                                min={1}
                                max={33}
                                value={slide.chapterImageNumber || ""}
                                onChange={(e) =>
                                  updateSlide(index, "chapterImageNumber", Number.parseInt(e.target.value) || undefined)
                                }
                                placeholder="Optional"
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
                          <div className="grid grid-cols-2 gap-3">
                            <Textarea
                              value={slide.leftContent || ""}
                              onChange={(e) => updateSlide(index, "leftContent", e.target.value)}
                              placeholder="Left column content"
                              rows={3}
                            />
                            <Textarea
                              value={slide.rightContent || ""}
                              onChange={(e) => updateSlide(index, "rightContent", e.target.value)}
                              placeholder="Right column content"
                              rows={3}
                            />
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
                  className="w-full bg-black hover:bg-black/90"
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

          {/* API Docs Tab - Updated */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>REST API endpoint for generating TP-branded presentations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Endpoint</Label>
                  <code className="block rounded bg-muted p-3 text-sm">POST /api/generate-ppt</code>
                </div>

                <div className="space-y-2">
                  <Label>Request Body</Label>
                  <pre className="overflow-auto rounded bg-muted p-4 text-sm">
                    {JSON.stringify(examplePayload, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <Label>Response</Label>
                  <pre className="overflow-auto rounded bg-muted p-4 text-sm">
                    {JSON.stringify(
                      {
                        fileName: "TP_Presentation_1234567890.pptx",
                        fileBase64: "<base64-encoded-pptx>",
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>

                <div className="space-y-2">
                  <Label>Supported Slide Types</Label>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { type: "title", master: "TP_TITLE", desc: "Black background title slide" },
                      {
                        type: "chapter",
                        master: "TP_CHAPTER",
                        desc: "Chapter divider with number & optional image (1-33)",
                      },
                      { type: "content", master: "TP_CONTENT_WHITE/BEIGE", desc: "Text content slide" },
                      { type: "bullets", master: "TP_CONTENT_WHITE/BEIGE", desc: "Bullet list slide" },
                      { type: "two-column", master: "TP_CONTENT_WHITE/BEIGE", desc: "Two column layout" },
                      { type: "image", master: "TP_CONTENT_WHITE/BEIGE", desc: "Image slide (base64)" },
                    ].map((item) => (
                      <div key={item.type} className="rounded-lg border p-3">
                        <div className="font-medium">{item.type}</div>
                        <div className="text-xs text-muted-foreground">{item.master}</div>
                        <div className="mt-1 text-sm">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Example Client Code</Label>
                  <pre className="overflow-auto rounded bg-muted p-4 text-sm">
                    {`const response = await fetch('/api/generate-ppt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "TP Presentation",
    slides: [
      { type: "title", master: "TP_TITLE", title: "Hello", subtitle: "World" },
      { type: "chapter", master: "TP_CHAPTER", chapterNumber: 1, title: "Intro", chapterImageNumber: 5 },
      { type: "content", master: "TP_CONTENT_WHITE", title: "Overview", content: "..." }
    ]
  })
});

const { fileName, fileBase64 } = await response.json();

// Convert base64 to blob and download
const binary = atob(fileBase64);
const bytes = new Uint8Array(binary.length);
for (let i = 0; i < binary.length; i++) {
  bytes[i] = binary.charCodeAt(i);
}
const blob = new Blob([bytes], { 
  type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
});
const url = URL.createObjectURL(blob);
window.open(url);`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Power Automate Tab - Updated */}
          <TabsContent value="power-automate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Power Automate Integration</CardTitle>
                <CardDescription>Steps to integrate with Microsoft Power Automate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
Headers: Content-Type: application/json
Body: {
  "title": "@{triggerOutputs()?['body/Title']}",
  "slides": [
    {
      "type": "title",
      "master": "TP_TITLE",
      "title": "@{triggerOutputs()?['body/Title']}",
      "subtitle": "@{triggerOutputs()?['body/Subtitle']}"
    },
    {
      "type": "chapter",
      "master": "TP_CHAPTER",
      "chapterNumber": 1,
      "title": "Overview",
      "chapterImageNumber": 1
    },
    {
      "type": "content",
      "master": "TP_CONTENT_WHITE",
      "title": "Summary",
      "content": "@{triggerOutputs()?['body/Content']}"
    }
  ]
}`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white">
                      2
                    </span>
                    <Label>Create File Action (OneDrive/SharePoint)</Label>
                  </div>
                  <pre className="overflow-auto rounded bg-muted p-4 text-sm">
                    {`File Name: @{body('HTTP')['fileName']}
File Content: @{base64ToBinary(body('HTTP')['fileBase64'])}`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white">
                      3
                    </span>
                    <Label>Environment Variables (Vercel)</Label>
                  </div>
                  <div className="rounded-lg border p-4 space-y-2 text-sm">
                    <p>
                      <code className="bg-muted px-1 rounded">PPT_API_KEY</code> - Optional API key for authentication
                    </p>
                    <p>
                      <code className="bg-muted px-1 rounded">CHAPTER_IMAGE_BASE_URL</code> - Base URL for chapter
                      images
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Example: <code>https://your-blob-storage.vercel-storage.com/images/chapter</code>
                    </p>
                    <p className="text-muted-foreground">
                      Upload images as <code>image1.png</code> through <code>image33.png</code> (or .jpg/.jpeg)
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                  <h4 className="font-semibold text-yellow-600">Production Notes</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>
                      • Set <code className="bg-muted px-1 rounded">PPT_API_KEY</code> for authentication
                    </li>
                    <li>
                      • Include API key in body or <code className="bg-muted px-1 rounded">x-api-key</code> header
                    </li>
                    <li>• Maximum payload size: 10MB</li>
                    <li>• Logos are embedded automatically from Vercel blob storage</li>
                    <li>
                      • Chapter images require <code className="bg-muted px-1 rounded">CHAPTER_IMAGE_BASE_URL</code> to
                      be set
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
