# EasyCover - AcoFork Project Guide

## Project Overview
EasyCover is a simple and elegant cover image generation tool that runs purely on the client side, ensuring user privacy. It allows users to create cover images with various aspect ratios, icons, text, and backgrounds.

## Key Features
- **Client-Side Generation**: All processing happens in the browser; no server uploads.
- **Multiple Aspect Ratios**: Supports 1:1, 16:9, 21:9, 4:3, 2:1, etc.
- **Icon Library**: Integrated with Iconify for access to thousands of icons.
- **Customization**:
    - **Icons**: Size, rotation, color, shadow, container shape, glassmorphism effects.
    - **Text**: Custom content, size, color, stroke.
    - **Background**: Solid colors, images (scale, rotate, pan, blur).
- **Export**: One-click PNG export with hidden guides.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (v16.1.1)
- **Library**: [React](https://react.dev/) (v19.2.3)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4), [Shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Iconify](https://iconify.design/), `lucide-react`, `react-icons`
- **Image Generation**: `html-to-image`
- **UI Components**: `@radix-ui/*` primitives

## Folder Structure
- `app/`: Next.js App Router pages and layouts.
- `components/`: React components (UI and feature-specific).
- `store/`: Zustand state management stores.
- `public/`: Static assets.
- `lib/`: Utility functions.
- `types/`: (If exists) TypeScript type definitions.

## Key Scripts
- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production (static export configured).
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint.

## Development Guidelines
- **Styling**: Use Tailwind CSS for styling. Components should generally be built using Shadcn/ui patterns.
- **State**: Use Zustand for global state management (e.g., canvas settings, selected elements).
- **Icons**: Use Iconify for dynamic icon loading.
- **Canvas Interaction**: `react-moveable` is used for element manipulation (resizing, moving).

## Deployment
The project is configured for static export (`output: 'export'`), making it suitable for Vercel, GitHub Pages, or any static hosting service.
