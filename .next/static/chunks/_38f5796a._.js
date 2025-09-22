(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/meetings/[id]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MeetingRecordPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function MeetingRecordPage() {
    var _meetingStatus_meeting_transcription;
    _s();
    const { id } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const [stream, setStream] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [recorder, setRecorder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [recording, setRecording] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [seconds, setSeconds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [chunksSent, setChunksSent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [meetingStatus, setMeetingStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showSummary, setShowSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasShownSummary, setHasShownSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const chunkIndexRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const timerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const statusCheckRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Start timer when recording starts
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MeetingRecordPage.useEffect": ()=>{
            if (recording) {
                timerRef.current = setInterval({
                    "MeetingRecordPage.useEffect": ()=>{
                        setSeconds({
                            "MeetingRecordPage.useEffect": (prev)=>prev + 1
                        }["MeetingRecordPage.useEffect"]);
                    }
                }["MeetingRecordPage.useEffect"], 1000);
            } else {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            }
            return ({
                "MeetingRecordPage.useEffect": ()=>{
                    if (timerRef.current) clearInterval(timerRef.current);
                }
            })["MeetingRecordPage.useEffect"];
        }
    }["MeetingRecordPage.useEffect"], [
        recording
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MeetingRecordPage.useEffect": ()=>{
            return ({
                "MeetingRecordPage.useEffect": ()=>{
                    if (timerRef.current) clearInterval(timerRef.current);
                    if (statusCheckRef.current) clearInterval(statusCheckRef.current);
                    recorder === null || recorder === void 0 ? void 0 : recorder.stop();
                    stream === null || stream === void 0 ? void 0 : stream.getTracks().forEach({
                        "MeetingRecordPage.useEffect": (t)=>t.stop()
                    }["MeetingRecordPage.useEffect"]);
                }
            })["MeetingRecordPage.useEffect"];
        }
    }["MeetingRecordPage.useEffect"], [
        recorder,
        stream
    ]);
    // Check meeting status periodically after recording stops
    const checkMeetingStatus = async ()=>{
        try {
            const res = await fetch("/api/meetings/".concat(id, "/status"));
            if (res.ok) {
                const data = await res.json();
                setMeetingStatus(data);
                // Auto-show summary when it becomes available (only once)
                if (data.meeting.summary && !hasShownSummary) {
                    setShowSummary(true);
                    setHasShownSummary(true);
                }
                // Stop checking if completed or failed
                if (data.meeting.status === 'completed' || data.meeting.status === 'failed') {
                    if (statusCheckRef.current) {
                        clearInterval(statusCheckRef.current);
                        statusCheckRef.current = null;
                    }
                }
            }
        } catch (error) {
            console.error('Error checking meeting status:', error);
        }
    };
    const start = async ()=>{
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            setStream(userStream);
            const mime = 'audio/webm'; // brede support (Chrome/Edge/Firefox). Safari: fallback mogelijk (m4a) in latere stap.
            const rec = new MediaRecorder(userStream, {
                mimeType: mime
            });
            rec.ondataavailable = async (e)=>{
                if (e.data && e.data.size > 0) {
                    const idx = chunkIndexRef.current++;
                    const fd = new FormData();
                    fd.append('chunk', e.data, "chunk-".concat(idx, ".webm"));
                    fd.append('chunkIndex', String(idx));
                    try {
                        const res = await fetch("/api/meetings/".concat(id, "/audio"), {
                            method: 'POST',
                            body: fd
                        });
                        if (res.ok) setChunksSent((prev)=>prev + 1);
                        else console.error('upload fout', await res.text());
                    } catch (err) {
                        console.error('upload error', err);
                    }
                }
            };
            rec.start(15000); // elke 15s een chunk
            setRecorder(rec);
            setSeconds(0);
            setRecording(true); // Timer starts via useEffect
        } catch (err) {
            alert('Microfoon-toegang geweigerd of niet beschikbaar.');
            console.error(err);
        }
    };
    const stop = async ()=>{
        if (!recorder) return;
        recorder.stop();
        setRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        stream === null || stream === void 0 ? void 0 : stream.getTracks().forEach((t)=>t.stop());
        setStream(null);
        setRecorder(null);
        try {
            await fetch("/api/meetings/".concat(id, "/finish"), {
                method: 'POST'
            });
            // Start checking status every 2 seconds for faster updates
            statusCheckRef.current = setInterval(checkMeetingStatus, 2000);
            checkMeetingStatus(); // Check immediately
        } catch (error) {
            console.error('Error finishing meeting:', error);
        }
    };
    const fmt = (s)=>new Date(s * 1000).toISOString().substring(11, 19);
    const getStatusColor = (status)=>{
        switch(status){
            case 'recording':
                return '#007bff';
            case 'processing':
                return '#ffc107';
            case 'completed':
                return '#28a745';
            case 'failed':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };
    const getStatusText = (status)=>{
        switch(status){
            case 'recording':
                return 'Opname bezig';
            case 'processing':
                return 'Verwerken van audio...';
            case 'completed':
                return 'Klaar! Samenvatting verzonden';
            case 'failed':
                return 'Fout bij verwerken';
            default:
                return status;
        }
    };
    const renderSummary = ()=>{
        if (!(meetingStatus === null || meetingStatus === void 0 ? void 0 : meetingStatus.meeting.summary)) return null;
        const summary = meetingStatus.meeting.summary;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                marginTop: '20px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: '28px',
                                marginRight: '12px'
                            },
                            children: "📋"
                        }, void 0, false, {
                            fileName: "[project]/app/meetings/[id]/page.tsx",
                            lineNumber: 166,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: {
                                margin: '0',
                                color: '#495057'
                            },
                            children: "Nederlandse Meeting Samenvatting"
                        }, void 0, false, {
                            fileName: "[project]/app/meetings/[id]/page.tsx",
                            lineNumber: 167,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/meetings/[id]/page.tsx",
                    lineNumber: 165,
                    columnNumber: 9
                }, this),
                summary.generalSummary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginBottom: '20px',
                        background: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                            style: {
                                color: '#495057',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        marginRight: '8px'
                                    },
                                    children: "💬"
                                }, void 0, false, {
                                    fileName: "[project]/app/meetings/[id]/page.tsx",
                                    lineNumber: 173,
                                    columnNumber: 15
                                }, this),
                                "Algemene Samenvatting"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/meetings/[id]/page.tsx",
                            lineNumber: 172,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                lineHeight: '1.6',
                                margin: '0',
                                color: '#6c757d'
                            },
                            children: summary.generalSummary
                        }, void 0, false, {
                            fileName: "[project]/app/meetings/[id]/page.tsx",
                            lineNumber: 175,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/meetings/[id]/page.tsx",
                    lineNumber: 171,
                    columnNumber: 11
                }, this),
                summary.keyPoints && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginBottom: '15px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                            children: "Belangrijke Punten:"
                        }, void 0, false, {
                            fileName: "[project]/app/meetings/[id]/page.tsx",
                            lineNumber: 181,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            children: summary.keyPoints.map((point, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: point
                                }, index, false, {
                                    fileName: "[project]/app/meetings/[id]/page.tsx",
                                    lineNumber: 184,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/meetings/[id]/page.tsx",
                            lineNumber: 182,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/meetings/[id]/page.tsx",
                    lineNumber: 180,
                    columnNumber: 11
                }, this),
                summary.decisions && summary.decisions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginBottom: '15px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                            children: "Beslissingen:"
                        }, void 0, false, {
                            fileName: "[project]/app/meetings/[id]/page.tsx",
                            lineNumber: 192,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            children: summary.decisions.map((decision, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: decision
                                }, index, false, {
                                    fileName: "[project]/app/meetings/[id]/page.tsx",
                                    lineNumber: 195,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/meetings/[id]/page.tsx",
                            lineNumber: 193,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/meetings/[id]/page.tsx",
                    lineNumber: 191,
                    columnNumber: 11
                }, this),
                summary.actionItems && summary.actionItems.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginBottom: '15px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                            children: "Actiepunten:"
                        }, void 0, false, {
                            fileName: "[project]/app/meetings/[id]/page.tsx",
                            lineNumber: 203,
                            columnNumber: 13
                        }, this),
                        summary.actionItems.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: '#fff',
                                    padding: '10px',
                                    margin: '5px 0',
                                    borderLeft: '4px solid #007bff'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "Taak:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/meetings/[id]/page.tsx",
                                        lineNumber: 206,
                                        columnNumber: 17
                                    }, this),
                                    " ",
                                    item.task,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/app/meetings/[id]/page.tsx",
                                        lineNumber: 206,
                                        columnNumber: 51
                                    }, this),
                                    item.assignee && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Toegewezen aan:"
                                            }, void 0, false, {
                                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                                lineNumber: 207,
                                                columnNumber: 37
                                            }, this),
                                            " ",
                                            item.assignee,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                                lineNumber: 207,
                                                columnNumber: 85
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    item.dueDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Deadline:"
                                            }, void 0, false, {
                                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                                lineNumber: 208,
                                                columnNumber: 36
                                            }, this),
                                            " ",
                                            item.dueDate
                                        ]
                                    }, void 0, true)
                                ]
                            }, index, true, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 205,
                                columnNumber: 15
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/meetings/[id]/page.tsx",
                    lineNumber: 202,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/meetings/[id]/page.tsx",
            lineNumber: 164,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: [
                    "Meeting ",
                    id
                ]
            }, void 0, true, {
                fileName: "[project]/app/meetings/[id]/page.tsx",
                lineNumber: 219,
                columnNumber: 7
            }, this),
            meetingStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#e9ecef',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    borderLeft: "4px solid ".concat(getStatusColor(meetingStatus.meeting.status))
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Status:"
                    }, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 229,
                        columnNumber: 11
                    }, this),
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: getStatusColor(meetingStatus.meeting.status)
                        },
                        children: getStatusText(meetingStatus.meeting.status)
                    }, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 229,
                        columnNumber: 36
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 231,
                        columnNumber: 18
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Titel:"
                    }, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 232,
                        columnNumber: 11
                    }, this),
                    " ",
                    meetingStatus.meeting.title,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 232,
                        columnNumber: 64
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Audio chunks:"
                    }, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 233,
                        columnNumber: 11
                    }, this),
                    " ",
                    meetingStatus.meeting.chunksCount,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 233,
                        columnNumber: 77
                    }, this),
                    meetingStatus.meeting.attendees.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Deelnemers:"
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 235,
                                columnNumber: 15
                            }, this),
                            " ",
                            meetingStatus.meeting.attendees.map((a)=>a.email).join(', ')
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/app/meetings/[id]/page.tsx",
                lineNumber: 222,
                columnNumber: 9
            }, this),
            recording && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#d4edda',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: "🔴 Opname actief"
                        }, void 0, false, {
                            fileName: "[project]/app/meetings/[id]/page.tsx",
                            lineNumber: 242,
                            columnNumber: 14
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 242,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            "Tijd: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: fmt(seconds)
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 243,
                                columnNumber: 20
                            }, this),
                            " · Verzonden chunks: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: chunksSent
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 243,
                                columnNumber: 72
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 243,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/meetings/[id]/page.tsx",
                lineNumber: 241,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 12,
                    marginBottom: '20px'
                },
                children: [
                    !recording ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: start,
                        style: {
                            padding: '12px 24px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        },
                        children: "Start opname"
                    }, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 249,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: stop,
                        style: {
                            padding: '12px 24px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        },
                        children: "Stop & afronden"
                    }, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 264,
                        columnNumber: 11
                    }, this),
                    (meetingStatus === null || meetingStatus === void 0 ? void 0 : meetingStatus.meeting.summary) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowSummary(!showSummary),
                        style: {
                            padding: '12px 24px',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        },
                        children: showSummary ? '📖 Verberg samenvatting' : '📋 Toon Nederlandse samenvatting'
                    }, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 281,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/meetings/[id]/page.tsx",
                lineNumber: 247,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: '#666',
                    fontSize: '14px',
                    marginBottom: '20px'
                },
                children: "💡 Laat de laptop/telefoon op tafel liggen. Sluit dit tabblad niet tijdens de opname."
            }, void 0, false, {
                fileName: "[project]/app/meetings/[id]/page.tsx",
                lineNumber: 298,
                columnNumber: 7
            }, this),
            showSummary && renderSummary(),
            (meetingStatus === null || meetingStatus === void 0 ? void 0 : meetingStatus.meeting.transcription) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    marginTop: '20px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        children: "Volledige Transcriptie"
                    }, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 306,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: 'white',
                            padding: '15px',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            lineHeight: '1.4',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            border: '1px solid #dee2e6'
                        },
                        children: meetingStatus.meeting.transcription
                    }, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 307,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: '12px',
                            color: '#666',
                            marginTop: '10px'
                        },
                        children: [
                            "📊 Transcriptie lengte: ",
                            meetingStatus.meeting.transcription.length,
                            " karakters"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 320,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/meetings/[id]/page.tsx",
                lineNumber: 305,
                columnNumber: 9
            }, this),
            (meetingStatus === null || meetingStatus === void 0 ? void 0 : meetingStatus.meeting.status) === 'processing' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#fff3cd',
                    padding: '20px',
                    borderRadius: '8px',
                    marginTop: '20px',
                    border: '1px solid #ffc107'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '10px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid #ffc107',
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    marginRight: '10px'
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 329,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "🎙️ Audio wordt verwerkt..."
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 338,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 328,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            margin: '0 0 10px 0'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Stap 1:"
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 341,
                                columnNumber: 13
                            }, this),
                            " Audio transcriptie via ElevenLabs Scribe",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 341,
                                columnNumber: 78
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Stap 2:"
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 342,
                                columnNumber: 13
                            }, this),
                            " AI samenvatting en actiepunten genereren",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 342,
                                columnNumber: 78
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Stap 3:"
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 343,
                                columnNumber: 13
                            }, this),
                            " Email versturen naar deelnemers"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 340,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: '14px',
                            color: '#856404',
                            margin: '10px 0 0 0'
                        },
                        children: "Dit kan 1-3 minuten duren afhankelijk van de lengte van de opname. De samenvatting verschijnt hier zodra deze klaar is."
                    }, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 345,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                        children: "\n            @keyframes spin {\n              0% { transform: rotate(0deg); }\n              100% { transform: rotate(360deg); }\n            }\n          "
                    }, void 0, false, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 348,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/meetings/[id]/page.tsx",
                lineNumber: 327,
                columnNumber: 9
            }, this),
            (meetingStatus === null || meetingStatus === void 0 ? void 0 : meetingStatus.meeting.status) === 'completed' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#d4edda',
                    padding: '20px',
                    borderRadius: '8px',
                    marginTop: '20px',
                    border: '1px solid #28a745'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '10px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '24px',
                                    marginRight: '10px'
                                },
                                children: "✅"
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 360,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                style: {
                                    color: '#155724'
                                },
                                children: "Meeting succesvol verwerkt!"
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 361,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 359,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            margin: '0',
                            color: '#155724'
                        },
                        children: [
                            "📊 ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Transcriptie:"
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 364,
                                columnNumber: 16
                            }, this),
                            " ",
                            ((_meetingStatus_meeting_transcription = meetingStatus.meeting.transcription) === null || _meetingStatus_meeting_transcription === void 0 ? void 0 : _meetingStatus_meeting_transcription.length) || 0,
                            " karakters",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 364,
                                columnNumber: 107
                            }, this),
                            "🤖 ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "AI Samenvatting:"
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 365,
                                columnNumber: 16
                            }, this),
                            " Inclusief actiepunten en beslissingen",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 365,
                                columnNumber: 87
                            }, this),
                            "📧 ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Email:"
                            }, void 0, false, {
                                fileName: "[project]/app/meetings/[id]/page.tsx",
                                lineNumber: 366,
                                columnNumber: 16
                            }, this),
                            " Verzonden naar ",
                            meetingStatus.meeting.attendees.length,
                            " deelnemer(s)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/meetings/[id]/page.tsx",
                        lineNumber: 363,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/meetings/[id]/page.tsx",
                lineNumber: 358,
                columnNumber: 9
            }, this),
            (meetingStatus === null || meetingStatus === void 0 ? void 0 : meetingStatus.meeting.status) === 'failed' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#f8d7da',
                    padding: '15px',
                    borderRadius: '8px',
                    marginTop: '20px'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: "❌ Er is een fout opgetreden bij het verwerken van de meeting. Probeer het opnieuw of neem contact op met ondersteuning."
                }, void 0, false, {
                    fileName: "[project]/app/meetings/[id]/page.tsx",
                    lineNumber: 373,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/meetings/[id]/page.tsx",
                lineNumber: 372,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/meetings/[id]/page.tsx",
        lineNumber: 218,
        columnNumber: 5
    }, this);
}
_s(MeetingRecordPage, "vRksxDsmr8LR8PmkRrp0hrA8hvw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"]
    ];
});
_c = MeetingRecordPage;
var _c;
__turbopack_context__.k.register(_c, "MeetingRecordPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_38f5796a._.js.map