# AI Therapist Agent - Project TODO

## Core Features

### Authentication & Session Management
- [ ] Anonymous chat sessions (no account required)
- [ ] User authentication (login/signup with Manus OAuth)
- [ ] Session persistence for authenticated users
- [ ] Session creation and tracking

### AI Therapist Chat
- [ ] Real-time chat interface with streaming AI responses
- [ ] Empathetic, non-judgmental AI responses
- [ ] Meaningful follow-up questions from AI
- [ ] Clear disclaimer: "Not a licensed therapist" visible in chat
- [ ] Message history within session

### Crisis Detection & Safety
- [ ] Crisis keyword detection (self-harm, suicide, harm to others)
- [ ] Immediate emergency resource display on crisis detection
- [ ] Emergency hotline numbers and support resources
- [ ] Clear call-to-action for professional help

### Session Management
- [ ] AI-generated session summaries (key topics, emotional insights, next steps)
- [ ] Session end/save functionality
- [ ] Session history dashboard for authenticated users
- [ ] Session search and filtering
- [ ] Session deletion capability

### Mood Tracking
- [ ] Pre-session mood logging (1-10 scale or emoji)
- [ ] Post-session mood logging
- [ ] Mood trend visualization (chart/graph)
- [ ] Historical mood data display

### Wellness Tools
- [ ] Daily affirmations feature
- [ ] Guided breathing exercises
- [ ] Easy access from dashboard (not buried in navigation)

### Session Export
- [ ] Export session summary as PDF
- [ ] Export session summary as text file
- [ ] Download functionality

### Multi-Language Support
- [ ] Language selection UI
- [ ] AI responses in selected language
- [ ] UI translation for all pages
- [ ] Language persistence (localStorage)

### UI/UX & Design
- [ ] Dark mode support
- [ ] Light mode support
- [ ] Mobile-first responsive design
- [ ] Calm, elegant color palette
- [ ] Smooth animations and transitions
- [ ] Accessible design (WCAG compliance)
- [ ] Clean chat interface similar to ChatGPT

### Database Schema
- [x] Users table (with authentication fields)
- [x] Sessions table (chat history, timestamps)
- [x] Messages table (user and AI messages)
- [x] Session summaries table
- [x] Mood logs table
- [x] User preferences table (language, theme)

### Backend API Routes
- [x] POST /api/trpc/chat.startSession - Start new session
- [x] POST /api/trpc/chat.sendMessage - Send message and get AI response
- [x] POST /api/trpc/chat.endSession - End session and generate summary
- [x] GET /api/trpc/sessions.list - Get user's sessions
- [x] GET /api/trpc/sessions.get - Get specific session details
- [x] POST /api/trpc/sessions.delete - Delete a session
- [x] POST /api/trpc/mood.log - Log mood before/after session
- [x] GET /api/trpc/mood.trends - Get mood trend data
- [x] POST /api/trpc/sessions.export - Export session as PDF/text

### Frontend Pages
- [x] Landing/Home page with call-to-action
- [x] Chat page (anonymous and authenticated)
- [x] Dashboard (authenticated users only)
- [x] Session history page with search and filtering
- [ ] Session detail/summary view
- [x] Wellness tools page (affirmations & breathing exercises)
- [ ] Settings page (language, theme, account)
- [x] Not found page

### Testing & Validation
- [x] Vitest unit tests for backend procedures (22 tests passing)
- [x] Crisis detection logic tests
- [x] Summary generation tests
- [ ] Manual testing of chat flow
- [ ] Manual testing of mood tracking
- [ ] Manual testing of export functionality

## Implementation Status

- [x] Project initialized with web-db-user scaffold
- [x] Phase 2: Database schema design
- [x] Phase 3: AI therapist chat engine with safety
- [x] Phase 4: Frontend auth and chat interface (Home, Chat, Dashboard pages created)
- [x] Phase 5: Session history and wellness tools (SessionHistory, Wellness pages created)
- [x] Phase 6: Polish and responsive design (elegant calming UI with dark mode)
- [ ] Phase 7: Testing and delivery
