```mermaid 
flowchart TD
  subgraph Client
    A[User Browser]
    B[React Components]
    C[Next.js Pages]
  end
  subgraph Server
    D[Next.js API Routes]
    E[Auth Logic]
    F[Book Logic]
    G[Genre Logic]
    H[User-Book Logic]
    I[Database Layer]
  end
  subgraph Database
    J[(SQLite DB)]
  end

  A-->|Interacts with|B
  B-->|Renders|C
  C-->|API Calls|D
  D-->|Handles Auth|E
  D-->|Handles Books|F
  D-->|Handles Genres|G
  D-->|Handles User-Book|H
  E-->|Queries|I
  F-->|Queries|I
  G-->|Queries|I
  H-->|Queries|I
  I-->|Reads/Writes|J

  style Client fill:#E0F2FE,stroke:#0284C7,stroke-width:2px
  style Server fill:#F1F5F9,stroke:#64748B,stroke-width:2px
  style Database fill:#FDE68A,stroke:#CA8A04,stroke-width:2px 
  ```