# The Eternal Falcon - Conversational AI Book Enhancement App

## Overview

The Eternal Falcon is a full-stack conversational AI application that enhances book reading through intelligent assistance. Built as a React frontend with Express backend, the app combines traditional book reading with an AI-powered assistant that can fact-check, explain concepts, and provide historical context. The application also features lifestyle enhancement tools including meditation/yoga modules and timeline exploration of historical events.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern React app using functional components and hooks
- **Styling**: Tailwind CSS with Shadcn/UI component library for consistent design system
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom Shadcn/UI theming

### Backend Architecture
- **Express Server**: Node.js REST API with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL (Neon database)
- **AI Integration**: Google Gemini API for multi-agent conversational AI system
- **Session Storage**: Express sessions with PostgreSQL store

### Multi-Agent AI System
The core AI feature implements a multi-agent approach:
- **Fact-checking Agent**: Verifies claims against curated historical database
- **Reasoning Agent**: Breaks down complex queries using Chain-of-Thought methodology
- **Narrative Agent**: Generates responses in the book's semi-academic storytelling style
- **Orchestrator Agent**: Routes queries and combines agent outputs

### Database Schema Design
- **Users**: Profile data, preferences, goals, and reading progress
- **Book Content**: Chapters with narrative, commentary, figures, and metadata
- **Historical Data**: Events and topics with timeline information and tagging
- **Practices**: Meditation and yoga content with categorization
- **Chat Sessions**: Conversation history with AI responses and agent metadata
- **User Progress**: Reading and practice tracking

### Component Architecture
- **Layout System**: Sidebar navigation with modal overlays for different features
- **Book Reader**: Chapter display with reading progress and customization options
- **AI Assistant**: Real-time chat interface with agent visualization
- **Timeline Explorer**: Historical event browser with filtering and search
- **Meditation Module**: Guided practice player with progress tracking

## External Dependencies

### AI Services
- **Google Gemini API**: Primary AI model for conversational responses and multi-agent orchestration

### Database & Storage
- **Neon PostgreSQL**: Serverless PostgreSQL database for production
- **Drizzle ORM**: Type-safe database toolkit with schema migrations

### Authentication & Sessions
- **Firebase**: Authentication and potential real-time features (configured but not fully implemented)
- **Connect-pg-simple**: PostgreSQL session store for Express

### UI & Styling
- **Shadcn/UI**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Backend bundling for production
- **Replit Integration**: Development environment with runtime error overlay

### Frontend Libraries
- **TanStack React Query**: Server state management and caching
- **Wouter**: Lightweight routing
- **React Hook Form**: Form handling with validation
- **Date-fns**: Date manipulation utilities
- **Class Variance Authority**: Type-safe CSS class variants