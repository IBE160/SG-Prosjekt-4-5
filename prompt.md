# 🧠 AI Study Buddy – Revised Project Proposal (prompt.md)

## 🎯 Background
Studenter bruker mye tid på å oppsummere pensum, lage flashcards og forberede seg til eksamen.  
**AI Study Buddy** skal automatisere dette ved hjelp av gratis og åpne AI-verktøy, slik at studentene kan fokusere på forståelse i stedet for gjentakende arbeid.

---

## 🎯 Purpose
Formålet er å **forenkle læringsprosessen** ved å generere AI-baserte sammendrag og flashcards fra opplastede forelesningsnotater.  
Prosjektet skal demonstrere hvordan **gratis, lokale AI-modeller** (Gemini CLI og Hugging Face) kan brukes i utdanningssammenheng.

---

## 👥 Target Users
- Universitets- og høyskole­studenter  
- Lærere som ønsker å lage undervisningsmateriell raskere  
- Privatlærere og livslang læring

---

## ⚙️ Reduced MVP Scope (6-Week Plan)
MVP inkluderer kun:

1. 🔐 Brukerautentisering (JWT-baserte tokens)  
2. 📄 PDF-opplasting (via pdfplumber)  
3. 🤖 AI-sammendrag (Gemini CLI + Hugging Face flan-t5-base)  
4. 🧩 Automatisk generering av flashcards fra sammendraget  

**Ikke inkludert i MVP:**  
OCR, DOCX/PPT-støtte, quizgenerator, ordliste, samarbeidsfunksjoner og fremdriftssporing.

---

## 🏗️ Technical Architecture

### Frontend
- Framework: **React + Vite**
- Styling: **Tailwind CSS**
- Hovedsider:  
  - Login/Signup  
  - Dashboard (opplasting og dokumentvisning)  
  - Study View (sammendrag + flashcards)

### Backend
- Språk: **Python**
- Framework: **FastAPI**
- Autentisering: **JWT (python-jose)**
- Filbehandling: **pdfplumber**
- AI-integrasjon: **Gemini CLI + Hugging Face Transformers**  
  (flan-t5-base og sentence-transformers/all-MiniLM-L6-v2)
- Chunking av lange dokumenter (map-reduce)

### Database
- DBMS: **PostgreSQL (Supabase/lokal Docker)**
- ORM: **SQLAlchemy (async)**
- Tabeller: `users`, `documents`, `summaries`, `flashcards`

---

## 🧠 Modellvalg og begrunnelse
**Hybrid tilnærming:**

- **Gemini CLI/API** → Primær generativ oppgave  
  (sammendrag og flashcards; gratisnivå utnyttes)  
- **Hugging Face (flan-t5-base / MiniLM)** →  
  Strukturering, tekst-embedding og semantisk søk  
  for rask, lokal behandling av dokument-chunks.

Dette reduserer avhengighet av Gemini og gir kostnadsfri robusthet.

---

## 🔌 API Endpoints

| Metode | Endpoint | Beskrivelse |
|--------|-----------|-------------|
| POST | `/auth/signup` | Registrer ny bruker |
| POST | `/auth/login` | Autentiser bruker, returner JWT |
| POST | `/upload` | Last opp PDF og hent tekst |
| POST | `/summarize` | Generer AI-sammendrag |
| GET | `/flashcards/{doc_id}` | Hent flashcards |
| DELETE | `/document/{id}` | Slett dokument |

---

## 🗓️ Timeline & Milestones (6 uker)

| Uke | Oppgave |
|-----|----------|
| 1 | Oppsett av miljø, repo, autentisering |
| 2 | Filopplasting og tekstuttrekk |
| 3 | AI-sammendrag (Gemini CLI) |
| 4 | Flashcard-generering |
| 5 | Integrasjon og testing |
| 6 | UI, dokumentasjon og sluttføring |

---

## 🧱 Error Handling & Security
- Filvalidering (kun `.pdf`)
- JWT-basert autentisering
- Passord-hashing (**bcrypt**)
- HTTPS (lokal SSL-testing)
- Feilhåndtering ved AI-timeout eller tomt resultat

---

## 💸 Cost & Resource Considerations
Alle verktøy er **gratis**:
- Gemini CLI (lokal)
- Hugging Face (open source)
- PostgreSQL (open source)
- FastAPI, React, Tailwind CSS (open source)  
→ Krever kun lokal maskin eller gratis GitHub Codespaces / Replit

---

## 🧪 Testing Strategy
- Enhetstester for API-endepunkter (**Pytest**)  
- Manuell validering av AI-output  
- Sammenligning av flashcards mot originaltekst  

---

## 🧩 Wireframe Overview
1️⃣ **Login Page:** Enkelt skjema → Dashboard  
2️⃣ **Dashboard:** Last opp PDF → vis dokumentliste → klikk for sammendrag  
3️⃣ **Study View:** Sammendrag (venstre) + Flashcards (høyre)

---

## 📈 Success Criteria
- Brukeren får sammendrag + flashcards på **< 60 sekunder**  
- Systemet kjører stabilt uten API-kostnader  
- Brukere rapporterer **bedre læringseffektivitet**

---

## ⚠️ Assumptions & Risks
- AI-modellkvalitet kan variere  
- Lange dokumenter krever chunking  
- Minimum 4–8 GB RAM anbefales for lokal kjøring

---

## 🔜 Next Steps
- Godkjenning av redusert MVP fra veileder  
- Opprett GitHub-repo og grunnstruktur (FastAPI + React)  
- Implementer etter ukeplan  

---

> 💡 **Bruk i AI-verktøy:**  
> Kopier hele denne filen inn i Gemini CLI, ChatGPT eller Hugging Face som kontekst for videre utvikling.  
> Spør f.eks.:  
> *«Generer kodestrukturen for MVP i henhold til `prompt.md`-filen»*  
> eller  
> *«Lag API-modulene i FastAPI basert på denne arkitekturen»*.
