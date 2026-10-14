export interface NotebookTemplate {
  id: 'study' | 'journal' | 'ideas' | 'tasks';
  name: string;
  badge: string;
  tagline: string;
  color: string;
  bgLight: string;
  borderLight: string;
  iconName: string;
  defaultTitle: string;
  defaultContent: string;
  suggestedCategory: string;
  suggestedTags: string[];
}

export const NOTEBOOK_TEMPLATES: NotebookTemplate[] = [
  {
    id: 'study',
    name: 'Study Notebook',
    badge: 'Study Notes',
    tagline: 'Academic lectures, mechanisms, and exam checklists',
    color: '#A6B49A',
    bgLight: 'bg-[#A6B49A]/15',
    borderLight: 'border-[#A6B49A]/30',
    iconName: 'GraduationCap',
    defaultTitle: 'Photosynthesis & Cellular Energetics',
    defaultContent: `# Photosynthesis & Cellular Energetics

**Subject:** Biology 101 · Module 04
**Date:** ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}

## Overview & Definition
The biochemical process by which photoautotrophs convert solar radiance, H₂O, and CO₂ into high-energy chemical bonds (glucose) and vital O₂.

## Key Mechanisms
- **Light-Dependent Phase:** Thylakoid membranes convert photons to ATP & NADPH; photolysis yields O₂.
- **Calvin-Benson Cycle:** Stroma matrix fixes atmospheric CO₂ via RuBisCO to synthesize triose sugars.
- **Pigment Absorption:** Chlorophyll a & b absorb 430nm (blue) and 660nm (red), reflecting green light.

> **Key Takeaway:** Photolysis of water in Photosystem II produces all breathable atmospheric oxygen!

## Study Checklist & Milestones
- [x] Submit Plant Physiology lab writeup
- [x] Review Chapter 8 electron transport slides
- [ ] Prepare 35 flashcards for Calvin cycle enzymes
- [ ] Group discussion at Library Atrium (4:00 PM)

*Note: Drink water and get 8 hours of sleep before the exam!*
`,
    suggestedCategory: 'Academics',
    suggestedTags: ['Study', 'Biology', 'Exam-Prep'],
  },
  {
    id: 'journal',
    name: 'Daily Journal',
    badge: 'Mindful Journal',
    tagline: 'Morning stillness, gratitude practice, and alignment',
    color: '#B96F52',
    bgLight: 'bg-[#B96F52]/15',
    borderLight: 'border-[#B96F52]/30',
    iconName: 'BookHeart',
    defaultTitle: 'Autumn Reflections & Daily Alignment',
    defaultContent: `# Autumn Reflections & Daily Alignment

**Date:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
**Weather:** Crisp morning mist · 52°F

## Morning Stream of Consciousness
Woke up early before the neighborhood stirred. Brewed fresh pour-over coffee and watched golden leaves drift across the wet pavement. In stillness, scattered thoughts finally find their natural rhythm.

## Observations & Flow
- **Morning Walk:** Chilly air, crisp mist rising above the pond, total absence of sirens.
- **Unbroken Flow:** 90 minutes of pure writing without notifications or inbox checks.
- **Creative Clarity:** Grounding in simple rituals and honest work.

> *“Quiet mornings give birth to clear minds and honest intentions.”*

## Daily Gratitude Practice
1. Warm pour-over coffee by the sunny window.
2. Encouraging voice note from an old university friend.
3. Steady progress on NoteSpace architecture.

## Intentions for the Evening
- [ ] 20-minute reading session before dinner
- [ ] Evening walk without headphones
- [ ] Call family this weekend
`,
    suggestedCategory: 'Personal',
    suggestedTags: ['Journal', 'Reflection', 'Gratitude'],
  },
  {
    id: 'ideas',
    name: 'Idea Lab',
    badge: 'Concept & Design',
    tagline: 'Product hypotheses, core pillars, and feature canvases',
    color: '#D4A373',
    bgLight: 'bg-[#D4A373]/15',
    borderLight: 'border-[#D4A373]/30',
    iconName: 'Lightbulb',
    defaultTitle: 'Project Aurora: Tactile Note-Taking Concept',
    defaultContent: `# Project Aurora: Tactile Note-Taking Concept

**Sprint:** Lab Concept v2.4
**Date:** ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}

## Product Vision
A digital sanctuary that blends the physical tactility of heavy-grain stationery with sub-50ms instant full-text search and cryptographic privacy.

## Core Pillars
1. **Tactile Simplicity:** Deliberate typography, zero algorithmic feed noise, calm workspace.
2. **Lightning Search:** Compound MongoDB indexing & client fuzzy caching for immediate recall.
3. **Data Sovereignty:** Export notes to Markdown, JSON, or printable PDF with zero lock-in.

> **Design Hypothesis:** True productivity is about subtracting clutter, not adding more widgets.

## Feature Brainstorm & Status
- [x] Interactive 3D dual-page notebook landing experience
- [x] Physical color-coded tabs with 600ms page turns
- [ ] Bi-directional [[wiki]] note interlinking
- [ ] Offline-first sync engine with local IndexedDB

*Priority: Test paper prototype with 5 users on Friday!*
`,
    suggestedCategory: 'Work',
    suggestedTags: ['Ideas', 'Design', 'Architecture'],
  },
  {
    id: 'tasks',
    name: 'Sprint Tasks',
    badge: 'Action Matrix',
    tagline: 'High-impact queues, prioritized checklists, and milestones',
    color: '#5C768D',
    bgLight: 'bg-[#5C768D]/15',
    borderLight: 'border-[#5C768D]/30',
    iconName: 'CheckSquare',
    defaultTitle: 'Sprint 42 Milestones & Action Queue',
    defaultContent: `# Sprint 42 Milestones & Action Queue

**Priority:** High
**Date:** ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}

## Target Milestones
- **API Integration:** 38/38 server test suites passing with 100% schema validation.
- **Security Suite:** Admin role verification, session revocation, and immutable audit logging.
- **Tactile UI Polish:** Interactive paper tabs with 60fps 3D page flip.

## High-Priority Action Items
- [x] Verify compound indexes on MongoDB note title & tags
- [x] Audit security cookies & rate-limiting middleware
- [x] Ship interactive landing page notebook hero
- [ ] Deploy production release bundle to cloud hosting

> *“Ship with pride, measure with clarity, iterate with empathy.”*
`,
    suggestedCategory: 'Tasks',
    suggestedTags: ['Tasks', 'Sprint', 'Priority'],
  },
];
