# Quiz Module

This is the quiz module for the tutornotes application. It provides a complete quiz system with:

- Quiz creation and management
- Question editing with GeoGebra integration
- Quiz taking interface
- Results and analytics
- Admin controls

## Quick Start

1. The module is already integrated with the parent app
2. Use the components by importing from this directory
3. All services use the parent's Supabase connection
4. Styling inherits from the parent's Material-UI theme

## Development

- Components are in the `components/` directory
- Business logic is in the `services/` directory
- Custom hooks are in the `hooks/` directory
- Types and interfaces are in the `types/` directory

## Testing

Run tests with:
```bash
npm test -- src/components/quiz/
```
