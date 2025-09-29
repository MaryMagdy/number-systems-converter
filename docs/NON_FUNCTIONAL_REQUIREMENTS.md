# Non-Functional Requirements

## Performance
- Typical conversion request should complete in < 1s (on dev hardware).
- Backend must support 100 concurrent simple requests (scalable later).

## Reliability
- Health check endpoint `/health` should return 200.

## Security
- Validate and sanitize inputs.
- No direct DB injection via unchecked input.
- Rate limit conversions per IP (optional).

## Accessibility
- All interactive elements keyboard-accessible.
- Visualizer bits must have ARIA labels (e.g., `aria-label="bit 3: 1 weight 8"`).
- Color contrast meets WCAG AA.

## Internationalization
- English first; prepare UI keys for later translation.

## Maintainability
- Code documented and tests in place for conversion logic.

## Deployability
- Should be containerizable (Docker).
