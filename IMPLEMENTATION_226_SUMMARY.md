# CPR Workflow Status Polling - Implementation Summary

## Issue #226: feat(bff): Add CPR workflow status polling BFF routes

**Status**: ✅ COMPLETED  
**Date**: December 27, 2025  
**Tests**: 51/51 passing

---

## Implementation Overview

Successfully implemented a complete CPR workflow status polling system with:

- 2 BFF routes for status polling
- 1 custom React hook with configurable polling
- 3 UI components for status visualization
- Comprehensive test coverage (51 tests)

---

## Files Created

### 1. BFF Routes (2 files)

**Location**: `/src/app/api/cpr/`

- `analise/status/[sessionId]/route.ts` (109 lines)
  - Proxies to: `GET /api/v1/cpr/analise/status/{sessionId}`
  - Auth: HttpOnly cookie (verity_access_token)
  - Returns: workflow status with extracted_data, compliance_result, risk_result

- `criar/status/[sessionId]/route.ts` (109 lines)
  - Proxies to: `GET /api/v1/cpr/criar/status/{sessionId}`
  - Auth: HttpOnly cookie (verity_access_token)
  - Returns: workflow status with documento_url, documento_gerado

**Features**:

- Automatic cookie forwarding
- Cache-Control headers to prevent stale data
- Comprehensive error handling
- Consistent error response format

---

### 2. Custom React Hook

**Location**: `/src/hooks/useCPRWorkflowStatus.ts` (377 lines)

**Features**:

- ✅ Configurable polling interval (default: 2000ms)
- ✅ Auto-start/stop based on workflow state
- ✅ Manual refresh capability
- ✅ Error handling with retry logic (max 3 retries)
- ✅ Automatic cleanup on component unmount
- ✅ PostHog analytics integration
- ✅ Callback support (onStatusChange, onComplete, onError)

**Workflow State Detection**:

- `pending` - Not started
- `running` - Waiting for user input
- `processing` - Actively processing
- `completed` - Successfully finished
- `failed` - Error occurred
- `unknown` - Unknown state

**Usage Example**:

```typescript
const { status, isPolling, error, startPolling, stopPolling, refresh } =
  useCPRWorkflowStatus({
    sessionId: 'abc123',
    workflowType: 'analise_cpr',
    pollingInterval: 2000,
    autoStart: true
  })
```

---

### 3. UI Components (3 components + 1 index)

**Location**: `/src/components/v2/CPRWorkflow/`

#### WorkflowStatusBadge.tsx (169 lines)

- Displays current workflow state with appropriate icon and color
- Supports 3 sizes: sm, md, lg
- Animated entrance and spinning icon for processing state
- Shows step-specific labels during processing

#### WorkflowProgressBar.tsx (205 lines)

- Visual progress indicator for multi-step workflows
- Separate step configurations for analise and criar workflows
- Animated progress bar and step icons
- Current step highlighting with pulsing animation
- Compact mode support

#### WorkflowStatusPanel.tsx (223 lines)

- Comprehensive status panel integrating Badge + ProgressBar
- Real-time status updates
- Extracted data display (analise workflow)
- Document download link (criar workflow)
- Error message display
- Polling indicator
- Manual refresh button
- Fully customizable

#### index.ts

- Clean exports for all components

---

## Test Coverage

**Total**: 51 tests across 4 test files, all passing

### Test Breakdown:

1. **useCPRWorkflowStatus.test.ts** (15 tests)
   - ✅ Basic functionality
   - ✅ Polling with auto-start/stop
   - ✅ Workflow type handling (analise/criar)
   - ✅ Error handling with retry logic
   - ✅ State derivation (completed, running, processing)
   - ✅ Callback execution
   - ✅ Cleanup on unmount

2. **WorkflowStatusBadge.test.tsx** (17 tests)
   - ✅ All 6 state displays (pending, running, processing, completed, failed, unknown)
   - ✅ Step label rendering
   - ✅ Size variants (sm, md, lg)
   - ✅ Custom className support
   - ✅ Animation behavior

3. **WorkflowProgressBar.test.tsx** (13 tests)
   - ✅ Analise workflow steps (6 steps)
   - ✅ Criar workflow steps (5 steps)
   - ✅ Progress calculation
   - ✅ Step states (completed, current, pending)
   - ✅ Label display toggle
   - ✅ Compact mode
   - ✅ Edge cases (unknown step, finalizado)

4. **WorkflowStatusPanel.test.tsx** (6 tests)
   - ✅ Null sessionId handling
   - ✅ Workflow type titles
   - ✅ Refresh button visibility
   - ✅ Custom className support

---

## Technical Details

### Architecture Patterns

**BFF (Backend for Frontend)**:

- Next.js API routes proxy backend endpoints
- Cookie forwarding for authentication
- No direct backend URLs exposed to client

**Polling Strategy**:

- Client-controlled polling via React hook
- Automatic stop on workflow completion
- Exponential backoff on errors
- Configurable interval (default 2s)

**State Management**:

- React hooks for local component state
- No global state required
- Clean separation of concerns

### Type Safety

All components and hooks are fully typed with TypeScript:

- Exported types for all props interfaces
- Discriminated unions for workflow states
- Proper generic typing for callbacks

### Performance Optimizations

- useCallback for all functions to prevent re-renders
- useRef for interval management
- Automatic cleanup to prevent memory leaks
- Cache-Control headers on API responses

---

## Usage Examples

### Example 1: Status Panel

```typescript
import { WorkflowStatusPanel } from '@/components/v2/CPRWorkflow'

<WorkflowStatusPanel
  sessionId={sessionId}
  workflowType="analise_cpr"
  pollingInterval={2000}
  onComplete={() => console.log('Workflow completed!')}
/>
```

### Example 2: Custom Status Display

```typescript
import {
  WorkflowStatusBadge,
  WorkflowProgressBar
} from '@/components/v2/CPRWorkflow'
import { useCPRWorkflowStatus } from '@/hooks/useCPRWorkflowStatus'

function MyCustomStatusDisplay({ sessionId }) {
  const { status } = useCPRWorkflowStatus({
    sessionId,
    workflowType: 'criar_cpr',
    autoStart: true
  })

  if (!status) return null

  return (
    <div>
      <WorkflowStatusBadge
        state={status.state}
        currentStep={status.currentStep}
      />
      <WorkflowProgressBar
        workflowType="criar_cpr"
        currentStep={status.currentStep}
      />
    </div>
  )
}
```

---

## Integration Points

### Backend Endpoints (Already Exist)

- `GET /api/v1/cpr/analise/status/{session_id}`
- `GET /api/v1/cpr/criar/status/{session_id}`

### Frontend BFF Routes (New)

- `GET /api/cpr/analise/status/[sessionId]`
- `GET /api/cpr/criar/status/[sessionId]`

### Analytics Events (PostHog)

- `cpr_workflow_polling_started`
- `cpr_workflow_polling_stopped`
- `cpr_workflow_completed`
- `cpr_workflow_status_error`

---

## Workflow Steps

### Análise CPR (6 steps)

1. solicitar_documento - Upload document
2. processar_documento - Extract data
3. confirmar_dados - Confirm extracted data
4. verificar_compliance - Check compliance
5. calcular_risco - Calculate risk
6. finalizado - Completed

### Criar CPR (5 steps)

1. selecionar_tipo - Select CPR type
2. coletar_dados - Collect data
3. revisar_dados - Review data
4. gerar_documento - Generate document
5. finalizado - Completed

---

## Test Execution

```bash
# Run all workflow status tests
npm test -- --run src/hooks/useCPRWorkflowStatus.test.ts src/components/v2/CPRWorkflow

# Results:
# ✓ src/hooks/useCPRWorkflowStatus.test.ts (15 tests) 413ms
# ✓ src/components/v2/CPRWorkflow/WorkflowStatusBadge.test.tsx (17 tests) 132ms
# ✓ src/components/v2/CPRWorkflow/WorkflowStatusPanel.test.tsx (6 tests) 167ms
# ✓ src/components/v2/CPRWorkflow/WorkflowProgressBar.test.tsx (13 tests) 276ms
#
# Test Files  4 passed (4)
# Tests  51 passed (51)
```

---

## Notes

- All code follows project conventions (see CLAUDE.md)
- Type-safe with comprehensive TypeScript types
- Fully tested with vitest and @testing-library/react
- Ready for production use
- No additional dependencies required (uses existing stack)

---

## Next Steps (Optional Enhancements)

- Add real-time WebSocket support for instant updates
- Implement workflow step history/timeline
- Add estimated time remaining calculation
- Create Storybook stories for components
- Add E2E tests with Playwright
