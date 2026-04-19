# Promotion Rules

Use this to decide when feature-owned UI should move into shared design-system layers.

## Promote To Primitive When

- Semantics are stable across consumers
- API is generic and not domain-bound
- Visual treatment is token-driven
- Accessibility behavior is shared and complete
- Override pressure is low
- Future reuse is likely

## Promote To Pattern When

- Multiple consumers share intent and structure
- Local wrapper logic still carries domain-light semantics
- Primitive layer alone would be too low-level
- Pattern can stay generic without page/workflow naming

## Do Not Promote When

- Reuse count is only signal
- One feature needs custom props or special-case styles
- Literal values are layout-critical and local
- Moving it would force primitive API growth for one screen
- Meaning is still unstable or under exploration

## Exception Rule

- Approved exceptions may stay local when they are:
  - framework/runtime-driven
  - one-off product expression with clear owner
  - layout-critical and not repeated shared meaning
- Record every exception in feature decision log with:
  - file/component
  - reason
  - owner
  - future review trigger
