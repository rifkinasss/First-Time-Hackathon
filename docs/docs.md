## FRMS MVP implementation

Target #2 diimplementasikan sebagai dashboard operasional berbasis activity-based fuel ratio.

- Frontend: Next.js App Router + TypeScript, Tailwind CSS, Recharts, TanStack Table, Zustand, React Hook Form, dan Zod.
- Backend: FastAPI + Pydantic dengan seed JSON read-only dan CORS untuk `localhost:3000`.
- Route utama: `/overview`, `/fuel-ratio/loading`, `/fuel-ratio/hauling`, `/fuel-ratio/supporting`, `/fuel-ratio/dewatering`.
- Export Excel masih berupa affordance UI karena scope MVP tidak membutuhkan report generator.
