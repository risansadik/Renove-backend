# reNove - RAG Pipeline Flow

```mermaid
flowchart TD
    A["<b>RagInput</b><br/>addictionType · severity · interests · previousLevels"]

    A --> B["<b>Ensure Qdrant collection</b><br/>create if not exists · cosine · 768d"]
    B --> C["<b>Build query string</b><br/>addictionType + interests joined"]
    C --> D["<b>Gemini embed(query)</b><br/>→ queryVector number[]"]
    D --> E["<b>Qdrant searchWithScores</b><br/>topK · relevance threshold filter"]
    E --> F{docs found?}

    F -- no --> G["<b>Serper search</b><br/>8 organic results"]
    G --> H["<b>Gemini embedBatch</b><br/>title + snippet per result"]
    H --> I["<b>Qdrant upsert</b><br/>SHA-256 id · metadata · indexedAt"]
    I --> J["<b>Qdrant search</b><br/>retrieve final context docs"]

    F -- yes --> K{"<b>Stale check</b><br/>&gt;50% docs older than TTL?"}
    K -- fresh --> J
    K -- stale --> L["<b>Serper search</b><br/>re-fetch fresh docs"]
    L --> M["<b>Gemini embedBatch</b><br/>title + snippet per result"]
    M --> N["<b>Qdrant upsert</b><br/>overwrite stale docs"]
    N --> J

    J --> O["<b>Build context string</b><br/>join doc.text · fallback to default"]
    O --> P["<b>LangChain RunnableSequence</b><br/>LEVEL_PROMPT → OpenRouter LLM → StringOutputParser"]
    P --> Q["<b>Zod validate output</b><br/>RawLevelSchema × (endLevel − startLevel + 1)"]
    Q --> R["<b>RawLevelPayload[]</b><br/>validated levels ready for use"]

    style A fill:#e8e6f0,stroke:#9e99c8,color:#3a3560
    style B fill:#ede9fb,stroke:#9e99c8,color:#3a3560
    style C fill:#e0f5ee,stroke:#5dcaa5,color:#085041
    style D fill:#e0f5ee,stroke:#5dcaa5,color:#085041
    style E fill:#ede9fb,stroke:#9e99c8,color:#3a3560
    style F fill:#f5f4f0,stroke:#888780,color:#2c2c2a
    style G fill:#faece7,stroke:#d85a30,color:#4a1b0c
    style H fill:#e0f5ee,stroke:#5dcaa5,color:#085041
    style I fill:#ede9fb,stroke:#9e99c8,color:#3a3560
    style J fill:#ede9fb,stroke:#9e99c8,color:#3a3560
    style K fill:#f5f4f0,stroke:#888780,color:#2c2c2a
    style L fill:#faece7,stroke:#d85a30,color:#4a1b0c
    style M fill:#e0f5ee,stroke:#5dcaa5,color:#085041
    style N fill:#ede9fb,stroke:#9e99c8,color:#3a3560
    style O fill:#f5f4f0,stroke:#888780,color:#2c2c2a
    style P fill:#faece7,stroke:#d85a30,color:#4a1b0c
    style Q fill:#eaf3de,stroke:#639922,color:#173404
    style R fill:#eaf3de,stroke:#639922,color:#173404
```

### Color key

| Color | Represents |
|---|---|
| Purple | Qdrant vector store operations |
| Teal | Gemini embedding operations |
| Coral | Serper search + LangChain chain |
| Green | Validated output |
| Gray | Input / logic / context building |