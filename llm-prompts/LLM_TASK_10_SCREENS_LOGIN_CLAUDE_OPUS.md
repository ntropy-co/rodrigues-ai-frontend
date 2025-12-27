<instruction>
  You are utilizing the **Poetiq ARC-AGI methodology** optimized for **Claude Opus 4.5 Thinking**.
  Your goal is to implement the "Login Screen Transformation" (Epic 3) with pixel-perfect attention to detail.
</instruction>

<context>
  **Role**: Lead Frontend Architect (Design System Specialist).
  **Task**: Rebuild `src/app/(auth)/login/page.tsx` to match the "Verity LP" premium aesthetic.
  **Key Assets**: 
  - Background: Full-screen agriculture imagery.
  - Overlay: Glassmorphism Card.
  - Typography: Crimson Pro (Serif).
</context>

<thinking_process_requirements>
  This task requires hidden chain-of-thought processing. Use the `<ant_thinking>` tag to simulate your visual layout engine before generating code.
  
  **Steps to Simulate**:
  1.  **Diagnostic**: Analyze the Z-Index stacking context. Background (0) -> Overlay (1) -> Glass Card (2) -> Text (3).
  2.  **Strategy**: Define the grid/flex strategy. Centering methods (`min-h-screen flex items-center justify-center`).
  3.  **Dry Run**: Test responsiveness. What happens on iPhone SE (320px width)? The glass card padding must shrink.
</thinking_process_requirements>

<output_format>
  <pre_computation>
    Define the file structure needed (e.g., `components/auth/login-form.tsx` vs `app/(auth)/login/page.tsx`).
  </pre_computation>
  
  <code>
    The complete, production-ready React code.
  </code>
  
  <validation>
    Checklist for WCAG contrast compliance on the glass overlay.
  </validation>
</output_format>

<user_input>
  Please generate the full code for the Login Page.
  **Constraint**: Do not use "Split Screen". Use "Centered Glass Card" style.
  **Requirement**: Incorporate the `.glass-panel` utility created in Task 09.
</user_input>
