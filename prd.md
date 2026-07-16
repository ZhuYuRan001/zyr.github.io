# Pixel Quest Blog
Version: 2.0

## Project Vision

Build a personal blog that feels like a retro 8-bit RPG game instead of a traditional website.

Visitors should feel they are exploring a game world, discovering stories, talking with NPCs, and opening treasure chests instead of clicking links.

The overall experience should combine:

- Retro pixel art
- SNES / GBA JRPG
- Modern frontend performance
- Excellent reading experience

This is NOT a game skin applied to a blog.

This IS a blog designed as a game.

---

# Core Design Principles

Every UI decision should follow these rules.

## 1

Reading is still the highest priority.

The UI should never interfere with reading articles.

## 2

Everything should feel handcrafted.

Avoid corporate UI.

Avoid SaaS dashboard styles.

Avoid generic Tailwind examples.

## 3

Use retro game language.

Buttons

Windows

Menus

Transitions

Loading

Dialogs

Inventory

Maps

NPC

Everything should resemble an old RPG.

## 4

Animation should feel alive.

Background should never be static.

The world should always feel breathing.

Clouds move.

Grass swings.

Birds fly.

Stars twinkle.

Water ripples.

Everything moves very slowly.

---

# Design Inspiration

Visual inspiration

- Pokemon Emerald
- Chrono Trigger
- Mother 3
- Stardew Valley
- Eastward
- Celeste
- FEZ
- Hyper Light Drifter

Interaction inspiration

- Nintendo DS menus
- Pokemon save screen
- RPG inventory
- JRPG dialog boxes

Website inspiration

Only borrow these ideas from lufutu.com

- subtle animated background
- clean spacing
- elegant transitions
- calm reading experience

Do NOT copy

- colors
- typography
- layout
- UI components

---

# Tech Stack

Astro

React

TypeScript

Tailwind CSS

Framer Motion

MDX

Shiki

Giscus

View Transitions API

---

# Color Palette

Use pixel-art palettes.

Never use muted beige.

Never use modern SaaS colors.

## Day Theme

Sky

#87CEEB

Cloud

#F8F8F8

Grass

#7BC96F

Forest

#3A7D44

Ground

#D4A373

Wood

#8B5A2B

Border

#2E1F14

Primary Text

#2B2B2B

Accent

#FFD166

Danger

#D95D39

Water

#4EA8DE

Shadow

#5C4033

---

## Night Theme

Background

#1F2430

Panel

#2C3446

Border

#5E6680

Primary Text

#ECECEC

Accent

#F2CC8F

Grass

#6BA368

Water

#5DADEC

Stars

#FFF3B0

---

# Typography

Title

Pixelify Sans

Weight

700

Subtitle

Pixelify Sans

Body

Maple Mono CN

Fallback

Noto Sans SC

Code

JetBrains Mono

Rules

Do NOT use rounded fonts.

Do NOT use geometric fonts.

Do NOT use Inter.

Do NOT use Poppins.

Body text must prioritize readability.

---

# Pixel Style

Everything should follow pixel aesthetics.

Borders

2~3px

Hard edges

No blur

No glassmorphism

No neumorphism

No floating cards

Icons

Pixel icons only.

Buttons

Pixel borders.

Panels

Pixel windows.

---

# Background

The background is one of the most important visual elements.

Never use a solid color.

Never use gradients.

Use a large animated pixel-art landscape.

The scene should include

Sky

Clouds

Mountains

Trees

Grass

Flowers

Water

Birds

Sun or Moon

The background should move slowly.

Suggested implementation

Parallax

Layer 1

Sky

Layer 2

Clouds

Layer 3

Mountains

Layer 4

Trees

Layer 5

Foreground grass

Movement

Clouds

Very slow

Grass

Gentle sway

Birds

Random

Water

Tiny ripple

Stars

Blink

---

# Navigation

Navigation should resemble an RPG menu.

Instead of modern navigation.

Example

BLOG

PROJECTS

ABOUT

NOTES

RSS

Github

Dark Mode

Selected item

Highlight with pixel cursor

Example

▶ BLOG

Hover

Cursor jumps

Tiny sound effect (optional)

---

# Home Page

Layout

Animated background

↓

Player character

↓

Main Menu

↓

Latest Articles

↓

Projects

↓

Now Playing

↓

Footer

The page should feel like entering a village.

---

# Hero

Do NOT use

Large corporate headline.

Instead

Pixel character

Speech bubble

Example

Hello!

Welcome back!

What would you like to explore?

▶ Blog

▶ Projects

▶ About

---

# Article List

Do NOT use modern cards.

Instead use RPG list.

Example

━━━━━━━━━━━━━━━━━━

BLOG

━━━━━━━━━━━━━━━━━━

▶ React Compiler

LV.12

2026.07.16

8 min

▶ Astro Islands

LV.8

▶ CSS Pixel Art

Hover

Arrow animation

Tiny movement

---

# Article Page

Keep reading experience clean.

Header

Title

Date

Reading Time

Tags

TOC

Content Width

720px

Large spacing

Code Block

Pixel window style

Images

Pixel frame

Bottom

Previous

Next

Comments

---

# Project Page

Projects should resemble equipment.

Example

Inventory

⚔ React UI

🛡 Astro Blog

🏹 Chrome Extension

Click opens detail.

---

# About Page

Character Profile

Avatar

Name

Class

Frontend Engineer

Level

Experience

Skills

Equipment

Timeline

Favorite Games

Favorite Books

Contact

Everything should resemble an RPG status screen.

---

# Buttons

Pixel borders

Hard corners

Hover

Move upward 2px

Border flashes

Pressed

Move downward 1px

---

# Window Style

All floating panels should resemble SNES dialog windows.

Dark outline

Light inner border

Flat colors

No shadows

---

# Cursor

Use custom pixel cursor.

Examples

Pixel arrow

Pixel glove

Pixel sword

---

# Page Transition

Very important.

Never simply fade.

Preferred transitions

Pixel wipe

Block dissolve

Camera scroll

Map transition

Pokemon door transition

GameBoy loading transition

Duration

250~450ms

Transitions should resemble moving between game maps.

---

# Animations

Never use exaggerated motion.

Use

Walking

Floating

Cloud movement

Grass sway

Blink

NPC idle

Chest opening

Flag waving

Fire flickering

---

# Loading

Replace spinner.

Examples

Loading...

Walking...

Saving...

██████□□□□

Or

Pixel character walking.

---

# Sound (Optional)

Hover

tiny beep

Open menu

tick

Page transition

door

Success

coin

Keep sounds subtle.

Muted by default.

---

# Markdown

MDX

Syntax highlighting

Pixel code frame

Copy button

Image zoom

Footnotes

Math support

Reading time

---

# Features

Required

Responsive

Dark Mode

RSS

Sitemap

Search

Reading Time

Tag

Category

TOC

MDX

Code Copy

Comments

Back To Top

Image Zoom

View Transition

Optional

Music Player

Achievements

Visitor Counter

Bookmarks

Weekly Notes

Pixel Guestbook

Mini Map

---

# Performance

Use Astro Islands.

React only when interaction is needed.

No unnecessary hydration.

Lighthouse

95+

---

# Folder Structure

src

components

layouts

pages

content

blog

projects

styles

assets

hooks

utils

public

---

# UX Philosophy

Users should feel they are exploring a peaceful RPG world.

Every click is entering a new area.

Every article is discovering a hidden story.

Every project is collecting a new item.

The website should feel nostalgic, relaxing, playful, and memorable.

---

# AI Implementation Rules

Always prioritize consistency.

Every new component must match the pixel-art visual language.

Never introduce modern SaaS UI elements.

Never generate glassmorphism.

Never generate floating material cards.

Never use rounded corporate buttons.

Prefer reusable components.

Use semantic HTML.

Use TypeScript.

Follow Astro best practices.

Keep interactions lightweight.

Always ask:

"Would this exist in a 16-bit RPG?"

If the answer is no,

redesign it.