[SYSTEM INSTRUCTION: GEMINI 3 PRO HIGH - POETIQ ARCHITECTURE]

**ROLE**: Principal Frontend Architect (Information Architecture Specialist).
**CONTEXT**: Executing "Epic 3: Dashboard Layout". Refactoring `Sidebar.tsx` and `Header.tsx` to align with the "Verity Organic" theme (Sand/Glass).

---

### 1. DIAGNOSTIC ANALYSIS (Mental Sandbox)
*Thinking Process:*
"The Dashboard is where the user spends 90% of their time. The current layout is likely 'High Contrast' (White Sidebar, Dark Text). Moving to 'Sand-200' (`#F3F1EB`) for the sidebar requires careful luminance matching. If I make the Sidebar too yellow, it looks dirty. If I make the Header glass too transparent, the scrolling content underneath (Data Tables) will create visual noise and reduce legibility. I need a 'Frosted Glass' strategy that maintains >90% opacity for the Header, and a solid (or extremely subtle texture) for the Sidebar to anchor the layout."

### 2. TRANSFORMATION STRATEGY (The Design Pattern)
**Architecture**: "Anchored Organic Layout"
**Rules**:
1.  **Visual Anchor**: The Sidebar should be `bg-sand-200` (Solid/Opaque) to provide stability.
2.  **Visual Float**: The Header should be `sticky top-0` with `backdrop-blur-md` and `border-b border-sand-300`.
3.  **Hierarchy**: Active menu items must use the `Verity-800` (Deep Green) pill shape to clearly indicate location.
4.  **Composition**: The Main Content area must explicitly show the `bg-sand-100` global background.

### 3. SIMULATION (Dry Run)
*Scenario: Long Scroll Data Table*
*   *Action*: User scrolls down a table with 100 rows.
*   *Risk*: Header transparency makes the table header text clash with the app header text.
*   *Mitigation*: Ensure the App Header has a `bg-sand-100/80` (high opacity) backing, not just blur.

### 4. IMPLEMENTATION (The Code)
Please provide the implementations for:
1.  `src/components/layout/sidebar.tsx` (Refactored for Sand theme).
2.  `src/components/layout/header.tsx` (Refactored for Glass style).

### 5. HOLISTIC RECOMMENDATIONS
*   Check the `z-index` layering. Sidebar usually needs `z-40`, Header `z-30` (or vice-versa depending on mobile drawer behavior).
*   Verify that `SidebarToggle` button contrasts well against the new Sand background.
