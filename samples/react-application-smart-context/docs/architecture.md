# How Smart Context Works

This sample demonstrates one core idea: **using the Microsoft Graph Copilot API to build a custom AI-powered UI**.

---

## The Big Picture

```
                        ┌─────────────────────────────────────────────────┐
                        │           SPFx App. Customizer                  │
                        │                                                 │
┌──────────────┐        │  ┌──────────────┐      ┌──────────────┐        │
│  SharePoint  │   →    │  │  Copilot API │  →   │   UI Panel   │        │
│    Page      │        │  │  + Prompt    │      │              │        │
└──────────────┘        │  └──────────────┘      └──────────────┘        │
                        │                                                 │
                        └─────────────────────────────────────────────────┘
```

1. User clicks the floating button on any SharePoint page
2. The app sends the page URL to Copilot API with a structured prompt
3. Copilot returns JSON data (not free text)
4. The app renders a polished UI from that JSON

---

## The Core: Prompt Engineering for JSON Output

The secret sauce is in [`constants/systemPrompt.ts`](../src/extensions/smartContextApp/constants/systemPrompt.ts).

Instead of letting Copilot respond with free-form text, the prompt instructs it to return a **specific JSON schema**:

```json
{
  "myRole": { "role": "Author", "reason": "You created this page" },
  "pendingActions": [{ "action": "Review document", "urgency": "high" }],
  "keyDecisions": [...],
  "timeline": [...],
  "tldr": ["Key point 1", "Key point 2"],
  "people": [{ "name": "John Doe", "url": "..." }]
}
```

This enables building a **predictable, structured UI** instead of parsing unpredictable AI responses.

---

## The API Flow

**File:** [`services/CopilotService.ts`](../src/extensions/smartContextApp/services/CopilotService.ts)

Two API calls, that's it:

```typescript
// 1. Create a conversation
POST /beta/copilot/conversations → { id: "conversation-123" }

// 2. Send the prompt with page context
POST /beta/copilot/conversations/conversation-123/chat
Body: {
  message: { text: "YOUR_PROMPT_HERE" },
  contextualResources: {
    files: [{ uri: "https://tenant.sharepoint.com/page.aspx" }]
  }
}
→ Returns: AI response with JSON + attributions
```

The page URL is passed as a **contextual resource**, giving Copilot access to analyze the page content alongside the user's emails, chats, and meetings.

---

## Component Architecture

```
SmartContextContainer          ← Controls panel open/close
  ├── FloatingButton           ← The "SC" side tab
  └── SmartContextPanel        ← Fetches data, handles states
        └── SmartContextContent   ← Renders the JSON as UI sections
              ├── MyRoleCard
              ├── PendingActionItem[]
              ├── TldrItem[]
              ├── KeyDecisionItem[]
              ├── TimelineItem[]
              ├── PersonItem[]
              └── AttributionItem[]
```

Each section component is simple: it receives typed data and renders it.

---

## Key Files

| File | What it does |
|------|--------------|
| [`CopilotService.ts`](../src/extensions/smartContextApp/services/CopilotService.ts) | Calls the Copilot API |
| [`systemPrompt.ts`](../src/extensions/smartContextApp/constants/systemPrompt.ts) | Defines the JSON schema prompt |
| [`jsonUtils.ts`](../src/extensions/smartContextApp/services/jsonUtils.ts) | Extracts JSON from Copilot response |
| [`SmartContextPanel.tsx`](../src/extensions/smartContextApp/components/SmartContextPanel.tsx) | Orchestrates fetch → parse → render |
| [`ICopilotService.ts`](../src/extensions/smartContextApp/services/ICopilotService.ts) | TypeScript types for the JSON schema |

---

## Why This Approach Works

1. **Structured output** — The prompt enforces a JSON schema, making the response predictable

2. **Type safety** — The JSON schema maps to TypeScript interfaces, enabling IntelliSense and compile-time checks

3. **Source citations** — The Copilot API returns `attributions` separately, so we can display "Sources" without polluting the content

4. **Personal context** — By using the Copilot API (not raw GPT), the response includes the user's emails, chats, and meetings automatically

---

## Gotchas

- **Beta API** — The `/beta/copilot/conversations` endpoint may change
- **JSON extraction** — Copilot sometimes wraps JSON in markdown; `extractJsonFromResponse()` handles this
- **Inline citations** — Copilot may add `[1](url)` even when asked not to; `removeInlineCitations()` strips them
- **JSON output approach** — I understand that instructing Copilot to return raw JSON may not be the optimal pattern. This was an experiment, and based on my tests I'm satisfied with the results. I'd love to hear feedback from the community on this approach!
