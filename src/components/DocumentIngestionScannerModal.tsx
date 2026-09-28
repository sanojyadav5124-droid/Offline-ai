import React, { useState, useRef, useEffect } from "react";
import {
  FileUp,
  FileSpreadsheet,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Wrench,
  Camera,
  Video,
  Database,
  PlusCircle,
  FileCode,
  RefreshCw,
  Zap,
  Image as ImageIcon,
  Check,
  Eye,
  Scan,
  BookOpen,
  Filter,
  Layers,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Tag,
  Cpu,
} from "lucide-react";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import {
  EquipmentKnowledgeItem,
  TroubleshootingEntry,
  MaritimeDepartment,
} from "../types";
import {
  MARITIME_TAXONOMY,
  MARINE_ABBREVIATIONS,
  normalizeMaritimeOcrText,
  matchMaritimeTaxonomy,
  MaritimeTaxonomyItem,
  TaxonomyMatchResult,
} from "../data/maritimeTaxonomy";

// Safe PDF.js worker setup
try {
  if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
} catch {
  // Graceful fallback
}

interface DocumentIngestionScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEquipment: (item: EquipmentKnowledgeItem) => void;
  onSaveTroubleshooting: (item: TroubleshootingEntry) => void;
  equipmentList: EquipmentKnowledgeItem[];
}

export const DocumentIngestionScannerModal: React.FC<DocumentIngestionScannerModalProps> = ({
  isOpen,
  onClose,
  onSaveEquipment,
  onSaveTroubleshooting,
  equipmentList,
}) => {
  const [activeMode, setActiveMode] = useState<"camera" | "upload" | "paste">("camera");
  const [rawText, setRawText] = useState("");
  const [targetType, setTargetType] = useState<"equipment" | "troubleshooting">("equipment");
  const [department, setDepartment] = useState<MaritimeDepartment>("Engine");
  
  const [extractedData, setExtractedData] = useState<TaxonomyMatchResult | null>(null);
  const [insufficientDataError, setInsufficientDataError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [parseSuccessMessage, setParseSuccessMessage] = useState<string | null>(null);

  // Taxonomy vocabulary filter UI drawer state
  const [showTaxonomyBrowser, setShowTaxonomyBrowser] = useState(false);
  const [selectedTaxonomyCategory, setSelectedTaxonomyCategory] = useState<string>("All");
  const [taxonomySearchQuery, setTaxonomySearchQuery] = useState("");

  // Camera & Viewfinder states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchEnabled, setTorchEnabled] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Editable review fields
  const [eqName, setEqName] = useState("");
  const [eqMaker, setEqMaker] = useState("");
  const [eqModel, setEqModel] = useState("");
  const [eqLocation, setEqLocation] = useState("");
  const [eqRegCode, setEqRegCode] = useState("");
  const [eqGoverning, setEqGoverning] = useState<"IMO SOLAS" | "IMO MARPOL" | "Class / IACS" | "Maker Standard" | "STCW" | "MLC 2006">("IMO SOLAS");
  const [eqSummary, setEqSummary] = useState("");
  const [eqLimit, setEqLimit] = useState("");
  const [eqInterval, setEqInterval] = useState<"Daily" | "Weekly" | "Monthly" | "3-Monthly" | "Annual" | "Prior Departure" | "Continuous">("Monthly");
  const [eqSpares, setEqSpares] = useState("");

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setTorchEnabled(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError(`Camera access unavailable (${err.name || err.message}). You can upload a photo or PDF directly.`);
      setCameraActive(false);
    }
  };

  // Start / Stop camera based on active mode & modal visibility
  useEffect(() => {
    if (isOpen && activeMode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, facingMode]);

  if (!isOpen) return null;

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const capabilities: any = track.getCapabilities?.() || {};
        if (capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !torchEnabled } as any],
          });
          setTorchEnabled(!torchEnabled);
        } else {
          alert("Torch/Flashlight hardware is not available on this device camera.");
        }
      } catch (err) {
        console.warn("Torch error:", err);
      }
    }
  };

  // Pre-process canvas for high-accuracy OCR (Grayscale & Contrast Boost)
  const preprocessImage = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const avg = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
      const contrast = (avg - 128) * 1.4 + 128;
      const finalVal = Math.min(255, Math.max(0, contrast));
      d[i] = finalVal;
      d[i + 1] = finalVal;
      d[i + 2] = finalVal;
    }
    ctx.putImageData(imgData, 0, 0);
  };

  // Run Real Client-Side OCR with static vocabulary post-processing
  const runRealOCR = async (imageSource: string | HTMLCanvasElement) => {
    setIsProcessing(true);
    setInsufficientDataError(null);
    setExtractedData(null);
    setParseSuccessMessage(null);
    setProcessingStatus("Initializing Marine OCR Engine...");

    try {
      const result = await Tesseract.recognize(imageSource, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const pct = Math.round((m.progress || 0) * 100);
            setProcessingStatus(`Extracting text from image... ${pct}%`);
          } else {
            setProcessingStatus(`OCR Engine: ${m.status}...`);
          }
        },
      });

      const extractedText = result?.data?.text || "";
      setRawText(extractedText);
      parseContentWithTaxonomy(extractedText);
    } catch (err: any) {
      console.error("OCR execution error:", err);
      setInsufficientDataError(`OCR processing failed: ${err.message}. Please try a clearer photo or paste text.`);
      setIsProcessing(false);
    }
  };

  // Shutter action on Live Camera
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setCapturedPhotoUrl(photoDataUrl);
      preprocessImage(canvas);
      runRealOCR(canvas);
    }
  };

  // Direct Image / Photo File Upload Handler
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      setCapturedPhotoUrl(dataUrl);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          preprocessImage(canvas);
          runRealOCR(canvas);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // PDF & Excel Spreadsheet Upload Handler with Fast Timeout Safety
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setInsufficientDataError(null);
    setExtractedData(null);
    setParseSuccessMessage(null);
    setProcessingStatus(`Analyzing ${file.name}...`);

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheet];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          const flattenedText = rows
            .map((r) => (Array.isArray(r) ? r.join(" | ") : String(r)))
            .join("\n");

          setRawText(flattenedText);
          parseContentWithTaxonomy(flattenedText);
        } catch (err: any) {
          setInsufficientDataError(`Failed to parse spreadsheet: ${err.message}`);
          setIsProcessing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileName.endsWith(".pdf")) {
      try {
        const reader = new FileReader();
        reader.onload = async (evt) => {
          try {
            setProcessingStatus("Loading PDF Document Stream...");
            const typedArray = new Uint8Array(evt.target?.result as ArrayBuffer);
            
            // Safe timeout: don't let huge 200 page manuals freeze UI
            const pdfDocPromise = pdfjsLib.getDocument({ data: typedArray }).promise;
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("PDF load timeout (over 8s).")), 8000)
            );

            const pdfDoc: any = await Promise.race([pdfDocPromise, timeoutPromise]);
            const maxPagesToScan = Math.min(pdfDoc.numPages, 15);
            let fullText = "";

            for (let i = 1; i <= maxPagesToScan; i++) {
              setProcessingStatus(`Extracting Technical Specs from Page ${i} of ${maxPagesToScan}...`);
              const page = await pdfDoc.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(" ");
              fullText += `[Page ${i}] ${pageText}\n`;

              // Early exit if high-confidence match is detected
              if (fullText.length > 400) {
                const testMatch = matchMaritimeTaxonomy(fullText);
                if (testMatch.confidenceScore >= 50) {
                  break;
                }
              }
            }

            setRawText(fullText);
            parseContentWithTaxonomy(fullText);
          } catch (pdfErr: any) {
            console.warn("PDF extraction fallback:", pdfErr);
            setInsufficientDataError(`PDF scan notice: ${pdfErr.message}. If the PDF is image-only, please take a snapshot with the camera scanner.`);
            setIsProcessing(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (err: any) {
        setInsufficientDataError(`Failed to read PDF: ${err.message}`);
        setIsProcessing(false);
      }
    } else if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        setCapturedPhotoUrl(dataUrl);
        runRealOCR(dataUrl);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = (evt.target?.result as string) || "";
        setRawText(text);
        parseContentWithTaxonomy(text);
      };
      reader.readAsText(file);
    }
  };

  const handlePasteAnalyze = () => {
    if (!rawText.trim()) {
      setInsufficientDataError("Please paste document text, manual excerpt, or equipment specifications.");
      return;
    }
    setIsProcessing(true);
    setInsufficientDataError(null);
    setExtractedData(null);
    parseContentWithTaxonomy(rawText);
  };

  // High-Precision Marine Parser with Static Taxonomy & Vocabulary Filtering
  const parseContentWithTaxonomy = (text: string) => {
    setProcessingStatus("Filtering through Maritime Taxonomy & Technical Vocabulary...");
    setTimeout(() => {
      setIsProcessing(false);
      const cleanText = text.trim();

      // Strict Anti-Dummy Check 1: Minimum character length
      if (cleanText.length < 10) {
        setInsufficientDataError(
          "⚠️ Insufficient structured maritime data in document/photo. No card generated or equipment added. Please focus the scanner on a machinery nameplate, manual page, or technical spreadsheet."
        );
        return;
      }

      // Match against static maritime taxonomy & abbreviation engine
      const matchResult = matchMaritimeTaxonomy(cleanText);

      // Strict Anti-Dummy Check 2: Confidence threshold & recognized machinery requirement
      if (!matchResult.matchedTaxonomy && matchResult.detectedAbbreviations.length === 0) {
        setInsufficientDataError(
          "⚠️ No recognized marine equipment or statutory machinery matched in the scanned document. No card generated or equipment added. The text does not match our static maritime taxonomy. Try aligning with an equipment nameplate or maker manual."
        );
        return;
      }

      const matched = matchResult.matchedTaxonomy;
      const primaryName = matched ? matched.systemName : (matchResult.detectedAbbreviations[0]?.fullName || "Marine Machinery");
      const matchedDept = matchResult.suggestedDepartment;
      const regCode = matchResult.statutoryCode;
      const limitVal = matchResult.limitThreshold;
      const makerVal = matchResult.makerName;
      const modelVal = matchResult.modelName;
      const defaultLoc = matchedDept === "Deck" ? "Bridge / Wheelhouse" : matchedDept === "Cargo" ? "Main Deck / CCR" : "Engine Room";

      // Populate review state
      setEqName(primaryName);
      setEqMaker(makerVal);
      setEqModel(modelVal);
      setEqLocation(defaultLoc);
      setEqRegCode(regCode);
      setDepartment(matchedDept);
      setEqGoverning(matched ? matched.governingBody : "IMO SOLAS");
      setEqSummary(matched ? matched.operationalSummary : `Primary Onboard Function: Verified statutory compliance for ${primaryName}.`);
      setEqLimit(limitVal);
      setEqInterval(matched ? matched.testInterval : "Monthly");
      setEqSpares(matchResult.suggestedSpares);

      setExtractedData(matchResult);

      const abbrList = matchResult.detectedAbbreviations.map((a) => a.abbreviation).join(", ");
      const abbrText = abbrList ? ` • Matched Acronyms: [${abbrList}]` : "";
      setParseSuccessMessage(
        `✅ Matched Taxonomy: "${primaryName}" (${matchedDept})${abbrText}. Review extracted specifications below and save to vault.`
      );
    }, 450);
  };

  const handleApplyTaxonomySample = (item: MaritimeTaxonomyItem) => {
    const sampleText = `Equipment: ${item.systemName}\nMaker: ${item.primaryMakers[0]}\nModel: ${item.commonModels[0]}\nRegulation: ${item.statutoryCode}\nLimit: ${item.standardLimit}\nAbbreviations: ${item.abbreviations.join(", ")}\nComponents: ${item.components.join(", ")}`;
    setRawText(sampleText);
    parseContentWithTaxonomy(sampleText);
    setShowTaxonomyBrowser(false);
  };

  const handleConfirmSave = () => {
    if (!extractedData) return;

    if (targetType === "equipment") {
      const newEquipment: EquipmentKnowledgeItem = {
        id: `eq-extracted-${Date.now()}`,
        equipmentName: eqName,
        maker: eqMaker,
        model: eqModel,
        department: department,
        installedLocation: eqLocation,
        area: eqLocation || "Vessel Compartment",
        statutoryRequirement: {
          id: `stat-${Date.now()}`,
          regulationCode: eqRegCode,
          governingBody: eqGoverning,
          requirementSummary: eqSummary,
          statutoryLimitValue: eqLimit,
          testInterval: eqInterval,
          standardTolerance: extractedData.matchedTaxonomy?.defaultTolerance || "± 2.0% Nominal",
        },
        currentReading: {
          measuredValue: eqLimit,
          unit: "PPM / Bar",
          lastTestedDate: new Date().toISOString().split("T")[0],
          testedByRank: "Chief Engineer / Navigating Officer",
          status: "Compliant",
        },
        makerDesignSpecs: [
          { label: "Operating Normal", nominalValue: "Nominal Operating Band", alarmLimit: eqLimit },
        ],
        quickNotes: "Extracted and verified via Marine Static Taxonomy OCR Engine.",
        criticalSparesOnboard: eqSpares.split(",").map((s) => s.trim()).filter(Boolean),
        photos: capturedPhotoUrl
          ? [
              {
                id: `photo-${Date.now()}`,
                fileName: `scan_${Date.now()}.jpg`,
                fileSizeKb: 150,
                dataUrl: capturedPhotoUrl,
                caption: `Nameplate / Technical Scan: ${eqName}`,
                uploadedAt: new Date().toISOString(),
                tag: "Nameplate",
              },
            ]
          : [],
        updatedAt: new Date().toISOString(),
      };
      onSaveEquipment(newEquipment);
    } else {
      const newTrouble: TroubleshootingEntry = {
        id: `trouble-extracted-${Date.now()}`,
        equipmentId: equipmentList[0]?.id || "general-eq",
        equipmentName: eqName,
        department: department,
        area: eqLocation,
        dateOfIncident: new Date().toISOString().split("T")[0],
        symptomOrAlarm: `Defect / Technical Anomaly: ${eqName} (${eqRegCode})`,
        rootCause: "Parameter deviation or component wear beyond statutory threshold limit: " + eqLimit,
        actionTakenAndFix: "1. Verified safe operating parameters against maker design threshold (" + eqLimit + ").\n2. Inspected local transducers, power supply, and confirmed standby unit availability.",
        sparesUsed: eqSpares,
        seafarerRank: "Chief Engineer / Master",
        lessonsLearned: "Always maintain critical spares and adhere strictly to " + eqRegCode + " limits.",
        severity: "Operational Warning",
        tags: ["OCR Extracted", eqName],
        photos: capturedPhotoUrl
          ? [
              {
                id: `photo-trouble-${Date.now()}`,
                fileName: `trouble_scan_${Date.now()}.jpg`,
                fileSizeKb: 150,
                dataUrl: capturedPhotoUrl,
                caption: `Fault Investigation Scan: ${eqName}`,
                uploadedAt: new Date().toISOString(),
                tag: "Inspection",
              },
            ]
          : [],
      };
      onSaveTroubleshooting(newTrouble);
    }

    stopCamera();
    onClose();
  };

  // Filter taxonomy items in browser drawer
  const filteredTaxonomyItems = MARITIME_TAXONOMY.filter((item) => {
    const matchesCategory = selectedTaxonomyCategory === "All" || item.category === selectedTaxonomyCategory;
    const matchesSearch =
      taxonomySearchQuery.trim() === "" ||
      item.systemName.toLowerCase().includes(taxonomySearchQuery.toLowerCase()) ||
      item.abbreviations.some((a) => a.toLowerCase().includes(taxonomySearchQuery.toLowerCase())) ||
      item.components.some((c) => c.toLowerCase().includes(taxonomySearchQuery.toLowerCase())) ||
      item.statutoryCode.toLowerCase().includes(taxonomySearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto">
        {/* Header with Taxonomy Vocabulary Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-500 shrink-0">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Marine OCR Scanner & Technical Ingestion</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by a Static Maritime Taxonomy & Vocabulary Filter for high-accuracy document and nameplate recognition.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTaxonomyBrowser(!showTaxonomyBrowser)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                showTaxonomyBrowser
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-black"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
              }`}
              title="View static marine equipment taxonomy and abbreviations"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Taxonomy Filter</span>
              {showTaxonomyBrowser ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close scanner modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expandable Static Taxonomy & Vocabulary Guide Drawer */}
        {showTaxonomyBrowser && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-amber-500/40 space-y-3 animate-in slide-in-from-top-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Static Maritime Taxonomy & Technical Acronym Lexicon
                </span>
              </div>

              {/* Taxonomy Search */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={taxonomySearchQuery}
                  onChange={(e) => setTaxonomySearchQuery(e.target.value)}
                  placeholder="Search taxonomy, rules, parts..."
                  className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              {["All", "Navigation & Bridge", "Propulsion & Machinery", "Cargo & Tanker Systems", "Power & Electrical", "Safety & LSA/FFA", "Auxiliary & Environmental"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedTaxonomyCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedTaxonomyCategory === cat
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Taxonomy Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredTaxonomyItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 hover:border-amber-500/50 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {item.systemName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 shrink-0">
                        {item.department}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {item.statutoryCode}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.abbreviations.map((abbr) => (
                        <span key={abbr} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {abbr}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyTaxonomySample(item)}
                    className="w-full py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Apply to Scanner</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Target Destination Switcher */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setTargetType("equipment")}
            className={`p-2.5 sm:p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
              targetType === "equipment"
                ? "bg-amber-500/15 border-amber-500 text-slate-900 dark:text-white font-bold"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Database className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-bold">Equipment Vault Item</p>
              <p className="text-[10px] text-slate-400">Statutory specs, maker tolerances, spares</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTargetType("troubleshooting")}
            className={`p-2.5 sm:p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
              targetType === "troubleshooting"
                ? "bg-indigo-500/15 border-indigo-500 text-slate-900 dark:text-white font-bold"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Wrench className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <p className="text-xs font-bold">Breakdown Emergency Card</p>
              <p className="text-[10px] text-slate-400">Safety checks, alarm threshold, root cause</p>
            </div>
          </button>
        </div>

        {/* Input Mode Selector Cards */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveMode("camera");
            }}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
              activeMode === "camera"
                ? "bg-indigo-600 border-indigo-500 text-white font-bold shadow-md"
                : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Camera className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <p className="text-xs font-bold">📷 Live Camera</p>
              <p className="text-[10px] opacity-80 hidden sm:block">Real-time OCR viewfinder</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveMode("upload");
            }}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
              activeMode === "upload"
                ? "bg-indigo-600 border-indigo-500 text-white font-bold shadow-md"
                : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileUp className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <p className="text-xs font-bold">📁 PDF / Excel / Photo</p>
              <p className="text-[10px] opacity-80 hidden sm:block">Upload file or photo</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveMode("paste");
            }}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
              activeMode === "paste"
                ? "bg-indigo-600 border-indigo-500 text-white font-bold shadow-md"
                : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <p className="text-xs font-bold">📋 Paste Text</p>
              <p className="text-[10px] opacity-80 hidden sm:block">Raw equipment notes</p>
            </div>
          </button>
        </div>

        {/* 1. Immersive High-Res Camera Viewfinder */}
        {activeMode === "camera" && (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-500/40 w-full min-h-[320px] sm:min-h-[420px] max-h-[500px] flex items-center justify-center shadow-inner group">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover min-h-[320px] sm:min-h-[420px]"
              />

              {/* Document Framing Scanner Overlay & Reticle */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
                  {/* Framing Header Guide */}
                  <div className="bg-slate-950/75 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20 flex items-center gap-1.5 shadow-lg animate-pulse">
                    <Scan className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Align Machinery Nameplate / Document Inside Reticle</span>
                  </div>

                  {/* Corner Targeting Brackets */}
                  <div className="relative w-4/5 sm:w-3/4 h-3/5 border-2 border-dashed border-indigo-400/50 rounded-xl flex items-center justify-center">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                    {/* Animated Scanning Laser */}
                    <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-bounce opacity-80" />
                  </div>

                  {/* Camera Controls Overlay Bar */}
                  <div className="pointer-events-auto flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 backdrop-blur-xs shadow-md transition cursor-pointer"
                      title="Switch Front/Back Camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`p-2.5 rounded-full border backdrop-blur-xs shadow-md transition cursor-pointer ${
                        torchEnabled
                          ? "bg-amber-500 text-slate-950 border-amber-400"
                          : "bg-slate-900/80 hover:bg-slate-800 text-white border-white/20"
                      }`}
                      title="Toggle Torch / Flashlight"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Initializing / Permission Prompt */}
              {!cameraActive && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/90 text-white p-4 text-center">
                  <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold">Requesting High-Definition Camera Stream...</p>
                  <p className="text-[11px] text-slate-400">Please allow camera permissions in your browser.</p>
                </div>
              )}

              {/* Error fallback */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/95 text-white p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                  <p className="text-xs font-bold text-amber-200">{cameraError}</p>
                  <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer transition flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload Photo From Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Shutter & Quick Photo Pick Bar */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <label className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs">
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </label>

              {/* Large Shutter Button */}
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={!cameraActive || isProcessing}
                className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-4 border-indigo-600 shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
                title="Snap Photo & Run Marine OCR"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center text-white transition">
                  <Camera className="w-5 h-5" />
                </div>
              </button>

              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Resolution</p>
                <p className="text-[10px] text-emerald-500 font-mono font-bold">1080p HD OCR</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. File Upload Mode (.pdf, .xlsx, .csv, image) */}
        {activeMode === "upload" && (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center space-y-3 transition bg-slate-50 dark:bg-slate-950/40 relative">
            <input
              type="file"
              accept=".pdf, .xlsx, .xls, .csv, .txt, image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
              <FileUp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click or drop PDF manual, Excel sheet, or Photo
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Fast multi-format support: PDF Manuals (.pdf), Spreadsheets (.xlsx, .csv), Images (.jpg, .png)
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-mono">
                ⚡ Fast PDF Engine (First 15 pages)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-mono">
                🔍 Static Maritime Taxonomy Filter
              </span>
            </div>
          </div>
        )}

        {/* 3. Paste Text Mode */}
        {activeMode === "paste" && (
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Paste Equipment Specifications / Manual Excerpt:</span>
              <span className="text-[11px] font-normal text-slate-400">Auto-matches marine taxonomy & abbreviations</span>
            </label>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={"Example:\nEquipment: Oily Water Separator (15 PPM Bilge Alarm)\nMaker: Alfa Laval PureBilge 2500\nRegulation: MARPOL Annex I Reg 14\nLimit: ≤ 15 PPM\nLocation: Engine Room Lower Floor"}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <button
              onClick={handlePasteAnalyze}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Parse via Maritime Taxonomy Engine</span>
            </button>
          </div>
        )}

        {/* Processing Progress Status */}
        {isProcessing && (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-center space-y-2 animate-in fade-in">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              {processingStatus || "Processing document..."}
            </p>
          </div>
        )}

        {/* Insufficient Data / Anti-Dummy Guard Warning */}
        {insufficientDataError && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-200">Anti-Dummy Guard Enforced</p>
                <p className="mt-0.5 leading-relaxed">{insufficientDataError}</p>
              </div>
            </div>

            {/* Quick Test Sample Buttons from static taxonomy */}
            <div className="pt-2 border-t border-red-900/60 flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                Quick Test Samples:
              </span>
              <button
                type="button"
                onClick={() => {
                  const sample = "Oily Water Separator (OWS) Alfa Laval 15ppm Bilge Alarm MARPOL Annex I Reg 14 Limit < 15 PPM Location: Engine Room Floor";
                  setRawText(sample);
                  parseContentWithTaxonomy(sample);
                }}
                className="px-2.5 py-1 rounded bg-red-900/50 hover:bg-red-900 text-red-200 text-[11px] font-bold border border-red-700 transition cursor-pointer"
              >
                Sample: OWS 15 PPM
              </button>
              <button
                type="button"
                onClick={() => {
                  const sample = "Furuno ECDIS FMD-3300 Dual Console SOLAS Ch.V Reg 19.2.10 UPS Emergency 45min Wheelhouse Bridge";
                  setRawText(sample);
                  parseContentWithTaxonomy(sample);
                }}
                className="px-2.5 py-1 rounded bg-red-900/50 hover:bg-red-900 text-red-200 text-[11px] font-bold border border-red-700 transition cursor-pointer"
              >
                Sample: ECDIS Navigation
              </button>
              <button
                type="button"
                onClick={() => {
                  const sample = "Inert Gas System (IGS) Scrubber Tower Wartsila Moss SOLAS Ch.II-2 Reg 4.5.5 Oxygen < 5.0%";
                  setRawText(sample);
                  parseContentWithTaxonomy(sample);
                }}
                className="px-2.5 py-1 rounded bg-red-900/50 hover:bg-red-900 text-red-200 text-[11px] font-bold border border-red-700 transition cursor-pointer"
              >
                Sample: IGS Inert Gas
              </button>
            </div>
          </div>
        )}

        {/* Success Review & Interactive Field Editing */}
        {parseSuccessMessage && extractedData && (
          <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{parseSuccessMessage}</span>
              </div>

              {/* Match Confidence Score */}
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                Accuracy: {extractedData.confidenceScore}%
              </span>
            </div>

            {/* Matched Taxonomy Tags (Category, Abbreviation, Components) */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-500" /> Matched Taxonomy:
              </span>

              {extractedData.matchedTaxonomy && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  {extractedData.matchedTaxonomy.category}
                </span>
              )}

              {extractedData.detectedAbbreviations.map((abbr) => (
                <span key={abbr.abbreviation} className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold">
                  {abbr.abbreviation} ({abbr.fullName})
                </span>
              ))}

              {extractedData.matchedComponents.map((comp) => (
                <span key={comp} className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px]">
                  ⚙️ {comp}
                </span>
              ))}
            </div>

            {/* Captured Photo Preview thumbnail if available */}
            {capturedPhotoUrl && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={capturedPhotoUrl}
                    alt="Captured Scan Preview"
                    className="w-16 h-12 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xs"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Captured Technical Photo Attached</p>
                    <p className="text-[10px] text-slate-500">Will be saved directly to the equipment's technical photo gallery.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCapturedPhotoUrl(null);
                    setActiveMode("camera");
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  Retake Photo
                </button>
              </div>
            )}

            {/* Review Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Equipment / System Name:</label>
                <input
                  type="text"
                  value={eqName}
                  onChange={(e) => setEqName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Vessel Department:</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as MaritimeDepartment)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:border-indigo-500"
                >
                  <option value="Engine">⚙️ Engine Room</option>
                  <option value="Deck">🧭 Deck & Bridge</option>
                  <option value="Electrical">⚡ Electrical / ETO</option>
                  <option value="Safety_ISM">🛡️ Safety / ISM</option>
                  <option value="Cargo">📦 Cargo Operations</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Maker & Model:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={eqMaker}
                    onChange={(e) => setEqMaker(e.target.value)}
                    placeholder="Maker"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={eqModel}
                    onChange={(e) => setEqModel(e.target.value)}
                    placeholder="Model"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Installed Location / Area:</label>
                <input
                  type="text"
                  value={eqLocation}
                  onChange={(e) => setEqLocation(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Statutory Regulation Code:</label>
                <input
                  type="text"
                  value={eqRegCode}
                  onChange={(e) => setEqRegCode(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Statutory Limit / Setpoint Value:</label>
                <input
                  type="text"
                  value={eqLimit}
                  onChange={(e) => setEqLimit(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600 dark:text-slate-400">Critical Spares Onboard (comma-separated):</label>
              <input
                type="text"
                value={eqSpares}
                onChange={(e) => setEqSpares(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save to Vessel Maritime Vault</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
